/**
 * Nomia surface palette, shared by the page-background document panel and the
 * `getquick/section` block so both offer the editor the same swatches.
 *
 * Values mirror the design tokens in `apps/frontend/src/styles/global.css`.
 */
export const NOMIA_SURFACE_COLORS = [
	{ label: 'Branco', color: '#ffffff' },
	{ label: 'Ciano 100', color: '#e5faf9' },
	{ label: 'Ciano 200', color: '#caf4f2' },
	{ label: 'Ciano 300', color: '#95e9e4' },
	{ label: 'Ciano 400', color: '#2ad2c9' },
	{ label: 'Teal 100', color: '#e0f4f3' },
	{ label: 'Teal 200', color: '#c0e9e6' },
	{ label: 'Teal 300', color: '#80d2cc' },
	{ label: 'Teal 400', color: '#00a499' },
	{ label: 'Teal 500', color: '#007b73' },
	{ label: 'Botanico 100', color: '#f4faec' },
	{ label: 'Botanico 200', color: '#e9f5d8' },
	{ label: 'Botanico 300', color: '#d2ebb1' },
	{ label: 'Botanico 400', color: '#a4d663' },
	{ label: 'Laranja 100', color: '#fef4e0' },
	{ label: 'Laranja 200', color: '#fde9c0' },
	{ label: 'Laranja 300', color: '#fbd380' },
	{ label: 'Laranja 400', color: '#f7a600' },
	{ label: 'Cinza 100', color: '#f0f0f0' },
	{ label: 'Cinza 200', color: '#e1e1e1' },
	{ label: 'Cinza 300', color: '#c3c3c3' },
	{ label: 'Monochrome 100', color: '#eeeeee' },
	{ label: 'Monochrome 200', color: '#eaeaea' },
	{ label: 'Monochrome 300', color: '#e6e6e6' },
];

/** Sections may also sit on the darker brand surfaces, which pages do not use. */
export const NOMIA_SECTION_COLORS = [
	...NOMIA_SURFACE_COLORS,
	{ label: 'Teal 600', color: '#00524d' },
	{ label: 'Teal 700', color: '#003333' },
	{ label: 'Ciano 600', color: '#156965' },
	{ label: 'Ciano 700', color: '#104f4c' },
	{ label: 'Cinza 700', color: '#444444' },
	{ label: 'Preto', color: '#000000' },
];

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
