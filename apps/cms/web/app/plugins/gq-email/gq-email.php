<?php
/**
 * Plugin Name: GETQUICK Email
 * Plugin URI: https://getquick.io
 * Description: Sends WordPress's transactional email through Cloudflare Email Service, configured from GETQUICK → Options → Email.
 * Version: 0.1.0
 * Requires at least: 7.0
 * Requires PHP: 8.4
 * Author: GETQUICK
 * Author URI: https://getquick.io
 * License: Proprietary
 * Text Domain: gq-email
 * Domain Path: /languages
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

use GetQuick\Email\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

define( 'GQ_EMAIL_VERSION', '0.1.0' );
define( 'GQ_EMAIL_PLUGIN_FILE', __FILE__ );

/*
 * This plugin isn't a Composer package yet (it lives in the Site's tree until
 * it is extracted), so it autoloads its PSR-4 classes itself, as GQ Design does.
 */
spl_autoload_register(
	static function ( string $class_name ): void {
		$prefix = 'GetQuick\\Email\\';

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
