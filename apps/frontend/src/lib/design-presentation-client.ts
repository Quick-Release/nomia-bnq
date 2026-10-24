import {
  mountDesignCarousels,
  mountDesignNavigation,
  mountVideoHero,
} from "@getquick/content/design/client";

/** The Site's browser lifecycle; interaction itself belongs to the runtime. */
export function startDesignPresentation() {
  let cleanup = () => {};
  const mount = () => {
    cleanup();
    const stops = [
      mountDesignCarousels(document),
      mountDesignNavigation(document),
      ...[...document.querySelectorAll<HTMLElement>(".wp-block-getquick-design-video-hero")].map(
        mountVideoHero,
      ),
    ];
    cleanup = () => stops.forEach((stop) => stop());
  };
  const unmount = () => cleanup();
  mount();
  document.addEventListener("astro:page-load", mount);
  document.addEventListener("astro:before-swap", unmount);
  return () => {
    unmount();
    document.removeEventListener("astro:page-load", mount);
    document.removeEventListener("astro:before-swap", unmount);
  };
}
