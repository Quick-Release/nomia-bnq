(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody, SelectControl, TextareaControl, TextControl, ToggleControl } =
    window.wp.components;
  const { createElement, Fragment, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { slugFromLabel } = window.getquickNomiaBlocksLib;
  const { MediaUploadButton, registerContractBlock, UrlField } = window.getquickNomiaBlocksEditor;

  const DEFAULT_FILTER_TERM = {
    slug: "",
    name: "",
  };
  const DEFAULT_PLATAFORMA_ITEM = {
    id: "",
    title: "",
    slug: "",
    href: "",
    date: "",
    dateLabel: "",
    description: "",
    subtitle: "",
    featured: false,
    imageId: undefined,
    imageUrl: "",
    imageAlt: "",
    tematicas: [],
    setores: [],
  };
  function normalizeFilterTerms(value) {
    return Array.isArray(value)
      ? value
          .map((term) => ({
            ...DEFAULT_FILTER_TERM,
            ...term,
          }))
          .filter((term) => term.name || term.slug)
          .map((term) => ({
            slug: term.slug || slugFromLabel(term.name),
            name: term.name || term.slug,
          }))
      : [];
  }
  function normalizePlataformaItems(attributes) {
    const source = [attributes.items, attributes.plataformas].find(Array.isArray) ?? [];
    return source.map((item) => ({
      ...DEFAULT_PLATAFORMA_ITEM,
      id: item?.id || "",
      title: item?.title || "",
      slug: item?.slug || "",
      href: item?.href || "",
      date: item?.date || "",
      dateLabel: item?.dateLabel || "",
      description: item?.description || "",
      subtitle: item?.subtitle || "",
      featured: item?.featured === true || item?.featured === "true",
      imageId: item?.imageId,
      imageUrl: item?.imageUrl || "",
      imageAlt: item?.imageAlt || "",
      tematicas: normalizeFilterTerms(item?.tematicas),
      setores: normalizeFilterTerms(item?.setores),
    }));
  }
  function TermListEditor({ title, terms, onChange }) {
    function updateTerm(index, patch) {
      onChange(
        terms.map((term, termIndex) =>
          termIndex === index
            ? {
                ...term,
                ...patch,
              }
            : term,
        ),
      );
    }
    function addTerm() {
      onChange([
        ...terms,
        {
          ...DEFAULT_FILTER_TERM,
        },
      ]);
    }
    function removeTerm(index) {
      onChange(terms.filter((_, termIndex) => termIndex !== index));
    }
    return createElement(
      "div",
      {
        className: "content-grid-filters-editor__terms",
      },
      createElement("strong", null, title),
      terms.map((term, index) =>
        createElement(
          "div",
          {
            className: "content-grid-filters-editor__term-row",
            key: index,
          },
          createElement(TextControl, {
            label: __("Name", "getquick-nomia-blocks"),
            value: term.name || "",
            onChange: (next) =>
              updateTerm(index, {
                name: next,
                slug: term.slug || slugFromLabel(next),
              }),
          }),
          createElement(TextControl, {
            label: __("Slug", "getquick-nomia-blocks"),
            value: term.slug || "",
            onChange: (next) =>
              updateTerm(index, {
                slug: slugFromLabel(next),
              }),
          }),
          createElement(
            Button,
            {
              isDestructive: true,
              variant: "tertiary",
              onClick: () => removeTerm(index),
            },
            __("Remove", "getquick-nomia-blocks"),
          ),
        ),
      ),
      createElement(
        Button,
        {
          variant: "secondary",
          onClick: addTerm,
        },
        __("Add term", "getquick-nomia-blocks"),
      ),
    );
  }
  function termOptions(terms) {
    return normalizeFilterTerms(terms).map((term) => ({
      label: term.name,
      value: term.slug,
    }));
  }
  function selectedTermsForItem(itemTerms, allTerms) {
    const selected = normalizeFilterTerms(itemTerms);
    return selected
      .map((term) => term.slug)
      .filter(Boolean)
      .filter((slug) => allTerms.some((term) => term.slug === slug));
  }
  function termsFromSelectedSlugs(slugs, allTerms) {
    return slugs.map((slug) => allTerms.find((term) => term.slug === slug)).filter(Boolean);
  }
  function ContentGridFiltersEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "content-grid-filters-editor",
    });
    const items = normalizePlataformaItems(attributes);
    const tematicas = normalizeFilterTerms(attributes.tematicas);
    const setores = normalizeFilterTerms(attributes.setores);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedItem = items[selectedIndex] || DEFAULT_PLATAFORMA_ITEM;
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
          ...DEFAULT_PLATAFORMA_ITEM,
          id: `platform-${items.length + 1}`,
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
    function setPlatformImage(index, media) {
      updateItem(index, {
        imageId: media?.id,
        imageUrl: media?.url || "",
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
            title: __("Filters", "getquick-nomia-blocks"),
            initialOpen: false,
          },
          createElement(TermListEditor, {
            title: __("Temáticas", "getquick-nomia-blocks"),
            terms: tematicas,
            onChange: (next) =>
              setAttributes({
                tematicas: next,
              }),
          }),
          createElement(TermListEditor, {
            title: __("Setores", "getquick-nomia-blocks"),
            terms: setores,
            onChange: (next) =>
              setAttributes({
                setores: next,
              }),
          }),
        ),
        hasItems
          ? createElement(
              PanelBody,
              {
                title: __("Selected platform fields", "getquick-nomia-blocks"),
                initialOpen: true,
              },
              createElement(TextControl, {
                label: __("Slug", "getquick-nomia-blocks"),
                value: selectedItem.slug || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    slug: slugFromLabel(next),
                    id: selectedItem.id || slugFromLabel(next),
                  }),
              }),
              createElement(TextControl, {
                label: __("Date label", "getquick-nomia-blocks"),
                value: selectedItem.dateLabel || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    dateLabel: next,
                  }),
              }),
              createElement(TextControl, {
                label: __("Date", "getquick-nomia-blocks"),
                type: "date",
                value: selectedItem.date || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    date: next,
                  }),
              }),
              createElement(ToggleControl, {
                label: __("Featured", "getquick-nomia-blocks"),
                checked: selectedItem.featured === true,
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    featured: next,
                  }),
              }),
              createElement(UrlField, {
                label: __("Platform URL", "getquick-nomia-blocks"),
                value: selectedItem.href || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    href: next,
                  }),
              }),
              createElement(SelectControl, {
                multiple: true,
                label: __("Temáticas", "getquick-nomia-blocks"),
                value: selectedTermsForItem(selectedItem.tematicas, tematicas),
                options: termOptions(tematicas),
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    tematicas: termsFromSelectedSlugs(
                      Array.isArray(next) ? next : [next],
                      tematicas,
                    ),
                  }),
              }),
              createElement(SelectControl, {
                multiple: true,
                label: __("Setores", "getquick-nomia-blocks"),
                value: selectedTermsForItem(selectedItem.setores, setores),
                options: termOptions(setores),
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    setores: termsFromSelectedSlugs(Array.isArray(next) ? next : [next], setores),
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
            className: "content-grid-filters-editor__inner",
          },
          createElement(
            "div",
            {
              className: "content-grid-filters-editor__header",
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
            createElement(
              Button,
              {
                variant: "secondary",
                onClick: addItem,
              },
              __("Add platform", "getquick-nomia-blocks"),
            ),
            createElement(
              "div",
              {
                className: "content-grid-filters-editor__filters",
              },
              createElement("span", null, __("Pesquisa", "getquick-nomia-blocks")),
              createElement("span", null, __("Temática: Todas", "getquick-nomia-blocks")),
              createElement("span", null, __("Sector: Todos", "getquick-nomia-blocks")),
              createElement("span", null, __("Ordenar por: Mais recente", "getquick-nomia-blocks")),
            ),
          ),
          hasItems
            ? createElement(
                "div",
                {
                  className: "content-grid-filters-editor__grid",
                },
                items.map((item, index) =>
                  createElement(
                    "article",
                    {
                      className: `content-grid-filters-editor__card${selectedIndex === index ? " is-selected" : ""}`,
                      key: index,
                    },
                    item.imageUrl
                      ? createElement("img", {
                          src: item.imageUrl,
                          alt: item.imageAlt || "",
                        })
                      : null,
                    createElement("div", {
                      className: "content-grid-filters-editor__card-overlay",
                    }),
                    createElement(
                      "div",
                      {
                        className: "content-grid-filters-editor__card-actions",
                      },
                      createElement(
                        "button",
                        {
                          type: "button",
                          className: "getquick-nomia-blocks-selection-button",
                          "aria-label": sprintf(
                            /* translators: %d: the platform position in the list. */
                            __("Select platform %d", "getquick-nomia-blocks"),
                            index + 1,
                          ),
                          "aria-pressed": selectedIndex === index,
                          onClick: () => setSelectedIndex(index),
                        },
                        selectedIndex === index
                          ? __("Selected", "getquick-nomia-blocks")
                          : __("Select", "getquick-nomia-blocks"),
                      ),
                      createElement(MediaUploadButton, {
                        imageId: item.imageId,
                        onSelect: (media) => setPlatformImage(index, media),
                        labelSelect: __("Select image", "getquick-nomia-blocks"),
                        labelReplace: __("Replace image", "getquick-nomia-blocks"),
                        hasImage: Boolean(item.imageUrl),
                      }),
                      createElement(
                        Button,
                        {
                          isDestructive: true,
                          variant: "secondary",
                          onClick: () => removeItem(index),
                        },
                        __("Remove", "getquick-nomia-blocks"),
                      ),
                    ),
                    item.featured
                      ? createElement(
                          "span",
                          {
                            className: "content-grid-filters-editor__featured",
                          },
                          __("Destaque", "getquick-nomia-blocks"),
                        )
                      : null,
                    createElement(
                      "div",
                      {
                        className: "content-grid-filters-editor__card-copy",
                      },
                      createElement(RichText, {
                        tagName: "p",
                        value: item.title || "",
                        placeholder: __("Platform title", "getquick-nomia-blocks"),
                        allowedFormats: [],
                        onChange: (next) =>
                          updateItem(index, {
                            title: next,
                            slug: item.slug || slugFromLabel(next),
                            id: item.id || slugFromLabel(next),
                          }),
                      }),
                      createElement(TextareaControl, {
                        label: __("Description", "getquick-nomia-blocks"),
                        value: item.description || "",
                        rows: 3,
                        onChange: (next) =>
                          updateItem(index, {
                            description: next,
                          }),
                      }),
                    ),
                  ),
                ),
              )
            : createElement(
                "div",
                {
                  className: "content-grid-filters-editor__empty",
                },
                createElement(
                  "p",
                  null,
                  __("Add a platform to start editing the grid.", "getquick-nomia-blocks"),
                ),
                createElement(
                  Button,
                  {
                    variant: "primary",
                    onClick: addItem,
                  },
                  __("Add platform", "getquick-nomia-blocks"),
                ),
              ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/content-grid-filters", { edit: ContentGridFiltersEdit });
})();
