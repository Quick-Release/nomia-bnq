(() => {
  const { useBlockProps } = window.wp.blockEditor;
  const { RangeControl, SelectControl, ToggleControl } = window.wp.components;
  const { useSelect } = window.wp.data;
  const { createElement, useMemo } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { CONTENT_COLLECTIONS, LISTING_PER_PAGE_DEFAULT, LISTING_PER_PAGE_MAX, readCollection } =
    window.gqBioeconomiaFrontendRules;
  const { PreviewIframe, buildPreviewUrl, registerContractBlock } = window.gqBioeconomiaEditor;
  const contracts = window.gqBioeconomiaContracts;

  const BLOCK_NAME = "getquick/content-listing";

  function displayOptions() {
    return [
      { value: "list", label: __("Lista de títulos", "gq-bioeconomia") },
      { value: "thumbnail-grid", label: __("Grelha de miniaturas", "gq-bioeconomia") },
      {
        value: "titled-thumbnail-grid",
        label: __("Grelha de miniaturas com título por cima", "gq-bioeconomia"),
      },
    ];
  }

  /** The collection's terms in a taxonomy, from WordPress's REST API. */
  function useTerms(taxonomy) {
    return useSelect(
      (select) =>
        taxonomy
          ? select("core").getEntityRecords("taxonomy", taxonomy, {
              per_page: 100,
              hide_empty: false,
              _fields: "id,slug,name",
            })
          : null,
      [taxonomy],
    );
  }

  function ContentListingEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "gq-bioeconomia-inline-editor" });
    const contract = contracts.find((item) => item.blockName === BLOCK_NAME);
    // Gutenberg leaves an attribute at its default out of `attributes`.
    const collectionKey = readCollection(attributes.collection ?? "biblioteca");
    const collection = collectionKey ? CONTENT_COLLECTIONS[collectionKey] : null;
    const taxonomy = collection?.taxonomies.some((item) => item.taxonomy === attributes.taxonomy)
      ? attributes.taxonomy
      : "";
    const terms = useTerms(taxonomy);
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
        value: collectionKey ?? "",
        options: Object.entries(CONTENT_COLLECTIONS).map(([value, item]) => ({
          value,
          label: item.label,
        })),
        // A term belongs to one collection's taxonomy: changing the collection clears it.
        onChange: (next) => setAttributes({ collection: next, taxonomy: "", term: "" }),
      }),
      createElement(SelectControl, {
        label: __("Mostrar só uma categoria de", "gq-bioeconomia"),
        value: taxonomy,
        options: [
          { value: "", label: __("Todos os conteúdos", "gq-bioeconomia") },
          ...(collection?.taxonomies ?? []).map((item) => ({
            value: item.taxonomy,
            label: item.label,
          })),
        ],
        onChange: (next) => setAttributes({ taxonomy: next, term: "" }),
      }),
      taxonomy
        ? createElement(SelectControl, {
            label: __("Categoria", "gq-bioeconomia"),
            value: attributes.term || "",
            options: [
              {
                value: "",
                label: terms
                  ? __("Escolha uma", "gq-bioeconomia")
                  : __("A carregar…", "gq-bioeconomia"),
              },
              ...(terms ?? []).map((term) => ({ value: term.slug, label: term.name })),
            ],
            onChange: (next) => setAttributes({ term: next }),
          })
        : null,
      createElement(SelectControl, {
        label: __("Apresentação", "gq-bioeconomia"),
        value: attributes.display || "list",
        options: displayOptions(),
        onChange: (next) => setAttributes({ display: next }),
      }),
      createElement(RangeControl, {
        label: __("Conteúdos por página", "gq-bioeconomia"),
        value: attributes.perPage ?? LISTING_PER_PAGE_DEFAULT,
        min: 1,
        max: LISTING_PER_PAGE_MAX,
        onChange: (next) => setAttributes({ perPage: next ?? LISTING_PER_PAGE_DEFAULT }),
      }),
      createElement(ToggleControl, {
        label: __("Mostrar paginação", "gq-bioeconomia"),
        checked: attributes.showPagination !== false,
        onChange: (next) => setAttributes({ showPagination: next }),
      }),
      createElement(
        "div",
        { className: "gq-bioeconomia-editor-preview" },
        createElement(PreviewIframe, {
          title: __("Pré-visualização da listagem", "gq-bioeconomia"),
          src: previewUrl,
        }),
      ),
    );
  }

  registerContractBlock(BLOCK_NAME, { edit: ContentListingEdit });
})();
