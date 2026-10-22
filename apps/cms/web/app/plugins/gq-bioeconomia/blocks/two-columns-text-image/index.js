(() => {
  const { BlockControls, InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, ToggleControl, ToolbarButton, ToolbarGroup } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const {
    ImageAltControl,
    MediaUploadButton,
    registerContractBlock,
    TematicaEyebrowField,
    UrlField,
    useTematicaEyebrow,
  } = window.gqBioeconomiaEditor;

  function normalizedMediaPosition(value) {
    return value === "left" ? "left" : "right";
  }
  function ImageLeftIcon() {
    return createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        width: 24,
        height: 24,
        "aria-hidden": true,
        focusable: false,
      },
      createElement("path", {
        d: "M4 5.5h7v13H4v-13Zm9.5 1h6v1.5h-6V6.5Zm0 4h6V12h-6v-1.5Zm0 4h6V16h-6v-1.5Z",
      }),
    );
  }
  function ImageRightIcon() {
    return createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        width: 24,
        height: 24,
        "aria-hidden": true,
        focusable: false,
      },
      createElement("path", {
        d: "M13 5.5h7v13h-7v-13Zm-8.5 1h6v1.5h-6V6.5Zm0 4h6V12h-6v-1.5Zm0 4h6V16h-6v-1.5Z",
      }),
    );
  }
  function TwoColumnsTextImageEdit({ attributes, setAttributes }) {
    const mediaPosition = normalizedMediaPosition(attributes.mediaPosition);
    const blockProps = useBlockProps({
      className: `two-columns-text-image-editor has-media-${mediaPosition}`,
    });
    const { selectedTematica, tematicaOptions, accent, setTematica } = useTematicaEyebrow(
      attributes,
      setAttributes,
    );
    const ctaHref = attributes.ctaHref || "";
    const hideCta = attributes.hideCta === true;
    const hideTaxonomy = attributes.hideTaxonomy === true;
    const primaryImageUrl = attributes.primarySrc || "";
    const primaryImageAlt = attributes.primaryAlt || "";
    function setPrimaryImage(media) {
      const nextUrl = media?.url || "";
      setAttributes({
        primaryId: media?.id,
        primarySrc: nextUrl,
        primaryAlt: media?.alt ?? "",
      });
    }
    return createElement(
      Fragment,
      null,
      createElement(
        BlockControls,
        null,
        createElement(
          ToolbarGroup,
          {
            label: __("Image position", "gq-bioeconomia"),
          },
          createElement(ToolbarButton, {
            icon: createElement(ImageLeftIcon, null),
            isPressed: mediaPosition === "left",
            label: __("Image left", "gq-bioeconomia"),
            showTooltip: true,
            onClick: () =>
              setAttributes({
                mediaPosition: "left",
              }),
          }),
          createElement(ToolbarButton, {
            icon: createElement(ImageRightIcon, null),
            isPressed: mediaPosition === "right",
            label: __("Image right", "gq-bioeconomia"),
            showTooltip: true,
            onClick: () =>
              setAttributes({
                mediaPosition: "right",
              }),
          }),
        ),
      ),
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Content", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(ToggleControl, {
            label: __("Hide taxonomy label", "gq-bioeconomia"),
            checked: hideTaxonomy,
            onChange: (next) =>
              setAttributes({
                hideTaxonomy: next,
              }),
          }),
          createElement(ToggleControl, {
            label: __("Hide CTA button", "gq-bioeconomia"),
            checked: hideCta,
            onChange: (next) =>
              setAttributes({
                hideCta: next,
              }),
          }),
          hideCta
            ? null
            : createElement(UrlField, {
                label: __("CTA URL", "gq-bioeconomia"),
                value: ctaHref,
                onChange: (next) =>
                  setAttributes({
                    ctaHref: next,
                  }),
              }),
          createElement(ImageAltControl, {
            value: primaryImageAlt,
            onChange: (next) =>
              setAttributes({
                primaryAlt: next,
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
            className: "two-columns-text-image-editor__inner",
          },
          createElement(
            "div",
            {
              className: "two-columns-text-image-editor__copy",
            },
            hideTaxonomy
              ? null
              : createElement(TematicaEyebrowField, {
                  accent: accent,
                  selectedTematica: selectedTematica,
                  tematicaOptions: tematicaOptions,
                  setTematica: setTematica,
                }),
            createElement(
              "div",
              {
                className: "two-columns-text-image-editor__text",
              },
              createElement(RichText, {
                tagName: "h2",
                value: attributes.heading || "",
                placeholder: __("Heading", "gq-bioeconomia"),
                allowedFormats: [],
                onChange: (next) =>
                  setAttributes({
                    heading: next,
                  }),
              }),
              createElement(RichText, {
                tagName: "p",
                value: attributes.body || "",
                placeholder: __("Body copy", "gq-bioeconomia"),
                allowedFormats: ["core/bold", "core/italic"],
                onChange: (next) =>
                  setAttributes({
                    body: next,
                  }),
              }),
            ),
            hideCta
              ? null
              : createElement(RichText, {
                  tagName: "span",
                  className: "two-columns-text-image-editor__cta",
                  value: attributes.ctaLabel || "",
                  placeholder: __("CTA label", "gq-bioeconomia"),
                  allowedFormats: [],
                  onChange: (next) =>
                    setAttributes({
                      ctaLabel: next,
                    }),
                }),
          ),
          createElement(
            "div",
            {
              className: "two-columns-text-image-editor__visual",
            },
            createElement(
              "figure",
              {
                className: "two-columns-text-image-editor__frame",
              },
              createElement(
                "div",
                {
                  className: "two-columns-text-image-editor__native-image",
                },
                primaryImageUrl
                  ? createElement("img", {
                      src: primaryImageUrl,
                      alt: primaryImageAlt,
                    })
                  : createElement(
                      "div",
                      {
                        className: "two-columns-text-image-editor__native-image-placeholder",
                      },
                      __("Select an image", "gq-bioeconomia"),
                    ),
              ),
              createElement(
                "div",
                {
                  className: "two-columns-text-image-editor__image-actions",
                },
                createElement(MediaUploadButton, {
                  imageId: attributes.primaryId,
                  onSelect: setPrimaryImage,
                  labelSelect: __("Select image", "gq-bioeconomia"),
                  labelReplace: __("Replace image", "gq-bioeconomia"),
                  hasImage: Boolean(primaryImageUrl),
                }),
              ),
            ),
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/two-columns-text-image", { edit: TwoColumnsTextImageEdit });
})();
