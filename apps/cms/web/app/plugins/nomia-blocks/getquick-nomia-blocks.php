<?php
/**
 * Plugin Name: Getquick Nomia Blocks
 * Description: Gutenberg content-contract blocks for Nomia. Astro renders the final frontend markup.
 * Version: 0.63.7
 * Author: Getquick
 * Text Domain: getquick-nomia-blocks
 * Domain Path: /languages
 * Requires at least: 6.7
 * Requires PHP: 8.4
 * Tested up to: 7.1.1
 *
 * @package GetquickNomiaBlocks
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

const GETQUICK_NOMIA_BLOCKS_VERSION                  = '0.63.7';
const GETQUICK_NOMIA_BLOCKS_HANDLE                   = 'getquick-nomia-blocks-editor';
const GETQUICK_NOMIA_BLOCKS_STYLE_HANDLE             = 'getquick-nomia-blocks-editor-style';
const GETQUICK_NOMIA_BLOCKS_PAGE_BACKGROUND_META_KEY = '_nomia_page_background_color';

/**
 * Return the absolute path to a file in the plugin.
 *
 * @param string $path Relative plugin path.
 * @return string Absolute plugin path.
 */
function getquick_nomia_blocks_plugin_path( string $path = '' ): string {
	return trailingslashit( __DIR__ ) . ltrim( $path, '/' );
}

/**
 * Return the URL to a file in the plugin.
 *
 * @param string $path Relative plugin path.
 * @return string Plugin file URL.
 */
function getquick_nomia_blocks_plugin_url( string $path = '' ): string {
	return plugins_url( ltrim( $path, '/' ), __FILE__ );
}

/**
 * Encode block attributes for embedding inside an HTML comment.
 *
 * An HTML comment ends at the first `-->`, so attribute text an editor typed
 * must not be able to produce one: a hero title containing `-->` would close
 * the debug comment early and let whatever followed it render as markup, in
 * every consumer of `content( format: RENDERED )`.
 *
 * `JSON_HEX_TAG` escapes `<` and `>` to their \uXXXX form, and the remaining
 * `--` pairs are escaped the same way. Both are ordinary JSON string escapes,
 * so the Astro-side parser still reads back the exact original value.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @return string JSON safe to interpolate into an HTML comment.
 */
function getquick_nomia_blocks_encode_comment_attributes( array $attributes ): string {
	$json = (string) wp_json_encode( $attributes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS );

	return str_replace( '--', '\u002D\u002D', $json );
}

/**
 * Return the block types available to the editor.
 *
 * @return array<string> Allowed block names.
 */
function getquick_nomia_blocks_allowed_block_types(): array {
	/*
	 * Blocks that only ever exist inside another block still have to be listed:
	 * `allowed_block_types_all` is checked for nested insertions too, so leaving
	 * `core/list-item` out of an allowlist that contains `core/list` produces a
	 * list nobody can add items to. `core/missing` and `core/block` are core's
	 * own recovery and reusable-block surfaces, and removing them takes the
	 * "attempt block recovery" UI away from editors.
	 */
	$core_blocks = array(
		'core/paragraph',
		'core/heading',
		'core/file',
		'core/image',
		'core/list',
		'core/list-item',
		'core/quote',
		'core/columns',
		'core/column',
		'core/buttons',
		'core/button',

		/*
		 * Static core blocks: each saves its complete HTML, which Astro renders
		 * with `wp-core-blocks.css`. Blocks that only render on the server
		 * (query, navigation, latest posts, embeds, social icons) or need
		 * WordPress's interactivity scripts (accordion, tabs) stay out, as do
		 * the raw-HTML blocks (custom HTML, classic).
		 */
		'core/group',
		'core/cover',
		'core/media-text',
		'core/gallery',
		'core/audio',
		'core/video',
		'core/table',
		'core/separator',
		'core/spacer',
		'core/code',
		'core/preformatted',
		'core/pullquote',
		'core/verse',
		'core/details',
		'core/math',
		'core/block',
		'core/missing',
	);

	/*
	 * GETQUICK Design's blocks (`getquick-design/*`: container, video hero,
	 * grid and the rest), which this site's Frontend renders too. Read from
	 * the registry, so the list follows the installed GQ Design release.
	 */
	$third_party_blocks = array_values(
		array_filter(
			array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() ),
			static fn( string $name ): bool => str_starts_with( $name, 'getquick-design/' )
		)
	);

	$nomia_blocks = array_values(
		array_map(
			static fn( array $contract ): string => (string) $contract['blockName'],
			array_filter(
				getquick_nomia_blocks_contracts(),
				static fn( array $contract ): bool => (bool) ( $contract['inserter'] ?? true )
			)
		)
	);

	return array_values( array_unique( array_merge( $core_blocks, $third_party_blocks, $nomia_blocks ) ) );
}

/**
 * Sanitize a hexadecimal color value.
 *
 * @param mixed $value Value to sanitize.
 * @return string Sanitized color or an empty string.
 */
function getquick_nomia_blocks_sanitize_hex_color( $value ): string {
	$color = is_string( $value ) ? trim( $value ) : '';

	if ( '' === $color ) {
		return '';
	}

	if ( function_exists( 'sanitize_hex_color' ) ) {
		return (string) ( sanitize_hex_color( $color ) ?? '' );
	}

	return 1 === preg_match( '/^#[0-9a-fA-F]{6}$/', $color ) ? strtolower( $color ) : '';
}

/**
 * Register the page background metadata exposed to WordPress and GraphQL.
 *
 * @return void
 */
function getquick_nomia_blocks_register_page_background_meta(): void {
	if ( function_exists( 'register_post_meta' ) ) {
		register_post_meta(
			'page',
			GETQUICK_NOMIA_BLOCKS_PAGE_BACKGROUND_META_KEY,
			array(
				'type'              => 'string',
				'description'       => __( 'Cor de fundo da página Nomia.', 'getquick-nomia-blocks' ),
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => 'getquick_nomia_blocks_sanitize_hex_color',
				'auth_callback'     => static fn(): bool => function_exists( 'current_user_can' )
					? current_user_can( 'edit_posts' )
					: true,
			)
		);
	}

	if ( function_exists( 'register_graphql_field' ) ) {
		register_graphql_field(
			'Page',
			'nomiaPageBackgroundColor',
			array(
				'type'        => 'String',
				'description' => __( 'Cor de fundo da página Nomia.', 'getquick-nomia-blocks' ),
				'resolve'     => static function ( $page ): ?string {
					/* phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- WPGraphQL exposes the databaseId field. */
					$database_id = isset( $page->databaseId ) ? (int) $page->databaseId : 0;
					if ( $database_id <= 0 || ! function_exists( 'get_post_meta' ) ) {
						return null;
					}

					$color = getquick_nomia_blocks_sanitize_hex_color(
						get_post_meta( $database_id, GETQUICK_NOMIA_BLOCKS_PAGE_BACKGROUND_META_KEY, true )
					);

					return '' !== $color ? $color : null;
				},
			)
		);
	}
}

/**
 * Register the public product release endpoint.
 *
 * @return void
 */
function getquick_nomia_blocks_register_release_route(): void {
	register_rest_route(
		'nomia/v1',
		'/release',
		array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
			'callback'            => static fn(): array => array(
				'product' => 'bioeconomia.pt',
				'version' => GETQUICK_NOMIA_BLOCKS_VERSION,
				'tag'     => GETQUICK_NOMIA_BLOCKS_VERSION,
			),
		)
	);
}

/**
 * Register the plugin's editor assets, metadata, and blocks.
 *
 * @return void
 */
function getquick_nomia_blocks_bootstrap(): void {
	static $bootstrapped = false;

	if ( $bootstrapped ) {
		return;
	}

	$bootstrapped = true;

	/*
	 * Source strings are Portuguese, because Portuguese is what this CMS is
	 * edited in; `languages/` carries the catalogs that translate them for any
	 * other locale. Loading on `init` (never earlier) is what WordPress asks
	 * for, so nothing is translated before the textdomain exists.
	 */
	load_plugin_textdomain(
		'getquick-nomia-blocks',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);

	require_once getquick_nomia_blocks_plugin_path( 'includes/contracts.php' );

	getquick_nomia_blocks_register_page_background_meta();

	add_filter(
		'block_categories_all',
		function ( array $categories ): array {
			$exists = array_filter( $categories, static fn( array $category ): bool => ( $category['slug'] ?? '' ) === 'getquick-nomia' );

			if ( $exists ) {
				return $categories;
			}

			array_unshift(
				$categories,
				array(
					'slug'  => 'getquick-nomia',
					'title' => __( 'Getquick Nomia', 'getquick-nomia-blocks' ),
					'icon'  => null,
				)
			);

			return $categories;
		}
	);

	add_filter(
		'allowed_block_types_all',
		/**
		 * Narrow the inserter to the blocks Astro can render.
		 *
		 * The filter runs for every block editor WordPress boots, so the
		 * allowlist is applied only where this plugin owns the content: an
		 * editor editing a post. Widgets, the site editor, and any other
		 * context keep whatever they were given.
		 *
		 * An allowlist another plugin already narrowed is intersected rather
		 * than replaced, so this filter can only ever remove block types.
		 *
		 * @param bool|string[]             $allowed_block_types Incoming allowlist, or true for "everything".
		 * @param WP_Block_Editor_Context   $context             The editor being configured.
		 * @return bool|string[] Allowed block names.
		 */
		static function ( $allowed_block_types, $context ) {
			if ( ! isset( $context->post ) || ! ( $context->post instanceof WP_Post ) ) {
				return $allowed_block_types;
			}

			$allowed = getquick_nomia_blocks_allowed_block_types();

			return is_array( $allowed_block_types )
				? array_values( array_intersect( $allowed_block_types, $allowed ) )
				: $allowed;
		},
		10,
		2
	);

	$asset_file = getquick_nomia_blocks_plugin_path( 'build/index.asset.php' );
	$asset      = file_exists( $asset_file )
		? require $asset_file
		: array(
			// Mirror the dependencies emitted by `build/index.asset.php` so the editor
			// still loads if that file is missing (broken build, manual checkout).
			// `wp-data` is required by `useSelect` in src/lib/tematica.jsx;
			// `react-jsx-runtime` is required by the JSX runtime transform.
			'dependencies' => array(
				'react-jsx-runtime',
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-data',
				'wp-element',
				'wp-i18n',
			),
			'version'      => GETQUICK_NOMIA_BLOCKS_VERSION,
		);

	$script_dependencies = array_values(
		array_unique(
			array_merge(
				$asset['dependencies'] ?? array(),
				array(
					'wp-components',
					'wp-data',
					// `wp-editor`, not `wp-edit-post`: the document setting panel
					// moved to `wp.editor` in WordPress 6.6 and `wp.editPost` only
					// re-exports it behind a deprecation notice.
					'wp-editor',
					'wp-element',
					'wp-i18n',
					'wp-plugins',
				)
			)
		)
	);

	wp_register_script(
		GETQUICK_NOMIA_BLOCKS_HANDLE,
		getquick_nomia_blocks_plugin_url( 'build/index.js' ),
		$script_dependencies,
		$asset['version'] ?? GETQUICK_NOMIA_BLOCKS_VERSION,
		true
	);

	// The editor's own strings live in the bundle, so they need the JSON catalogs
	// `wp i18n make-json` writes next to the PO files rather than the PHP ones.
	wp_set_script_translations(
		GETQUICK_NOMIA_BLOCKS_HANDLE,
		'getquick-nomia-blocks',
		getquick_nomia_blocks_plugin_path( 'languages' )
	);

	wp_register_style(
		GETQUICK_NOMIA_BLOCKS_STYLE_HANDLE,
		getquick_nomia_blocks_plugin_url( 'build/index.css' ),
		array(),
		$asset['version'] ?? GETQUICK_NOMIA_BLOCKS_VERSION
	);

	$nomia_fe_base_url = defined( 'GETQUICK_NOMIA_FE_URL' )
		? (string) constant( 'GETQUICK_NOMIA_FE_URL' )
		: home_url( '/' );

	$preview_base_url = (string) apply_filters( 'getquick_nomia_blocks_preview_base_url', $nomia_fe_base_url );
	$preview_token    = defined( 'GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN' )
		? (string) constant( 'GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN' )
		: '';

	wp_localize_script(
		GETQUICK_NOMIA_BLOCKS_HANDLE,
		'getquickNomiaBlocks',
		array(
			'nomiaFeBaseUrl'    => $preview_base_url,
			'contractsEndpoint' => trailingslashit( $preview_base_url ) . 'api/wp-block-contracts.json',
			'previewToken'      => (string) apply_filters( 'getquick_nomia_blocks_preview_token', $preview_token ),
		)
	);

	/*
	 * Every block is described by a generated `blocks/<catalogId>/block.json`
	 * (ADR 0014): apiVersion, title, category, icon, keywords, attributes,
	 * supports, example, and the shared editor script/style handles. WordPress
	 * translates the metadata through its `textdomain`. The collection manifest
	 * lets core register all of them without decoding each JSON file per request.
	 */
	$blocks_root = getquick_nomia_blocks_plugin_path( 'blocks' );
	wp_register_block_metadata_collection( $blocks_root, $blocks_root . '/blocks-manifest.php' );

	foreach ( getquick_nomia_blocks_contracts() as $contract ) {
		register_block_type(
			$blocks_root . '/' . $contract['catalogId'],
			array(
				'render_callback' => static function ( array $attributes, string $content = '' ) use ( $contract ): string {
					// Frontend rendering is owned by the Astro web app via content(format: RAW).
					// This placeholder keeps REST `content(format: RENDERED)` and
					// non-headless views debuggable without affecting the Astro output.
					// Container blocks append their rendered children so nested content
					// is not silently dropped from the RENDERED projection.
					return sprintf(
						'<!-- getquick/%s rendered by Astro (Bioeconomia.pt). attributes: %s -->',
						sanitize_key( (string) ( $contract['catalogId'] ?? '' ) ),
						getquick_nomia_blocks_encode_comment_attributes( $attributes )
					) . ( '' !== $content ? $content : '' );
				},
			)
		);
	}
}

require_once __DIR__ . '/includes/graphql.php';

if ( function_exists( 'add_action' ) ) {
	add_action( 'init', 'getquick_nomia_blocks_bootstrap' );
	add_action( 'rest_api_init', 'getquick_nomia_blocks_register_release_route' );
	add_action( 'graphql_register_types', 'getquick_nomia_blocks_register_graphql_fields' );
}
