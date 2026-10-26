/*
 * The "Detalhes do documento" panel: a biblioteca document's year, publisher
 * and independent links, plus its native excerpt as the description.
 */
(() => {
  const { MediaUpload, MediaUploadCheck } = window.wp.blockEditor;
  const { Button, SelectControl, TextControl, TextareaControl } = window.wp.components;
  const { useEntityProp } = window.wp.coreData;
  const { useSelect } = window.wp.data;
  const { PluginDocumentSettingPanel } = window.wp.editor;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { registerPlugin } = window.wp.plugins;
  const { metaKeys, yearMin, yearMax } = window.gqBioeconomiaLibraryDetails;

  function NomiaLibraryDetailsPanel() {
    const postType = useSelect((select) => select("core/editor").getCurrentPostType(), []);
    const [meta, setMeta] = useEntityProp("postType", postType, "meta");

    const [excerpt, setExcerpt] = useEntityProp("postType", postType, "excerpt");

    if (postType !== "biblioteca" || !meta) {
      return null;
    }

    const year = meta[metaKeys.year] || "";
    const fileUrl = meta[metaKeys.fileUrl] || "";
    const update = (key, value) => setMeta({ ...meta, [key]: value });

    return createElement(
      PluginDocumentSettingPanel,
      {
        name: "gq-bioeconomia-library-details",
        title: __("Detalhes do documento", "gq-bioeconomia"),
      },
      createElement(SelectControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Ano", "gq-bioeconomia"),
        options: [
          { value: "", label: __("Selecione o ano", "gq-bioeconomia") },
          ...Array.from({ length: yearMax - yearMin + 1 }, (_, index) => {
            const value = String(yearMax - index);
            return { value, label: value };
          }),
        ],
        value: year ? String(year) : "",
        onChange: (value) => update(metaKeys.year, Number.parseInt(value, 10) || 0),
      }),
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Publicado por", "gq-bioeconomia"),
        value: meta[metaKeys.author] || "",
        onChange: (value) => update(metaKeys.author, value),
      }),
      createElement(TextareaControl, {
        __nextHasNoMarginBottom: true,
        label: __("Descrição", "gq-bioeconomia"),
        help: __("Resumo apresentado nos cartões da Biblioteca.", "gq-bioeconomia"),
        value: typeof excerpt === "string" ? excerpt : excerpt?.raw || "",
        onChange: setExcerpt,
      }),
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Ligação para a página", "gq-bioeconomia"),
        placeholder: "https://...",
        type: "url",
        value: meta[metaKeys.pageUrl] || "",
        onChange: (value) => update(metaKeys.pageUrl, value),
      }),
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Ficheiro PDF", "gq-bioeconomia"),
        placeholder: "https://...",
        type: "url",
        value: fileUrl,
        onChange: (value) => update(metaKeys.fileUrl, value),
      }),
      createElement(
        MediaUploadCheck,
        null,
        createElement(MediaUpload, {
          allowedTypes: ["application/pdf"],
          onSelect: (media) => update(metaKeys.fileUrl, media?.url || ""),
          render: ({ open }) =>
            createElement(
              Fragment,
              null,
              createElement(
                Button,
                { variant: "secondary", onClick: open },
                fileUrl
                  ? __("Substituir ficheiro", "gq-bioeconomia")
                  : __("Selecionar ficheiro", "gq-bioeconomia"),
              ),
              fileUrl
                ? createElement(
                    Button,
                    {
                      variant: "tertiary",
                      isDestructive: true,
                      onClick: () => update(metaKeys.fileUrl, ""),
                    },
                    __("Remover ficheiro", "gq-bioeconomia"),
                  )
                : null,
            ),
        }),
      ),
    );
  }

  registerPlugin("gq-bioeconomia-library-details", { render: NomiaLibraryDetailsPanel });
})();
