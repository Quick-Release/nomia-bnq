(() => {
  const { InspectorControls, useBlockProps } = window.wp.blockEditor;
  const { PanelBody, Placeholder, SelectControl } = window.wp.components;
  const { createElement, Fragment } = window.wp.element;
  const { __, sprintf } = window.wp.i18n;
  const { registerContractBlock } = window.getquickNomiaBlocksEditor;

  // The site's menus (Appearance → Menus), from nomia-blocks' HeaderNavigation.
  const menus = window.getquickNomiaMenus || [];

  function MenuSelect({ menuId, setAttributes }) {
    const known = menus.some((menu) => menu.id === menuId);
    return createElement(SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: __("Menu", "getquick-nomia-blocks"),
      value: String(menuId),
      options: [
        {
          value: "0",
          label: __("Escolher um menu", "getquick-nomia-blocks"),
        },
        // A menu deleted since it was chosen stays listed, so the block shows
        // why it renders nothing instead of silently picking another menu.
        ...(menuId && !known
          ? [
              {
                value: String(menuId),
                label: __("Menu apagado", "getquick-nomia-blocks"),
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
      className: "getquick-nomia-blocks-inline-editor",
    });
    const menuId = Number(attributes.menuId) || 0;
    const menu = menus.find((item) => item.id === menuId);
    let instructions = __(
      "Escolha o menu a mostrar. Os menus editam-se em Aparência → Menus.",
      "getquick-nomia-blocks",
    );
    if (menu) {
      instructions = sprintf(
        // translators: %s: the menu's name.
        __("Mostra o menu “%s”, com o estilo do cabeçalho Nomia.", "getquick-nomia-blocks"),
        menu.name,
      );
    } else if (menuId) {
      instructions = __(
        "O menu escolhido foi apagado: o bloco não aparece no site.",
        "getquick-nomia-blocks",
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
            title: __("Menu", "getquick-nomia-blocks"),
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
            label: __("Navegação", "getquick-nomia-blocks"),
            instructions,
          },
          select,
        ),
      ),
    );
  }

  registerContractBlock("getquick/header-navigation", { edit: HeaderNavigationEdit });
})();
