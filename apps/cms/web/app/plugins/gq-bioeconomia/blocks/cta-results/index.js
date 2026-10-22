(() => {
  const { InspectorControls, RichText, useBlockProps } = window.wp.blockEditor;
  const { Button, PanelBody, TextControl } = window.wp.components;
  const { createElement, Fragment, useRef, useState } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { registerContractBlock, UrlField } = window.gqBioeconomiaEditor;

  const DEFAULT_CTA_RESULT = {
    year: "",
    value: "",
    unit: "",
    description: "",
    href: "",
    nodeId: "",
  };
  function normalizeCtaResults(attributes) {
    const source = [attributes.results, attributes.items].find(Array.isArray) ?? [];
    return source.map((item) => ({
      ...DEFAULT_CTA_RESULT,
      year: item?.year || "",
      value: item?.value || "",
      unit: item?.unit || "",
      description: item?.description || "",
      href: item?.href || "",
      nodeId: item?.nodeId || "",
    }));
  }
  function CtaResultsEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "cta-results-editor",
    });
    const results = normalizeCtaResults(attributes);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectionButtons = useRef([]);
    const selectedResult = results[selectedIndex] || DEFAULT_CTA_RESULT;
    const hasResults = results.length > 0;
    function setResults(nextResults) {
      setAttributes({
        results: nextResults,
      });
    }
    function updateResult(index, patch) {
      setResults(
        results.map((result, resultIndex) =>
          resultIndex === index
            ? {
                ...result,
                ...patch,
              }
            : result,
        ),
      );
    }
    function addResult() {
      const nextResults = [
        ...results,
        {
          ...DEFAULT_CTA_RESULT,
          nodeId: `wp-barometro-result-${results.length + 1}`,
        },
      ];
      setResults(nextResults);
      setSelectedIndex(nextResults.length - 1);
    }
    function removeResult(index) {
      const nextResults = results.filter((_, resultIndex) => resultIndex !== index);
      setResults(nextResults);
      setSelectedIndex(Math.max(0, Math.min(index, nextResults.length - 1)));
    }
    function moveSelectionFocus(event, index) {
      let direction = 0;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        direction = 1;
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        direction = -1;
      }
      if (direction === 0 || results.length < 2) {
        return;
      }
      event.preventDefault();
      const nextIndex = (index + direction + results.length) % results.length;
      selectionButtons.current[nextIndex]?.focus();
    }
    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        hasResults
          ? createElement(
              PanelBody,
              {
                title: __("Selected result settings", "gq-bioeconomia"),
                initialOpen: true,
              },
              createElement(UrlField, {
                label: __("Result URL", "gq-bioeconomia"),
                value: selectedResult.href || "",
                onChange: (next) =>
                  updateResult(selectedIndex, {
                    href: next,
                  }),
              }),
              createElement(TextControl, {
                label: __("Node/content ID", "gq-bioeconomia"),
                value: selectedResult.nodeId || "",
                onChange: (next) =>
                  updateResult(selectedIndex, {
                    nodeId: next,
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
            className: "cta-results-editor__outer",
          },
          createElement(
            "div",
            {
              className: "cta-results-editor__panel",
            },
            createElement(
              "div",
              {
                className: "cta-results-editor__intro",
              },
              createElement(
                "div",
                {
                  className: "cta-results-editor__eyebrow",
                },
                createElement(
                  "span",
                  {
                    "aria-hidden": true,
                  },
                  "+",
                ),
                createElement("p", null, __("ECONOMIA", "gq-bioeconomia")),
              ),
              createElement(
                "div",
                {
                  className: "cta-results-editor__heading",
                },
                createElement("h2", null, __("Barómetro", "gq-bioeconomia")),
                createElement(
                  "p",
                  null,
                  __(
                    "Promovendo a coordenação, o desenvolvimento e a divulgação da atividade estatística nacional.",
                    "gq-bioeconomia",
                  ),
                ),
              ),
            ),
            hasResults
              ? createElement(
                  "div",
                  {
                    className: "cta-results-editor__results",
                  },
                  createElement(
                    "div",
                    {
                      className: "cta-results-editor__toolbar",
                    },
                    createElement(
                      Button,
                      {
                        variant: "secondary",
                        onClick: addResult,
                      },
                      __("Add result", "gq-bioeconomia"),
                    ),
                  ),
                  results.map((result, index) =>
                    createElement(
                      "article",
                      {
                        className: `cta-results-editor__card${selectedIndex === index ? " is-selected" : ""}`,
                        key: index,
                      },
                      createElement(
                        "div",
                        {
                          className: "cta-results-editor__card-actions",
                        },
                        createElement(
                          "button",
                          {
                            type: "button",
                            className: "gq-bioeconomia-selection-button",
                            ref: (element) => {
                              selectionButtons.current[index] = element;
                            },
                            "aria-keyshortcuts": "ArrowDown ArrowUp ArrowLeft ArrowRight",
                            "aria-label": sprintf(
                              /* translators: %d: the result position in the list. */
                              __("Select result %d", "gq-bioeconomia"),
                              index + 1,
                            ),
                            "aria-pressed": selectedIndex === index,
                            onClick: () => setSelectedIndex(index),
                            onKeyDown: (event) => moveSelectionFocus(event, index),
                          },
                          selectedIndex === index
                            ? __("Selected", "gq-bioeconomia")
                            : __("Select", "gq-bioeconomia"),
                        ),
                        createElement(
                          Button,
                          {
                            isDestructive: true,
                            variant: "secondary",
                            onClick: () => removeResult(index),
                          },
                          __("Remove", "gq-bioeconomia"),
                        ),
                      ),
                      createElement(
                        "div",
                        {
                          className: "cta-results-editor__year",
                        },
                        createElement(
                          "span",
                          {
                            "aria-hidden": true,
                          },
                          "+",
                        ),
                        createElement(RichText, {
                          tagName: "span",
                          value: result.year || "",
                          placeholder: __("Year", "gq-bioeconomia"),
                          allowedFormats: [],
                          onChange: (next) =>
                            updateResult(index, {
                              year: next,
                            }),
                        }),
                      ),
                      createElement(
                        "div",
                        {
                          className: "cta-results-editor__metric",
                        },
                        createElement(RichText, {
                          tagName: "span",
                          value: result.value || "",
                          placeholder: __("Value", "gq-bioeconomia"),
                          allowedFormats: [],
                          onChange: (next) =>
                            updateResult(index, {
                              value: next,
                            }),
                        }),
                        createElement(RichText, {
                          tagName: "span",
                          value: result.unit || "",
                          placeholder: __("Unit", "gq-bioeconomia"),
                          allowedFormats: [],
                          onChange: (next) =>
                            updateResult(index, {
                              unit: next,
                            }),
                        }),
                      ),
                      createElement(RichText, {
                        tagName: "p",
                        value: result.description || "",
                        placeholder: __("Description", "gq-bioeconomia"),
                        allowedFormats: ["core/bold", "core/italic"],
                        onChange: (next) =>
                          updateResult(index, {
                            description: next,
                          }),
                      }),
                    ),
                  ),
                )
              : createElement(
                  "div",
                  {
                    className: "cta-results-editor__empty",
                  },
                  createElement(
                    "p",
                    null,
                    __("Add a result to start editing the CTA results section.", "gq-bioeconomia"),
                  ),
                  createElement(
                    Button,
                    {
                      variant: "primary",
                      onClick: addResult,
                    },
                    __("Add result", "gq-bioeconomia"),
                  ),
                ),
          ),
        ),
      ),
    );
  }

  registerContractBlock("getquick/cta-results", { edit: CtaResultsEdit });
})();
