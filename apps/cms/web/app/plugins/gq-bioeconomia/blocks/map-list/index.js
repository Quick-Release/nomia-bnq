(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody, SelectControl } = window.wp.components;
  const { createElement, Fragment, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { slugFromLabel } = window.gqBioeconomiaLib;
  const { ImageAltControl, MediaUploadButton, registerContractBlock, UrlField } =
    window.gqBioeconomiaEditor;

  const MAP_REGION_OPTIONS = [
    {
      label: "Norte",
      value: "norte",
    },
    {
      label: "Centro",
      value: "centro",
    },
    {
      label: "Lisboa",
      value: "lisboa",
    },
    {
      label: "Alentejo",
      value: "alentejo",
    },
    {
      label: "Algarve",
      value: "algarve",
    },
    {
      label: "Açores",
      value: "acores",
    },
    {
      label: "Madeira",
      value: "madeira",
    },
  ];
  const MAP_AUDIENCE_OPTIONS = [
    {
      label: "Empresas",
      value: "empresas",
    },
    {
      label: "Cidadãos",
      value: "cidadaos",
    },
    {
      label: "Investigação",
      value: "investigacao",
    },
  ];
  const DEFAULT_MAP_LIST_ITEM = {
    id: "",
    title: "",
    excerpt: "",
    dateLabel: "",
    imageId: undefined,
    imageSrc: "",
    imageAlt: "",
    href: "",
    regionId: "alentejo",
    audienceIds: [],
  };
  function defaultMapRegions() {
    return MAP_REGION_OPTIONS.map((option) => ({
      id: option.value,
      label: option.label,
    }));
  }
  function defaultMapAudiences() {
    return MAP_AUDIENCE_OPTIONS.map((option) => ({
      id: option.value,
      label: option.label,
    }));
  }
  function normalizeMapTerms(value, defaults) {
    return Array.isArray(value) && value.length > 0
      ? value.map((term) => ({
          id: term?.id || "",
          label: term?.label || "",
        }))
      : defaults();
  }
  function normalizeMapItems(attributes) {
    return Array.isArray(attributes.items)
      ? attributes.items.map((item) => ({
          ...DEFAULT_MAP_LIST_ITEM,
          id: item?.id || "",
          title: item?.title || "",
          excerpt: item?.excerpt || "",
          dateLabel: item?.dateLabel || "",
          imageId: item?.imageId,
          imageSrc: item?.imageSrc || item?.imageUrl || "",
          imageAlt: item?.imageAlt || "",
          href: item?.href || item?.url || "",
          regionId: item?.regionId || "alentejo",
          audienceIds: Array.isArray(item?.audienceIds) ? item.audienceIds : [],
        }))
      : [];
  }
  function MapListEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "map-list-editor",
    });
    const regions = normalizeMapTerms(attributes.regions, defaultMapRegions);
    const audiences = normalizeMapTerms(attributes.audiences, defaultMapAudiences);
    const items = normalizeMapItems(attributes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedItem = items[selectedIndex] || DEFAULT_MAP_LIST_ITEM;
    const hasItems = items.length > 0;
    function updateRegionLabel(id, label) {
      setAttributes({
        regions: regions.map((region) =>
          region.id === id
            ? {
                ...region,
                label,
              }
            : region,
        ),
      });
    }
    function updateAudienceLabel(id, label) {
      setAttributes({
        audiences: audiences.map((audience) =>
          audience.id === id
            ? {
                ...audience,
                label,
              }
            : audience,
        ),
      });
    }
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
          ...DEFAULT_MAP_LIST_ITEM,
          id: `map-item-${items.length + 1}`,
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
    function setMapItemImage(index, media) {
      const nextUrl = media?.url || "";
      const item = items[index] || DEFAULT_MAP_LIST_ITEM;
      updateItem(index, {
        imageId: media?.id,
        imageSrc: nextUrl,
        imageAlt: media?.alt ?? item.imageAlt ?? "",
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
                title: __("Selected item fields", "gq-bioeconomia"),
                initialOpen: true,
              },
              createElement(ImageAltControl, {
                value: selectedItem.imageAlt || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    imageAlt: next,
                  }),
              }),
              createElement(UrlField, {
                label: __("Item URL", "gq-bioeconomia"),
                value: selectedItem.href || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    href: next,
                  }),
              }),
              createElement(SelectControl, {
                label: __("Region", "gq-bioeconomia"),
                value: selectedItem.regionId || "alentejo",
                options: MAP_REGION_OPTIONS,
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    regionId: next,
                  }),
              }),
              createElement(SelectControl, {
                multiple: true,
                label: __("Audiences", "gq-bioeconomia"),
                value: Array.isArray(selectedItem.audienceIds) ? selectedItem.audienceIds : [],
                options: MAP_AUDIENCE_OPTIONS,
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    audienceIds: Array.isArray(next) ? next : [next],
                  }),
              }),
            )
          : null,
      ),
      createElement(
        "section",
        blockProps,
        createElement(
          "div",
          {
            className: "map-list-editor__inner",
          },
          createElement(
            "div",
            {
              className: "map-list-editor__map",
            },
            __("Portugal regions map preview", "gq-bioeconomia"),
          ),
          createElement(
            "div",
            {
              className: "map-list-editor__panel",
            },
            createElement(
              "div",
              {
                className: "map-list-editor__filters",
              },
              createElement("h2", null, __("Filtros", "gq-bioeconomia")),
              createElement(
                "div",
                null,
                createElement(RichText, {
                  tagName: "span",
                  value: regions[0]?.label || __("Região", "gq-bioeconomia"),
                  placeholder: __("Region label", "gq-bioeconomia"),
                  allowedFormats: [],
                  onChange: (next) => updateRegionLabel(regions[0]?.id || "norte", next),
                }),
                audiences.map((audience) =>
                  createElement(RichText, {
                    key: audience.id,
                    tagName: "span",
                    value: audience.label || "",
                    placeholder: __("Audience label", "gq-bioeconomia"),
                    allowedFormats: [],
                    onChange: (next) => updateAudienceLabel(audience.id, next),
                  }),
                ),
              ),
              createElement(
                Button,
                {
                  variant: "secondary",
                  onClick: addItem,
                },
                __("Add item", "gq-bioeconomia"),
              ),
            ),
            hasItems
              ? createElement(
                  "div",
                  {
                    className: "map-list-editor__items",
                  },
                  items.map((item, index) =>
                    createElement(
                      "article",
                      {
                        className: `map-list-editor__list-row${selectedIndex === index ? " is-selected" : ""}`,
                        key: index,
                      },
                      createElement(
                        "div",
                        {
                          className: "map-list-editor__image",
                        },
                        item.imageSrc || item.imageUrl
                          ? createElement("img", {
                              src: item.imageSrc || item.imageUrl,
                              alt: item.imageAlt || "",
                            })
                          : createElement(
                              "div",
                              {
                                className: "map-list-editor__image-placeholder",
                              },
                              __("Select image", "gq-bioeconomia"),
                            ),
                        createElement(
                          "div",
                          {
                            className: "map-list-editor__image-actions",
                          },
                          createElement(
                            "button",
                            {
                              type: "button",
                              className: "gq-bioeconomia-selection-button",
                              "aria-label": sprintf(
                                /* translators: %d: the item position in the list. */
                                __("Select item %d", "gq-bioeconomia"),
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
                            onSelect: (media) => setMapItemImage(index, media),
                            labelSelect: __("Select image", "gq-bioeconomia"),
                            labelReplace: __("Replace image", "gq-bioeconomia"),
                            hasImage: Boolean(item.imageSrc || item.imageUrl),
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
                          className: "map-list-editor__copy",
                        },
                        createElement(RichText, {
                          tagName: "h3",
                          value: item.title || "",
                          placeholder: __("Item title", "gq-bioeconomia"),
                          allowedFormats: [],
                          onChange: (next) =>
                            updateItem(index, {
                              title: next,
                              id: item.id || slugFromLabel(next),
                            }),
                        }),
                        createElement(RichText, {
                          tagName: "p",
                          value: item.excerpt || "",
                          placeholder: __("Excerpt", "gq-bioeconomia"),
                          allowedFormats: ["core/bold", "core/italic"],
                          onChange: (next) =>
                            updateItem(index, {
                              excerpt: next,
                            }),
                        }),
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
                    ),
                  ),
                )
              : createElement(
                  "div",
                  {
                    className: "map-list-editor__empty",
                  },
                  createElement(
                    "p",
                    null,
                    __("Add an item to start editing the map list.", "gq-bioeconomia"),
                  ),
                  createElement(
                    Button,
                    {
                      variant: "primary",
                      onClick: addItem,
                    },
                    __("Add item", "gq-bioeconomia"),
                  ),
                ),
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/map-list", { edit: MapListEdit });
})();
