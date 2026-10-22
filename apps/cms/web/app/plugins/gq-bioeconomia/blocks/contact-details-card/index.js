(() => {
  const {
    BlockControls,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    useBlockProps,
    Warning,
  } = window.wp.blockEditor;
  const { Button, PanelBody, Popover, ToggleControl, ToolbarButton, ToolbarGroup } =
    window.wp.components;
  const { createElement, Fragment, useEffect, useState } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { contactDetailsLines, safeHref } = window.gqBioeconomiaFrontendRules;
  const { ImageAltControl, MediaUploadButton, registerContractBlock, UrlField } =
    window.gqBioeconomiaEditor;

  // The `link` glyph from `@wordpress/icons`, which WordPress does not expose as a
  // script global; inlined so the toolbar matches core's Button block without
  // bundling the icon package.
  const linkIcon = createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
    },
    createElement("path", {
      d: "M9.5 12L14.5 12M10 7.75H8.25C5.90279 7.75 4 9.65279 4 12C4 14.3472 5.90279 16.25 8.25 16.25H10M14 16.25H15.75C18.0972 16.25 20 14.3472 20 12C20 9.65279 18.0972 7.75 15.75 7.75L14 7.75",
      vectorEffect: "non-scaling-stroke",
    }),
  );

  // The title and details take bold and italic, which the Astro renderer turns
  // back into `<strong>`/`<em>`; the button text stays plain. No field gets link
  // tooling, and only the details, whose lines are the point, take a `<br>`.
  const PLAIN_TEXT_PROPS = {
    allowedFormats: [],
    withoutInteractiveFormatting: true,
  };
  const FORMATTED_TEXT_PROPS = {
    allowedFormats: ["core/bold", "core/italic"],
    withoutInteractiveFormatting: true,
  };
  function ArrowLargeRightIcon() {
    return createElement(
      "svg",
      {
        viewBox: "0 0 32 32",
        width: 32,
        height: 32,
        fill: "none",
        "aria-hidden": true,
        focusable: false,
      },
      createElement("path", {
        d: "M3.74348 16.2565L28.2565 16.2565M16.4903 4.49025L28.2565 16.2565L16.4903 28.0228",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      }),
    );
  }
  function ContactDetailsCardEdit({ attributes, setAttributes, isSelected }) {
    const blockProps = useBlockProps({
      className: "getquick-contact-details-card-editor",
    });
    // The link popover opens from the toolbar or from the link chip under the
    // button; the element that opened it is its anchor, and null means closed.
    const [linkAnchor, setLinkAnchor] = useState(null);
    // Close the popover with the selection, as core's Button block does, so it
    // does not reopen on the next selection against a stale anchor.
    useEffect(() => {
      if (!isSelected) {
        setLinkAnchor(null);
      }
    }, [isSelected]);
    const iconUrl = attributes.iconUrl || "";
    const iconAlt = attributes.iconAlt || "";
    const buttonHref = attributes.buttonHref || "";
    const hideIcon = attributes.hideIcon === true;
    const hideButton = attributes.hideButton === true;
    // Mirrors ContactDetailsCardBlock.astro: the button needs a label and a
    // followable link, and the card needs at least one visible part.
    const hasButtonLabel = contactDetailsLines(attributes.buttonLabel).length > 0;
    const hasSafeButtonHref = Boolean(safeHref(buttonHref));
    const isUnsafeButtonHref = Boolean(buttonHref.trim()) && !hasSafeButtonHref;
    const rendersButton = !hideButton && hasButtonLabel && hasSafeButtonHref;
    const isButtonIncomplete =
      !hideButton && !rendersButton && (hasButtonLabel || Boolean(buttonHref.trim()));
    const rendersCard =
      contactDetailsLines(attributes.title).length > 0 ||
      contactDetailsLines(attributes.details).length > 0 ||
      rendersButton;
    const buttonWarning = isUnsafeButtonHref
      ? __(
          "Este link não é aceite e o botão não aparece no site. Use uma página, https://…, mailto: ou tel:.",
          "gq-bioeconomia",
        )
      : __("O botão só aparece no site com texto e link.", "gq-bioeconomia");
    function toggleLinkEditor(anchor) {
      setLinkAnchor((current) => (current === anchor ? null : anchor));
    }
    function setIcon(media) {
      setAttributes({
        iconId: media?.id,
        iconUrl: media?.url || "",
        iconAlt: media?.alt ?? "",
      });
    }
    function removeIcon() {
      setAttributes({
        iconId: undefined,
        iconUrl: "",
        iconAlt: "",
      });
    }
    const linkField = createElement(
      Fragment,
      null,
      createElement(UrlField, {
        label: __("Link do botão", "gq-bioeconomia"),
        value: buttonHref,
        onChange: (next) =>
          setAttributes({
            buttonHref: next,
          }),
      }),
      createElement(
        "p",
        {
          className: "getquick-contact-details-card-editor__hint",
        },
        __(
          "Página, https://…, mailto:email@exemplo.pt ou tel:+351…. Sem link, o botão não aparece no site.",
          "gq-bioeconomia",
        ),
      ),
    );
    return createElement(
      Fragment,
      null,
      hideButton
        ? null
        : createElement(
            BlockControls,
            null,
            createElement(
              ToolbarGroup,
              null,
              createElement(ToolbarButton, {
                icon: linkIcon,
                label: __("Editar link do botão", "gq-bioeconomia"),
                showTooltip: true,
                isPressed: Boolean(linkAnchor || buttonHref),
                "aria-expanded": Boolean(linkAnchor),
                onClick: (event) => toggleLinkEditor(event.currentTarget),
              }),
            ),
          ),
      !hideButton && isSelected && linkAnchor
        ? createElement(
            Popover,
            {
              anchor: linkAnchor,
              placement: "bottom-start",
              onClose: () => setLinkAnchor(null),
              className: "getquick-contact-details-card-editor__link-popover",
            },
            linkField,
          )
        : null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Ícone", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: __("Mostrar ícone", "gq-bioeconomia"),
            checked: !hideIcon,
            onChange: (show) =>
              setAttributes({
                hideIcon: !show,
              }),
          }),
          hideIcon
            ? null
            : createElement(
                Fragment,
                null,
                createElement(
                  "div",
                  {
                    className: "getquick-contact-details-card-editor__icon-actions",
                  },
                  createElement(MediaUploadButton, {
                    imageId: attributes.iconId,
                    onSelect: setIcon,
                    labelSelect: __("Carregar ícone", "gq-bioeconomia"),
                    labelReplace: __("Substituir ícone", "gq-bioeconomia"),
                    hasImage: Boolean(iconUrl),
                  }),
                  iconUrl
                    ? createElement(
                        Button,
                        {
                          __next40pxDefaultSize: true,
                          variant: "tertiary",
                          isDestructive: true,
                          onClick: removeIcon,
                        },
                        __("Remover ícone", "gq-bioeconomia"),
                      )
                    : null,
                ),
                iconUrl
                  ? createElement(ImageAltControl, {
                      value: iconAlt,
                      onChange: (next) =>
                        setAttributes({
                          iconAlt: next,
                        }),
                    })
                  : null,
              ),
        ),
        createElement(
          PanelBody,
          {
            title: __("Botão", "gq-bioeconomia"),
            initialOpen: true,
          },
          createElement(ToggleControl, {
            __nextHasNoMarginBottom: true,
            label: __("Mostrar botão", "gq-bioeconomia"),
            checked: !hideButton,
            onChange: (show) => {
              setAttributes({
                hideButton: !show,
              });
              if (!show) {
                setLinkAnchor(null);
              }
            },
          }),
          hideButton ? null : createElement(Fragment, null, linkField),
        ),
      ),
      createElement(
        "div",
        blockProps,
        rendersCard
          ? null
          : createElement(
              Warning,
              {
                className: "getquick-contact-details-card-editor__warning",
              },
              __(
                "Este bloco não aparece no site enquanto o título, os detalhes e o botão estiverem vazios.",
                "gq-bioeconomia",
              ),
            ),
        isButtonIncomplete
          ? createElement(
              Warning,
              {
                className: "getquick-contact-details-card-editor__warning",
              },
              buttonWarning,
            )
          : null,
        hideIcon
          ? null
          : createElement(
              MediaUploadCheck,
              {
                fallback: iconUrl
                  ? createElement(
                      "span",
                      {
                        className: "getquick-contact-details-card-editor__icon",
                      },
                      createElement("img", {
                        src: iconUrl,
                        alt: iconAlt,
                      }),
                    )
                  : null,
              },
              createElement(MediaUpload, {
                allowedTypes: ["image"],
                value: attributes.iconId,
                onSelect: setIcon,
                render: ({ open }) =>
                  createElement(
                    "button",
                    {
                      type: "button",
                      className: "getquick-contact-details-card-editor__icon",
                      "data-empty": iconUrl ? undefined : "true",
                      "aria-label": iconUrl
                        ? __("Substituir ícone", "gq-bioeconomia")
                        : __("Carregar ícone", "gq-bioeconomia"),
                      onClick: open,
                    },
                    iconUrl
                      ? createElement("img", {
                          src: iconUrl,
                          alt: "",
                        })
                      : createElement(
                          "span",
                          {
                            "aria-hidden": true,
                          },
                          "+",
                        ),
                  ),
              }),
            ),
        createElement(
          "div",
          {
            className: "getquick-contact-details-card-editor__copy",
          },
          createElement(RichText, {
            ...FORMATTED_TEXT_PROPS,
            disableLineBreaks: true,
            tagName: "p",
            identifier: "title",
            "aria-label": __("Título", "gq-bioeconomia"),
            className: "getquick-contact-details-card-editor__title",
            value: attributes.title || "",
            placeholder: __("Título", "gq-bioeconomia"),
            onChange: (next) =>
              setAttributes({
                title: next,
              }),
          }),
          createElement(RichText, {
            ...FORMATTED_TEXT_PROPS,
            tagName: "p",
            identifier: "details",
            "aria-label": __("Detalhes", "gq-bioeconomia"),
            className: "getquick-contact-details-card-editor__details",
            value: attributes.details || "",
            placeholder: __("Detalhes (Enter para nova linha)", "gq-bioeconomia"),
            onChange: (next) =>
              setAttributes({
                details: next,
              }),
          }),
        ),
        hideButton
          ? null
          : createElement(
              "div",
              {
                className: "getquick-contact-details-card-editor__button-group",
              },
              createElement(
                "div",
                {
                  className: "getquick-contact-details-card-editor__button",
                  "data-missing-link": isButtonIncomplete ? "true" : undefined,
                },
                createElement(RichText, {
                  ...PLAIN_TEXT_PROPS,
                  disableLineBreaks: true,
                  tagName: "span",
                  identifier: "buttonLabel",
                  "aria-label": __("Texto do botão", "gq-bioeconomia"),
                  value: attributes.buttonLabel || "",
                  placeholder: __("Texto do botão", "gq-bioeconomia"),
                  onChange: (next) =>
                    setAttributes({
                      buttonLabel: next,
                    }),
                }),
                createElement(ArrowLargeRightIcon, null),
              ),
              createElement(
                "button",
                {
                  type: "button",
                  className: "getquick-contact-details-card-editor__link-chip",
                  "data-missing": hasSafeButtonHref ? undefined : "true",
                  "aria-expanded": Boolean(linkAnchor),
                  onClick: (event) => toggleLinkEditor(event.currentTarget),
                },
                buttonHref || __("Adicionar link — sem link o botão não aparece", "gq-bioeconomia"),
              ),
            ),
      ),
    );
  }

  registerContractBlock("getquick/contact-details-card", { edit: ContactDetailsCardEdit });
})();
