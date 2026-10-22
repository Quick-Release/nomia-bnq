(function (window) {
  const mediaPicker = window.gqBioeconomiaMediaPicker;

  if (!mediaPicker || typeof mediaPicker.create !== "function") {
    return;
  }

  const selectButton = document.getElementById("gq-bioeconomia-footer-logos-select");
  const input = document.getElementById("gq-bioeconomia-footer-logo-ids");
  const container = document.getElementById("gq-bioeconomia-footer-logos");
  const labels = window.gqBioeconomiaFooterAdmin || {};
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
    button.setAttribute("data-gq-bioeconomia-media-action", action);
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
    listClassName: "gq-bioeconomia-footer-logos__list",
    renderItem: (media) => {
      const item = window.document.createElement("li");
      const thumb = window.document.createElement("span");
      const title = window.document.createElement("span");
      const imageUrl = media.fullUrl;

      thumb.className = "gq-bioeconomia-footer-logos__thumb";
      title.className = "gq-bioeconomia-footer-logos__title";
      title.textContent = media.title || media.filename || imageLabel;

      if (imageUrl) {
        const image = window.document.createElement("img");

        image.className = "gq-bioeconomia-footer-logos__image";
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
        createActionButton(
          moveUpLabel,
          "button-link gq-bioeconomia-footer-logos__move-up",
          "move-up",
        ),
      );
      item.appendChild(
        createActionButton(
          moveDownLabel,
          "button-link gq-bioeconomia-footer-logos__move-down",
          "move-down",
        ),
      );
      item.appendChild(
        createActionButton(
          removeLabel,
          "button-link-delete gq-bioeconomia-footer-logos__remove",
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
