(() => {
  const {
    BlockControls,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    useBlockProps,
  } = window.wp.blockEditor;
  const {
    Button,
    ColorPalette,
    PanelBody,
    RangeControl,
    TextControl,
    ToolbarButton,
    ToolbarGroup,
  } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { registerContractBlock, UrlField, useSiteColors } = window.gqBioeconomiaEditor;

  const DEFAULT_COLUMN_BACKGROUND = "#ffffff";
  const DEFAULT_COLUMN_HOVER_BACKGROUND = "#f2a900";
  const DEFAULT_COLUMN_TITLE_COLOR = "#ffffff";
  const DEFAULT_COLUMN_TEXT_COLOR = "#ffffff";
  const DEFAULT_COLUMN_BORDER_RADIUS = 40;
  const DEFAULT_TEXT_VERTICAL_ALIGN = "bottom";
  const SHARE_HREF = "https://nomia.getquick.io/partilhar/";
  const SHARE_LABEL = "Partilhar";
  const TEXT_VERTICAL_ALIGN_OPTIONS = new Set(["top", "bottom"]);
  function TextTopIcon() {
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
        d: "M5 4.5h14V6H5V4.5Zm1 3.5h12v1.5H6V8Zm0 3.5h8V13H6v-1.5Zm-1 5h14V18H5v-1.5Z",
      }),
    );
  }
  function TextBottomIcon() {
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
        d: "M5 4.5h14V6H5V4.5Zm1 6.5h8v1.5H6V11Zm0 3.5h12V16H6v-1.5Zm0 3.5h12v1.5H6V18Z",
      }),
    );
  }
  function MediaButton({ allowedTypes, value, onSelect, label, replaceLabel }) {
    return createElement(
      MediaUploadCheck,
      null,
      createElement(MediaUpload, {
        allowedTypes: allowedTypes,
        value: value,
        onSelect: onSelect,
        render: ({ open }) =>
          createElement(
            Button,
            {
              variant: "secondary",
              onClick: open,
            },
            value ? replaceLabel : label,
          ),
      }),
    );
  }
  function borderRadiusValue(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return DEFAULT_COLUMN_BORDER_RADIUS;
    }
    return Math.min(80, Math.max(0, parsed));
  }
  function borderRadiusStyle(value) {
    return `${borderRadiusValue(value)}px`;
  }
  function BorderRadiusControl({ label, name, attributes, setAttributes }) {
    return createElement(RangeControl, {
      label: label,
      value: borderRadiusValue(attributes[name]),
      min: 0,
      max: 80,
      step: 1,
      onChange: (next) =>
        setAttributes({
          [name]: String(borderRadiusValue(next)),
        }),
    });
  }
  function ColumnPanel({
    hrefName,
    backgroundName,
    hoverBackgroundName,
    titleColorName,
    textColorName,
    borderRadiusName,
    attributes,
    setAttributes,
  }) {
    const siteColors = useSiteColors();
    const backgroundColor = attributes[backgroundName] || DEFAULT_COLUMN_BACKGROUND;
    const hoverBackgroundColor = attributes[hoverBackgroundName] || DEFAULT_COLUMN_HOVER_BACKGROUND;
    const titleColor = attributes[titleColorName] || DEFAULT_COLUMN_TITLE_COLOR;
    const textColor = attributes[textColorName] || DEFAULT_COLUMN_TEXT_COLOR;
    return createElement(
      "div",
      {
        className: "page-hero-media-grid-editor__inspector-group",
      },
      createElement(UrlField, {
        label: __("URL", "gq-bioeconomia"),
        value: attributes[hrefName] || "",
        onChange: (next) =>
          setAttributes({
            [hrefName]: next,
          }),
      }),
      createElement(
        "p",
        {
          className: "page-hero-media-grid-editor__inspector-label",
        },
        __("Background color", "gq-bioeconomia"),
      ),
      createElement(ColorPalette, {
        colors: siteColors,
        value: backgroundColor,
        onChange: (next) =>
          setAttributes({
            [backgroundName]: next || DEFAULT_COLUMN_BACKGROUND,
          }),
      }),
      createElement(
        "p",
        {
          className: "page-hero-media-grid-editor__inspector-label",
        },
        __("Hover color", "gq-bioeconomia"),
      ),
      createElement(ColorPalette, {
        colors: siteColors,
        value: hoverBackgroundColor,
        onChange: (next) =>
          setAttributes({
            [hoverBackgroundName]: next || DEFAULT_COLUMN_HOVER_BACKGROUND,
          }),
      }),
      createElement(
        "p",
        {
          className: "page-hero-media-grid-editor__inspector-label",
        },
        __("Title color", "gq-bioeconomia"),
      ),
      createElement(ColorPalette, {
        colors: siteColors,
        value: titleColor,
        onChange: (next) =>
          setAttributes({
            [titleColorName]: next || DEFAULT_COLUMN_TITLE_COLOR,
          }),
      }),
      createElement(
        "p",
        {
          className: "page-hero-media-grid-editor__inspector-label",
        },
        __("Paragraph color", "gq-bioeconomia"),
      ),
      createElement(ColorPalette, {
        colors: siteColors,
        value: textColor,
        onChange: (next) =>
          setAttributes({
            [textColorName]: next || DEFAULT_COLUMN_TEXT_COLOR,
          }),
      }),
      createElement(BorderRadiusControl, {
        label: __("Corner radius", "gq-bioeconomia"),
        name: borderRadiusName,
        attributes: attributes,
        setAttributes: setAttributes,
      }),
    );
  }
  function PageHeroMediaGridEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "page-hero-media-grid-editor",
    });
    const backgroundImageUrl = attributes.backgroundImageSrc || "";
    const videoSrc = attributes.videoSrc || "";
    const videoPosterSrc = attributes.videoPosterSrc || "";
    const heading = attributes.heading || "Destaques e video";
    const shareHref = attributes.shareHref ?? SHARE_HREF;
    const shareLabel = attributes.shareLabel ?? SHARE_LABEL;
    const firstBackgroundColor = attributes.firstBackgroundColor || DEFAULT_COLUMN_BACKGROUND;
    const firstHoverBackgroundColor =
      attributes.firstHoverBackgroundColor || DEFAULT_COLUMN_HOVER_BACKGROUND;
    const firstTitleColor = attributes.firstTitleColor || DEFAULT_COLUMN_TITLE_COLOR;
    const firstTextColor = attributes.firstTextColor || DEFAULT_COLUMN_TEXT_COLOR;
    const secondBackgroundColor = attributes.secondBackgroundColor || DEFAULT_COLUMN_BACKGROUND;
    const secondHoverBackgroundColor =
      attributes.secondHoverBackgroundColor || DEFAULT_COLUMN_HOVER_BACKGROUND;
    const secondTitleColor = attributes.secondTitleColor || DEFAULT_COLUMN_TITLE_COLOR;
    const secondTextColor = attributes.secondTextColor || DEFAULT_COLUMN_TEXT_COLOR;
    const firstBorderRadius = borderRadiusStyle(attributes.firstBorderRadius);
    const secondBorderRadius = borderRadiusStyle(attributes.secondBorderRadius);
    const videoBorderRadius = borderRadiusStyle(attributes.videoBorderRadius);
    const textVerticalAlign = TEXT_VERTICAL_ALIGN_OPTIONS.has(attributes.textVerticalAlign)
      ? attributes.textVerticalAlign
      : DEFAULT_TEXT_VERTICAL_ALIGN;
    const textVerticalAlignClass = `page-hero-media-grid-editor__button--text-${textVerticalAlign}`;
    function setBackgroundImage(media) {
      setAttributes({
        backgroundImageId: media?.id,
        backgroundImageSrc: media?.url || "",
        backgroundImageAlt: media?.alt || "",
      });
    }
    function setVideo(media) {
      setAttributes({
        videoId: media?.id,
        videoSrc: media?.url || "",
        videoTitle: media?.title || attributes.videoTitle || "",
      });
    }
    function setVideoPoster(media) {
      setAttributes({
        videoPosterId: media?.id,
        videoPosterSrc: media?.url || "",
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
            label: __("Paragraph vertical alignment", "gq-bioeconomia"),
          },
          createElement(ToolbarButton, {
            icon: createElement(TextTopIcon, null),
            label: __("Top aligned", "gq-bioeconomia"),
            isPressed: textVerticalAlign === "top",
            showTooltip: true,
            onClick: () =>
              setAttributes({
                textVerticalAlign: "top",
              }),
          }),
          createElement(ToolbarButton, {
            icon: createElement(TextBottomIcon, null),
            label: __("Bottom aligned", "gq-bioeconomia"),
            isPressed: textVerticalAlign === "bottom",
            showTooltip: true,
            onClick: () =>
              setAttributes({
                textVerticalAlign: "bottom",
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
            title: __("Background", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(
            "div",
            {
              className: "page-hero-media-grid-editor__inspector-group",
            },
            createElement(TextControl, {
              label: __("Accessible section label", "gq-bioeconomia"),
              value: heading,
              onChange: (next) =>
                setAttributes({
                  heading: next,
                }),
            }),
            createElement(
              "p",
              {
                className: "page-hero-media-grid-editor__inspector-label",
              },
              __("Background image", "gq-bioeconomia"),
            ),
            createElement(MediaButton, {
              allowedTypes: ["image"],
              value: attributes.backgroundImageId,
              onSelect: setBackgroundImage,
              label: __("Select background image", "gq-bioeconomia"),
              replaceLabel: __("Replace background image", "gq-bioeconomia"),
            }),
          ),
        ),
        createElement(
          PanelBody,
          {
            title: __("Column A", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(ColumnPanel, {
            hrefName: "firstHref",
            backgroundName: "firstBackgroundColor",
            hoverBackgroundName: "firstHoverBackgroundColor",
            titleColorName: "firstTitleColor",
            textColorName: "firstTextColor",
            borderRadiusName: "firstBorderRadius",
            attributes: attributes,
            setAttributes: setAttributes,
          }),
        ),
        createElement(
          PanelBody,
          {
            title: __("Column B", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(ColumnPanel, {
            hrefName: "secondHref",
            backgroundName: "secondBackgroundColor",
            hoverBackgroundName: "secondHoverBackgroundColor",
            titleColorName: "secondTitleColor",
            textColorName: "secondTextColor",
            borderRadiusName: "secondBorderRadius",
            attributes: attributes,
            setAttributes: setAttributes,
          }),
        ),
        createElement(
          PanelBody,
          {
            title: __("Column C", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(
            "div",
            {
              className: "page-hero-media-grid-editor__inspector-group",
            },
            createElement(
              "p",
              {
                className: "page-hero-media-grid-editor__inspector-label",
              },
              __("Video", "gq-bioeconomia"),
            ),
            createElement(MediaButton, {
              allowedTypes: ["video"],
              value: attributes.videoId,
              onSelect: setVideo,
              label: __("Select video", "gq-bioeconomia"),
              replaceLabel: __("Replace video", "gq-bioeconomia"),
            }),
            createElement(UrlField, {
              label: __("Video URL", "gq-bioeconomia"),
              value: videoSrc,
              onChange: (next) =>
                setAttributes({
                  videoSrc: next,
                }),
            }),
            createElement(TextControl, {
              label: __("Video title", "gq-bioeconomia"),
              value: attributes.videoTitle || "",
              onChange: (next) =>
                setAttributes({
                  videoTitle: next,
                }),
            }),
            createElement(UrlField, {
              label: __("Share URL", "gq-bioeconomia"),
              value: shareHref,
              onChange: (next) =>
                setAttributes({
                  shareHref: next,
                }),
            }),
            createElement(TextControl, {
              label: __("Share label", "gq-bioeconomia"),
              value: shareLabel,
              onChange: (next) =>
                setAttributes({
                  shareLabel: next,
                }),
            }),
            createElement(BorderRadiusControl, {
              label: __("Corner radius", "gq-bioeconomia"),
              name: "videoBorderRadius",
              attributes: attributes,
              setAttributes: setAttributes,
            }),
          ),
          createElement(
            "div",
            {
              className: "page-hero-media-grid-editor__inspector-group",
            },
            createElement(
              "p",
              {
                className: "page-hero-media-grid-editor__inspector-label",
              },
              __("Video poster image", "gq-bioeconomia"),
            ),
            createElement(MediaButton, {
              allowedTypes: ["image"],
              value: attributes.videoPosterId,
              onSelect: setVideoPoster,
              label: __("Select poster image", "gq-bioeconomia"),
              replaceLabel: __("Replace poster image", "gq-bioeconomia"),
            }),
          ),
        ),
      ),
      createElement(
        "section",
        { ...blockProps, "aria-label": heading },
        createElement(
          "div",
          {
            className: "page-hero-media-grid-editor__background",
            "aria-hidden": true,
          },
          backgroundImageUrl
            ? createElement("img", {
                src: backgroundImageUrl,
                alt: "",
              })
            : null,
          createElement("div", {
            className: "page-hero-media-grid-editor__overlay",
          }),
        ),
        createElement(
          "div",
          {
            className: "page-hero-media-grid-editor__content",
          },
          createElement(
            "div",
            {
              className: "page-hero-media-grid-editor__grid",
            },
            createElement(
              "div",
              {
                className: `page-hero-media-grid-editor__button ${textVerticalAlignClass}`,
                style: {
                  "--column-background": firstBackgroundColor,
                  "--column-hover-background": firstHoverBackgroundColor,
                  "--column-title-color": firstTitleColor,
                  "--column-text-color": firstTextColor,
                  "--column-border-radius": firstBorderRadius,
                },
              },
              createElement(RichText, {
                tagName: "span",
                className: "page-hero-media-grid-editor__button-title",
                value: attributes.firstTitle || "",
                placeholder: __("First title", "gq-bioeconomia"),
                allowedFormats: [],
                onChange: (next) =>
                  setAttributes({
                    firstTitle: next,
                  }),
              }),
              createElement(RichText, {
                tagName: "span",
                className: "page-hero-media-grid-editor__button-text",
                value: attributes.firstText || "",
                placeholder: __("First text", "gq-bioeconomia"),
                allowedFormats: ["core/bold", "core/italic"],
                onChange: (next) =>
                  setAttributes({
                    firstText: next,
                  }),
              }),
            ),
            createElement(
              "div",
              {
                className: `page-hero-media-grid-editor__button ${textVerticalAlignClass}`,
                style: {
                  "--column-background": secondBackgroundColor,
                  "--column-hover-background": secondHoverBackgroundColor,
                  "--column-title-color": secondTitleColor,
                  "--column-text-color": secondTextColor,
                  "--column-border-radius": secondBorderRadius,
                },
              },
              createElement(RichText, {
                tagName: "span",
                className: "page-hero-media-grid-editor__button-title",
                value: attributes.secondTitle || "",
                placeholder: __("Second title", "gq-bioeconomia"),
                allowedFormats: [],
                onChange: (next) =>
                  setAttributes({
                    secondTitle: next,
                  }),
              }),
              createElement(RichText, {
                tagName: "span",
                className: "page-hero-media-grid-editor__button-text",
                value: attributes.secondText || "",
                placeholder: __("Second text", "gq-bioeconomia"),
                allowedFormats: ["core/bold", "core/italic"],
                onChange: (next) =>
                  setAttributes({
                    secondText: next,
                  }),
              }),
            ),
            createElement(
              "div",
              {
                className: "page-hero-media-grid-editor__video",
                style: {
                  "--video-border-radius": videoBorderRadius,
                },
              },
              videoSrc
                ? createElement(
                    Fragment,
                    null,
                    createElement(
                      "video",
                      {
                        autoPlay: true,
                        loop: true,
                        muted: true,
                        playsInline: true,
                        poster: videoPosterSrc || undefined,
                      },
                      createElement("source", {
                        src: videoSrc,
                      }),
                    ),
                    shareHref && shareLabel
                      ? createElement(
                          "a",
                          {
                            className: "page-hero-media-grid-editor__share",
                            href: shareHref,
                          },
                          shareLabel,
                        )
                      : null,
                  )
                : createElement(
                    "div",
                    {
                      className: "page-hero-media-grid-editor__video-placeholder",
                    },
                    __("Select a video", "gq-bioeconomia"),
                  ),
            ),
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/page-hero-media-grid", { edit: PageHeroMediaGridEdit });
})();
