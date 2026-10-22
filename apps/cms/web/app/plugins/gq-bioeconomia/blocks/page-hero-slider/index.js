(() => {
  const { BlockControls, InspectorControls, RichText, URLInputButton, useBlockProps } =
    window.wp.blockEditor;
  const { Button, PanelBody, ToggleControl, ToolbarGroup } = window.wp.components;
  const { createElement, Fragment, useState } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { MediaUploadButton, registerContractBlock, UrlField } = window.gqBioeconomiaEditor;

  const DEFAULT_PAGE_HERO_SLIDER_SLIDE = {
    id: "",
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaHref: "",
    bgImage: "",
    bgImageId: undefined,
    spotlightImageSrc: "",
    spotlightImageId: undefined,
    showSpotlight: true,
    spotlightTitle: "",
    spotlightBody: "",
    spotlightHref: "",
  };
  function normalizeSliderSlides(value) {
    return Array.isArray(value)
      ? value.map((slide) => ({
          ...DEFAULT_PAGE_HERO_SLIDER_SLIDE,
          id: slide?.id || "",
          title: slide?.title || "",
          subtitle: slide?.subtitle || "",
          ctaLabel: slide?.ctaLabel || "",
          ctaHref: slide?.ctaHref || slide?.ctaUrl || "",
          bgImageId: slide?.bgImageId,
          bgImage: slide?.bgImage || slide?.imageSrc || slide?.imageUrl || "",
          spotlightImageSrc: slide?.spotlightImageSrc || slide?.spotlightImageUrl || "",
          spotlightImageId: slide?.spotlightImageId,
          showSpotlight: slide?.showSpotlight !== false,
          spotlightTitle: slide?.spotlightTitle || "",
          spotlightBody: slide?.spotlightBody || "",
          spotlightHref: slide?.spotlightHref || slide?.spotlightUrl || "",
        }))
      : [];
  }
  function PageHeroSliderEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "page-hero-slider-editor",
    });
    const slides = normalizeSliderSlides(attributes.slides);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedSlide = slides[selectedIndex] || DEFAULT_PAGE_HERO_SLIDER_SLIDE;
    const hasSlides = slides.length > 0;
    function setSlides(nextSlides) {
      setAttributes({
        slides: nextSlides,
      });
    }
    function updateSlide(index, patch) {
      setSlides(
        slides.map((slide, slideIndex) =>
          slideIndex === index
            ? {
                ...slide,
                ...patch,
              }
            : slide,
        ),
      );
    }
    function addSlide() {
      const nextSlides = [
        ...slides,
        {
          ...DEFAULT_PAGE_HERO_SLIDER_SLIDE,
          id: `slide-${slides.length + 1}`,
        },
      ];
      setSlides(nextSlides);
      setSelectedIndex(nextSlides.length - 1);
    }
    function removeSlide(index) {
      const nextSlides = slides.filter((_, slideIndex) => slideIndex !== index);
      setSlides(nextSlides);
      setSelectedIndex(Math.max(0, Math.min(index, nextSlides.length - 1)));
    }
    function setBackgroundImage(media) {
      updateSlide(selectedIndex, {
        bgImageId: media?.id,
        bgImage: media?.url || "",
      });
    }
    function setSpotlightImage(media) {
      updateSlide(selectedIndex, {
        spotlightImageId: media?.id,
        spotlightImageSrc: media?.url || "",
      });
    }
    return createElement(
      Fragment,
      null,
      hasSlides
        ? createElement(
            BlockControls,
            null,
            createElement(
              ToolbarGroup,
              {
                label: __("CTA link", "gq-bioeconomia"),
              },
              createElement(URLInputButton, {
                url: selectedSlide.ctaHref || "",
                onChange: (next) =>
                  updateSlide(selectedIndex, {
                    ctaHref: next,
                  }),
              }),
            ),
          )
        : null,
      createElement(
        InspectorControls,
        null,
        hasSlides
          ? createElement(
              PanelBody,
              {
                title: __("Visibility", "gq-bioeconomia"),
                initialOpen: true,
              },
              createElement(ToggleControl, {
                label: __("Show spotlight section", "gq-bioeconomia"),
                checked: selectedSlide.showSpotlight !== false,
                onChange: (next) =>
                  updateSlide(selectedIndex, {
                    showSpotlight: next,
                  }),
              }),
            )
          : null,
      ),
      createElement(
        "section",
        blockProps,
        hasSlides
          ? createElement(
              "div",
              {
                className: "page-hero-slider-editor__viewport",
              },
              createElement(
                "div",
                {
                  className: "page-hero-slider-editor__slide-controls",
                },
                createElement(
                  "div",
                  {
                    className: "page-hero-slider-editor__slide-tabs",
                  },
                  slides.map((slide, index) =>
                    createElement(
                      Button,
                      {
                        key: index,
                        variant: selectedIndex === index ? "primary" : "secondary",
                        "aria-pressed": selectedIndex === index,
                        onClick: () => setSelectedIndex(index),
                      },
                      slide.title || `${__("Slide", "gq-bioeconomia")} ${index + 1}`,
                    ),
                  ),
                ),
                createElement(
                  Button,
                  {
                    variant: "secondary",
                    onClick: addSlide,
                  },
                  __("Add slide", "gq-bioeconomia"),
                ),
                createElement(
                  Button,
                  {
                    isDestructive: true,
                    variant: "secondary",
                    onClick: () => removeSlide(selectedIndex),
                  },
                  __("Remove selected", "gq-bioeconomia"),
                ),
              ),
              createElement(
                "div",
                {
                  className: "page-hero-slider-editor__media",
                },
                selectedSlide.bgImage
                  ? createElement("img", {
                      src: selectedSlide.bgImage,
                      alt: "",
                    })
                  : createElement(
                      "div",
                      {
                        className: "page-hero-slider-editor__image-placeholder",
                      },
                      __("Select a background image", "gq-bioeconomia"),
                    ),
                createElement("div", {
                  className: "page-hero-slider-editor__overlay",
                }),
                createElement(
                  "div",
                  {
                    className: "page-hero-slider-editor__media-actions",
                  },
                  createElement(MediaUploadButton, {
                    imageId: selectedSlide.bgImageId,
                    onSelect: setBackgroundImage,
                    labelSelect: __("Select background image", "gq-bioeconomia"),
                    labelReplace: __("Replace background image", "gq-bioeconomia"),
                    hasImage: Boolean(selectedSlide.bgImage),
                  }),
                ),
              ),
              createElement(
                "div",
                {
                  className: "page-hero-slider-editor__content",
                },
                createElement(
                  "div",
                  {
                    className: "page-hero-slider-editor__copy",
                  },
                  createElement(RichText, {
                    tagName: "p",
                    value: selectedSlide.title || "",
                    placeholder: __("Slide title", "gq-bioeconomia"),
                    allowedFormats: [],
                    onChange: (next) =>
                      updateSlide(selectedIndex, {
                        title: next,
                      }),
                  }),
                  createElement(RichText, {
                    tagName: "p",
                    value: selectedSlide.subtitle || "",
                    placeholder: __("Slide subtitle", "gq-bioeconomia"),
                    allowedFormats: ["core/bold", "core/italic"],
                    onChange: (next) =>
                      updateSlide(selectedIndex, {
                        subtitle: next,
                      }),
                  }),
                  createElement(RichText, {
                    tagName: "span",
                    className: "page-hero-slider-editor__cta",
                    value: selectedSlide.ctaLabel || "",
                    placeholder: __("CTA label", "gq-bioeconomia"),
                    allowedFormats: [],
                    onChange: (next) =>
                      updateSlide(selectedIndex, {
                        ctaLabel: next,
                      }),
                  }),
                ),
                selectedSlide.showSpotlight !== false
                  ? createElement(
                      "div",
                      {
                        className: "page-hero-slider-editor__spotlight",
                      },
                      selectedSlide.spotlightImageSrc
                        ? createElement("img", {
                            src: selectedSlide.spotlightImageSrc,
                            alt: "",
                          })
                        : createElement(
                            "div",
                            {
                              className: "page-hero-slider-editor__spotlight-placeholder",
                            },
                            __("Spotlight image", "gq-bioeconomia"),
                          ),
                      createElement(
                        "div",
                        {
                          className: "page-hero-slider-editor__spotlight-actions",
                        },
                        createElement(MediaUploadButton, {
                          imageId: selectedSlide.spotlightImageId,
                          onSelect: setSpotlightImage,
                          labelSelect: __("Select spotlight image", "gq-bioeconomia"),
                          labelReplace: __("Replace spotlight image", "gq-bioeconomia"),
                          hasImage: Boolean(selectedSlide.spotlightImageSrc),
                        }),
                      ),
                      createElement(
                        "div",
                        {
                          className: "page-hero-slider-editor__spotlight-copy",
                        },
                        createElement(RichText, {
                          tagName: "p",
                          value: selectedSlide.spotlightTitle || "",
                          placeholder: __("Spotlight title", "gq-bioeconomia"),
                          allowedFormats: [],
                          onChange: (next) =>
                            updateSlide(selectedIndex, {
                              spotlightTitle: next,
                            }),
                        }),
                        createElement(RichText, {
                          tagName: "p",
                          value: selectedSlide.spotlightBody || "",
                          placeholder: __("Spotlight body", "gq-bioeconomia"),
                          allowedFormats: ["core/bold", "core/italic"],
                          onChange: (next) =>
                            updateSlide(selectedIndex, {
                              spotlightBody: next,
                            }),
                        }),
                        createElement(UrlField, {
                          label: __("Spotlight URL", "gq-bioeconomia"),
                          value: selectedSlide.spotlightHref || "",
                          onChange: (next) =>
                            updateSlide(selectedIndex, {
                              spotlightHref: next,
                            }),
                        }),
                      ),
                    )
                  : null,
              ),
            )
          : createElement(
              "div",
              {
                className: "page-hero-slider-editor__empty",
              },
              createElement(
                "p",
                null,
                __("Add a slide to start editing the hero slider.", "gq-bioeconomia"),
              ),
              createElement(
                Button,
                {
                  variant: "primary",
                  onClick: addSlide,
                },
                __("Add slide", "gq-bioeconomia"),
              ),
            ),
      ),
    );
  }

  registerContractBlock("getquick/page-hero-slider", { edit: PageHeroSliderEdit });
})();
