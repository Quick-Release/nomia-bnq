(() => {
  const {
    BlockControls,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    useBlockProps,
  } = window.wp.blockEditor;
  const {
    BaseControl,
    Button,
    ButtonGroup,
    ColorIndicator,
    ColorPalette,
    Dropdown,
    PanelBody,
    RangeControl,
    SelectControl,
    ToggleControl,
    ToolbarButton,
    ToolbarGroup,
  } = window.wp.components;
  const { createElement, Fragment, useCallback } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { contractEnum, MediaUploadButton, registerContractBlock, UrlField, useSiteColors } =
    window.gqBioeconomiaEditor;
  const {
    pageHeroCanvasPadding,
    pageHeroCanvasStyle,
    pageHeroHeightLabels,
    pageHeroLegacyAttributePatch,
  } = window.gqBioeconomiaLib;
  const {
    lineHeightTokenPx,
    normalizePageHeroColor,
    normalizePageHeroFontSize,
    PAGE_HERO_FONT_SIZE_BOUNDS,
    PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN,
    PAGE_HERO_TEXT_ALIGN_ATTRIBUTE,
    PAGE_HERO_TYPOGRAPHY_DEFAULTS,
    pageHeroTextColorAttribute,
    pageHeroTextFontSizeAttribute,
    pageHeroTextLineHeightAttribute,
    pageHeroTextStyleProperties,
    readPageHeroTextAlign,
    readPageHeroTextTypographies,
    readPageHeroTextTypography,
  } = window.gqBioeconomiaFrontendRules;

  /**
   * The steps and the default come from the generated contract, so the sidebar
   * offers exactly the values the Astro renderer accepts.
   */
  const HEIGHT = contractEnum("getquick/page-hero-static", "height");
  const PADDING_TOP = contractEnum("getquick/page-hero-static", "paddingTop");
  const PADDING_BOTTOM = contractEnum("getquick/page-hero-static", "paddingBottom");
  const SUBTITLE_LINE_HEIGHT = contractEnum("getquick/page-hero-static", "subtitleLineHeight");
  function paddingStepLabels() {
    return {
      default: __("Predefinido (da altura)", "gq-bioeconomia"),
      none: __("Nenhum", "gq-bioeconomia"),
      small: __("Pequeno", "gq-bioeconomia"),
      medium: __("Médio", "gq-bioeconomia"),
      large: __("Grande", "gq-bioeconomia"),
    };
  }

  /**
   * Line-height options name the pixel value of each design token, and the
   * "default" option names the token the subtitle's class already uses.
   *
   * @return {Object[]} SelectControl options.
   */
  function subtitleLineHeightOptions() {
    return SUBTITLE_LINE_HEIGHT.values.map((value) => ({
      value,
      label:
        value === "default"
          ? sprintf(
              /* translators: %s: pixels. */
              __("Predefinido (%spx)", "gq-bioeconomia"),
              lineHeightTokenPx(PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN),
            )
          : sprintf(
              /* translators: %s: pixels. */
              __("%spx", "gq-bioeconomia"),
              lineHeightTokenPx(value),
            ),
    }));
  }

  /**
   * One vertical padding step, top or bottom.
   *
   * @param {Object}   props
   * @param {string}   props.label    Control label.
   * @param {Object}   props.steps    Contract enum for the attribute.
   * @param {unknown}  props.value    Stored step.
   * @param {Function} props.onChange Receives the next step.
   */
  function PaddingStepControl({ label, steps, value, onChange }) {
    const labels = paddingStepLabels();
    return createElement(SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: label,
      value: steps.read(value),
      options: steps.values.map((step) => ({
        value: step,
        label: labels[step] ?? step,
      })),
      onChange: onChange,
    });
  }

  /**
   * Join the shorter height steps into a list for the sidebar help.
   *
   * The conjunction is a translatable string, so it lives here next to the
   * sentence it joins rather than inside `pageHeroHeightLabels`.
   *
   * @param {string[]} steps Uppercased steps, shortest first.
   * @return {string} The steps as a list, e.g. "XS, S, M e L".
   */
  function shorterStepsLabel(steps) {
    if (steps.length < 2) {
      return steps.join("");
    }
    return sprintf(
      /* translators: 1: comma-separated steps, e.g. "XS, S, M". 2: the last step, e.g. "L". */
      __("%1$s e %2$s", "gq-bioeconomia"),
      steps.slice(0, -1).join(", "),
      steps[steps.length - 1],
    );
  }
  function textFieldLabel(field) {
    return field === "title" ? __("Título", "gq-bioeconomia") : __("Subtítulo", "gq-bioeconomia");
  }

  /**
   * The stored colour is a swatch name where the palette has one, so the closed
   * control reads as a theme choice rather than a hex code.
   *
   * @param {string}  color  Effective six-digit hex colour, lowercase.
   * @param {boolean} isSet  Whether the block stores an override for this text.
   * @param {Array}   colors The site's palette (useSiteColors).
   * @return {string} Label for the closed colour control.
   */
  function colorSwatchLabel(color, isSet, colors) {
    const swatch = colors.find((option) => option.color.toLowerCase() === color);
    if (swatch) {
      return isSet
        ? swatch.label
        : sprintf(
            /* translators: %s: palette swatch name, e.g. "Cinza 100". */
            __("%s (predefinido)", "gq-bioeconomia"),
            swatch.label,
          );
    }
    return isSet ? color.toUpperCase() : __("Predefinido", "gq-bioeconomia");
  }

  /**
   * Colour is picked in three steps, not one: the sidebar shows the colour in
   * use, opening it offers the theme swatches, and Gutenberg's own "Custom color"
   * button inside the palette is the only path to a free-form picker. Clearing
   * stores nothing, so the text falls back to its design token.
   *
   * @param {Object}   props
   * @param {string}   props.id       Control id, shared by the label and toggle.
   * @param {string}   props.label    Sidebar label for this text's colour.
   * @param {string}   props.color    Effective colour, the design default when unset.
   * @param {boolean}  props.isSet    Whether an override is stored.
   * @param {Function} props.onChange Commits a colour, or a falsy value to clear.
   */
  function TextColorControl({ id, label, color, isSet, onChange }) {
    const siteColors = useSiteColors();
    return createElement(
      BaseControl,
      {
        __nextHasNoMarginBottom: true,
        id: id,
        label: label,
      },
      createElement(Dropdown, {
        className: "page-hero-static-editor__color-control",
        popoverProps: {
          placement: "left-start",
          offset: 24,
        },
        renderToggle: ({ isOpen, onToggle }) =>
          createElement(
            Button,
            {
              id: id,
              className: "page-hero-static-editor__color-toggle",
              variant: "secondary",
              onClick: onToggle,
              "aria-expanded": isOpen,
              "aria-haspopup": "true",
            },
            createElement(ColorIndicator, {
              colorValue: color,
            }),
            createElement("span", null, colorSwatchLabel(color, isSet, siteColors)),
          ),
        renderContent: () =>
          createElement(
            "div",
            {
              className: "page-hero-static-editor__color-palette",
            },
            createElement(ColorPalette, {
              colors: siteColors,
              value: color,
              enableAlpha: false,
              clearable: isSet,
              onChange: onChange,
            }),
          ),
      }),
    );
  }
  const TEXT_ALIGNMENTS = [
    {
      value: "left",
      icon: "editor-alignleft",
      label: __("Alinhar texto à esquerda", "gq-bioeconomia"),
    },
    {
      value: "center",
      icon: "editor-aligncenter",
      label: __("Alinhar texto ao centro", "gq-bioeconomia"),
    },
    {
      value: "right",
      icon: "editor-alignright",
      label: __("Alinhar texto à direita", "gq-bioeconomia"),
    },
  ];

  /**
   * One alignment for the whole stack: title, subtitle and CTA move together.
   *
   * @param {Object}   props
   * @param {Object}   props.attributes    Block attributes.
   * @param {Function} props.setAttributes Block attribute setter.
   */
  function TextAlignmentControl({ attributes, setAttributes }) {
    const align = readPageHeroTextAlign(attributes);
    return createElement(
      BaseControl,
      {
        __nextHasNoMarginBottom: true,
        id: "page-hero-static-text-align",
        label: __("Alinhamento do texto", "gq-bioeconomia"),
        help: __("Move o título, o subtítulo e o botão em conjunto.", "gq-bioeconomia"),
      },
      createElement(
        ButtonGroup,
        null,
        TEXT_ALIGNMENTS.map((option) =>
          createElement(Button, {
            key: option.value,
            size: "compact",
            icon: option.icon,
            label: option.label,
            showTooltip: true,
            variant: align === option.value ? "primary" : "secondary",
            "aria-pressed": align === option.value,
            onClick: () =>
              setAttributes({
                [PAGE_HERO_TEXT_ALIGN_ATTRIBUTE]: option.value,
              }),
          }),
        ),
      ),
    );
  }
  function TextTypographyControls({ field, attributes, setAttributes }) {
    const label = textFieldLabel(field);
    const typography = readPageHeroTextTypography(attributes, field);
    const defaults = PAGE_HERO_TYPOGRAPHY_DEFAULTS[field];
    const fontSizeAttribute = pageHeroTextFontSizeAttribute(field);
    const colorAttribute = pageHeroTextColorAttribute(field);
    const color = typography.color || defaults.color;
    return createElement(
      "div",
      {
        className: "page-hero-static-editor__typography-controls",
      },
      createElement(RangeControl, {
        __nextHasNoMarginBottom: true,
        label: sprintf(
          /* translators: %s: hero text field name, e.g. "Título". */
          __("Tamanho de letra (%s)", "gq-bioeconomia"),
          label,
        ),
        value: typography.fontSize ?? defaults.fontSize,
        min: PAGE_HERO_FONT_SIZE_BOUNDS.min,
        max: PAGE_HERO_FONT_SIZE_BOUNDS.max,
        step: 1,
        allowReset: typography.fontSize !== undefined,
        onChange: (next) =>
          setAttributes({
            [fontSizeAttribute]: normalizePageHeroFontSize(next),
          }),
      }),
      field === "subtitle"
        ? createElement(SelectControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: sprintf(
              /* translators: %s: hero text field name, e.g. "Subtítulo". */
              __("Altura da linha (%s)", "gq-bioeconomia"),
              label,
            ),
            value: SUBTITLE_LINE_HEIGHT.read(attributes[pageHeroTextLineHeightAttribute(field)]),
            options: subtitleLineHeightOptions(),
            onChange: (next) =>
              setAttributes({
                [pageHeroTextLineHeightAttribute(field)]: next,
              }),
          })
        : null,
      createElement(TextColorControl, {
        id: `page-hero-static-${field}-color`,
        label: sprintf(
          /* translators: %s: hero text field name, e.g. "Título". */
          __("Cor do texto (%s)", "gq-bioeconomia"),
          label,
        ),
        color: color,
        isSet: Boolean(attributes[colorAttribute]),
        onChange: (next) =>
          setAttributes({
            [colorAttribute]: normalizePageHeroColor(next),
          }),
      }),
    );
  }
  function PageHeroStaticEdit({ attributes, setAttributes }) {
    const height = HEIGHT.read(attributes.height);
    const canvas = pageHeroCanvasStyle(height);
    const heightLabels = pageHeroHeightLabels(HEIGHT.values);
    const blockProps = useBlockProps({
      // `alignfull` is Gutenberg's own "escape the content column" class, so
      // this edge-to-edge hero fills the editor canvas the way it fills the
      // page. The block declares `supports.align: false` — editors must not
      // pick an alignment, and nothing is persisted, because the block saves
      // no markup. This is the canvas borrowing core's layout escape hatch,
      // not the block opting into alignment.
      className: "page-hero-static-editor alignfull gq-bioeconomia-full-width",
      style: {
        "--page-hero-static-height": canvas?.height,
        "--page-hero-static-padding": pageHeroCanvasPadding(height, {
          top: attributes.paddingTop,
          bottom: attributes.paddingBottom,
        }),
      },
    });

    /** Every edit also retires whatever legacy keys the block still carries. */
    const commit = useCallback(
      (next) =>
        setAttributes({
          ...pageHeroLegacyAttributePatch(attributes),
          ...next,
        }),
      [attributes, setAttributes],
    );
    const ctaHref = attributes.ctaHref || attributes.ctaUrl || "";
    const imageUrl = attributes.imageSrc || attributes.imageUrl || "";
    const imageAlt = attributes.imageAlt || "";
    const showCta = attributes.hideCta === true ? false : attributes.showCta !== false;
    const showSubtitle = attributes.showSubtitle !== false;
    const typographies = readPageHeroTextTypographies(attributes);
    const textAlign = readPageHeroTextAlign(attributes);
    function setHeroImage(media) {
      const nextUrl = media?.url || "";
      commit({
        imageId: media?.id,
        imageSrc: nextUrl,
        imageAlt: media?.alt ?? "",
      });
    }
    return createElement(
      Fragment,
      null,
      createElement(
        BlockControls,
        null,
        createElement(
          ToolbarGroup,
          {
            label: __("Imagem do cabeçalho", "gq-bioeconomia"),
          },
          createElement(
            MediaUploadCheck,
            null,
            createElement(MediaUpload, {
              allowedTypes: ["image"],
              value: attributes.imageId,
              onSelect: setHeroImage,
              render: ({ open }) =>
                createElement(ToolbarButton, {
                  icon: "format-image",
                  label: imageUrl
                    ? __("Substituir imagem", "gq-bioeconomia")
                    : __("Selecionar imagem", "gq-bioeconomia"),
                  showTooltip: true,
                  onClick: open,
                }),
            }),
          ),
        ),
      ),
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Conteúdo", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(MediaUploadButton, {
            imageId: attributes.imageId,
            onSelect: setHeroImage,
            previewUrl: imageUrl,
            previewAlt: imageAlt,
            labelSelect: __("Selecionar imagem", "gq-bioeconomia"),
            labelReplace: __("Substituir imagem", "gq-bioeconomia"),
            hasImage: Boolean(imageUrl),
          }),
          createElement(ToggleControl, {
            label: __("Mostrar subtítulo", "gq-bioeconomia"),
            checked: showSubtitle,
            onChange: (next) =>
              commit({
                showSubtitle: next,
              }),
          }),
          createElement(ToggleControl, {
            label: __("Mostrar botão", "gq-bioeconomia"),
            checked: showCta,
            onChange: (next) =>
              commit({
                showCta: next,
              }),
          }),
          showCta
            ? createElement(UrlField, {
                label: __("URL do botão", "gq-bioeconomia"),
                value: ctaHref,
                onChange: (next) =>
                  commit({
                    ctaHref: next,
                  }),
              })
            : null,
        ),
        createElement(
          PanelBody,
          {
            title: __("Tipografia", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(TextAlignmentControl, {
            attributes: attributes,
            setAttributes: commit,
          }),
          createElement(TextTypographyControls, {
            field: "title",
            attributes: attributes,
            setAttributes: commit,
          }),
          createElement(TextTypographyControls, {
            field: "subtitle",
            attributes: attributes,
            setAttributes: commit,
          }),
        ),
        createElement(
          PanelBody,
          {
            title: __("Disposição", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(
            BaseControl,
            {
              __nextHasNoMarginBottom: true,
              id: "page-hero-static-height",
              label: __("Altura", "gq-bioeconomia"),
              help: sprintf(
                /* translators: 1: tallest step, e.g. XL. 2: the remaining steps, e.g. "XS, S, M e L". */
                __(
                  "%1$s ocupa o ecrã inteiro; %2$s são faixas progressivamente mais baixas.",
                  "gq-bioeconomia",
                ),
                heightLabels.tallest,
                shorterStepsLabel(heightLabels.shorter),
              ),
            },
            createElement(
              ButtonGroup,
              null,
              HEIGHT.values.map((option) =>
                createElement(
                  Button,
                  {
                    key: option,
                    size: "compact",
                    variant: height === option ? "primary" : "secondary",
                    "aria-pressed": height === option,
                    onClick: () =>
                      commit({
                        height: option,
                      }),
                  },
                  option.toUpperCase(),
                ),
              ),
            ),
          ),
          createElement(PaddingStepControl, {
            label: __("Espaço superior", "gq-bioeconomia"),
            steps: PADDING_TOP,
            value: attributes.paddingTop,
            onChange: (next) =>
              commit({
                paddingTop: next,
              }),
          }),
          createElement(PaddingStepControl, {
            label: __("Espaço inferior", "gq-bioeconomia"),
            steps: PADDING_BOTTOM,
            value: attributes.paddingBottom,
            onChange: (next) =>
              commit({
                paddingBottom: next,
              }),
          }),
        ),
      ),
      createElement(
        "section",
        blockProps,
        createElement(
          "div",
          {
            className: "page-hero-static-editor__viewport",
          },
          createElement(
            "div",
            {
              className: "page-hero-static-editor__media",
              "aria-hidden": true,
            },
            imageUrl
              ? createElement("img", {
                  src: imageUrl,
                  alt: imageAlt,
                })
              : createElement(
                  "div",
                  {
                    className: "page-hero-static-editor__image-placeholder",
                  },
                  __("Selecionar imagem de fundo (opcional)", "gq-bioeconomia"),
                ),
            imageUrl
              ? createElement("div", {
                  className: "page-hero-static-editor__overlay",
                })
              : null,
          ),
          createElement(
            "div",
            {
              className: "page-hero-static-editor__content",
            },
            createElement(
              "div",
              {
                className: `page-hero-static-editor__copy page-hero-static-editor__copy--${textAlign}`,
              },
              /*
               * No formats on any of the three fields. These attributes are
               * plain strings that `NomiaPageHeroStatic.astro` interpolates as
               * text, so markup such as a <strong> would reach the site as
               * visible tags rather than as formatting. The subtitle alone
               * takes line breaks: it reads as a short description, and Astro
               * renders each line as its own paragraph.
               */
              createElement(RichText, {
                tagName: "h1",
                value: attributes.title || "",
                style: pageHeroTextStyleProperties(typographies.title),
                placeholder: __("Título do cabeçalho", "gq-bioeconomia"),
                allowedFormats: [],
                disableLineBreaks: true,
                onChange: (next) =>
                  commit({
                    title: next,
                  }),
              }),
              showSubtitle
                ? createElement(RichText, {
                    tagName: "p",
                    value: attributes.subtitle || "",
                    style: pageHeroTextStyleProperties(typographies.subtitle),
                    className: "page-hero-static-editor__subtitle",
                    placeholder: __(
                      "Subtítulo ou descrição (Enter para novo parágrafo)",
                      "gq-bioeconomia",
                    ),
                    allowedFormats: [],
                    withoutInteractiveFormatting: true,
                    onChange: (next) =>
                      commit({
                        subtitle: next,
                      }),
                  })
                : null,
              showCta
                ? createElement(RichText, {
                    tagName: "span",
                    className: "page-hero-static-editor__cta",
                    value: attributes.ctaLabel || "",
                    placeholder: __("Texto do botão", "gq-bioeconomia"),
                    allowedFormats: [],
                    disableLineBreaks: true,
                    onChange: (next) =>
                      commit({
                        ctaLabel: next,
                      }),
                  })
                : null,
            ),
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/page-hero-static", { edit: PageHeroStaticEdit });
})();
