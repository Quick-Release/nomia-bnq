(function (window) {
  const toStringValue = (value) => {
    if (null === value || undefined === value) {
      return "";
    }

    return String(value);
  };

  const normalizeIds = (values) => {
    const seen = new Set();
    const ids = [];

    values.forEach((value) => {
      const id = Number(value);

      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
        return;
      }

      seen.add(id);
      ids.push(id);
    });

    return ids;
  };

  const parseIds = (value) =>
    normalizeIds(
      toStringValue(value)
        .split(",")
        .map((item) => item.trim()),
    );

  const normalizeAttachment = (attachment) => {
    const data =
      attachment && typeof attachment.toJSON === "function" ? attachment.toJSON() : attachment;

    if (!data || "object" !== typeof data) {
      return null;
    }

    const id = Number(data.id);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    const url = toStringValue(data.url);
    const fullUrl = toStringValue(data.sizes?.full?.url || url);

    return {
      id,
      title: toStringValue(data.title),
      filename: toStringValue(data.filename),
      url,
      fullUrl,
    };
  };

  const normalizeAttachments = (attachments) => {
    const seen = new Set();
    const normalized = [];

    attachments.forEach((attachment) => {
      const media = normalizeAttachment(attachment);

      if (!media || seen.has(media.id)) {
        return;
      }

      seen.add(media.id);
      normalized.push(media);
    });

    return normalized;
  };

  const create = (options) => {
    if (
      !window.wp ||
      typeof window.wp.media !== "function" ||
      !options ||
      !options.selectButton ||
      !options.input ||
      !options.container ||
      typeof options.renderItem !== "function"
    ) {
      return;
    }

    const {
      selectButton,
      clearButton,
      input,
      container,
      frame = {},
      emptyLabel = "",
      listClassName = "",
      renderItem,
      onItemAction,
    } = options;
    let mediaFrame;

    const replaceContainerChildren = (child) => {
      if (typeof container.replaceChildren === "function") {
        container.replaceChildren(child);
        return;
      }

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      container.appendChild(child);
    };

    const syncInput = () => {
      const ids = normalizeIds(
        Array.from(container.querySelectorAll("[data-attachment-id]")).map((item) =>
          item.getAttribute("data-attachment-id"),
        ),
      );

      input.value = ids.join(",");
    };

    const renderEmpty = () => {
      const emptyState = window.document.createElement("p");

      emptyState.className = "description";
      emptyState.textContent = emptyLabel;
      replaceContainerChildren(emptyState);
      input.value = "";
    };

    const renderSelection = (attachments) => {
      const normalized = normalizeAttachments(attachments);

      if (!normalized.length) {
        renderEmpty();
        return;
      }

      const list = window.document.createElement("ol");

      list.className = listClassName;

      normalized.forEach((media) => {
        const item = renderItem(media);

        if (!item || typeof item.setAttribute !== "function") {
          return;
        }

        item.setAttribute("data-attachment-id", String(media.id));
        list.appendChild(item);
      });

      if (!list.children.length) {
        renderEmpty();
        return;
      }

      replaceContainerChildren(list);
      syncInput();
    };

    const createMediaFrame = () => {
      if (mediaFrame) {
        return mediaFrame;
      }

      mediaFrame = window.wp.media({
        title: frame.title,
        button: {
          text: frame.buttonText,
        },
        library: {
          type: "image",
        },
        multiple: true,
      });

      mediaFrame.on("open", () => {
        const selection = mediaFrame.state().get("selection");

        selection.reset();

        if (typeof window.wp.media.attachment !== "function") {
          return;
        }

        parseIds(input.value).forEach((id) => {
          const attachment = window.wp.media.attachment(id);

          if (!attachment) {
            return;
          }

          if (typeof attachment.fetch === "function") {
            attachment.fetch();
          }

          selection.add(attachment);
        });
      });

      mediaFrame.on("select", () => {
        const selection = mediaFrame.state().get("selection");

        renderSelection(selection.toJSON());
      });

      return mediaFrame;
    };

    selectButton.addEventListener("click", () => {
      const frameToOpen = createMediaFrame();

      if (frameToOpen && typeof frameToOpen.open === "function") {
        frameToOpen.open();
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", renderEmpty);
    }

    container.addEventListener("click", (event) => {
      const target = event.target;

      if (!target || typeof target.closest !== "function") {
        return;
      }

      const actionTarget = target.closest("[data-gq-bioeconomia-media-action]");
      const item = actionTarget?.closest("[data-attachment-id]");

      if (!actionTarget || !item) {
        return;
      }

      if (typeof event.preventDefault === "function") {
        event.preventDefault();
      }

      if (typeof onItemAction === "function") {
        onItemAction(actionTarget.getAttribute("data-gq-bioeconomia-media-action"), item);
      }

      if (container.querySelector("[data-attachment-id]")) {
        syncInput();
        return;
      }

      renderEmpty();
    });
  };

  window.gqBioeconomiaMediaPicker = { create };
})(window);
