(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, ToggleControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const {
    MediaUploadButton,
    registerContractBlock,
    TematicaEyebrowField,
    UrlField,
    useTematicaEyebrow,
  } = window.getquickNomiaBlocksEditor;

  /** @param {Record<string, unknown>} attributes */
  function homeIntroShowsCta(attributes) {
    if (attributes.hideCta === true) {
      return false;
    }
    return attributes.showCta !== false;
  }

  /** @param {Record<string, unknown>} attributes */
  function homeIntroShowsTematica(attributes) {
    return attributes.showTematica !== false;
  }

  /** @param {Record<string, unknown>} attributes */
  function homeIntroShowsCaption(attributes) {
    return attributes.showCaption !== false;
  }
  function HomeIntroEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "getquick-home-intro-editor",
    });
    const { selectedTematica, tematicaOptions, accent, setTematica } = useTematicaEyebrow(
      attributes,
      setAttributes,
    );
    const ctaHref = attributes.ctaHref || attributes.ctaUrl || "";
    const showCta = homeIntroShowsCta(attributes);
    const showTematica = homeIntroShowsTematica(attributes);
    const showCaption = homeIntroShowsCaption(attributes);
    const heroImageUrl = attributes.heroSrc || attributes.heroUrl || "";
    const heroImageAlt = attributes.heroAlt || "";
    function setHeroImage(media) {
      const nextUrl = media?.url || "";
      setAttributes({
        heroId: media?.id,
        heroSrc: nextUrl,
        heroAlt: media?.alt ?? "",
      });
    }
    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Content", "getquick-nomia-blocks"),
            initialOpen: true,
          },
          createElement(ToggleControl, {
            label: __("Show Tematic selector", "getquick-nomia-blocks"),
            checked: showTematica,
            onChange: (next) =>
              setAttributes({
                showTematica: next,
              }),
          }),
          createElement(ToggleControl, {
            label: __("Show CTA button", "getquick-nomia-blocks"),
            checked: showCta,
            onChange: (next) =>
              setAttributes({
                showCta: next,
              }),
          }),
          showCta
            ? createElement(UrlField, {
                label: __("CTA URL", "getquick-nomia-blocks"),
                value: ctaHref,
                onChange: (next) =>
                  setAttributes({
                    ctaHref: next,
                  }),
              })
            : null,
          createElement(ToggleControl, {
            label: __("Show description text", "getquick-nomia-blocks"),
            checked: showCaption,
            onChange: (next) =>
              setAttributes({
                showCaption: next,
              }),
          }),
        ),
      ),
      createElement(
        "section",
        blockProps,
        createElement(
          "div",
          {
            className: "getquick-home-intro-editor__inner",
          },
          createElement(
            "div",
            {
              className: "getquick-home-intro-editor__intro",
            },
            showTematica
              ? createElement(TematicaEyebrowField, {
                  accent: accent,
                  selectedTematica: selectedTematica,
                  tematicaOptions: tematicaOptions,
                  setTematica: setTematica,
                  centered: true,
                })
              : null,
            createElement(
              "div",
              {
                className: "getquick-home-intro-editor__text",
              },
              createElement(RichText, {
                tagName: "h2",
                value: attributes.heading || "",
                placeholder: __("Heading", "getquick-nomia-blocks"),
                allowedFormats: [],
                onChange: (next) =>
                  setAttributes({
                    heading: next,
                  }),
              }),
              createElement(RichText, {
                tagName: "p",
                value: attributes.body || "",
                placeholder: __("Body copy", "getquick-nomia-blocks"),
                allowedFormats: ["core/bold", "core/italic"],
                onChange: (next) =>
                  setAttributes({
                    body: next,
                  }),
              }),
            ),
            showCta
              ? createElement(RichText, {
                  tagName: "span",
                  className: "getquick-home-intro-editor__cta",
                  value: attributes.ctaLabel || "",
                  placeholder: __("CTA label", "getquick-nomia-blocks"),
                  allowedFormats: [],
                  onChange: (next) =>
                    setAttributes({
                      ctaLabel: next,
                    }),
                })
              : null,
          ),
          createElement(
            "figure",
            {
              className: "getquick-home-intro-editor__figure",
            },
            createElement(
              "div",
              {
                className: "getquick-home-intro-editor__hero",
              },
              heroImageUrl
                ? createElement("img", {
                    src: heroImageUrl,
                    alt: heroImageAlt,
                  })
                : createElement(
                    "div",
                    {
                      className: "getquick-home-intro-editor__hero-placeholder",
                    },
                    __("Select an image", "getquick-nomia-blocks"),
                  ),
            ),
            createElement(
              "div",
              {
                className: "getquick-home-intro-editor__hero-actions",
              },
              createElement(MediaUploadButton, {
                imageId: attributes.heroId,
                onSelect: setHeroImage,
                labelSelect: __("Select hero image", "getquick-nomia-blocks"),
                labelReplace: __("Replace hero image", "getquick-nomia-blocks"),
                hasImage: Boolean(heroImageUrl),
              }),
            ),
            showCaption
              ? createElement(
                  "figcaption",
                  {
                    className: "getquick-home-intro-editor__caption",
                  },
                  createElement(RichText, {
                    tagName: "p",
                    className: "getquick-home-intro-editor__caption-title",
                    value: attributes.captionHeading || "",
                    placeholder: __("Caption heading", "getquick-nomia-blocks"),
                    allowedFormats: [],
                    onChange: (next) =>
                      setAttributes({
                        captionHeading: next,
                      }),
                  }),
                  createElement(RichText, {
                    tagName: "p",
                    className: "getquick-home-intro-editor__caption-body",
                    value: attributes.captionBody || "",
                    placeholder: __("Caption body", "getquick-nomia-blocks"),
                    allowedFormats: ["core/bold", "core/italic"],
                    onChange: (next) =>
                      setAttributes({
                        captionBody: next,
                      }),
                  }),
                )
              : null,
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/home-intro", { edit: HomeIntroEdit });
})();
