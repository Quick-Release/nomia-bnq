(() => {
  const { BlockAlignmentControl, BlockControls, useBlockProps } = window.wp.blockEditor;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { readNomiaContactMapAlignment, toGoogleMapsEmbedUrl } = window.getquickNomiaFrontendRules;
  const { AttributeField, registerContractBlock } = window.getquickNomiaBlocksEditor;
  const contracts = window.getquickNomiaBlocksContracts;

  const BLOCK_NAME = "getquick/nomia-contact-map";
  const ALIGNMENT_CONTROLS = ["left", "right", "full"];
  const FIELDS = ["mapUrl", "title"];
  function alignmentLabel(align) {
    return {
      none: __("Centrado (predefinição)", "getquick-nomia-blocks"),
      left: __("Alinhado à esquerda", "getquick-nomia-blocks"),
      right: __("Alinhado à direita", "getquick-nomia-blocks"),
      full: __("Largura total", "getquick-nomia-blocks"),
    }[align];
  }
  function NomiaContactMapEdit({ attributes, setAttributes }) {
    const align = readNomiaContactMapAlignment(attributes.align);
    const blockProps = useBlockProps({
      // Full width uses Gutenberg's own `alignfull` escape from the content
      // column, like the page image hero, so the canvas matches the page.
      // Nothing is persisted: the block saves no markup.
      className: [
        "getquick-nomia-blocks-inline-editor",
        "getquick-contact-map-editor",
        `is-align-${align}`,
        align === "full" ? "alignfull getquick-nomia-blocks-full-width" : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
    const contract = contracts.find((item) => item.blockName === BLOCK_NAME);
    const embedUrl = toGoogleMapsEmbedUrl(
      attributes.mapUrl || attributes.url || "",
      attributes.title || "",
    );
    return createElement(
      Fragment,
      null,
      createElement(
        BlockControls,
        {
          group: "block",
        },
        createElement(BlockAlignmentControl, {
          controls: ALIGNMENT_CONTROLS,
          value: align === "none" ? undefined : align,
          onChange: (next) =>
            setAttributes({
              align: readNomiaContactMapAlignment(next),
            }),
        }),
      ),
      createElement(
        "div",
        blockProps,
        createElement(
          "p",
          {
            className: "getquick-nomia-blocks-inline-editor__intro",
          },
          contract?.description,
        ),
        FIELDS.map((attributeName) =>
          createElement(AttributeField, {
            key: attributeName,
            attributeName: attributeName,
            schema: contract?.attributes?.[attributeName],
            attributes: attributes,
            setAttributes: setAttributes,
          }),
        ),
        createElement(
          "p",
          {
            className: "getquick-contact-map-editor__alignment",
          },
          __("Alinhamento:", "getquick-nomia-blocks"),
          " ",
          createElement("strong", null, alignmentLabel(align)),
        ),
        embedUrl
          ? createElement(
              "div",
              {
                className: "getquick-contact-map-editor__stage",
              },
              createElement(
                "div",
                {
                  className: "getquick-contact-map-editor__map",
                },
                createElement("iframe", {
                  src: embedUrl,
                  title: attributes.title || __("Mapa", "getquick-nomia-blocks"),
                  loading: "lazy",
                  referrerPolicy: "no-referrer-when-downgrade",
                }),
              ),
            )
          : null,
      ),
    );
  }

  registerContractBlock("getquick/nomia-contact-map", { edit: NomiaContactMapEdit });
})();
