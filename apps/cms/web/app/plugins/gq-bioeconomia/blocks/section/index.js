(() => {
  const { InnerBlocks, InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { Button, ColorPicker, PanelBody, SelectControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const {
    contractEnum,
    isLightColor,
    MediaUploadButton,
    normalizeHexColor,
    registerContractBlock,
    useSiteColors,
  } = window.gqBioeconomiaEditor;

  const BACKGROUND_POSITION = contractEnum("getquick/section", "backgroundImagePosition");
  const BACKGROUND_SIZE = contractEnum("getquick/section", "backgroundImageSize");

  /** Mirrors `sectionBackgroundPositionCss` in apps/frontend/src/lib/section-block.ts. */
  const BACKGROUND_POSITION_CSS = {
    "top-left": "left top",
    top: "center top",
    "top-right": "right top",
    left: "left center",
    center: "center center",
    right: "right center",
    "bottom-left": "left bottom",
    bottom: "center bottom",
    "bottom-right": "right bottom",
  };

  /** The canvas draws the image as a CSS background; `none` is its natural size. */
  const BACKGROUND_SIZE_CSS = {
    cover: "cover",
    contain: "contain",
    none: "auto",
  };
  function backgroundPositionLabels() {
    return {
      "top-left": __("Em cima à esquerda", "gq-bioeconomia"),
      top: __("Em cima ao centro", "gq-bioeconomia"),
      "top-right": __("Em cima à direita", "gq-bioeconomia"),
      left: __("Ao centro à esquerda", "gq-bioeconomia"),
      center: __("Ao centro", "gq-bioeconomia"),
      right: __("Ao centro à direita", "gq-bioeconomia"),
      "bottom-left": __("Em baixo à esquerda", "gq-bioeconomia"),
      bottom: __("Em baixo ao centro", "gq-bioeconomia"),
      "bottom-right": __("Em baixo à direita", "gq-bioeconomia"),
    };
  }
  function backgroundSizeOptions() {
    const labels = {
      cover: __("Preencher (recorta a imagem)", "gq-bioeconomia"),
      contain: __("Ajustar (imagem inteira)", "gq-bioeconomia"),
      none: __("Tamanho original", "gq-bioeconomia"),
    };
    return BACKGROUND_SIZE.values.map((value) => ({
      value,
      label: labels[value] ?? value,
    }));
  }

  /**
   * Padding steps mirror `SECTION_PADDING_STEPS` / `SECTION_HORIZONTAL_PADDINGS`
   * in `apps/frontend/src/lib/section-block.ts`, which owns the responsive classes each
   * step resolves to. Keep the two lists in step when either changes.
   */
  const VERTICAL_PADDING_OPTIONS = [
    {
      value: "none",
      label: __("Nenhum", "gq-bioeconomia"),
    },
    {
      value: "small",
      label: __("Pequeno", "gq-bioeconomia"),
    },
    {
      value: "medium",
      label: __("Médio", "gq-bioeconomia"),
    },
    {
      value: "large",
      label: __("Grande", "gq-bioeconomia"),
    },
  ];
  const HORIZONTAL_PADDING_OPTIONS = [
    {
      value: "none",
      label: __("Nenhum (largura total)", "gq-bioeconomia"),
    },
    {
      value: "small",
      label: __("Pequeno", "gq-bioeconomia"),
    },
    {
      value: "default",
      label: __("Predefinido", "gq-bioeconomia"),
    },
  ];

  /** Editor-canvas approximations of the frontend spacing scale. */
  const VERTICAL_PADDING_PREVIEW = {
    none: "0px",
    small: "32px",
    medium: "64px",
    large: "96px",
  };
  const HORIZONTAL_PADDING_PREVIEW = {
    none: "0px",
    small: "24px",
    default: "48px",
  };
  function SectionEdit({ attributes, setAttributes }) {
    const siteColors = useSiteColors();
    const backgroundColor = normalizeHexColor(attributes.backgroundColor);
    const paddingTop = attributes.paddingTop || "medium";
    const paddingBottom = attributes.paddingBottom || "medium";
    const paddingX = attributes.paddingX || "default";
    const light = !backgroundColor || isLightColor(backgroundColor);
    const backgroundImage = attributes.backgroundImageSrc || "";
    const backgroundPosition = BACKGROUND_POSITION.read(attributes.backgroundImagePosition);
    const backgroundSize = BACKGROUND_SIZE.read(attributes.backgroundImageSize);
    const positionLabels = backgroundPositionLabels();
    const blockProps = useBlockProps({
      className: "gq-bioeconomia-section-editor",
      "data-gq-bioeconomia-section-contrast": light ? "light" : "dark",
      style: {
        backgroundColor: backgroundColor || undefined,
        backgroundImage: backgroundImage ? `url(${JSON.stringify(backgroundImage)})` : undefined,
        backgroundPosition: backgroundImage
          ? BACKGROUND_POSITION_CSS[backgroundPosition]
          : undefined,
        backgroundSize: backgroundImage ? BACKGROUND_SIZE_CSS[backgroundSize] : undefined,
        backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
        paddingTop: VERTICAL_PADDING_PREVIEW[paddingTop],
        paddingBottom: VERTICAL_PADDING_PREVIEW[paddingBottom],
        paddingLeft: HORIZONTAL_PADDING_PREVIEW[paddingX],
        paddingRight: HORIZONTAL_PADDING_PREVIEW[paddingX],
      },
    });
    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Fundo da secção", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(
            "div",
            {
              className: "gq-bioeconomia-section-editor__swatches",
            },
            siteColors.map((option) => {
              const color = normalizeHexColor(option.color);
              const isSelected = backgroundColor === color;
              return createElement(
                "button",
                {
                  key: option.slug,
                  type: "button",
                  className: "gq-bioeconomia-section-editor__swatch",
                  "data-selected": isSelected ? "true" : undefined,
                  style: {
                    "--gq-bioeconomia-section-swatch": color,
                  },
                  "aria-label": option.label,
                  "aria-pressed": isSelected,
                  title: option.label,
                  onClick: () =>
                    setAttributes({
                      backgroundColor: color,
                    }),
                },
                createElement(
                  "span",
                  {
                    className: "screen-reader-text",
                  },
                  option.label,
                ),
              );
            }),
          ),
          createElement(ColorPicker, {
            color: backgroundColor || "#ffffff",
            enableAlpha: false,
            onChange: (next) =>
              setAttributes({
                backgroundColor: normalizeHexColor(next),
              }),
          }),
          createElement(
            "div",
            {
              className: "gq-bioeconomia-section-editor__actions",
            },
            createElement(
              Button,
              {
                variant: "secondary",
                onClick: () =>
                  setAttributes({
                    backgroundColor: "",
                  }),
                disabled: !backgroundColor,
              },
              __("Repor", "gq-bioeconomia"),
            ),
          ),
          createElement(
            "p",
            {
              className: "gq-bioeconomia-section-editor__hint",
            },
            backgroundColor
              ? __(
                  "O texto dos blocos interiores fica automaticamente legível sobre este fundo.",
                  "gq-bioeconomia",
                )
              : __("Sem cor definida, a secção herda o fundo da página.", "gq-bioeconomia"),
          ),
        ),
        createElement(
          PanelBody,
          {
            title: __("Imagem de fundo", "gq-bioeconomia"),
            initialOpen: Boolean(backgroundImage),
          },
          createElement(MediaUploadButton, {
            imageId: attributes.backgroundImageId,
            onSelect: (media) =>
              setAttributes({
                backgroundImageId: media?.id,
                backgroundImageSrc: media?.url || "",
              }),
            previewUrl: backgroundImage || undefined,
            labelSelect: __("Selecionar imagem", "gq-bioeconomia"),
            labelReplace: __("Substituir imagem", "gq-bioeconomia"),
            hasImage: Boolean(backgroundImage),
          }),
          backgroundImage
            ? createElement(
                Fragment,
                null,
                createElement(
                  "div",
                  {
                    className: "gq-bioeconomia-section-editor__actions",
                  },
                  createElement(
                    Button,
                    {
                      __next40pxDefaultSize: true,
                      variant: "tertiary",
                      isDestructive: true,
                      onClick: () =>
                        setAttributes({
                          backgroundImageId: undefined,
                          backgroundImageSrc: "",
                        }),
                    },
                    __("Remover imagem", "gq-bioeconomia"),
                  ),
                ),
                createElement(
                  "fieldset",
                  {
                    className: "gq-bioeconomia-section-editor__position",
                  },
                  createElement("legend", null, __("Alinhamento da imagem", "gq-bioeconomia")),
                  createElement(
                    "div",
                    {
                      className: "gq-bioeconomia-section-editor__position-grid",
                    },
                    BACKGROUND_POSITION.values.map((value) =>
                      createElement("button", {
                        key: value,
                        type: "button",
                        className: "gq-bioeconomia-section-editor__position-cell",
                        "aria-label": positionLabels[value],
                        title: positionLabels[value],
                        "aria-pressed": backgroundPosition === value,
                        onClick: () =>
                          setAttributes({
                            backgroundImagePosition: value,
                          }),
                      }),
                    ),
                  ),
                ),
                createElement(SelectControl, {
                  __next40pxDefaultSize: true,
                  __nextHasNoMarginBottom: true,
                  label: __("Tamanho da imagem", "gq-bioeconomia"),
                  value: backgroundSize,
                  options: backgroundSizeOptions(),
                  onChange: (next) =>
                    setAttributes({
                      backgroundImageSize: next,
                    }),
                }),
                createElement(
                  "p",
                  {
                    className: "gq-bioeconomia-section-editor__hint",
                  },
                  __(
                    'Para uma imagem quadrada encostada a um lado, escolha "Ajustar" e o alinhamento desse lado. A imagem fica por cima da cor de fundo.',
                    "gq-bioeconomia",
                  ),
                ),
              )
            : null,
        ),
        createElement(
          PanelBody,
          {
            title: __("Espaçamento", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(SelectControl, {
            __nextHasNoMarginBottom: true,
            label: __("Topo", "gq-bioeconomia"),
            value: paddingTop,
            options: VERTICAL_PADDING_OPTIONS,
            onChange: (next) =>
              setAttributes({
                paddingTop: next,
              }),
          }),
          createElement(SelectControl, {
            __nextHasNoMarginBottom: true,
            label: __("Base", "gq-bioeconomia"),
            value: paddingBottom,
            options: VERTICAL_PADDING_OPTIONS,
            onChange: (next) =>
              setAttributes({
                paddingBottom: next,
              }),
          }),
          createElement(SelectControl, {
            __nextHasNoMarginBottom: true,
            label: __("Laterais", "gq-bioeconomia"),
            value: paddingX,
            options: HORIZONTAL_PADDING_OPTIONS,
            onChange: (next) =>
              setAttributes({
                paddingX: next,
              }),
          }),
        ),
      ),
      createElement(
        "div",
        blockProps,
        createElement(InnerBlocks, {
          renderAppender: InnerBlocks.ButtonBlockAppender,
        }),
      ),
    );
  }

  registerContractBlock("getquick/section", { edit: SectionEdit });
})();
