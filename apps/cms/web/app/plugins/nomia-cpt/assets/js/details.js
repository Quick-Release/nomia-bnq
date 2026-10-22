/* Editorial metadata lives outside block content. */
(() => {
  const { Button, CheckboxControl, Notice, SelectControl, TextControl, TextareaControl } =
    window.wp.components;
  const { useEntityProp, useEntityRecords } = window.wp.coreData;
  const { useSelect } = window.wp.data;
  const { PluginDocumentSettingPanel } = window.wp.editor;
  const { createElement: h, Fragment } = window.wp.element;
  const { __ } = window.wp.i18n;
  const { registerPlugin } = window.wp.plugins;
  const { postType, definition } = window.nomiaCptDetails;
  const choices = {
    geographicArea: ["NUTS 0", "NUTS 1", "NUTS 2", "NUTS 3", "Municipality"],
    graphicRepresentation: ["Columns", "Traffic Lights", "Speedometer", "Horizontal Bars"],
    xAxisType: ["number", "text"],
    yAxisType: ["number", "text"],
  };
  const validUrl = (value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  };

  function SectorControl({ field, meta, update }) {
    // Core data resolves per_page:-1 by fetching every REST page.
    const { records, hasResolved } = useEntityRecords("taxonomy", "setor_atividade", {
      per_page: -1,
      hide_empty: false,
      orderby: "name",
      order: "asc",
    });
    const id = Number(meta[field.key] || 0);
    const labelKey = definition.fields.setorAtividade.key;
    const label = meta[labelKey] || "";
    const terms = records || [];
    const selected = terms.find((term) => term.id === id);
    const unresolved = hasResolved && ((id > 0 && !selected) || (!id && label));
    const options = [
      { value: "0", label: __("Sem setor selecionado", "nomia-cpt"), disabled: true },
    ];
    if (id && !selected) {
      options.push({
        value: String(id),
        label: `${label || id} (${__("Referência importada", "nomia-cpt")})`,
      });
    }
    options.push(...terms.map((term) => ({ value: String(term.id), label: term.name })));
    return h(
      Fragment,
      null,
      h(SelectControl, {
        label: field.label,
        value: String(id),
        disabled: !hasResolved,
        options,
        onChange: (value) => {
          const nextId = Number(value);
          const term = terms.find((item) => item.id === nextId);
          if (!term) return;
          update({ [field.key]: nextId, [labelKey]: term?.name || "" });
        },
      }),
      unresolved &&
        h(
          Notice,
          { status: "warning", isDismissible: false },
          __(
            "O setor importado não corresponde a um termo atual. Selecione um setor para atualizar a referência; as categorias atribuídas à plataforma são conservadas.",
            "nomia-cpt",
          ),
        ),
    );
  }

  function PointsControl({ field, value, set }) {
    const rows = Array.isArray(value) ? value : [];
    return h(
      "fieldset",
      null,
      h("legend", null, field.label),
      ...rows.map((point, index) =>
        h(
          "div",
          { key: index },
          ...["x", "y"].map((axis) =>
            h(TextControl, {
              key: axis,
              label: `${axis.toUpperCase()} — ${index + 1}`,
              value: point[axis],
              onChange: (next) =>
                set(rows.map((row, i) => (i === index ? { ...row, [axis]: next } : row))),
            }),
          ),
          h(
            Button,
            { variant: "tertiary", onClick: () => set(rows.filter((_, i) => i !== index)) },
            __("Remover linha", "nomia-cpt"),
          ),
          h(
            Button,
            {
              variant: "tertiary",
              disabled: index === 0,
              onClick: () => {
                const moved = [...rows];
                [moved[index - 1], moved[index]] = [moved[index], moved[index - 1]];
                set(moved);
              },
            },
            __("Mover para cima", "nomia-cpt"),
          ),
        ),
      ),
      h(
        Button,
        { variant: "secondary", onClick: () => set([...rows, { x: "", y: "" }]) },
        __("Adicionar linha", "nomia-cpt"),
      ),
    );
  }

  function DetailsPanel() {
    const currentType = useSelect((select) => select("core/editor").getCurrentPostType(), []);
    const [meta, setMeta] = useEntityProp("postType", postType, "meta");
    if (currentType !== postType || !meta) return null;
    const update = (values) => setMeta({ ...meta, ...values });
    const controls = Object.entries(definition.fields).map(([name, field]) => {
      const value = meta[field.key] ?? field.default;
      const set = (next) => update({ [field.key]: next });
      const common = {
        key: name,
        label: field.label,
        value,
        onChange: set,
        readOnly: name === "setorAtividade",
      };
      if (field.control === "sector") {
        return h(SectorControl, { key: name, field, meta, update });
      }
      if (field.control === "points") return h(PointsControl, { key: name, field, value, set });
      if (field.control === "specialization") {
        const options = [...new Set(["N", "S", ...value])];
        return h(
          "fieldset",
          { key: name },
          h("legend", null, field.label),
          ...options.map((option) =>
            h(CheckboxControl, {
              key: option,
              label: option,
              checked: value.includes(option),
              onChange: (checked) =>
                set(checked ? [...value, option] : value.filter((item) => item !== option)),
            }),
          ),
        );
      }
      if (field.control === "select") {
        return h(SelectControl, {
          ...common,
          options: [...new Set([value, ...choices[name]])].map((option) => ({
            label: option || __("Sem valor", "nomia-cpt"),
            value: option,
          })),
        });
      }
      if (field.control === "textarea") return h(TextareaControl, common);
      return h(
        Fragment,
        { key: name },
        h(TextControl, {
          ...common,
          type: field.control === "url" ? "url" : field.control === "date" ? "date" : "text",
        }),
        field.control === "url" &&
          !validUrl(value) &&
          h(
            Notice,
            { status: "warning", isDismissible: false },
            __("Introduza um URL válido com http ou https.", "nomia-cpt"),
          ),
      );
    });
    const start = meta[definition.fields.startDate?.key];
    const end = meta[definition.fields.endDate?.key];
    return h(
      PluginDocumentSettingPanel,
      { name: `nomia-${definition.prefix}-details`, title: definition.title },
      ...controls,
      start &&
        end &&
        end < start &&
        h(
          Notice,
          { status: "warning", isDismissible: false },
          __("A data de fim deve ser igual ou posterior à data de início.", "nomia-cpt"),
        ),
    );
  }
  registerPlugin("nomia-cpt-details", { render: DetailsPanel });
})();
