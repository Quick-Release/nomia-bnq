(() => {
  const { useBlockProps } = window.wp.blockEditor;
  const { Notice, SelectControl } = window.wp.components;
  const { useSelect } = window.wp.data;
  const { createElement, useMemo } = window.wp.element;
  const { decodeEntities } = window.wp.htmlEntities;
  const { __ } = window.wp.i18n;
  const { PreviewIframe, buildPreviewUrl, registerContractBlock } = window.gqBioeconomiaEditor;
  const contracts = window.gqBioeconomiaContracts;

  const BLOCK_NAME = "getquick/indicador-chart";

  /** Temáticas terms, from WordPress's REST API. */
  function useTematicas() {
    return useSelect(
      (select) =>
        select("core").getEntityRecords("taxonomy", "tematicas", {
          per_page: 100,
          hide_empty: false,
          _fields: "id,slug,name",
        }),
      [],
    );
  }

  /** Published Indicadores, in one Temática when a term ID is given. */
  function useIndicadores(termId) {
    return useSelect(
      (select) =>
        select("core").getEntityRecords("postType", "indicadores", {
          per_page: 100,
          status: "publish",
          orderby: "title",
          order: "asc",
          _fields: "id,title",
          ...(termId ? { tematicas: termId } : {}),
        }),
      [termId],
    );
  }

  /** The chosen Indicador, which may be outside the list (another Temática, unpublished). */
  function useIndicador(id) {
    return useSelect(
      (select) => (id ? select("core").getEntityRecord("postType", "indicadores", id) : null),
      [id],
    );
  }

  const titleOf = (record) =>
    decodeEntities(record?.title?.rendered || record?.title?.raw || "") ||
    __("(sem título)", "gq-bioeconomia");

  function IndicadorChartEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "gq-bioeconomia-inline-editor" });
    const contract = contracts.find((item) => item.blockName === BLOCK_NAME);
    const tematicas = useTematicas();
    const term = (tematicas ?? []).find((item) => item.slug === attributes.tematica);
    const indicadores = useIndicadores(term?.id);
    const chosenId = attributes.indicadorId || 0;
    const chosen = useIndicador(chosenId);
    const listed = (indicadores ?? []).some((item) => item.id === chosenId);
    const previewUrl = useMemo(() => buildPreviewUrl(BLOCK_NAME, attributes), [attributes]);

    const options = [
      {
        value: "",
        label: indicadores
          ? __("Escolha um indicador", "gq-bioeconomia")
          : __("A carregar…", "gq-bioeconomia"),
      },
      ...(chosenId && !listed && chosen
        ? [{ value: String(chosenId), label: titleOf(chosen) }]
        : []),
      ...(indicadores ?? []).map((item) => ({ value: String(item.id), label: titleOf(item) })),
    ];

    return createElement(
      "div",
      blockProps,
      createElement(
        "p",
        { className: "gq-bioeconomia-inline-editor__intro" },
        contract?.description,
      ),
      createElement(SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Temática", "gq-bioeconomia"),
        help: __("Filtra a lista de indicadores; não altera o gráfico.", "gq-bioeconomia"),
        value: attributes.tematica || "",
        options: [
          {
            value: "",
            label: tematicas
              ? __("Todas as temáticas", "gq-bioeconomia")
              : __("A carregar…", "gq-bioeconomia"),
          },
          ...(tematicas ?? []).map((item) => ({
            value: item.slug,
            label: decodeEntities(item.name),
          })),
        ],
        onChange: (next) => setAttributes({ tematica: next }),
      }),
      createElement(SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Indicador", "gq-bioeconomia"),
        value: chosenId ? String(chosenId) : "",
        options,
        onChange: (next) => setAttributes({ indicadorId: next ? Number(next) : undefined }),
      }),
      chosen && chosen.status && chosen.status !== "publish"
        ? createElement(
            Notice,
            { status: "warning", isDismissible: false },
            __(
              "Este indicador não está publicado: o gráfico não aparece no site.",
              "gq-bioeconomia",
            ),
          )
        : null,
      chosenId
        ? createElement(
            "div",
            { className: "gq-bioeconomia-editor-preview" },
            createElement(PreviewIframe, {
              title: __("Pré-visualização do gráfico", "gq-bioeconomia"),
              src: previewUrl,
            }),
          )
        : createElement(
            Notice,
            { status: "info", isDismissible: false },
            __("Escolha um indicador para ver o gráfico.", "gq-bioeconomia"),
          ),
    );
  }

  registerContractBlock(BLOCK_NAME, { edit: IndicadorChartEdit });
})();
