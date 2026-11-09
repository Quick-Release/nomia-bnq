(() => {
  const { InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { Button, Notice, PanelBody, SelectControl, TextControl, TextareaControl } =
    window.wp.components;
  const { createElement, Fragment, useMemo } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { MediaUploadButton, PreviewIframe, buildPreviewUrl, registerContractBlock } =
    window.gqBioeconomiaEditor;
  const contracts = window.gqBioeconomiaContracts;

  const BLOCK_NAME = "getquick/interactive-image";

  /*
   * The graphic's own texts, shown as placeholders: an empty field keeps them
   * exactly as drawn. Keep in sync with the Frontend's
   * economia-circular.slots.json (checked by its interactive-images test).
   */
  const DEFAULTS = {
    "linear-heading": "MODELO LINEAR",
    "linear-1": "Extrair",
    "linear-2": "Produzir",
    "linear-3": "Utilizar",
    "linear-4": "Eliminar",
    "linear-info":
      "No modelo linear os recursos são extraídos, transformados em produtos, utilizados e, no fim de vida, eliminados como resíduos.",
    "circular-heading": "MODELO CIRCULAR",
    "center-label": "Economia Circular",
    "step-1-title": "Prevenir e repensar",
    "step-1-description":
      "Evitar a necessidade de novos produtos e repensar a forma como são concebidos e utilizados.",
    "step-1-info":
      "Ponderar a necessidade de adquirir um novo produto. Desenhar produtos com tempo de vida útil mais longo, prevenindo a sua reparação, reciclagem ou providenciando a sua função sem produzir um novo produto.",
    "step-2-title": "Conceber para durar",
    "step-2-description":
      "Conceber produtos duráveis, reparáveis e recicláveis, com impacto ambiental mínimo.",
    "step-2-info": "Integrar a durabilidade, reparabilidade e a reciclabilidade desde a conceção.",
    "step-3-title": "Reduzir e partilhar",
    "step-3-description":
      "Reduzir o consumo de recursos e partilhar produtos para maximizar a sua utilização.",
    "step-3-info":
      "Usar menos recursos e promover a partilha para que os produtos sejam utilizados por mais pessoas.",
    "step-4-title": "Manter, reparar e reutilizar",
    "step-4-description":
      "Manter e reparar produtos para prolongar a sua vida útil e reutilizá-los sempre que possível.",
    "step-4-info":
      "Reparar um produto com defeito de modo a poder ser utilizado na sua função original ou reutilizá-lo.",
    "step-5-title": "Recondicionar e remanufacturar",
    "step-5-description":
      "Restaurar produtos ou componentes de modo a que tenham a mesma função que um novo produto.",
    "step-5-info": "Utilizar partes/componentes de um produto num novo produto com a mesma função.",
    "step-6-title": "Reciclar com segurança",
    "step-6-description":
      "Reciclar materiais de forma segura e eficiente, substituindo matérias-primas virgens.",
    "step-6-info":
      "Processar o produto descartado em materiais úteis e de elevada qualidade, permitindo substituir matérias-primas virgens.",
    "regeneration-heading": "REGENERAÇÃO DOS SISTEMAS NATURAIS",
    "regeneration-text":
      "Restaurar e regenerar os sistemas naturais, reforçando os recursos de que dependemos.",
    "regeneration-1": "solo",
    "regeneration-2": "água",
    "regeneration-3": "biodiversidade",
    "regeneration-4": "nutrientes",
    "regeneration-5": "compostagem segura",
    "regeneration-info":
      "Proteger e regenerar o solo, a água, a biodiversidade e os ciclos de nutrientes, garantindo a base para uma economia verdadeiramente sustentável.",
    hint: "Clique em cada etapa para saber mais.",
  };

  /** A row of an array attribute, padded so the n-th row edits item n. */
  function setRow(attributes, setAttributes, name, index, patch) {
    const rows = Array.isArray(attributes[name]) ? [...attributes[name]] : [];
    while (rows.length <= index) rows.push({});
    rows[index] = { ...rows[index], ...patch };
    setAttributes({ [name]: rows });
  }

  const rowOf = (attributes, name, index) =>
    (Array.isArray(attributes[name]) && attributes[name][index]) || {};

  function Text({ label, value, slot, onChange, multiline }) {
    return createElement(multiline ? TextareaControl : TextControl, {
      __next40pxDefaultSize: !multiline,
      __nextHasNoMarginBottom: true,
      label,
      value: value || "",
      placeholder: DEFAULTS[slot],
      onChange,
    });
  }

  /** An icon: the uploaded image, or the graphic's own when there is none. */
  function Icon({ label, src, id, onChange }) {
    return createElement(
      "div",
      { className: "gq-bioeconomia-interactive-image__icon" },
      createElement("p", { className: "components-base-control__label" }, label),
      createElement(MediaUploadButton, {
        imageId: id,
        hasImage: Boolean(src),
        previewUrl: src || undefined,
        labelSelect: __("Substituir ícone", "gq-bioeconomia"),
        labelReplace: __("Trocar ícone", "gq-bioeconomia"),
        // A selection without a URL (cancelled, or an unexpected shape) changes nothing.
        onSelect: (media) => media?.url && onChange({ iconId: media.id, iconSrc: media.url }),
      }),
      src
        ? createElement(
            Button,
            {
              variant: "link",
              isDestructive: true,
              onClick: () => onChange({ iconId: undefined, iconSrc: "" }),
            },
            __("Repor ícone original", "gq-bioeconomia"),
          )
        : createElement(
            "p",
            { className: "gq-bioeconomia-interactive-image__hint" },
            __("A usar o ícone original.", "gq-bioeconomia"),
          ),
    );
  }

  function InteractiveImageEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "gq-bioeconomia-inline-editor" });
    const contract = contracts.find((item) => item.blockName === BLOCK_NAME);
    const previewUrl = useMemo(() => buildPreviewUrl(BLOCK_NAME, attributes), [attributes]);
    const field = (name, slot, label, multiline = false) =>
      createElement(Text, {
        label,
        slot,
        multiline,
        value: attributes[name],
        onChange: (next) => setAttributes({ [name]: next }),
      });
    const rowField = (name, index, key, slot, label, multiline = false) =>
      createElement(Text, {
        label,
        slot,
        multiline,
        value: rowOf(attributes, name, index)[key],
        onChange: (next) => setRow(attributes, setAttributes, name, index, { [key]: next }),
      });
    const rowIcon = (name, index, label) =>
      createElement(Icon, {
        label,
        src: rowOf(attributes, name, index).iconSrc,
        id: rowOf(attributes, name, index).iconId,
        onChange: (patch) => setRow(attributes, setAttributes, name, index, patch),
      });

    const steps = [1, 2, 3, 4, 5, 6].map((step) =>
      createElement(
        PanelBody,
        {
          key: `step-${step}`,
          title: sprintf(
            /* translators: 1: step number, 2: step title */
            __("Etapa %1$d: %2$s", "gq-bioeconomia"),
            step,
            rowOf(attributes, "steps", step - 1).title || DEFAULTS[`step-${step}-title`],
          ),
          initialOpen: false,
        },
        rowField("steps", step - 1, "title", `step-${step}-title`, __("Título", "gq-bioeconomia")),
        rowField(
          "steps",
          step - 1,
          "description",
          `step-${step}-description`,
          __("Texto", "gq-bioeconomia"),
          true,
        ),
        rowField(
          "steps",
          step - 1,
          "info",
          `step-${step}-info`,
          __("Detalhe (aparece ao passar o rato)", "gq-bioeconomia"),
          true,
        ),
        rowIcon("steps", step - 1, __("Ícone", "gq-bioeconomia")),
      ),
    );

    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          { title: __("Imagem", "gq-bioeconomia") },
          createElement(SelectControl, {
            __next40pxDefaultSize: true,
            __nextHasNoMarginBottom: true,
            label: __("Imagem interativa", "gq-bioeconomia"),
            value: attributes.image || "economia-circular",
            options: [
              { value: "economia-circular", label: __("Economia Circular", "gq-bioeconomia") },
            ],
            onChange: (next) => setAttributes({ image: next }),
          }),
          createElement(
            Notice,
            { status: "info", isDismissible: false },
            __(
              "Deixe um campo vazio para manter o texto ou o ícone original da imagem. O texto alterado ajusta-se à largura original.",
              "gq-bioeconomia",
            ),
          ),
        ),
        createElement(
          PanelBody,
          { title: __("Modelo linear", "gq-bioeconomia"), initialOpen: false },
          field("linearHeading", "linear-heading", __("Título", "gq-bioeconomia")),
          ...[1, 2, 3, 4].flatMap((n) => [
            rowField(
              "linearSteps",
              n - 1,
              "label",
              `linear-${n}`,
              sprintf(/* translators: %d: stage number */ __("Fase %d", "gq-bioeconomia"), n),
            ),
            rowIcon(
              "linearSteps",
              n - 1,
              sprintf(
                /* translators: %d: stage number */ __("Ícone da fase %d", "gq-bioeconomia"),
                n,
              ),
            ),
          ]),
          field("linearInfo", "linear-info", __("Detalhe", "gq-bioeconomia"), true),
        ),
        createElement(
          PanelBody,
          { title: __("Modelo circular", "gq-bioeconomia"), initialOpen: false },
          field("circularHeading", "circular-heading", __("Título", "gq-bioeconomia")),
          field("centerLabel", "center-label", __("Texto ao centro", "gq-bioeconomia")),
          createElement(Icon, {
            label: __("Logótipo ao centro", "gq-bioeconomia"),
            src: attributes.centerIconSrc,
            id: attributes.centerIconId,
            onChange: (patch) =>
              setAttributes({ centerIconId: patch.iconId, centerIconSrc: patch.iconSrc }),
          }),
        ),
        ...steps,
        createElement(
          PanelBody,
          { title: __("Regeneração dos sistemas naturais", "gq-bioeconomia"), initialOpen: false },
          field("regenerationHeading", "regeneration-heading", __("Título", "gq-bioeconomia")),
          field("regenerationText", "regeneration-text", __("Texto", "gq-bioeconomia"), true),
          ...[1, 2, 3, 4, 5].flatMap((n) => [
            rowField(
              "regenerationItems",
              n - 1,
              "label",
              `regeneration-${n}`,
              sprintf(/* translators: %d: item number */ __("Sistema %d", "gq-bioeconomia"), n),
            ),
            rowIcon(
              "regenerationItems",
              n - 1,
              sprintf(
                /* translators: %d: item number */ __("Ícone do sistema %d", "gq-bioeconomia"),
                n,
              ),
            ),
          ]),
          field("regenerationInfo", "regeneration-info", __("Detalhe", "gq-bioeconomia"), true),
        ),
        createElement(
          PanelBody,
          { title: __("Indicação", "gq-bioeconomia"), initialOpen: false },
          field("hint", "hint", __("Texto por baixo da imagem", "gq-bioeconomia")),
        ),
      ),
      createElement(
        "div",
        blockProps,
        createElement(
          "p",
          { className: "gq-bioeconomia-inline-editor__intro" },
          contract?.description,
        ),
        createElement(
          "div",
          { className: "gq-bioeconomia-editor-preview" },
          createElement(PreviewIframe, {
            title: __("Pré-visualização da imagem interativa", "gq-bioeconomia"),
            src: previewUrl,
          }),
        ),
      ),
    );
  }

  registerContractBlock(BLOCK_NAME, { edit: InteractiveImageEdit });
})();
