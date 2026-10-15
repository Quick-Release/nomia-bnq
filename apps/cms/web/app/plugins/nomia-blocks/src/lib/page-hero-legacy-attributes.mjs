/**
 * Retirement of the static page hero's superseded attribute keys.
 *
 * `ctaUrl`, `imageUrl`, `hideCta` and the `cta` object were replaced by
 * `ctaHref`, `imageSrc`, `showCta` and flat CTA fields. Both the editor and the
 * Astro renderer have read the old keys as fallbacks ever since, which keeps
 * old posts rendering but also means no post ever stops carrying them.
 *
 * Kept free of JSX so `apps/frontend/tests/` can exercise it directly, the way
 * `page-hero-canvas-scale.mjs` is.
 */

/**
 * Rewrite whatever legacy keys a stored hero still carries onto the canonical
 * ones, and drop the legacy keys.
 *
 * Setting an attribute to `undefined` removes it from the serialized block, so
 * folding this patch into the next edit retires the old keys as content is
 * touched, rather than dirtying every post that nobody opened. A canonical
 * value already present always wins: this migrates, it never overwrites.
 *
 * @param {Object} attributes Current block attributes.
 * @return {Object} Patch to apply alongside the edit; empty when nothing is legacy.
 */
export function pageHeroLegacyAttributePatch( attributes = {} ) {
	const patch = {};

	if ( attributes.imageUrl !== undefined ) {
		if ( ! attributes.imageSrc ) {
			patch.imageSrc = attributes.imageUrl;
		}
		patch.imageUrl = undefined;
	}

	if ( attributes.hideCta !== undefined ) {
		if ( attributes.hideCta === true ) {
			patch.showCta = false;
		}
		patch.hideCta = undefined;
	}

	if ( attributes.ctaUrl !== undefined ) {
		if ( ! attributes.ctaHref ) {
			patch.ctaHref = attributes.ctaUrl;
		}
		patch.ctaUrl = undefined;
	}

	if ( attributes.cta && typeof attributes.cta === 'object' ) {
		const { label, href, url } = attributes.cta;
		if ( ! attributes.ctaLabel && label ) {
			patch.ctaLabel = label;
		}
		if (
			! attributes.ctaHref &&
			patch.ctaHref === undefined &&
			( href || url )
		) {
			patch.ctaHref = href || url;
		}
		patch.cta = undefined;
	}

	return patch;
}
