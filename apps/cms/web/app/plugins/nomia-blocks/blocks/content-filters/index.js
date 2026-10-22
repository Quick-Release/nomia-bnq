(() => {
  const { useBlockProps } = window.wp.blockEditor;
  const { SelectControl, ToggleControl } = window.wp.components;
  const { createElement, useMemo } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { CONTENT_COLLECTIONS, readCollection } = window.getquickNomiaFrontendRules;
  const { PreviewIframe, buildPreviewUrl, registerContractBlock } =
    window.getquickNomiaBlocksEditor;
  const contracts = window.getquickNomiaBlocksContracts;

  const BLOCK_NAME = "getquick/content-filters";

  function ContentFiltersEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "getquick-nomia-blocks-inline-editor" });
    const contract = contracts.find((item) => item.blockName === BLOCK_NAME);
    // Gutenberg leaves an attribute at its default out of `attributes`.
    const collectionKey = readCollection(attributes.collection ?? "biblioteca");
    const collection = collectionKey ? CONTENT_COLLECTIONS[collectionKey] : null;
    const hidden = Array.isArray(attributes.hiddenTaxonomies) ? attributes.hiddenTaxonomies : [];
    const previewUrl = useMemo(() => buildPreviewUrl(BLOCK_NAME, attributes), [attributes]);

    return createElement(
      "div",
      blockProps,
      createElement(
        "p",
        { className: "getquick-nomia-blocks-inline-editor__intro" },
        contract?.description,
      ),
      createElement(SelectControl, {
        label: __("Tipo de conteúdo", "getquick-nomia-blocks"),
        help: __("O mesmo da listagem desta página.", "getquick-nomia-blocks"),
        value: collectionKey ?? "",
        options: Object.entries(CONTENT_COLLECTIONS).map(([value, item]) => ({
          value,
          label: item.label,
        })),
        onChange: (next) => setAttributes({ collection: next, hiddenTaxonomies: [] }),
      }),
      createElement(ToggleControl, {
        label: __("Mostrar a caixa de pesquisa", "getquick-nomia-blocks"),
        checked: attributes.showSearch !== false,
        onChange: (next) => setAttributes({ showSearch: next }),
      }),
      (collection?.taxonomies ?? []).map((item) =>
        createElement(ToggleControl, {
          key: item.taxonomy,
          label: sprintf(
            /* translators: %s: taxonomy name, e.g. "Temática". */
            __("Filtrar por %s", "getquick-nomia-blocks"),
            item.label.toLowerCase(),
          ),
          checked: !hidden.includes(item.taxonomy),
          onChange: (show) =>
            setAttributes({
              hiddenTaxonomies: show
                ? hidden.filter((taxonomy) => taxonomy !== item.taxonomy)
                : [...hidden, item.taxonomy],
            }),
        }),
      ),
      createElement(
        "div",
        { className: "getquick-nomia-blocks-editor-preview" },
        createElement(PreviewIframe, {
          title: __("Pré-visualização dos filtros", "getquick-nomia-blocks"),
          src: previewUrl,
        }),
      ),
    );
  }

  registerContractBlock(BLOCK_NAME, { edit: ContentFiltersEdit });
})();
