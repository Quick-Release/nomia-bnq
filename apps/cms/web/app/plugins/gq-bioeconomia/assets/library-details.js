/*
 * The "Detalhes do documento" panel: a biblioteca document's year, author
 * and file, stored as post meta (includes/library-details.php).
 */
(() => {
  const { MediaUpload, MediaUploadCheck } = window.wp.blockEditor;
  const { Button, TextControl } = window.wp.components;
  const { useEntityProp } = window.wp.coreData;
  const { useSelect } = window.wp.data;
  const { PluginDocumentSettingPanel } = window.wp.editor;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { registerPlugin } = window.wp.plugins;
  const { metaKeys } = window.gqBioeconomiaLibraryDetails;

  function NomiaLibraryDetailsPanel() {
    const postType = useSelect((select) => select("core/editor").getCurrentPostType(), []);
    const [meta, setMeta] = useEntityProp("postType", postType, "meta");

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
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Ano", "gq-bioeconomia"),
        min: 0,
        type: "number",
        value: year ? String(year) : "",
        onChange: (value) => update(metaKeys.year, Number.parseInt(value, 10) || 0),
      }),
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Autor", "gq-bioeconomia"),
        value: meta[metaKeys.author] || "",
        onChange: (value) => update(metaKeys.author, value),
      }),
      createElement(TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: __("Ficheiro", "gq-bioeconomia"),
        placeholder: "https://...",
        type: "url",
        value: fileUrl,
        onChange: (value) => update(metaKeys.fileUrl, value),
      }),
      createElement(
        MediaUploadCheck,
        null,
        createElement(MediaUpload, {
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
