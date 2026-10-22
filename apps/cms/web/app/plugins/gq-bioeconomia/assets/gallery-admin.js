(function (window) {
  const mediaPicker = window.gqBioeconomiaMediaPicker;

  if (!mediaPicker || typeof mediaPicker.create !== "function") {
    return;
  }

  const selectButton = document.getElementById("gq-bioeconomia-gallery-select");
  const clearButton = document.getElementById("gq-bioeconomia-gallery-clear");
  const input = document.getElementById("gq-bioeconomia-gallery-image-ids");
  const container = document.getElementById("gq-bioeconomia-gallery-selection");
  const emptyLabel = window.gqBioeconomiaGalleryAdmin?.emptyLabel || "Nenhuma imagem selecionada.";

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
    listClassName: "gq-bioeconomia-gallery-selection__list",
    renderItem: (media) => {
      const item = window.document.createElement("li");
      const label = media.title || media.filename || "Imagem";

      item.textContent = label;

      return item;
    },
  });
})(window);
