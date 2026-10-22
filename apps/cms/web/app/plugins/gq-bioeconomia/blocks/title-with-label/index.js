(() => {
  const {
    BlockControls,
    HeadingLevelDropdown,
    InspectorControls,
    RichText,
    useBlockProps,
    Warning,
  } = window.wp.blockEditor;
  const { Button, PanelBody, SelectControl, ToggleControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const {
    hasTitleWithLabelLegacyTypography,
    migrateTitleWithLabelLegacyTypography,
    normalizeTitleWithLabelHeadingLevel,
    readTitleWithLabelTypographies,
    TITLE_WITH_LABEL_FIELDS,
    TITLE_WITH_LABEL_HEADING_LEVELS,
    TITLE_WITH_LABEL_LEGACY_ATTRIBUTES,
    TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS,
    TITLE_WITH_LABEL_SIZE_TOKENS,
    TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS,
    titleWithLabelFieldStyleProperties,
    titleWithLabelLineHeightPx,
    titleWithLabelSizePx,
    withTitleWithLabelTypography,
  } = window.gqBioeconomiaFrontendRules;
  const { registerContractBlock } = window.gqBioeconomiaEditor;

  function fieldTitles() {
    return {
      label: __("Etiqueta", "gq-bioeconomia"),
      titleLine1: __("Título · linha 1", "gq-bioeconomia"),
      titleLine2: __("Título · linha 2", "gq-bioeconomia"),
    };
  }
  function sizeNames() {
    return {
      extra: __("Extra", "gq-bioeconomia"),
      notes: __("Notas", "gq-bioeconomia"),
      body: __("Corpo", "gq-bioeconomia"),
      "body-large": __("Corpo grande", "gq-bioeconomia"),
      subtitle: __("Subtítulo", "gq-bioeconomia"),
      h4: __("Título 4", "gq-bioeconomia"),
      h3: __("Título 3", "gq-bioeconomia"),
      h2: __("Título 2", "gq-bioeconomia"),
      h1: __("Título 1", "gq-bioeconomia"),
      large: __("Grande", "gq-bioeconomia"),
      super: __("Super", "gq-bioeconomia"),
    };
  }
  function sizeLabel(slug) {
    return sprintf(
      /* translators: 1: design-system size name, e.g. "Título 4". 2: pixels. */
      __("%1$s · %2$spx", "gq-bioeconomia"),
      sizeNames()[slug],
      titleWithLabelSizePx(slug),
    );
  }
  function lineHeightLabel(slug) {
    return sprintf(
      /* translators: %s: pixels. */
      __("%spx", "gq-bioeconomia"),
      titleWithLabelLineHeightPx(slug),
    );
  }

  /**
   * The empty option keeps the field on its design default, and names that
   * default so an editor sees what "nothing chosen" looks like.
   *
   * @param {string}   defaultLabel Label of the token the field inherits.
   * @param {Object[]} tokens       Token list, ascending.
   * @param {Function} label        Formats one token slug for display.
   * @return {Object[]} SelectControl options.
   */
  function tokenOptions(defaultLabel, tokens, label) {
    return [
      {
        value: "",
        label: sprintf(
          /* translators: %s: the design default, e.g. "Título 4 · 32px". */
          __("Predefinido (%s)", "gq-bioeconomia"),
          defaultLabel,
        ),
      },
      ...tokens.map(({ slug }) => ({
        value: slug,
        label: label(slug),
      })),
    ];
  }

  /**
   * One field's typography as an inspector panel: every control picks a design
   * token or a whole-field style, and "Repor" clears the field. Built from stable
   * components only — `ToolsPanel` is still `__experimental` in WordPress 7.1.
   *
   * @param {Object}   props
   * @param {string}   props.field       Field key.
   * @param {string}   props.title       Field name shown in the panel header.
   * @param {Object}   props.typography  Current overrides for the field.
   * @param {boolean}  props.initialOpen Whether the panel starts expanded.
   * @param {Function} props.onChange    Receives the field's next overrides.
   */
  function FieldTypographyPanel({ field, title, typography, initialOpen, onChange }) {
    const defaults = TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS[field];
    const update = (property, value) =>
      onChange({
        ...typography,
        [property]: value || undefined,
      });
    const hasOverride = Object.keys(typography).length > 0;
    return createElement(
      PanelBody,
      {
        title: sprintf(
          /* translators: %s: field name, e.g. "Título · linha 1". */
          __("Tipografia: %s", "gq-bioeconomia"),
          title,
        ),
        initialOpen: initialOpen,
      },
      createElement(
        "div",
        {
          className: "getquick-title-with-label-editor-panel",
        },
        createElement(SelectControl, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          label: __("Tamanho", "gq-bioeconomia"),
          value: typography.size ?? "",
          options: tokenOptions(sizeLabel(defaults.size), TITLE_WITH_LABEL_SIZE_TOKENS, sizeLabel),
          onChange: (next) => update("size", next),
        }),
        createElement(SelectControl, {
          __next40pxDefaultSize: true,
          __nextHasNoMarginBottom: true,
          label: __("Altura da linha", "gq-bioeconomia"),
          value: typography.lineHeight ?? "",
          options: tokenOptions(
            lineHeightLabel(defaults.lineHeight),
            TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS,
            lineHeightLabel,
          ),
          onChange: (next) => update("lineHeight", next),
        }),
        createElement(ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: __("Negrito", "gq-bioeconomia"),
          checked: typography.bold === true,
          onChange: (next) => update("bold", next),
        }),
        createElement(ToggleControl, {
          __nextHasNoMarginBottom: true,
          label: __("Itálico", "gq-bioeconomia"),
          checked: typography.italic === true,
          onChange: (next) => update("italic", next),
        }),
        createElement(
          Button,
          {
            __next40pxDefaultSize: true,
            variant: "secondary",
            disabled: !hasOverride,
            accessibleWhenDisabled: true,
            onClick: () => onChange({}),
          },
          __("Repor", "gq-bioeconomia"),
        ),
      ),
    );
  }
  function TitleWithLabelEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "getquick-title-with-label-editor",
    });
    const titles = fieldTitles();
    const typography = readTitleWithLabelTypographies(attributes);
    const level = normalizeTitleWithLabelHeadingLevel(attributes.level);
    const Heading = `h${level}`;
    // Astro renders nothing without these two, so say so before publishing.
    const isMissingRequired = !attributes.label || !attributes.titleLine1;

    // The text fields store plain copy: no formats, and Enter/Shift+Enter
    // cannot insert a `<br>` that the published heading would not honour.
    const textProps = {
      allowedFormats: [],
      disableLineBreaks: true,
      withoutInteractiveFormatting: true,
    };
    return createElement(
      Fragment,
      null,
      createElement(
        BlockControls,
        {
          group: "block",
        },
        createElement(HeadingLevelDropdown, {
          options: TITLE_WITH_LABEL_HEADING_LEVELS,
          value: level,
          onChange: (next) =>
            setAttributes({
              level: next,
            }),
        }),
      ),
      createElement(
        InspectorControls,
        null,
        TITLE_WITH_LABEL_FIELDS.map((field) =>
          createElement(FieldTypographyPanel, {
            key: field,
            field: field,
            initialOpen: field === TITLE_WITH_LABEL_FIELDS[0],
            title: titles[field],
            typography: typography[field],
            onChange: (next) =>
              setAttributes({
                typography: withTitleWithLabelTypography(attributes.typography, field, next),
              }),
          }),
        ),
      ),
      createElement(
        "section",
        blockProps,
        isMissingRequired
          ? createElement(
              Warning,
              null,
              __(
                "Este bloco não aparece no site enquanto a etiqueta e a primeira linha do título estiverem vazias.",
                "gq-bioeconomia",
              ),
            )
          : null,
        createElement(
          "div",
          {
            className: "getquick-title-with-label-editor__inner",
          },
          createElement(
            "div",
            {
              className: "getquick-title-with-label-editor__grid",
            },
            createElement(
              "div",
              {
                className: "getquick-title-with-label-editor__eyebrow",
              },
              createElement(
                "span",
                {
                  className: "getquick-title-with-label-editor__eyebrow-icon",
                  "aria-hidden": true,
                },
                createElement(
                  "svg",
                  {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    focusable: false,
                  },
                  createElement("path", {
                    d: "M12 4v16M4 12h16M6.34 6.34l11.32 11.32M17.66 6.34L6.34 17.66",
                    stroke: "currentColor",
                    strokeWidth: "1.35",
                    strokeLinecap: "round",
                  }),
                ),
              ),
              createElement(RichText, {
                ...textProps,
                tagName: "p",
                identifier: "label",
                "aria-label": titles.label,
                className: "getquick-title-with-label-editor__eyebrow-label",
                style: titleWithLabelFieldStyleProperties(typography.label),
                value: attributes.label || "",
                placeholder: __("Etiqueta", "gq-bioeconomia"),
                onChange: (next) =>
                  setAttributes({
                    label: next,
                  }),
              }),
            ),
            createElement(
              Heading,
              {
                className: "getquick-title-with-label-editor__title",
              },
              createElement(RichText, {
                ...textProps,
                tagName: "span",
                identifier: "titleLine1",
                "aria-label": titles.titleLine1,
                className:
                  "getquick-title-with-label-editor__line getquick-title-with-label-editor__line--1",
                style: titleWithLabelFieldStyleProperties(typography.titleLine1),
                value: attributes.titleLine1 || "",
                placeholder: __("Primeira linha do título", "gq-bioeconomia"),
                onChange: (next) =>
                  setAttributes({
                    titleLine1: next,
                  }),
              }),
              createElement(RichText, {
                ...textProps,
                tagName: "span",
                identifier: "titleLine2",
                "aria-label": titles.titleLine2,
                className:
                  "getquick-title-with-label-editor__line getquick-title-with-label-editor__line--2",
                style: titleWithLabelFieldStyleProperties(typography.titleLine2),
                value: attributes.titleLine2 || "",
                placeholder: __("Segunda linha do título (opcional)", "gq-bioeconomia"),
                onChange: (next) =>
                  setAttributes({
                    titleLine2: next,
                  }),
              }),
            ),
          ),
        ),
      ),
    );
  }

  /**
   * Block deprecation for content saved before the token schema, when each field
   * stored free pixel values (`titleLine1FontSize: 40`, `labelBold: true`, …).
   *
   * The block saves `null`, so a deprecation never runs for invalid markup; it
   * runs because `isEligible` sees a retired attribute in the comment delimiter.
   * `migrate` moves each value onto the nearest design token — the same mapping
   * the Astro renderer applies to not-yet-migrated content, so the page does not
   * change when the post is next saved — and drops the retired keys.
   *
   * @param {Object} attributes Current contract attribute schemas.
   * @return {Object[]} `deprecated` entries, newest first.
   */
  function titleWithLabelDeprecated(attributes) {
    const { typography: _typography, ...current } = attributes;
    const legacy = Object.fromEntries(
      Object.entries(TITLE_WITH_LABEL_LEGACY_ATTRIBUTES).map(([name, type]) => [
        name,
        {
          type,
        },
      ]),
    );
    return [
      {
        attributes: {
          ...current,
          ...legacy,
        },
        isEligible: hasTitleWithLabelLegacyTypography,
        migrate(stored) {
          const next = {
            ...stored,
          };
          for (const name of Object.keys(legacy)) {
            delete next[name];
          }
          const migrated = migrateTitleWithLabelLegacyTypography(stored);
          return {
            ...next,
            typography: Object.keys(migrated).length > 0 ? migrated : undefined,
          };
        },
        save: () => null,
      },
    ];
  }

  registerContractBlock("getquick/title-with-label", {
    edit: TitleWithLabelEdit,
    deprecated: titleWithLabelDeprecated,
  });
})();
