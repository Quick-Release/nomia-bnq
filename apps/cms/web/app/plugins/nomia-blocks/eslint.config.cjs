/**
 * Project ESLint config (flat config).
 *
 * Extends the default `@wordpress/scripts` config, opts the editor's JSX
 * modules into flat-config discovery, and layers on two narrow rule overrides.
 *
 * 1. WordPress packages are runtime externals provided by WordPress core (see
 *    the dependency-extraction-webpack-plugin), so the resolver ignores only
 *    the `@wordpress/*` package family. Relative imports remain checked.
 *
 * 2. The extraneous-dependency rule remains active. Imports of host-provided
 *    WordPress packages that are not locally installed carry a line-level
 *    exception at the import site; unrelated packages and internal imports are
 *    still checked.
 *
 * 3. Editor controls follow the JSX accessibility rules supplied by
 *    `@wordpress/scripts`; no source-wide accessibility suppressions are
 *    needed.
 */
const wordpressScriptsConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...wordpressScriptsConfig,
	// ESLint flat config only discovers .js/.mjs/.cjs by default. Declaring
	// the editor's actual source extension makes the inherited WordPress,
	// accessibility, React, import, and formatting rules apply to every JSX
	// module instead of silently skipping the editor.
	{
		files: [ '**/*.jsx' ],
	},
	{
		files: [ '**/*.{js,jsx}' ],
		rules: {
			'import/no-unresolved': [
				'error',
				{
					// `@nomia/web-src` is a webpack alias for the frontend's
					// shared modules, not a package (see webpack.config.js).
					ignore: [ '^@wordpress/', '^@nomia/web-src/' ],
				},
			],
			'import/no-extraneous-dependencies': [
				'error',
				{
					peerDependencies: true,
				},
			],
		},
	},
];
