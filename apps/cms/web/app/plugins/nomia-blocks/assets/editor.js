(() => {
  const { InnerBlocks, MediaUpload, MediaUploadCheck, URLInput, useBlockProps } =
    window.wp.blockEditor;
  const { getBlockType, registerBlockType } = window.wp.blocks;
  const { Button, Notice, SelectControl, TextareaControl, TextControl, ToggleControl } =
    window.wp.components;
  const { useSelect } = window.wp.data;
  const { createElement, useEffect, useMemo, useRef, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const contracts = window.getquickNomiaBlocksContracts;
  const {
    buildPreviewUrl: buildPreviewRequestUrl,
    getPreviewOrigin,
    PREVIEW_DEFAULT_HEIGHT,
    registerPreviewResizeListener,
  } = window.getquickNomiaFrontendRules;
  const {
    arrayItemFields,
    blankArrayItem,
    enumFromContracts,
    fieldKind,
    isValidArrayItem,
    normalizeArrayItem,
  } = window.getquickNomiaBlocksLib;

  // Runtime settings WordPress adds before this script (`Blocks\EditorAssets`).
  const settings = window.getquickNomiaBlocksSettings || {};
  const NOMIA_FE_BASE_URL = settings.nomiaFeBaseUrl || "http://localhost:4321";
  const PREVIEW_TOKEN = settings.previewToken || "";

  /**
   * The site's colors, as the block editor offers them: GQ Design's palette
   * (GETQUICK → Design → Branding → Colors, saved in Global Styles). The page
   * background panel and the Nomia blocks' color controls offer these, so every
   * color comes from the palette editors manage.
   *
   * @return {Array<{name: string, label: string, slug: string, color: string}>} Palette colors.
   */
  function useSiteColors() {
    return useSelect((select) => {
      const colors = select("core/block-editor")?.getSettings?.()?.colors || [];
      return colors
        .filter((entry) => typeof entry?.color === "string")
        .map(({ name, slug, color }) => ({
          name: name || slug,
          label: name || slug,
          slug,
          color,
        }));
    }, []);
  }
  function normalizeHexColor(value) {
    if (typeof value !== "string") {
      return "";
    }
    const color = value.trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : "";
  }

  /**
   * WCAG relative luminance, mirroring `isLightSectionBackground` in
   * `apps/frontend/src/lib/section-block.ts` so the editor preview shows the same
   * text contrast the Astro renderer will pick.
   *
   * @param {string} hex Six-digit hex colour.
   * @return {boolean} True when black body copy reads better than white.
   */
  function isLightColor(hex) {
    const color = normalizeHexColor(hex);
    if (!color) {
      return true;
    }
    const channel = (offset) => {
      const srgb = parseInt(color.slice(offset, offset + 2), 16) / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
    };
    const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
    return luminance > 0.1791;
  }

  /**
   * Read an enum attribute's allowed values and default straight from the
   * generated contracts (`window.getquickNomiaBlocksContracts`), so a bespoke editor's controls cannot drift
   * from the contract the Astro renderer reads the same attribute against.
   *
   * @param {string} blockName     Registered block name, e.g. `getquick/section`.
   * @param {string} attributeName Enum attribute to read from that block.
   * @return {{values: string[], fallback: string|undefined, read: (value: unknown) => string|undefined}} Allowed values, the default, and a reader that clamps onto it.
   */
  function contractEnum(blockName, attributeName) {
    return enumFromContracts(contracts, blockName, attributeName);
  }

  function buildPreviewUrl(blockName, attributes) {
    return buildPreviewRequestUrl({
      baseUrl: NOMIA_FE_BASE_URL,
      blockName,
      attributes,
      previewToken: PREVIEW_TOKEN,
    });
  }
  const PREVIEW_DEBOUNCE_MS = 300;
  function PreviewIframe({ title, src }) {
    const iframeRef = useRef(null);
    const [height, setHeight] = useState(PREVIEW_DEFAULT_HEIGHT);

    // The preview URL encodes every attribute, so `src` changes on every keystroke.
    // Debounce it so the iframe only reloads shortly after typing pauses, instead
    // of once per keystroke (which causes visible flicker + a preview round-trip).
    const [debouncedSrc, setDebouncedSrc] = useState(src);
    useEffect(() => {
      const id = setTimeout(() => setDebouncedSrc(src), PREVIEW_DEBOUNCE_MS);
      return () => clearTimeout(id);
    }, [src]);
    useEffect(() => {
      const expectedOrigin = getPreviewOrigin(NOMIA_FE_BASE_URL);
      return registerPreviewResizeListener(
        window,
        () => ({
          expectedOrigin,
          source: iframeRef.current?.contentWindow,
        }),
        (nextHeight) => setHeight(nextHeight),
      );
    }, []);
    return createElement("iframe", {
      ref: iframeRef,
      title: title,
      src: debouncedSrc,
      loading: "lazy",
      style: {
        height: `${height}px`,
      },
    });
  }

  const TEMATICAS_TAXONOMY = "tematicas";
  const FALLBACK_TEMATICAS = [
    {
      id: "bioeconomia-sustentavel",
      name: "Bioeconomia Sustentável",
      slug: "bioeconomia-sustentavel",
    },
    {
      id: "economia-circular",
      name: "Economia Circular",
      slug: "economia-circular",
    },
  ];
  function normalizeTematicaOptions(terms, selectedLabel) {
    const sourceTerms = Array.isArray(terms) && terms.length > 0 ? terms : FALLBACK_TEMATICAS;
    const options = sourceTerms.map((term) => ({
      label: term.name,
      value: term.name,
      slug: term.slug || "",
    }));
    if (selectedLabel && !options.some((option) => option.value === selectedLabel)) {
      return [
        {
          label: selectedLabel,
          value: selectedLabel,
          slug: "",
        },
        ...options,
      ];
    }
    return options;
  }
  function accentForTematica(label, slug = "") {
    const value = `${label} ${slug}`.toLowerCase();
    return value.includes("bioeconomia") || value.includes("sustentavel") ? "botnico" : "ciano";
  }
  function useTematicaEyebrow(attributes, setAttributes) {
    const eyebrow = attributes.eyebrowLabel || attributes.eyebrow || "";
    const tematicaTerms = useSelect(
      (select) =>
        select("core")?.getEntityRecords?.("taxonomy", TEMATICAS_TAXONOMY, {
          per_page: -1,
          orderby: "name",
          order: "asc",
        }),
      [],
    );
    const tematicaOptions = useMemo(
      () => normalizeTematicaOptions(tematicaTerms, eyebrow),
      [tematicaTerms, eyebrow],
    );
    const selectedTematica = eyebrow || "Economia Circular";
    const selectedOption = tematicaOptions.find((option) => option.value === selectedTematica);
    const accent = accentForTematica(selectedTematica, selectedOption?.slug);
    function setTematica(next) {
      const nextOption = tematicaOptions.find((option) => option.value === next);
      setAttributes({
        eyebrowLabel: next,
        eyebrow: next,
        accent: accentForTematica(next, nextOption?.slug),
      });
    }
    return {
      selectedTematica,
      tematicaOptions,
      accent,
      setTematica,
    };
  }
  function TematicaEyebrowField({
    accent,
    selectedTematica,
    tematicaOptions,
    setTematica,
    centered = false,
  }) {
    return createElement(
      "div",
      {
        className: `getquick-nomia-tematica-eyebrow is-${accent}${centered ? " is-centered" : ""}`,
      },
      createElement(
        "span",
        {
          "aria-hidden": true,
        },
        "+",
      ),
      createElement(SelectControl, {
        label: __("Temática", "getquick-nomia-blocks"),
        hideLabelFromVision: true,
        value: selectedTematica,
        options: tematicaOptions,
        onChange: setTematica,
      }),
    );
  }

  /*
   * Image alt-text inspector field. The `TextControl` with the translatable
   * "Image alt text" label is duplicated in the editors that manage a primary
   * image (TwoColumnsTextImage, MapList).
   */
  function ImageAltControl({ value, onChange }) {
    return createElement(TextControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: __("Texto alternativo da imagem", "getquick-nomia-blocks"),
      value: value || "",
      onChange: onChange,
    });
  }

  function JsonField({ label, value, onChange }) {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value ?? {}, null, 2);
    return createElement(TextareaControl, {
      label: label,
      value: stringValue,
      rows: 8,
      help: __(
        "Structured content only. Visual styling is controlled by the Astro web app.",
        "getquick-nomia-blocks",
      ),
      onChange: (next) => {
        try {
          onChange(JSON.parse(next || "null"));
        } catch {
          onChange(next);
        }
      },
    });
  }

  /*
   * Inspector media-upload button (the `Button variant="secondary"` envelope).
   *
   * Replaces the inline
   * `<MediaUploadCheck><MediaUpload allowedTypes={['image']} render={<Button variant="secondary">…}>` block duplicated
   * across the custom editors. `labelSelect`/`labelReplace` are the
   * already-translated button labels; `hasImage` picks between them.
   *
   * Block-toolbar variants (which use `ToolbarButton` + an icon) are intentionally
   * not handled here — keep those inline.
   *
   * Pass `previewUrl` to turn the control into the selected image itself: the
   * thumbnail becomes the button that opens the media library. Editors that do
   * not pass it keep the plain text button.
   */
  function MediaUploadButton({
    imageId,
    onSelect,
    labelSelect,
    labelReplace,
    hasImage,
    previewUrl,
    previewAlt = "",
  }) {
    return createElement(
      MediaUploadCheck,
      null,
      createElement(MediaUpload, {
        allowedTypes: ["image"],
        value: imageId,
        onSelect: onSelect,
        render: ({ open }) =>
          previewUrl
            ? createElement(
                Button,
                {
                  __next40pxDefaultSize: true,
                  className: "getquick-nomia-blocks-media-upload__preview",
                  label: labelReplace,
                  showTooltip: true,
                  onClick: open,
                },
                createElement("img", {
                  src: previewUrl,
                  alt: previewAlt,
                }),
                createElement("span", null, labelReplace),
              )
            : createElement(
                Button,
                {
                  __next40pxDefaultSize: true,
                  variant: "secondary",
                  onClick: open,
                },
                hasImage ? labelReplace : labelSelect,
              ),
      }),
    );
  }

  function MediaField({ attributeName, attributes, setAttributes }) {
    const value = attributes[attributeName] || "";
    const idAttribute = attributeName.replace(/(Url|Src)$/i, "Id");
    const altAttribute = attributeName.replace(/(Url|Src)$/i, "Alt");
    return createElement(
      "div",
      {
        className: "getquick-nomia-blocks-media-field",
      },
      createElement(TextControl, {
        label: attributeName,
        value: value,
        onChange: (next) =>
          setAttributes({
            [attributeName]: next,
          }),
      }),
      createElement(
        MediaUploadCheck,
        null,
        createElement(MediaUpload, {
          allowedTypes: ["image"],
          value: attributes[idAttribute],
          onSelect: (media) =>
            setAttributes({
              [idAttribute]: media.id,
              [attributeName]: media.url,
              [altAttribute]: media.alt || "",
            }),
          render: ({ open }) =>
            createElement(
              Button,
              {
                variant: "secondary",
                onClick: open,
              },
              __("Selecionar imagem", "getquick-nomia-blocks"),
            ),
        }),
      ),
    );
  }

  /*
   * Inspector URL field (the `getquick-nomia-blocks-url-field` envelope).
   *
   * Replaces the inline `<div className="...url-field"><label/><URLInput/></div>`
   * block duplicated across the custom editors (CTA URL, Result URL, Item URL,
   * Listen/Share/Spotlight/Platform URL, …). `label` is the already-translated
   * field label; `value`/`onChange` are caller-supplied so this works for both
   * top-level attributes and array-item editors.
   */
  function UrlField({ label, value, onChange }) {
    return createElement(
      "div",
      {
        className: "getquick-nomia-blocks-url-field",
      },
      createElement(URLInput, {
        __next40pxDefaultSize: true,
        label: label,
        value: value || "",
        onChange: onChange,
      }),
    );
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function blankValue(value) {
    if (Array.isArray(value)) {
      return [];
    }
    if (isPlainObject(value)) {
      return Object.fromEntries(Object.keys(value).map((key) => [key, ""]));
    }
    return "";
  }
  function inferArrayTemplate(rows) {
    const firstObject = rows.find(isPlainObject);
    if (firstObject) {
      return Object.fromEntries(
        Object.keys(firstObject).map((key) => [key, blankValue(firstObject[key])]),
      );
    }
    return "";
  }
  function schemaValue(row, fieldName) {
    return isPlainObject(row) ? row[fieldName] : "";
  }
  function updateField(row, fieldName, onRowChange, next) {
    onRowChange({
      ...row,
      [fieldName]: next,
    });
  }
  function ArrayRowField({ fieldName, row, onRowChange, schema, required }) {
    const value = schemaValue(row, fieldName);
    const kind = fieldKind(fieldName, schema);
    if (kind === "media") {
      const idField = /(Url|Src)$/i.test(fieldName)
        ? fieldName.replace(/(Url|Src)$/i, "Id")
        : `${fieldName}Id`;
      const altField = /(Url|Src)$/i.test(fieldName)
        ? fieldName.replace(/(Url|Src)$/i, "Alt")
        : `${fieldName}Alt`;
      return createElement(
        "div",
        {
          className: "getquick-nomia-blocks-media-field",
        },
        createElement(TextControl, {
          label: fieldName,
          value: value || "",
          required: required,
          onChange: (next) => updateField(row, fieldName, onRowChange, next),
        }),
        createElement(MediaUploadButton, {
          imageId: row[idField],
          onSelect: (media) =>
            onRowChange({
              ...row,
              [idField]: media.id,
              [fieldName]: media.url,
              [altField]: media.alt || row[altField] || "",
            }),
          labelSelect: __("Select image", "getquick-nomia-blocks"),
          labelReplace: __("Replace image", "getquick-nomia-blocks"),
          hasImage: Boolean(row[idField] || value),
        }),
      );
    }
    if (kind === "url") {
      return createElement(
        "div",
        {
          className: "getquick-nomia-blocks-url-field",
        },
        createElement(URLInput, {
          label: fieldName,
          value: value || "",
          onChange: (next) => updateField(row, fieldName, onRowChange, next),
        }),
      );
    }
    if (kind === "select") {
      return createElement(SelectControl, {
        label: fieldName,
        value: value ?? "",
        options: (schema.enum || []).map((option) => ({
          label: option,
          value: option,
        })),
        required: required,
        onChange: (next) => updateField(row, fieldName, onRowChange, next),
      });
    }
    if (kind === "boolean") {
      return createElement(ToggleControl, {
        label: fieldName,
        checked: value === true || value === "true",
        onChange: (next) => updateField(row, fieldName, onRowChange, next),
      });
    }
    if (kind === "number") {
      return createElement(TextControl, {
        label: fieldName,
        type: "number",
        value: value ?? "",
        required: required,
        onChange: (next) => {
          const numeric = Number(next);
          updateField(
            row,
            fieldName,
            onRowChange,
            next === "" || !Number.isFinite(numeric) ? next : numeric,
          );
        },
      });
    }
    if (kind === "json") {
      return createElement(JsonField, {
        label: fieldName,
        value: value,
        onChange: (next) => updateField(row, fieldName, onRowChange, next),
      });
    }
    const FieldControl = kind === "textarea" ? TextareaControl : TextControl;
    return createElement(FieldControl, {
      label: fieldName,
      value:
        isPlainObject(value) || Array.isArray(value)
          ? JSON.stringify(value, null, 2)
          : (value ?? ""),
      rows: FieldControl === TextareaControl ? 3 : undefined,
      required: required,
      onChange: (next) => updateField(row, fieldName, onRowChange, next),
    });
  }
  function ArrayField({ attributeName, schema, value, onChange }) {
    const rows = Array.isArray(value) ? value : [];
    const fields = arrayItemFields(schema);
    const hasSchemaFields = fields !== null && Object.keys(fields).length > 0;
    const template = hasSchemaFields ? blankArrayItem(schema) : inferArrayTemplate(rows);
    const objectRows =
      hasSchemaFields || (rows.every((row) => isPlainObject(row)) && isPlainObject(template));
    const objectKeys = objectRows ? Object.keys(hasSchemaFields ? fields : template) : [];
    const requiredFields = schema?.items?.required || [];
    const invalidRowCount = hasSchemaFields
      ? rows.filter((row) => !isValidArrayItem(row, schema)).length
      : 0;
    function updateRow(index, nextRow) {
      const normalizedRow = hasSchemaFields ? normalizeArrayItem(nextRow, schema) : nextRow;
      onChange(rows.map((row, rowIndex) => (rowIndex === index ? normalizedRow : row)));
    }
    function addRow() {
      onChange([...rows, hasSchemaFields ? blankArrayItem(schema) : template]);
    }
    function removeRow(index) {
      onChange(rows.filter((_, rowIndex) => rowIndex !== index));
    }
    return createElement(
      "div",
      {
        className: "getquick-nomia-blocks-array-field",
      },
      createElement(
        "div",
        {
          className: "getquick-nomia-blocks-array-field__header",
        },
        createElement("strong", null, attributeName),
        createElement(
          Button,
          {
            variant: "secondary",
            onClick: addRow,
          },
          __("Adicionar item", "getquick-nomia-blocks"),
        ),
      ),
      invalidRowCount > 0
        ? createElement(
            "p",
            {
              className: "getquick-nomia-blocks-array-field__validation",
              role: "alert",
            },
            `${invalidRowCount} ${__("incomplete item(s). Complete the required fields before publishing.", "getquick-nomia-blocks")}`,
          )
        : null,
      rows.length === 0
        ? createElement(
            "p",
            {
              className: "getquick-nomia-blocks-array-field__empty",
            },
            __("Ainda sem itens.", "getquick-nomia-blocks"),
          )
        : null,
      rows.map((row, index) => {
        const displayRow = hasSchemaFields ? normalizeArrayItem(row, schema) : row;
        return createElement(
          "div",
          {
            className: "getquick-nomia-blocks-array-field__item",
            key: index,
          },
          createElement(
            "div",
            {
              className: "getquick-nomia-blocks-array-field__item-header",
            },
            createElement("span", null, __("Item", "getquick-nomia-blocks"), " ", index + 1),
            createElement(
              Button,
              {
                isDestructive: true,
                variant: "tertiary",
                onClick: () => removeRow(index),
              },
              __("Remover", "getquick-nomia-blocks"),
            ),
          ),
          objectRows
            ? objectKeys.map((key) =>
                createElement(ArrayRowField, {
                  key: key,
                  fieldName: key,
                  row: displayRow,
                  onRowChange: (nextRow) => updateRow(index, nextRow),
                  schema: hasSchemaFields ? fields[key] : undefined,
                  required: requiredFields.includes(key),
                }),
              )
            : createElement(TextControl, {
                label: attributeName,
                value: row ?? "",
                onChange: (next) => updateRow(index, next),
              }),
        );
      }),
    );
  }

  function AttributeField({ attributeName, schema, attributes, setAttributes }) {
    if (attributeName === "schemaVersion" || attributeName === "blockId") {
      return null;
    }
    if (schema?.type === "array") {
      return createElement(ArrayField, {
        attributeName: attributeName,
        schema: schema,
        value: attributes[attributeName],
        onChange: (next) =>
          setAttributes({
            [attributeName]: next,
          }),
      });
    }
    const kind = fieldKind(attributeName, schema);
    const value = attributes[attributeName];
    if (kind === "json") {
      return createElement(JsonField, {
        label: attributeName,
        value: value,
        onChange: (next) =>
          setAttributes({
            [attributeName]: next,
          }),
      });
    }
    if (kind === "media") {
      return createElement(MediaField, {
        attributeName: attributeName,
        attributes: attributes,
        setAttributes: setAttributes,
      });
    }
    if (kind === "url") {
      return createElement(
        "div",
        {
          className: "getquick-nomia-blocks-url-field",
        },
        createElement(URLInput, {
          label: attributeName,
          value: value || "",
          onChange: (next) =>
            setAttributes({
              [attributeName]: next,
            }),
        }),
      );
    }
    if (kind === "select") {
      return createElement(SelectControl, {
        label: attributeName,
        value: value ?? schema.default ?? "",
        options: (schema.enum || []).map((option) => ({
          label: option,
          value: option,
        })),
        onChange: (next) =>
          setAttributes({
            [attributeName]: next,
          }),
      });
    }
    if (kind === "boolean") {
      return createElement(ToggleControl, {
        label: attributeName,
        checked: (value ?? schema.default) === true || (value ?? schema.default) === "true",
        onChange: (next) =>
          setAttributes({
            [attributeName]: next,
          }),
      });
    }
    if (kind === "number") {
      return createElement(TextControl, {
        label: attributeName,
        type: "number",
        value: value ?? "",
        onChange: (next) => {
          const numeric = Number(next);
          setAttributes({
            [attributeName]: next === "" || !Number.isFinite(numeric) ? next : numeric,
          });
        },
      });
    }
    const Control = kind === "textarea" ? TextareaControl : TextControl;
    return createElement(Control, {
      label: attributeName,
      value: value || "",
      rows: kind === "textarea" ? 4 : undefined,
      onChange: (next) =>
        setAttributes({
          [attributeName]: next,
        }),
    });
  }

  const INLINE_EDITOR_HIDDEN_ATTRIBUTES = new Set(["schemaVersion", "blockId"]);

  /**
   * The editor of a block without a bespoke one: a field per contract
   * attribute, and the Frontend's rendering of them unless the block's
   * contract asks for inline fields only.
   */
  function ContractEdit({ name, attributes, setAttributes }) {
    const contract = contracts.find((item) => item.blockName === name);
    const previewUrl = useMemo(() => buildPreviewUrl(name, attributes), [name, attributes]);
    const blockProps = useBlockProps({
      className: "getquick-nomia-blocks-inline-editor",
    });
    if (!contract) {
      return createElement(
        Notice,
        {
          status: "error",
          isDismissible: false,
        },
        __("Contrato de bloco Nomia em falta.", "getquick-nomia-blocks"),
      );
    }
    const editableAttributes = Object.entries(contract.attributes).filter(
      ([attributeName]) => !INLINE_EDITOR_HIDDEN_ATTRIBUTES.has(attributeName),
    );

    // The registry holds the copy that went through `__()` on the PHP side;
    // the contracts only carry the untranslated Portuguese source.
    const blockType = getBlockType(name);
    return createElement(
      "div",
      blockProps,
      createElement(
        "p",
        {
          className: "getquick-nomia-blocks-inline-editor__intro",
        },
        blockType?.description ?? contract.description,
      ),
      editableAttributes.map(([attributeName, schema]) =>
        createElement(AttributeField, {
          key: attributeName,
          attributeName: attributeName,
          schema: schema,
          attributes: attributes,
          setAttributes: setAttributes,
        }),
      ),
      contract.editorExperience === "inline-fields"
        ? null
        : createElement(
            "div",
            {
              className: "getquick-nomia-blocks-editor-preview",
            },
            createElement(PreviewIframe, {
              title: sprintf(
                /* translators: %s: block title. */
                __("Pré-visualização: %s", "getquick-nomia-blocks"),
                blockType?.title ?? contract.title,
              ),
              src: previewUrl,
            }),
          ),
    );
  }

  /*
   * Registers a Nomia block's editor from its `blocks/<id>/index.js`. Only
   * `edit`, `save`, and any `deprecated` versions are registered here.
   * Everything else — apiVersion, title, description, icon, category, keywords,
   * example, attributes, supports — comes from the block's generated
   * `block.json`, which PHP registers and WordPress serializes into the editor
   * before this script runs.
   *
   * This is not just deduplication. `processBlockType` merges the two as
   * `{ ...serverDefinition, ...jsSettings }`, so anything passed here wins — and
   * the strings in the contracts are the raw Portuguese source, while the
   * server definition carries the copy WordPress translated through the
   * `block.json` text domain. Passing a title here would pin the inserter to
   * Portuguese in every locale and make the translation catalogs dead weight.
   *
   * `deprecated` receives the contract's attribute schemas and returns the
   * block's `deprecated` list (newest first), because a deprecation has to
   * declare the full attribute set of the version it parses.
   */
  const registerContractBlock = (name, { edit = ContractEdit, deprecated } = {}) => {
    const contract = contracts.find((item) => item.blockName === name);
    registerBlockType(name, {
      edit,
      // Container blocks must serialize their children into post_content;
      // Astro reads them back from `content(format: RAW)`. Every other block
      // is attribute-only and saves nothing.
      save: contract?.container ? () => createElement(InnerBlocks.Content, null) : () => null,
      ...(deprecated && contract ? { deprecated: deprecated(contract.attributes) } : {}),
    });
  };

  window.getquickNomiaBlocksEditor = {
    NOMIA_FE_BASE_URL,
    PREVIEW_TOKEN,
    useSiteColors,
    normalizeHexColor,
    isLightColor,
    contractEnum,
    buildPreviewUrl,
    PreviewIframe,
    TEMATICAS_TAXONOMY,
    FALLBACK_TEMATICAS,
    useTematicaEyebrow,
    TematicaEyebrowField,
    ImageAltControl,
    JsonField,
    MediaUploadButton,
    MediaField,
    UrlField,
    ArrayField,
    AttributeField,
    registerContractBlock,
  };
})();
