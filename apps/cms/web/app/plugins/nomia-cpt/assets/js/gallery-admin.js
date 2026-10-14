(function (window) {
  const mediaPicker = window.nomiaCptMediaPicker;

  if (!mediaPicker || typeof mediaPicker.create !== "function") {
    return;
  }

  const selectButton = document.getElementById("nomia-cpt-gallery-select");
  const clearButton = document.getElementById("nomia-cpt-gallery-clear");
  const input = document.getElementById("nomia-cpt-gallery-image-ids");
  const container = document.getElementById("nomia-cpt-gallery-selection");
  const emptyLabel = window.nomiaCptGalleryAdmin?.emptyLabel || "Nenhuma imagem selecionada.";

  if (!selectButton || !clearButton || !input || !container) {
    return;
  }

  mediaPicker.create({
    selectButton,
    clearButton,
    input,
    container,
    frame: {
      title: "Selecionar imagens da galeria",
      buttonText: "Usar nesta galeria",
    },
    emptyLabel,
    listClassName: "nomia-cpt-gallery-selection__list",
    renderItem: (media) => {
      const item = window.document.createElement("li");
      const label = media.title || media.filename || "Imagem";

      item.textContent = label;

      return item;
    },
  });
})(window);
