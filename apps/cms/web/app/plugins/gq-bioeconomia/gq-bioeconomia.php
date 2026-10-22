<?php
/**
 * Plugin Name: GETQUICK Bio.Eco.Nomia
 * Plugin URI: https://getquick.io
 * Description: Nomia's content types, taxonomies and content-contract blocks, built on GQ Design. Astro renders the final frontend markup.
 * Version: 0.65.0
 * Requires at least: 7.0
 * Requires PHP: 8.4
 * Requires Plugins: gq-design
 * Author: GETQUICK
 * Text Domain: gq-bioeconomia
 * Domain Path: /languages
 *
 * @package GetQuick\Bioeconomia
 */

declare(strict_types=1);

use GetQuick\Bioeconomia\Lifecycle\Lifecycle;
use GetQuick\Bioeconomia\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

define( 'GQ_BIOECONOMIA_VERSION', '0.65.0' );
define( 'GQ_BIOECONOMIA_PLUGIN_FILE', __FILE__ );
define( 'GQ_BIOECONOMIA_PLUGIN_DIR', __DIR__ );

/*
 * This plugin isn't a Composer package (the CMS loads it from its own tree),
 * so it autoloads its PSR-4 classes itself rather than through the Site's
 * Composer autoloader, as GQ Design does.
 */
spl_autoload_register(
	static function ( string $class_name ): void {
		$prefix = 'GetQuick\\Bioeconomia\\';

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

register_activation_hook( __FILE__, [ Lifecycle::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ Lifecycle::class, 'deactivate' ] );
