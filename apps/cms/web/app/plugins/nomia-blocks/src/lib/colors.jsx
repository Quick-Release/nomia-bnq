import { useSelect } from '@wordpress/data';

/**
 * The site's colors, as the block editor offers them: GQ Design's palette
 * (GETQUICK → Design → Branding → Colors, saved in Global Styles). The page
 * background panel and the Nomia blocks' color controls offer these, so every
 * color comes from the palette editors manage.
 *
 * @return {Array<{name: string, label: string, slug: string, color: string}>} Palette colors.
 */
export function useSiteColors() {
	return useSelect( ( select ) => {
		const colors =
			select( 'core/block-editor' )?.getSettings?.()?.colors || [];

		return colors
			.filter( ( entry ) => typeof entry?.color === 'string' )
			.map( ( { name, slug, color } ) => ( {
				name: name || slug,
				label: name || slug,
				slug,
				color,
			} ) );
	}, [] );
}

export function normalizeHexColor( value ) {
	if ( typeof value !== 'string' ) {
		return '';
	}

	const color = value.trim();
	return /^#[0-9a-fA-F]{6}$/.test( color ) ? color.toLowerCase() : '';
}

/**
 * WCAG relative luminance, mirroring `isLightSectionBackground` in
 * `apps/frontend/src/lib/section-block.ts` so the editor preview shows the same
 * text contrast the Astro renderer will pick.
 *
 * @param {string} hex Six-digit hex colour.
 * @return {boolean} True when black body copy reads better than white.
 */
export function isLightColor( hex ) {
	const color = normalizeHexColor( hex );
	if ( ! color ) {
		return true;
	}

	const channel = ( offset ) => {
		const srgb = parseInt( color.slice( offset, offset + 2 ), 16 ) / 255;
		return srgb <= 0.03928
			? srgb / 12.92
			: Math.pow( ( srgb + 0.055 ) / 1.055, 2.4 );
	};

	const luminance =
		0.2126 * channel( 1 ) + 0.7152 * channel( 3 ) + 0.0722 * channel( 5 );

	return luminance > 0.1791;
}
