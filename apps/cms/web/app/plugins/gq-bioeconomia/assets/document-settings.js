/*
 * The document-level editor additions: the page background panel and the
 * Bioeconomia button variation. Blocks register from their own
 * `blocks/<id>/index.js`.
 */
(() => {
  const { registerBlockVariation } = window.wp.blocks;
  const { Button, ColorPicker } = window.wp.components;
  const { useDispatch, useSelect } = window.wp.data;
  /*
   * `wp.editor`, not `wp.editPost`: the document setting panel moved in
   * WordPress 6.6 and `wp.editPost` only re-exports it behind a deprecation
   * notice, returning null in the site editor.
   */
  const { PluginDocumentSettingPanel } = window.wp.editor;
  const { createElement } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { registerPlugin } = window.wp.plugins;
  const { normalizeHexColor, useSiteColors } = window.gqBioeconomiaEditor;

  const PAGE_BACKGROUND_META_KEY = "_gq_bioeconomia_page_background_color";
  function PageBackgroundPanel() {
    const siteColors = useSiteColors();
    const postType = useSelect((select) => select("core/editor")?.getCurrentPostType?.(), []);
    const meta =
      useSelect((select) => select("core/editor")?.getEditedPostAttribute?.("meta") || {}, []) ||
      {};
    const { editPost } = useDispatch("core/editor");
    if (postType !== "page") {
      return null;
    }
    const currentColor = normalizeHexColor(meta[PAGE_BACKGROUND_META_KEY] || "");
    const setBackgroundColor = (nextColor) => {
      editPost({
        meta: {
          ...meta,
          [PAGE_BACKGROUND_META_KEY]: normalizeHexColor(nextColor),
        },
      });
    };
    return createElement(
      PluginDocumentSettingPanel,
      {
        name: "gq-bioeconomia-page-background",
        title: __("Fundo da página", "gq-bioeconomia"),
        className: "gq-bioeconomia-page-background-panel",
      },
      createElement(
        "div",
        {
          className: "gq-bioeconomia-page-background-panel__theme-colors",
        },
        siteColors.map((option) => {
          const color = normalizeHexColor(option.color);
          const isSelected = currentColor === color;
          return createElement(
            "button",
            {
              key: option.slug,
              type: "button",
              className: "gq-bioeconomia-page-background-panel__swatch",
              "data-selected": isSelected ? "true" : undefined,
              style: {
                "--gq-bioeconomia-page-background-swatch": color,
              },
              "aria-label": option.label,
              "aria-pressed": isSelected,
              title: option.label,
              onClick: () => setBackgroundColor(color),
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
        color: currentColor || "#ffffff",
        enableAlpha: false,
        onChange: setBackgroundColor,
      }),
      createElement(
        "div",
        {
          className: "gq-bioeconomia-page-background-panel__actions",
          style: {
            "--gq-bioeconomia-page-background-preview": currentColor || "#ffffff",
          },
        },
        createElement("span", {
          className: "gq-bioeconomia-page-background-panel__preview",
        }),
        createElement(
          Button,
          {
            variant: "secondary",
            onClick: () => setBackgroundColor(""),
            disabled: !currentColor,
          },
          __("Repor", "gq-bioeconomia"),
        ),
      ),
    );
  }

  /*
   * The visual prototype is a native `core/button` variation rather than a
   * second custom block. WordPress still owns the button text/link controls and
   * serialization; Astro recognizes the class and owns the final markup.
   */
  registerBlockVariation("core/button", {
    name: "bioeconomia",
    title: __("Botão Bioeconomia", "gq-bioeconomia"),
    description: __("Botão animado com o estilo visual da Bioeconomia.", "gq-bioeconomia"),
    icon: "button",
    attributes: {
      className: "is-style-bioeconomia",
      text: "Explora a Bionomia",
    },
    scope: ["inserter"],
  });
  registerPlugin("gq-bioeconomia-page-background", {
    render: PageBackgroundPanel,
  });
})();
