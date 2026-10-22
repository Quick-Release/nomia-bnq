(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody, SelectControl, TextareaControl, TextControl, ToggleControl } =
    window.wp.components;
  const { createElement, Fragment, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { slugFromLabel } = window.gqBioeconomiaLib;
  const { MediaUploadButton, registerContractBlock, UrlField } = window.gqBioeconomiaEditor;

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
            label: __("Name", "gq-bioeconomia"),
            value: term.name || "",
            onChange: (next) =>
              updateTerm(index, {
                name: next,
                slug: term.slug || slugFromLabel(next),
              }),
          }),
          createElement(TextControl, {
            label: __("Slug", "gq-bioeconomia"),
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
            __("Remove", "gq-bioeconomia"),
          ),
        ),
      ),
      createElement(
        Button,
        {
          variant: "secondary",
          onClick: addTerm,
        },
        __("Add term", "gq-bioeconomia"),
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
            title: __("Filters", "gq-bioeconomia"),
            initialOpen: false,
          },
          createElement(TermListEditor, {
            title: __("Temáticas", "gq-bioeconomia"),
            terms: tematicas,
            onChange: (next) =>
              setAttributes({
                tematicas: next,
              }),
          }),
          createElement(TermListEditor, {
            title: __("Setores", "gq-bioeconomia"),
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
                title: __("Selected platform fields", "gq-bioeconomia"),
                initialOpen: true,
              },
              createElement(TextControl, {
                label: __("Slug", "gq-bioeconomia"),
                value: selectedItem.slug || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    slug: slugFromLabel(next),
                    id: selectedItem.id || slugFromLabel(next),
                  }),
              }),
              createElement(TextControl, {
                label: __("Date label", "gq-bioeconomia"),
                value: selectedItem.dateLabel || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    dateLabel: next,
                  }),
              }),
              createElement(TextControl, {
                label: __("Date", "gq-bioeconomia"),
                type: "date",
                value: selectedItem.date || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    date: next,
                  }),
              }),
              createElement(ToggleControl, {
                label: __("Featured", "gq-bioeconomia"),
                checked: selectedItem.featured === true,
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    featured: next,
                  }),
              }),
              createElement(UrlField, {
                label: __("Platform URL", "gq-bioeconomia"),
                value: selectedItem.href || "",
                onChange: (next) =>
                  updateItem(selectedIndex, {
                    href: next,
                  }),
              }),
              createElement(SelectControl, {
                multiple: true,
                label: __("Temáticas", "gq-bioeconomia"),
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
                label: __("Setores", "gq-bioeconomia"),
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
              placeholder: __("Heading", "gq-bioeconomia"),
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
              __("Add platform", "gq-bioeconomia"),
            ),
            createElement(
              "div",
              {
                className: "content-grid-filters-editor__filters",
              },
              createElement("span", null, __("Pesquisa", "gq-bioeconomia")),
              createElement("span", null, __("Temática: Todas", "gq-bioeconomia")),
              createElement("span", null, __("Sector: Todos", "gq-bioeconomia")),
              createElement("span", null, __("Ordenar por: Mais recente", "gq-bioeconomia")),
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
                          className: "gq-bioeconomia-selection-button",
                          "aria-label": sprintf(
                            /* translators: %d: the platform position in the list. */
                            __("Select platform %d", "gq-bioeconomia"),
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
                        onSelect: (media) => setPlatformImage(index, media),
                        labelSelect: __("Select image", "gq-bioeconomia"),
                        labelReplace: __("Replace image", "gq-bioeconomia"),
                        hasImage: Boolean(item.imageUrl),
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
                    item.featured
                      ? createElement(
                          "span",
                          {
                            className: "content-grid-filters-editor__featured",
                          },
                          __("Destaque", "gq-bioeconomia"),
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
                        placeholder: __("Platform title", "gq-bioeconomia"),
                        allowedFormats: [],
                        onChange: (next) =>
                          updateItem(index, {
                            title: next,
                            slug: item.slug || slugFromLabel(next),
                            id: item.id || slugFromLabel(next),
                          }),
                      }),
                      createElement(TextareaControl, {
                        label: __("Description", "gq-bioeconomia"),
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
                  __("Add a platform to start editing the grid.", "gq-bioeconomia"),
                ),
                createElement(
                  Button,
                  {
                    variant: "primary",
                    onClick: addItem,
                  },
                  __("Add platform", "gq-bioeconomia"),
                ),
              ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/content-grid-filters", { edit: ContentGridFiltersEdit });
})();
