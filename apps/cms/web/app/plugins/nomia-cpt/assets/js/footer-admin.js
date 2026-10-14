(function (window) {
  const mediaPicker = window.nomiaCptMediaPicker;

  if (!mediaPicker || typeof mediaPicker.create !== "function") {
    return;
  }

  const selectButton = document.getElementById("nomia-cpt-footer-logos-select");
  const input = document.getElementById("nomia-cpt-footer-logo-ids");
  const container = document.getElementById("nomia-cpt-footer-logos");
  const labels = window.nomiaCptFooterAdmin || {};
  const emptyLabel = labels.emptyLabel || "Nenhum logótipo selecionado.";
  const imageLabel = labels.imageLabel || "Logótipo";
  const moveUpLabel = labels.moveUpLabel || "Subir";
  const moveDownLabel = labels.moveDownLabel || "Descer";
  const removeLabel = labels.removeLabel || "Remover";

  if (!selectButton || !input || !container) {
    return;
  }

  const createActionButton = (label, className, action) => {
    const button = window.document.createElement("button");

    button.setAttribute("type", "button");
    button.className = className;
    button.setAttribute("data-nomia-cpt-media-action", action);
    button.textContent = label;

    return button;
  };

  mediaPicker.create({
    selectButton,
    input,
    container,
    frame: {
      title: "Selecionar logótipos do rodapé",
      buttonText: "Usar no rodapé",
    },
    emptyLabel,
    listClassName: "nomia-cpt-footer-logos__list",
    renderItem: (media) => {
      const item = window.document.createElement("li");
      const thumb = window.document.createElement("span");
      const title = window.document.createElement("span");
      const imageUrl = media.fullUrl;

      thumb.className = "nomia-cpt-footer-logos__thumb";
      title.className = "nomia-cpt-footer-logos__title";
      title.textContent = media.title || media.filename || imageLabel;

      if (imageUrl) {
        const image = window.document.createElement("img");

        image.className = "nomia-cpt-footer-logos__image";
        image.setAttribute("src", imageUrl);
        image.setAttribute("alt", "");
        image.setAttribute(
          "style",
          "max-height: 200px; width: auto; max-width: 100%; object-fit: contain;",
        );
        thumb.appendChild(image);
      }

      item.appendChild(thumb);
      item.appendChild(title);
      item.appendChild(
        createActionButton(moveUpLabel, "button-link nomia-cpt-footer-logos__move-up", "move-up"),
      );
      item.appendChild(
        createActionButton(
          moveDownLabel,
          "button-link nomia-cpt-footer-logos__move-down",
          "move-down",
        ),
      );
      item.appendChild(
        createActionButton(
          removeLabel,
          "button-link-delete nomia-cpt-footer-logos__remove",
          "remove",
        ),
      );

      return item;
    },
    onItemAction: (action, item) => {
      if ("remove" === action) {
        item.remove();
        return;
      }

      if ("move-up" === action && item.previousElementSibling) {
        item.parentNode.insertBefore(item, item.previousElementSibling);
        return;
      }

      if ("move-down" === action && item.nextElementSibling) {
        item.parentNode.insertBefore(item.nextElementSibling, item);
      }
    },
  });
})(window);
