(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody } = window.wp.components;
  const { createElement, Fragment, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { MediaUploadButton, registerContractBlock, UrlField } = window.gqBioeconomiaEditor;

  const DEFAULT_PODCAST_ITEM = {
    episodeNumber: "",
    dateLabel: "",
    title: "",
    imageId: undefined,
    imageSrc: "",
    imageAlt: "",
    listenHref: "",
    shareUrl: "",
  };
  function normalizePodcastItems(attributes) {
    const source = [attributes.items, attributes.episodes].find(Array.isArray) ?? [];
    return source.map((item) => ({
      ...DEFAULT_PODCAST_ITEM,
      episodeNumber: item?.episodeNumber ?? "",
      dateLabel: item?.dateLabel || "",
      title: item?.title || "",
      imageId: item?.imageId,
      imageSrc: item?.imageSrc || item?.imageUrl || "",
      imageAlt: item?.imageAlt || "",
      listenHref: item?.listenHref || item?.listenUrl || "",
      shareUrl: item?.shareUrl || "",
    }));
  }
  function PodcastListEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "content-list-editor",
    });
    const items = normalizePodcastItems(attributes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedItem = items[selectedIndex] || DEFAULT_PODCAST_ITEM;
    const hasItems = items.length > 0;
    function setItems(nextItems) {
      setAttributes({
        items: nextItems,
      });
    }
    function updateItem(index, patch) {
      setItems(
        items.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...patch,
              }
            : item,
        ),
      );
    }
    function addItem() {
      const nextItems = [
        ...items,
        {
          ...DEFAULT_PODCAST_ITEM,
          episodeNumber: items.length + 1,
        },
      ];
      setItems(nextItems);
      setSelectedIndex(nextItems.length - 1);
    }
    function removeItem(index) {
      const nextItems = items.filter((_, itemIndex) => itemIndex !== index);
      setItems(nextItems);
      setSelectedIndex(Math.max(0, Math.min(index, nextItems.length - 1)));
    }
    function setPodcastImage(index, media) {
      const nextUrl = media?.url || "";
      updateItem(index, {
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
        hasItems
          ? createElement(
              PanelBody,
              {
                title: __("Selected episode fields", "gq-bioeconomia"),
                initialOpen: true,
              },
              createElement(UrlField, {
                label: __("Listen URL", "gq-bioeconomia"),
                value: selectedItem.listenHref || selectedItem.listenUrl || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    listenHref: next,
                  }),
              }),
              createElement(UrlField, {
                label: __("Share URL", "gq-bioeconomia"),
                value: selectedItem.shareUrl || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    shareUrl: next,
                  }),
              }),
            )
          : null,
      ),
      createElement(
        "section",
        blockProps,
        hasItems
          ? createElement(
              "div",
              {
                className: "content-list-editor__inner",
              },
              createElement(
                "div",
                {
                  className: "content-list-editor__toolbar",
                },
                createElement(
                  Button,
                  {
                    variant: "secondary",
                    onClick: addItem,
                  },
                  __("Add episode", "gq-bioeconomia"),
                ),
              ),
              items.map((item, index) =>
                createElement(
                  "article",
                  {
                    className: `content-list-editor__item${selectedIndex === index ? " is-selected" : ""}`,
                    key: index,
                  },
                  createElement(
                    "div",
                    {
                      className: "content-list-editor__image",
                    },
                    item.imageUrl || item.imageSrc
                      ? createElement("img", {
                          src: item.imageUrl || item.imageSrc,
                          alt: item.imageAlt || "",
                        })
                      : createElement(
                          "div",
                          {
                            className: "content-list-editor__image-placeholder",
                          },
                          __("Select image", "gq-bioeconomia"),
                        ),
                    createElement(
                      "div",
                      {
                        className: "content-list-editor__image-actions",
                      },
                      createElement(
                        "button",
                        {
                          type: "button",
                          className: "gq-bioeconomia-selection-button",
                          "aria-label": sprintf(
                            /* translators: %d: the episode position in the list. */
                            __("Select episode %d", "gq-bioeconomia"),
                            index + 1,
                          ),
                          "aria-pressed": selectedIndex === index,
                          onClick: () => setSelectedIndex(index),
                        },
                        selectedIndex === index
                          ? __("Selected", "gq-bioeconomia")
                          : __("Select", "gq-bioeconomia"),
                      ),
                      createElement(MediaUploadButton, {
                        imageId: item.imageId,
                        onSelect: (media) => setPodcastImage(index, media),
                        labelSelect: __("Select episode image", "gq-bioeconomia"),
                        labelReplace: __("Replace episode image", "gq-bioeconomia"),
                        hasImage: Boolean(item.imageUrl || item.imageSrc),
                      }),
                      createElement(
                        Button,
                        {
                          isDestructive: true,
                          variant: "secondary",
                          onClick: () => removeItem(index),
                        },
                        __("Remove", "gq-bioeconomia"),
                      ),
                    ),
                  ),
                  createElement(
                    "div",
                    {
                      className: "content-list-editor__copy",
                    },
                    createElement(
                      "div",
                      {
                        className: "content-list-editor__meta",
                      },
                      createElement(
                        "span",
                        {
                          className: "content-list-editor__badge",
                        },
                        `${__("Episode", "gq-bioeconomia")} `,
                        createElement(RichText, {
                          tagName: "span",
                          value: String(item.episodeNumber ?? ""),
                          placeholder: "1",
                          allowedFormats: [],
                          onChange: (next) =>
                            updateItem(index, {
                              episodeNumber: next,
                            }),
                        }),
                      ),
                      createElement(RichText, {
                        tagName: "span",
                        value: item.dateLabel || "",
                        placeholder: __("Date label", "gq-bioeconomia"),
                        allowedFormats: [],
                        onChange: (next) =>
                          updateItem(index, {
                            dateLabel: next,
                          }),
                      }),
                    ),
                    createElement(RichText, {
                      tagName: "h2",
                      value: item.title || "",
                      placeholder: __("Episode title", "gq-bioeconomia"),
                      allowedFormats: [],
                      onChange: (next) =>
                        updateItem(index, {
                          title: next,
                        }),
                    }),
                    createElement(
                      "div",
                      {
                        className: "content-list-editor__actions",
                      },
                      createElement("span", null, __("Ouvir", "gq-bioeconomia")),
                      createElement("span", null, __("Partilhar", "gq-bioeconomia")),
                    ),
                  ),
                ),
              ),
            )
          : createElement(
              "div",
              {
                className: "content-list-editor__empty",
              },
              createElement(
                "p",
                null,
                __("Add an episode to start editing the podcast list.", "gq-bioeconomia"),
              ),
              createElement(
                Button,
                {
                  variant: "primary",
                  onClick: addItem,
                },
                __("Add episode", "gq-bioeconomia"),
              ),
            ),
      ),
    );
  }

  registerContractBlock("getquick/content-list", { edit: PodcastListEdit });
})();
