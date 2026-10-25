(() => {
  const { InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody, TextControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { MediaUploadButton, registerContractBlock } = window.gqBioeconomiaEditor;

  function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "gq-bioeconomia-header-action-editor" });
    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          { title: __("Contacto do cabeçalho", "gq-bioeconomia"), initialOpen: true },
          createElement(TextControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Texto acessível", "gq-bioeconomia"),
            value: attributes.label,
            onChange: (value) => setAttributes({ label: value }),
          }),
          createElement(TextControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Ligação", "gq-bioeconomia"),
            value: attributes.href,
            onChange: (value) => setAttributes({ href: value }),
          }),
          createElement(MediaUploadButton, {
            imageId: attributes.iconId,
            hasImage: Boolean(attributes.iconUrl),
            previewUrl: attributes.iconUrl,
            labelSelect: __("Carregar ícone", "gq-bioeconomia"),
            labelReplace: __("Substituir ícone", "gq-bioeconomia"),
            onSelect: (media) => setAttributes({ iconId: media.id || 0, iconUrl: media.url || "" }),
          }),
          attributes.iconUrl &&
            createElement(
              Button,
              {
                variant: "tertiary",
                onClick: () => setAttributes({ iconId: 0, iconUrl: "" }),
              },
              __("Remover ícone", "gq-bioeconomia"),
            ),
          createElement(
            "p",
            null,
            __("Sem ícone escolhido, usa o ícone predefinido.", "gq-bioeconomia"),
          ),
          createElement(
            "p",
            null,
            __(
              "Use /contactos/ para abrir a página de contactos, ou tel:+351 seguido do número para telefonar.",
              "gq-bioeconomia",
            ),
          ),
        ),
      ),
      createElement(
        "div",
        blockProps,
        attributes.iconUrl
          ? createElement("img", { src: attributes.iconUrl, alt: "", width: 24, height: 24 })
          : createElement(
              "svg",
              {
                width: 24,
                height: 24,
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                "aria-hidden": true,
              },
              createElement("path", {
                d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
              }),
            ),
        createElement("span", null, attributes.label || __("Contactos", "gq-bioeconomia")),
      ),
    );
  }
  registerContractBlock("getquick/header-contact", { edit: Edit });
})();
