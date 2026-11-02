(() => {
  const { createElement: el, Fragment, useState, useEffect } = window.wp.element;
  const { InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, SelectControl, TextControl, Button, Spinner, Notice } = window.wp.components;
  const { useSelect } = window.wp.data;
  const { __ } = window.wp.i18n;
  const { registerContractBlock, buildPreviewUrl, PreviewIframe } = window.gqBioeconomiaEditor;
  const types = [
    "post",
    "videos",
    "podcasts",
    "infografias",
    "gq_bio_gallery",
    "eventos",
    "oportunidades",
    "ferramentas",
    "plataformas",
    "bases_de_dados",
  ];
  function Slot({ item, index, onChange, selected }) {
    const [type, setType] = useState(item?.postType || "post");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    useEffect(() => {
      const timer = setTimeout(() => setQuery(search), 300);
      return () => clearTimeout(timer);
    }, [search]);
    const { records, loading, error, postTypes } = useSelect(
      (select) => {
        const core = select("core");
        const args = {
          per_page: 20,
          search: query,
          status: "publish",
          orderby: "date",
          order: "desc",
        };
        return {
          records: core.getEntityRecords("postType", type, args),
          loading: core.isResolving("getEntityRecords", ["postType", type, args]),
          error: core.getResolutionError("getEntityRecords", ["postType", type, args]),
          postTypes: core.getPostTypes({ per_page: -1 }),
        };
      },
      [type, query],
    );
    return el(
      PanelBody,
      {
        title:
          index === 0
            ? __("Coluna A — destaque principal", "gq-bioeconomia")
            : `Coluna B — ${index}`,
        initialOpen: index === 0,
      },
      el(SelectControl, {
        label: __("Tipo de conteúdo", "gq-bioeconomia"),
        value: type,
        options: types.map((value) => ({
          value,
          label: postTypes?.find((t) => t.slug === value)?.name || value,
        })),
        onChange: setType,
      }),
      el(TextControl, {
        label: __("Pesquisar conteúdos", "gq-bioeconomia"),
        value: search,
        onChange: setSearch,
      }),
      item?.postId && el("p", null, item.title),
      item?.postId &&
        el(
          Button,
          { variant: "secondary", onClick: () => onChange({}) },
          __("Remover seleção", "gq-bioeconomia"),
        ),
      loading && el(Spinner),
      error &&
        el(
          Notice,
          { status: "error", isDismissible: false },
          __("Não foi possível carregar os conteúdos.", "gq-bioeconomia"),
        ),
      !loading &&
        !error &&
        records?.length === 0 &&
        el("p", null, __("Nenhum conteúdo encontrado.", "gq-bioeconomia")),
      (records || []).map((post) =>
        el(
          Button,
          {
            key: post.id,
            variant: item?.postId === post.id ? "primary" : "secondary",
            disabled: selected.includes(post.id) && item?.postId !== post.id,
            onClick: () =>
              onChange({
                postId: post.id,
                postType: type,
                uri: new URL(post.link).pathname,
                title: post.title.raw || post.title.rendered,
              }),
          },
          post.title.raw || post.title.rendered || __("Sem título", "gq-bioeconomia"),
        ),
      ),
    );
  }
  function Edit({ attributes, setAttributes }) {
    const [filling, setFilling] = useState(false);
    const [fillError, setFillError] = useState(false);
    async function fillLatest() {
      setFilling(true);
      setFillError(false);
      try {
        const groups = [
          ["post"],
          ["videos", "podcasts", "infografias", "gq_bio_gallery"],
          ["eventos"],
          ["oportunidades"],
          ["ferramentas", "plataformas", "bases_de_dados"],
        ];
        const next = await Promise.all(
          groups.map(async (group) => {
            const candidates = (
              await Promise.all(
                group.map(async (type) => {
                  const rows = await window.wp.data
                    .resolveSelect("core")
                    .getEntityRecords("postType", type, {
                      per_page: 1,
                      status: "publish",
                      orderby: "date",
                      order: "desc",
                    });
                  return (rows || []).map((post) => ({ post, type }));
                }),
              )
            )
              .flat()
              .sort((a, b) => b.post.date.localeCompare(a.post.date) || b.post.id - a.post.id);
            const candidate = candidates[0];
            if (!candidate) return {};
            const { post, type } = candidate;
            return {
              postId: post.id,
              postType: type,
              uri: new URL(post.link).pathname,
              title: post.title.raw || post.title.rendered,
            };
          }),
        );
        setAttributes({ items: next });
      } catch {
        setFillError(true);
      } finally {
        setFilling(false);
      }
    }
    const items = Array.from({ length: 5 }, (_, i) => attributes.items?.[i] || {});
    return el(
      Fragment,
      null,
      el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: __("Seleção inicial", "gq-bioeconomia") },
          el(
            Button,
            { variant: "secondary", disabled: filling, isBusy: filling, onClick: fillLatest },
            __("Preencher com os mais recentes", "gq-bioeconomia"),
          ),
          el(
            "p",
            null,
            __(
              "Substitui as cinco seleções pelo conteúdo mais recente de cada grupo.",
              "gq-bioeconomia",
            ),
          ),
          fillError &&
            el(
              Notice,
              { status: "error", isDismissible: false },
              __("Não foi possível preencher a seleção.", "gq-bioeconomia"),
            ),
        ),
        items.map((item, index) =>
          el(Slot, {
            key: index,
            index,
            item,
            selected: items.map((row) => row.postId),
            onChange: (value) =>
              setAttributes({ items: items.map((row, i) => (i === index ? value : row)) }),
          }),
        ),
      ),
      el(
        "div",
        useBlockProps(),
        el("h2", null, __("Grelha de destaques", "gq-bioeconomia")),
        el(
          "p",
          null,
          __(
            "Selecione um destaque principal e quatro conteúdos nas definições do bloco.",
            "gq-bioeconomia",
          ),
        ),
        el(
          "ol",
          null,
          items.map((item, i) =>
            el("li", { key: i }, item.title || __("Selecionar conteúdo", "gq-bioeconomia")),
          ),
        ),
        el(PreviewIframe, {
          title: __("Pré-visualização dos destaques", "gq-bioeconomia"),
          src: buildPreviewUrl("getquick/selected-content-grid", attributes),
        }),
      ),
    );
  }
  registerContractBlock("getquick/selected-content-grid", { edit: Edit });
})();
