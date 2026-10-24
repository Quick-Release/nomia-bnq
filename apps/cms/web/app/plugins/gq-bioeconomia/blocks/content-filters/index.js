(() => {
  const { useBlockProps } = window.wp.blockEditor;
  const { SelectControl, ToggleControl } = window.wp.components;
  const { createElement, useMemo } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { CONTENT_COLLECTIONS, readCollection } = window.gqBioeconomiaFrontendRules;
  const { PreviewIframe, buildPreviewUrl, registerContractBlock } = window.gqBioeconomiaEditor;
  const contracts = window.gqBioeconomiaContracts;

  const BLOCK_NAME = "getquick/content-filters";

  function ContentFiltersEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "gq-bioeconomia-inline-editor" });
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
        { className: "gq-bioeconomia-inline-editor__intro" },
        contract?.description,
      ),
      createElement(SelectControl, {
        label: __("Tipo de conteúdo", "gq-bioeconomia"),
        help: __("O mesmo da listagem desta página.", "gq-bioeconomia"),
        value: collectionKey ?? "",
        options: Object.entries(CONTENT_COLLECTIONS).map(([value, item]) => ({
          value,
          label: item.label,
        })),
        onChange: (next) => setAttributes({ collection: next, hiddenTaxonomies: [] }),
      }),
      createElement(ToggleControl, {
        label: __("Mostrar a caixa de pesquisa", "gq-bioeconomia"),
        checked: attributes.showSearch !== false,
        onChange: (next) => setAttributes({ showSearch: next }),
      }),
      (collection?.taxonomies ?? []).map((item) =>
        createElement(ToggleControl, {
          key: item.taxonomy,
          label: sprintf(
            /* translators: %s: taxonomy name, e.g. "Temática". */
            __("Filtrar por %s", "gq-bioeconomia"),
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
        { className: "gq-bioeconomia-editor-preview" },
        createElement(PreviewIframe, {
          title: __("Pré-visualização dos filtros", "gq-bioeconomia"),
          src: previewUrl,
        }),
      ),
    );
  }

  registerContractBlock(BLOCK_NAME, { edit: ContentFiltersEdit });
})();
