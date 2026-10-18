/**
 * Editor bundle configuration.
 *
 * Extends the `@wordpress/scripts` default (WordPress externals, the
 * dependency-extraction plugin that writes `build/index.asset.php`, JSX, CSS)
 * and adds one thing: an alias for the frontend's shared modules.
 *
 * A handful of rules — hero typography defaults and their sanitization, for
 * instance — have to hold identically in the Gutenberg canvas and in the Astro
 * renderer, so they live in one module rather than being restated here. The
 * alias is what keeps importing that module from looking like
 * `../../../../../../../frontend/src/lib/...` at every call site. Modules that only
 * *approximate* the frontend (see `src/lib/page-hero-canvas-scale.mjs`) stay
 * plugin-local, because those are deliberately allowed to differ.
 */
const { resolve } = require( 'node:path' );

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const WEB_SRC = resolve( __dirname, '../../../../../frontend/src' );

module.exports = {
	...defaultConfig,
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve?.alias,
			'@nomia/web-src': WEB_SRC,
		},
	},
};
