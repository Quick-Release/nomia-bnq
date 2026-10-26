/** Progressive enhancement: ordinary image and next-page links also work without JS. */
export function initializeListings(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-nomia-content-listing]").forEach((section) => {
    if (section.dataset.initialized) return;
    section.dataset.initialized = "true";
    const rows = section.querySelector("[data-listing-rows]");
    const more = section.querySelector<HTMLAnchorElement>("[data-listing-more]");
    const status = section.querySelector<HTMLElement>("[data-listing-status]");
    let loading = false;
    let observer: IntersectionObserver | undefined;

    async function loadMore() {
      if (loading || !more || more.hidden) return;
      loading = true;
      observer?.unobserve(more);
      more.setAttribute("aria-disabled", "true");
      rows?.setAttribute("aria-busy", "true");
      if (status) status.textContent = "A carregar…";
      try {
        const response = await fetch(more.href, { headers: { Accept: "text/html" } });
        if (!response.ok) throw new Error("Listing unavailable");
        const page = new DOMParser().parseFromString(await response.text(), "text/html");
        // Match by position because Gutenberg may omit or duplicate blockId.
        const index = Array.from(document.querySelectorAll("[data-nomia-content-listing]")).indexOf(
          section,
        );
        const incoming = page.querySelectorAll("[data-nomia-content-listing]")[index];
        const items = incoming?.querySelectorAll("[data-listing-rows] > li");
        if (!rows || !items?.length) throw new Error("Missing listing rows");
        items.forEach((item) => rows.append(document.importNode(item, true)));
        const next = incoming.querySelector<HTMLAnchorElement>("[data-listing-more]");
        if (next && new URL(next.getAttribute("href")!, response.url).href !== more.href) {
          more.href = new URL(next.getAttribute("href")!, response.url).href;
          observer?.observe(more);
        } else {
          more.hidden = true;
          observer?.disconnect();
        }
        if (status)
          status.textContent = `${items.length} conteúdos carregados.${more.hidden ? " Todos os conteúdos foram carregados." : ""}`;
      } catch {
        // Leave the link available for an explicit retry. Avoid an automatic retry loop.
        if (status)
          status.textContent =
            "Não foi possível carregar. Selecione Carregar mais para tentar novamente.";
      } finally {
        loading = false;
        more.removeAttribute("aria-disabled");
        rows?.removeAttribute("aria-busy");
      }
    }

    if (more) {
      more.addEventListener("click", (event) => {
        event.preventDefault();
        void loadMore();
      });
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) void loadMore();
          },
          { rootMargin: "200px" },
        );
        observer.observe(more);
      }
    }

    const dialog = section.querySelector<HTMLDialogElement>("[data-listing-dialog]");
    if (!dialog || typeof dialog.showModal !== "function") return;
    const image = dialog.querySelector<HTMLImageElement>("[data-listing-image]")!;
    const caption = dialog.querySelector<HTMLElement>("[data-listing-caption]")!;
    const links = () =>
      Array.from(section.querySelectorAll<HTMLAnchorElement>("[data-listing-item] > a"));
    let current = 0;
    let trigger: HTMLAnchorElement | undefined;
    let previousOverflow = "";
    function show(index: number) {
      const photos = links();
      current = (index + photos.length) % photos.length;
      const link = photos[current];
      image.src = link.href;
      image.alt = link.querySelector("img")?.alt || link.textContent?.trim() || "Fotografia";
      caption.textContent = `${image.alt} · ${current + 1} / ${photos.length}`;
      dialog!.querySelectorAll<HTMLButtonElement>("[data-listing-step]").forEach((button) => {
        button.disabled = photos.length < 2;
      });
    }
    section.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("[data-listing-item] > a");
      if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      show(links().indexOf(link));
      previousOverflow = document.documentElement.style.overflow;
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    });
    dialog.querySelector("[data-listing-close]")?.addEventListener("click", () => dialog.close());
    dialog.querySelectorAll<HTMLButtonElement>("[data-listing-step]").forEach((button) => {
      button.addEventListener("click", () => show(current + Number(button.dataset.listingStep)));
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        const buttons = Array.from(
          dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
        );
        const first = buttons[0];
        const last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        show(current + (event.key === "ArrowLeft" ? -1 : 1));
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.documentElement.style.overflow = previousOverflow;
      trigger?.focus();
      image.removeAttribute("src");
    });
  });
}
