<?php
/**
 * Plugin.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email;

use GetQuick\Email\Cli\EmailCommand;
use GetQuick\Email\Testing\TestController;
use GetQuick\Email\Testing\TestEmail;

/**
 * Wires the Email tab and the Cloudflare transport into WordPress.
 */
final class Plugin {

	public const TEXT_DOMAIN = 'gq-email';

	/**
	 * Boots the plugin once.
	 */
	public function boot(): void {
		static $booted = false;

		if ( $booted ) {
			return;
		}

		$booted = true;

		add_action( 'init', [ $this, 'loadTextDomain' ] );
		( new Settings() )->register();
		( new CloudflareTransport( new Settings() ) )->register();
		( new TestController( new TestEmail( new Settings() ) ) )->register();

		if ( defined( 'WP_CLI' ) && WP_CLI && class_exists( \WP_CLI::class ) ) {
			\WP_CLI::add_command( 'gq-email', new EmailCommand( new Settings() ) );
		}
	}

	/**
	 * Loads the plugin's translations.
	 */
	public function loadTextDomain(): void {
		load_plugin_textdomain( self::TEXT_DOMAIN, false, dirname( plugin_basename( GQ_EMAIL_PLUGIN_FILE ) ) . '/languages' );
	}
}
