(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { PanelBody } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { ImageAltControl, MediaUploadButton, registerContractBlock } =
    window.getquickNomiaBlocksEditor;

  function ImageZoomEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "image-zoom-editor",
    });
    const imageUrl = attributes.imageSrc || "";
    const imageAlt = attributes.imageAlt || "";
    function setImage(media) {
      const nextUrl = media?.url || "";
      setAttributes({
        imageId: media?.id,
        imageSrc: nextUrl,
        imageAlt: media?.alt ?? "",
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
            title: __("Image", "getquick-nomia-blocks"),
            initialOpen: true,
          },
          createElement(MediaUploadButton, {
            imageId: attributes.imageId,
            onSelect: setImage,
            labelSelect: __("Select image", "getquick-nomia-blocks"),
            labelReplace: __("Replace image", "getquick-nomia-blocks"),
            hasImage: Boolean(imageUrl),
          }),
          createElement(ImageAltControl, {
            value: imageAlt,
            onChange: (next) =>
              setAttributes({
                imageAlt: next,
              }),
          }),
        ),
      ),
      createElement(
        "figure",
        blockProps,
        createElement(
          "div",
          {
            className: "image-zoom-editor__frame",
          },
          imageUrl
            ? createElement("img", {
                src: imageUrl,
                alt: imageAlt,
              })
            : createElement(
                "div",
                {
                  className: "image-zoom-editor__placeholder",
                },
                __("Select an image", "getquick-nomia-blocks"),
              ),
        ),
        createElement(
          "div",
          {
            className: "image-zoom-editor__actions",
          },
          createElement(MediaUploadButton, {
            imageId: attributes.imageId,
            onSelect: setImage,
            labelSelect: __("Select image", "getquick-nomia-blocks"),
            labelReplace: __("Replace image", "getquick-nomia-blocks"),
            hasImage: Boolean(imageUrl),
          }),
        ),
        createElement(RichText, {
          tagName: "figcaption",
          value: attributes.caption || "",
          placeholder: __("Optional caption", "getquick-nomia-blocks"),
          allowedFormats: ["core/bold", "core/italic"],
          onChange: (next) =>
            setAttributes({
              caption: next,
            }),
        }),
      ),
    );
  }

  registerContractBlock("getquick/image-zoom", { edit: ImageZoomEdit });
})();
