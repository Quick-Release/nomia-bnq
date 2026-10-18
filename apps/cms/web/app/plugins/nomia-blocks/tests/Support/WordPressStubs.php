<?php

declare(strict_types=1);

/**
 * Minimal WordPress function shims for the Pest unit suite.
 *
 * The plugin is first-party CMS source, so its tests run without a WordPress
 * load (the plugin test harness uses plain PHP/Composer or the CMS DDEV runtime).
 * This file defines just the WP functions the plugin calls and
 * records every call into $GLOBALS['nomia_blocks_test_state'] for assertions.
 *
 * Mirrors the CMS tests/Support/WordPressStubs.php pattern, but
 * scoped to the ~13 functions getquick-nomia-blocks.php actually uses.
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/../../../' );
}

if ( ! isset( $GLOBALS['nomia_blocks_test_state'] ) ) {
	$GLOBALS['nomia_blocks_test_state'] = array(
		'actions'              => array(),
		'filters'              => array(),
		'apply_filters_calls'  => array(),
		'registered_scripts'   => array(),
		'registered_styles'    => array(),
		'localized_scripts'    => array(),
		'registered_blocks'    => array(),
		'block_metadata_collections' => array(),
		'registered_post_meta' => array(),
		'loaded_textdomains'   => array(),
		'script_translations'  => array(),
		'registered_graphql_fields' => array(),
		'post_meta'           => array(),
		'home_url'             => 'https://example.com',
	);
}

if ( ! function_exists( '__' ) ) {
	function __( $text ) {
		return $text;
	}
}

if ( ! function_exists( 'esc_html' ) ) {
	function esc_html( $text ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'wp_json_encode' ) ) {
	function wp_json_encode( $data, $options = 0 ) {
		$json = json_encode( $data, (int) $options );

		return false === $json ? '' : $json;
	}
}

if ( ! function_exists( 'sanitize_key' ) ) {
	function sanitize_key( $key ) {
		return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $key ) );
	}
}

if ( ! function_exists( 'sanitize_hex_color' ) ) {
	function sanitize_hex_color( $color ) {
		$color = is_string( $color ) ? trim( $color ) : '';

		return preg_match( '/^#[0-9a-fA-F]{6}$/', $color ) === 1 ? strtolower( $color ) : null;
	}
}

if ( ! function_exists( 'current_user_can' ) ) {
	function current_user_can() {
		return true;
	}
}

if ( ! function_exists( 'trailingslashit' ) ) {
	function trailingslashit( $value ) {
		return rtrim( (string) $value, '/' ) . '/';
	}
}

if ( ! function_exists( 'plugins_url' ) ) {
	function plugins_url( $path = '', $file = '' ) {
		$base = 'https://example.com/plugins/nomia-blocks';

		if ( '' === $path ) {
			return $base;
		}

		return $base . '/' . ltrim( (string) $path, '/' );
	}
}

if ( ! function_exists( 'home_url' ) ) {
	function home_url( $path = '' ) {
		$base = rtrim( (string) $GLOBALS['nomia_blocks_test_state']['home_url'], '/' );

		if ( '' === $path ) {
			return $base;
		}

		return $base . '/' . ltrim( (string) $path, '/' );
	}
}

if ( ! function_exists( 'add_action' ) ) {
	function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$GLOBALS['nomia_blocks_test_state']['actions'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

		return true;
	}
}

if ( ! function_exists( 'add_filter' ) ) {
	function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
		$GLOBALS['nomia_blocks_test_state']['filters'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

		return true;
	}
}

if ( ! function_exists( 'apply_filters' ) ) {
	function apply_filters( $hook, $value, ...$args ) {
		$GLOBALS['nomia_blocks_test_state']['apply_filters_calls'][] = array(
			'hook'   => $hook,
			'value'  => $value,
			'args'   => $args,
		);

		$filters = array_filter(
			$GLOBALS['nomia_blocks_test_state']['filters'],
			static fn( $registered_filter ) => $registered_filter['hook'] === $hook
		);

		usort(
			$filters,
			static fn( $left, $right ) => $left['priority'] <=> $right['priority']
		);

		foreach ( $filters as $filter ) {
			$params   = array_merge( array( $value ), array_slice( $args, 0, max( 0, (int) $filter['accepted_args'] - 1 ) ) );
			$value    = ( $filter['callback'] )( ...$params );
		}

		return $value;
	}
}

if ( ! function_exists( 'wp_register_script' ) ) {
	function wp_register_script( $handle, $src = '', $deps = array(), $ver = false, $args = false ) {
		$GLOBALS['nomia_blocks_test_state']['registered_scripts'][ $handle ] = compact( 'src', 'deps', 'ver', 'args' );

		return true;
	}
}

if ( ! function_exists( 'load_plugin_textdomain' ) ) {
	function load_plugin_textdomain( $domain, $deprecated = false, $plugin_rel_path = false ) {
		$GLOBALS['nomia_blocks_test_state']['loaded_textdomains'][ $domain ] = $plugin_rel_path;

		return true;
	}
}

if ( ! function_exists( 'plugin_basename' ) ) {
	function plugin_basename( $file ) {
		return 'nomia-blocks/' . basename( (string) $file );
	}
}

if ( ! function_exists( 'wp_set_script_translations' ) ) {
	function wp_set_script_translations( $handle, $domain = 'default', $path = '' ) {
		$GLOBALS['nomia_blocks_test_state']['script_translations'][ $handle ] = compact( 'domain', 'path' );

		return true;
	}
}

if ( ! function_exists( 'wp_register_style' ) ) {
	function wp_register_style( $handle, $src = '', $deps = array(), $ver = false, $media = 'all' ) {
		$GLOBALS['nomia_blocks_test_state']['registered_styles'][ $handle ] = compact( 'src', 'deps', 'ver', 'media' );

		return true;
	}
}

if ( ! function_exists( 'wp_localize_script' ) ) {
	function wp_localize_script( $handle, $object_name, $l10n ) {
		$GLOBALS['nomia_blocks_test_state']['localized_scripts'][ $handle ][ $object_name ] = $l10n;

		return true;
	}
}

if ( ! function_exists( 'wp_register_block_metadata_collection' ) ) {
	function wp_register_block_metadata_collection( $path, $manifest ) {
		$GLOBALS['nomia_blocks_test_state']['block_metadata_collections'][ rtrim( $path, '/' ) ] = $manifest;
	}
}

if ( ! function_exists( 'register_block_type' ) ) {
	/**
	 * Like core, a directory argument is read as block metadata: from a
	 * registered collection manifest when one covers it, otherwise from its
	 * `block.json`. The block is recorded under the name the metadata declares.
	 */
	function register_block_type( $block_type, $args = array() ) {
		$name     = $block_type;
		$metadata = null;

		if ( is_string( $block_type ) && str_contains( $block_type, '/' ) && ! preg_match( '#^[a-z0-9-]+/[a-z0-9-]+$#', $block_type ) ) {
			$directory  = rtrim( $block_type, '/' );
			$collection = $GLOBALS['nomia_blocks_test_state']['block_metadata_collections'][ dirname( $directory ) ] ?? null;

			if ( null !== $collection && is_file( $collection ) ) {
				$manifest = require $collection;
				$metadata = $manifest[ basename( $directory ) ] ?? null;
			}

			if ( null === $metadata && is_file( $directory . '/block.json' ) ) {
				$metadata = json_decode( (string) file_get_contents( $directory . '/block.json' ), true );
			}

			if ( ! is_array( $metadata ) || ! isset( $metadata['name'] ) ) {
				return false;
			}

			$name = $metadata['name'];
		}

		$GLOBALS['nomia_blocks_test_state']['registered_blocks'][ $name ] = array(
			'name'     => $name,
			'path'     => null === $metadata ? null : $block_type,
			'metadata' => $metadata,
			'args'     => $args,
		);

		return true;
	}
}

if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
	/**
	 * The block registry, over the blocks the stubs recorded.
	 */
	final class WP_Block_Type_Registry {
		/**
		 * The one registry.
		 *
		 * @return self
		 */
		public static function get_instance(): self {
			static $instance = null;

			return $instance ??= new self();
		}

		/**
		 * Registered blocks by name.
		 *
		 * @return array<string, array<string, mixed>>
		 */
		public function get_all_registered(): array {
			return $GLOBALS['nomia_blocks_test_state']['registered_blocks'];
		}
	}
}

if ( ! function_exists( 'register_post_meta' ) ) {
	function register_post_meta( $post_type, $meta_key, $args = array() ) {
		$GLOBALS['nomia_blocks_test_state']['registered_post_meta'][ $post_type ][ $meta_key ] = $args;

		return true;
	}
}

if ( ! function_exists( 'register_graphql_field' ) ) {
	function register_graphql_field( $type_name, $field_name, $config = array() ) {
		$GLOBALS['nomia_blocks_test_state']['registered_graphql_fields'][ $type_name ][ $field_name ] = $config;

		return true;
	}
}

if ( ! function_exists( 'get_post_meta' ) ) {
	function get_post_meta( $post_id, $key = '', $single = false ) {
		return $GLOBALS['nomia_blocks_test_state']['post_meta'][ $post_id ][ $key ] ?? '';
	}
}

/**
 * Reset the recorded-call state. Called from Pest.php beforeEach.
 */
function nomia_blocks_reset_test_state(): void {
	$GLOBALS['nomia_blocks_test_state'] = array(
		'actions'             => array(),
		'filters'             => array(),
		'apply_filters_calls' => array(),
		'registered_scripts'  => array(),
		'registered_styles'   => array(),
		'localized_scripts'   => array(),
		'registered_blocks'   => array(),
		'block_metadata_collections' => array(),
		'registered_post_meta' => array(),
		'loaded_textdomains'   => array(),
		'script_translations'  => array(),
		'registered_graphql_fields' => array(),
		'post_meta'           => array(),
		'home_url'            => 'https://example.com',
	);
}
