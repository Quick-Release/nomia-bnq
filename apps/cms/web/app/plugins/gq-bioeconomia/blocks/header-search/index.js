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
          { title: __("Pesquisa do cabeçalho", "gq-bioeconomia"), initialOpen: true },
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
            label: __("Página de resultados", "gq-bioeconomia"),
            value: attributes.resultsHref,
            onChange: (value) => setAttributes({ resultsHref: value }),
          }),
          createElement(TextControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Texto do campo de pesquisa", "gq-bioeconomia"),
            value: attributes.placeholder,
            onChange: (value) => setAttributes({ placeholder: value }),
          }),
          createElement(TextControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Texto do botão de pesquisa", "gq-bioeconomia"),
            value: attributes.submitLabel,
            onChange: (value) => setAttributes({ submitLabel: value }),
          }),
          createElement(TextControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Texto do botão de fechar", "gq-bioeconomia"),
            value: attributes.closeLabel,
            onChange: (value) => setAttributes({ closeLabel: value }),
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
              "O formulário envia o termo no parâmetro q. Escolha uma página com pesquisa, como /pesquisa/, ou um arquivo com filtros de conteúdo.",
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
              createElement("path", { d: "M21 21l-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0" }),
            ),
        createElement("span", null, attributes.label || __("Pesquisar", "gq-bioeconomia")),
      ),
    );
  }
  registerContractBlock("getquick/header-search", { edit: Edit });
})();
