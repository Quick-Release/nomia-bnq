(() => {
  const { InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, Placeholder, SelectControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { registerContractBlock } = window.gqBioeconomiaEditor;

  // The site's menus (Appearance → Menus), from gq-bioeconomia's HeaderNavigation.
  const menus = window.gqBioeconomiaMenus || [];

  function MenuSelect({ menuId, setAttributes }) {
    const known = menus.some((menu) => menu.id === menuId);
    return createElement(SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: __("Menu", "gq-bioeconomia"),
      value: String(menuId),
      options: [
        {
          value: "0",
          label: __("Escolher um menu", "gq-bioeconomia"),
        },
        // A menu deleted since it was chosen stays listed, so the block shows
        // why it renders nothing instead of silently picking another menu.
        ...(menuId && !known
          ? [
              {
                value: String(menuId),
                label: __("Menu apagado", "gq-bioeconomia"),
              },
            ]
          : []),
        ...menus.map((menu) => ({
          value: String(menu.id),
          label: menu.name,
        })),
      ],
      onChange: (next) =>
        setAttributes({
          menuId: Number(next) || 0,
        }),
    });
  }

  function HeaderNavigationEdit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: "gq-bioeconomia-inline-editor",
    });
    const menuId = Number(attributes.menuId) || 0;
    const menu = menus.find((item) => item.id === menuId);
    let instructions = __(
      "Escolha o menu a mostrar. Os menus editam-se em Aparência → Menus.",
      "gq-bioeconomia",
    );
    if (menu) {
      instructions = sprintf(
        // translators: %s: the menu's name.
        __("Mostra o menu “%s”, com o estilo do cabeçalho Nomia.", "gq-bioeconomia"),
        menu.name,
      );
    } else if (menuId) {
      instructions = __(
        "O menu escolhido foi apagado: o bloco não aparece no site.",
        "gq-bioeconomia",
      );
    }
    const select = createElement(MenuSelect, {
      menuId,
      setAttributes,
    });
    return createElement(
      Fragment,
      null,
      createElement(
        InspectorControls,
        null,
        createElement(
          PanelBody,
          {
            title: __("Menu", "gq-bioeconomia"),
            initialOpen: true,
          },
          select,
        ),
      ),
      createElement(
        "div",
        blockProps,
        createElement(
          Placeholder,
          {
            icon: "menu",
            label: "nomia_navigation",
            instructions,
          },
          select,
        ),
      ),
    );
  }

  registerContractBlock("getquick/header-navigation", { edit: HeaderNavigationEdit });
})();
