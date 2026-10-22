/*
 * The editor's pure helpers, as `window.gqBioeconomiaLib`. Nothing here
 * reads WordPress or the DOM, so `apps/frontend/tests/` loads this file
 * directly to check the rules it shares with the Astro renderer.
 */
(() => {
  function slugFromLabel(label) {
    return String(label || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function fieldKind(attributeName, schema) {
    if (schema?.ui?.kind) {
      return schema.ui.kind;
    }
    if (Array.isArray(schema?.enum)) {
      return "select";
    }
    if (schema?.type === "array" || schema?.type === "object") {
      return "json";
    }
    if (schema?.type === "boolean") {
      return "boolean";
    }
    if (schema?.type === "number") {
      return "number";
    }
    if (
      /image.*(Id|Url|Src)|hero.*(Url|Src)|primary.*(Url|Src)|leftImage.*(Url|Src)|rightImage.*(Url|Src)/i.test(
        attributeName,
      )
    ) {
      return "media";
    }
    if (/href|url|link/i.test(attributeName)) {
      return "url";
    }
    if (/body|description|summary|intro|subtitle|heading/i.test(attributeName)) {
      return "textarea";
    }
    return "text";
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function cloneValue(value) {
    if (Array.isArray(value)) {
      return value.map(cloneValue);
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]),
      );
    }
    return value;
  }
  function arrayItemFields(schema) {
    const itemSchema = schema?.items;
    return itemSchema?.type === "object" && isPlainObject(itemSchema.properties)
      ? itemSchema.properties
      : null;
  }
  function blankValueForSchema(schema) {
    if (schema && "default" in schema) {
      return cloneValue(schema.default);
    }
    if (schema?.type === "array") {
      return [];
    }
    if (schema?.type === "object") {
      return {};
    }
    if (schema?.type === "boolean") {
      return false;
    }
    if (schema?.type === "number") {
      return undefined;
    }
    return "";
  }
  function blankArrayItem(schema) {
    const fields = arrayItemFields(schema);
    if (!fields) {
      return "";
    }
    return Object.fromEntries(
      Object.entries(fields).map(([name, fieldSchema]) => [name, blankValueForSchema(fieldSchema)]),
    );
  }
  function hasValue(value) {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined;
  }
  function readFieldValue(row, fieldName, schema) {
    const current = row[fieldName];
    if (hasValue(current)) {
      return current;
    }
    for (const legacyName of schema?.legacyReads || []) {
      if (hasValue(row[legacyName])) {
        return row[legacyName];
      }
    }
    return current;
  }
  function normalizeArrayItem(row, schema) {
    const fields = arrayItemFields(schema);
    if (!fields || !isPlainObject(row)) {
      return row;
    }
    return Object.fromEntries(
      Object.entries(fields).map(([name, fieldSchema]) => [
        name,
        readFieldValue(row, name, fieldSchema),
      ]),
    );
  }
  function matchesType(value, schema) {
    if (value === "" || value === null || value === undefined) {
      return true;
    }
    if (schema?.type === "array") {
      return Array.isArray(value);
    }
    if (schema?.type === "object") {
      return isPlainObject(value);
    }
    if (schema?.type === "boolean") {
      return value === true || value === false || value === "true" || value === "false";
    }
    if (schema?.type === "number") {
      return Number.isFinite(typeof value === "number" ? value : Number(value));
    }
    if (schema?.type === "string") {
      return typeof value === "string" || typeof value === "number";
    }
    return true;
  }
  function isValidArrayItem(row, schema) {
    const fields = arrayItemFields(schema);
    const itemSchema = schema?.items;
    if (!fields || !isPlainObject(row)) {
      return !itemSchema?.required?.length;
    }
    const normalized = normalizeArrayItem(row, schema);
    const required = itemSchema.required || [];
    return (
      required.every((name) => hasValue(normalized[name])) &&
      Object.entries(fields).every(([name, fieldSchema]) => {
        const value = normalized[name];
        return (
          matchesType(value, fieldSchema) &&
          (!hasValue(value) ||
            !Array.isArray(fieldSchema?.enum) ||
            fieldSchema.enum.includes(value))
        );
      })
    );
  }

  /**
   * Enum attribute reader. `contractEnum()` in `editor.js` supplies the real
   * contracts; tests supply their own.
   *
   * `read()` clamps leniently — trimming and lowercasing before matching — so the
   * editor resolves a stored value exactly as the Astro renderer does. A sidebar
   * that highlighted one step while the page rendered another would be worse than
   * either being strict.
   *
   * @param {Array<{blockName: string, attributes?: Object}>} contracts     Generated block contracts.
   * @param {string}                                          blockName     Registered block name, e.g. `getquick/section`.
   * @param {string}                                          attributeName Enum attribute to read from that block.
   * @return {{values: string[], fallback: string|undefined, read: (value: unknown) => string|undefined}} Allowed values, the contract default, and a reader that clamps onto it.
   */
  function enumFromContracts(contracts, blockName, attributeName) {
    const schema = contracts.find((item) => item.blockName === blockName)?.attributes?.[
      attributeName
    ];
    const values = Array.isArray(schema?.enum) ? schema.enum : [];
    const fallback = values.includes(schema?.default) ? schema.default : values[0];
    return {
      values,
      fallback,
      read: (value) => {
        if (typeof value !== "string") {
          return fallback;
        }
        const step = value.trim().toLowerCase();
        return values.includes(step) ? step : fallback;
      },
    };
  }

  /**
   * Canvas approximations of the published hero height scale.
   *
   * The plugin bundles separately from the frontend and cannot import Tailwind's
   * output, so these measurements restate what
   * `apps/frontend/src/components/page-heroes/pageHeroShared.ts` resolves each step to.
   * The restatement is checked rather than trusted: `page-hero-canvas-scale.test.mjs`
   * in `apps/frontend/tests/` derives the expected values from the frontend classes and
   * fails when the two drift, including when a new step arrives with no entry here.
   *
   * Padding mirrors the frontend's `md:` tier, because the editor canvas is wide.
   */
  const PAGE_HERO_CANVAS_SCALE = {
    xs: {
      height: "max(35svh, 280px)",
      top: "64px",
      sides: "64px",
      bottom: "64px",
    },
    s: {
      height: "max(50svh, 360px)",
      top: "96px",
      sides: "64px",
      bottom: "96px",
    },
    m: {
      height: "max(65svh, 440px)",
      top: "112px",
      sides: "64px",
      bottom: "160px",
    },
    l: {
      height: "max(80svh, 560px)",
      top: "128px",
      sides: "64px",
      bottom: "192px",
    },
    xl: {
      height: "100svh",
      top: "128px",
      sides: "64px",
      bottom: "192px",
    },
  };

  /**
   * The `md:` tier of each named padding step in `pageHeroShared.ts`; "default"
   * is absent because it keeps the height step's own padding.
   */
  const PAGE_HERO_CANVAS_PADDING_STEPS = {
    none: "0px",
    small: "48px",
    medium: "96px",
    large: "128px",
  };
  function paddingShorthand(top, sides, bottom) {
    return top === bottom ? `${top} ${sides}` : `${top} ${sides} ${bottom}`;
  }

  /**
   * @param {string} step Height step, e.g. `l`.
   * @return {{height: string, padding: string}|undefined} Canvas measurements, or
   * undefined for a step this map does not cover.
   */
  function pageHeroCanvasStyle(step) {
    const scale = PAGE_HERO_CANVAS_SCALE[step];
    if (!scale) {
      return undefined;
    }
    return {
      height: scale.height,
      padding: paddingShorthand(scale.top, scale.sides, scale.bottom),
    };
  }

  /**
   * Canvas padding for a height step with the block's padding steps applied.
   *
   * @param {string} step             Height step, e.g. `l`.
   * @param {Object} padding          Stored padding steps.
   * @param {string} [padding.top]    `paddingTop` step; "default" or unknown keeps the height's.
   * @param {string} [padding.bottom] `paddingBottom` step, likewise.
   * @return {string|undefined} CSS padding shorthand.
   */
  function pageHeroCanvasPadding(step, { top, bottom } = {}) {
    const scale = PAGE_HERO_CANVAS_SCALE[step];
    if (!scale) {
      return undefined;
    }
    return paddingShorthand(
      PAGE_HERO_CANVAS_PADDING_STEPS[top] ?? scale.top,
      scale.sides,
      PAGE_HERO_CANVAS_PADDING_STEPS[bottom] ?? scale.bottom,
    );
  }
  function pageHeroHeightLabels(steps) {
    const labels = steps.map((step) => step.toUpperCase());
    return {
      tallest: labels[labels.length - 1],
      shorter: labels.slice(0, -1),
    };
  }

  /**
   * Retirement of the static page hero's superseded attribute keys.
   *
   * `ctaUrl`, `imageUrl`, `hideCta` and the `cta` object were replaced by
   * `ctaHref`, `imageSrc`, `showCta` and flat CTA fields. Both the editor and the
   * Astro renderer have read the old keys as fallbacks ever since, which keeps
   * old posts rendering but also means no post ever stops carrying them.
   */

  /**
   * Rewrite whatever legacy keys a stored hero still carries onto the canonical
   * ones, and drop the legacy keys.
   *
   * Setting an attribute to `undefined` removes it from the serialized block, so
   * folding this patch into the next edit retires the old keys as content is
   * touched, rather than dirtying every post that nobody opened. A canonical
   * value already present always wins: this migrates, it never overwrites.
   *
   * @param {Object} attributes Current block attributes.
   * @return {Object} Patch to apply alongside the edit; empty when nothing is legacy.
   */
  function pageHeroLegacyAttributePatch(attributes = {}) {
    const patch = {};
    if (attributes.imageUrl !== undefined) {
      if (!attributes.imageSrc) {
        patch.imageSrc = attributes.imageUrl;
      }
      patch.imageUrl = undefined;
    }
    if (attributes.hideCta !== undefined) {
      if (attributes.hideCta === true) {
        patch.showCta = false;
      }
      patch.hideCta = undefined;
    }
    if (attributes.ctaUrl !== undefined) {
      if (!attributes.ctaHref) {
        patch.ctaHref = attributes.ctaUrl;
      }
      patch.ctaUrl = undefined;
    }
    if (attributes.cta && typeof attributes.cta === "object") {
      const { label, href, url } = attributes.cta;
      if (!attributes.ctaLabel && label) {
        patch.ctaLabel = label;
      }
      if (!attributes.ctaHref && patch.ctaHref === undefined && (href || url)) {
        patch.ctaHref = href || url;
      }
      patch.cta = undefined;
    }
    return patch;
  }

  window.gqBioeconomiaLib = {
    slugFromLabel,
    fieldKind,
    arrayItemFields,
    blankValueForSchema,
    blankArrayItem,
    normalizeArrayItem,
    isValidArrayItem,
    enumFromContracts,
    pageHeroCanvasStyle,
    pageHeroCanvasPadding,
    pageHeroHeightLabels,
    pageHeroLegacyAttributePatch,
  };
})();
