<?php
/**
 * Plugin Name: GETQUICK Nomia Blocks
 * Description: Nomia's content-contract blocks, built on GQ Design. Astro renders the final frontend markup.
 * Version: 0.64.0
 * Requires at least: 7.0
 * Requires PHP: 8.4
 * Requires Plugins: gq-design
 * Author: GETQUICK
 * Text Domain: getquick-nomia-blocks
 * Domain Path: /languages
 *
 * @package GetQuick\NomiaBlocks
 */

declare(strict_types=1);

use GetQuick\NomiaBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

define( 'GETQUICK_NOMIA_BLOCKS_VERSION', '0.64.0' );
define( 'GETQUICK_NOMIA_BLOCKS_PLUGIN_FILE', __FILE__ );
define( 'GETQUICK_NOMIA_BLOCKS_PLUGIN_DIR', __DIR__ );

/*
 * This plugin isn't a Composer package (the CMS loads it from its own tree),
 * so it autoloads its PSR-4 classes itself rather than through the Site's
 * Composer autoloader, as GQ Design does.
 */
spl_autoload_register(
	static function ( string $class_name ): void {
		$prefix = 'GetQuick\\NomiaBlocks\\';

		if ( ! str_starts_with( $class_name, $prefix ) ) {
			return;
		}

		$file = __DIR__ . '/src/' . str_replace( '\\', '/', substr( $class_name, strlen( $prefix ) ) ) . '.php';

		if ( is_file( $file ) ) {
			require_once $file;
		}
	}
);

add_action(
	'plugins_loaded',
	static function (): void {
		( new Plugin() )->boot();
	}
);
