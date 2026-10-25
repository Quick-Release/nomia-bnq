/** Progressive enhancement: without JS the GET search form stays visible. */
export function defineHeaderSearch() {
  if (customElements.get("nomia-header-search")) return;
  customElements.define(
    "nomia-header-search",
    class extends HTMLElement {
      private cleanup?: () => void;
      private observer?: MutationObserver;

      connectedCallback() {
        this.cleanup?.();
        if (this.initialize()) return;
        // A previously registered element can connect before the parser has
        // supplied its children (client navigation or another header instance).
        this.observer = new MutationObserver(() => {
          if (this.initialize()) this.observer?.disconnect();
        });
        this.observer.observe(this, { childList: true, subtree: true });
      }

      private initialize(): boolean {
        const open = this.querySelector<HTMLButtonElement>("[data-search-open]");
        const close = this.querySelector<HTMLButtonElement>("[data-search-close]");
        const form = this.querySelector<HTMLFormElement>("form");
        const input = this.querySelector<HTMLInputElement>('input[type="search"]');
        if (!open || !close || !form || !input) return false;
        const scope = this.closest(".nomia-header-bar");
        const setOpen = (expanded: boolean, restoreFocus = true) => {
          // Only one expanded form per header; other headers stay independent.
          if (expanded && scope) {
            scope
              .querySelectorAll<HTMLButtonElement>(
                "nomia-header-search[data-expanded] [data-search-close]",
              )
              .forEach((button) => button.click());
          }
          form.hidden = !expanded;
          open.hidden = expanded;
          open.setAttribute("aria-expanded", String(expanded));
          this.toggleAttribute("data-expanded", expanded);
          scope?.classList.toggle(
            "nomia-header-search-open",
            Boolean(scope.querySelector("nomia-header-search[data-expanded]")),
          );
          if (expanded) input.focus();
          else if (restoreFocus) open.focus();
        };
        const show = () => setOpen(true);
        const hide = () => setOpen(false);
        const escape = (event: KeyboardEvent) => {
          if (event.key === "Escape" && !form.hidden) {
            event.preventDefault();
            event.stopPropagation();
            hide();
          }
        };
        open.addEventListener("click", show);
        close.addEventListener("click", hide);
        this.addEventListener("keydown", escape);
        close.hidden = false;
        setOpen(false, false);
        this.cleanup = () => {
          open.removeEventListener("click", show);
          close.removeEventListener("click", hide);
          this.removeEventListener("keydown", escape);
          if (this.hasAttribute("data-expanded"))
            scope?.classList.remove("nomia-header-search-open");
        };
        return true;
      }

      disconnectedCallback() {
        this.observer?.disconnect();
        this.cleanup?.();
      }
    },
  );
}
