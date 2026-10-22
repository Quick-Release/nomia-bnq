<?php
/**
 * Lifecycle.
 *
 * @package GetQuick\Bioeconomia\Lifecycle
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Lifecycle;

use GetQuick\Bioeconomia\Content\Capabilities;
use GetQuick\Bioeconomia\Content\PostTypes;
use GetQuick\Bioeconomia\Content\Taxonomies;

/**
 * Activation, upgrades and uninstall.
 *
 * Upgrades run once per plugin version, on `init` after the content types
 * are registered: first the rename of nomia-cpt's stored data, then the
 * default terms and the capabilities.
 */
final class Lifecycle {

	public const VERSION_OPTION = 'gq_bioeconomia_version';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'upgradeAndFlush' ], 20 );
	}

	/**
	 * Runs the upgrade routines, then flushes the rewrite rules if they ran.
	 */
	public function upgradeAndFlush(): void {
		if ( self::upgrade() ) {
			flush_rewrite_rules();
		}
	}

	/**
	 * Runs the upgrade routines unless this version already has.
	 *
	 * @return bool Whether they ran.
	 */
	public static function upgrade(): bool {
		$stored_version = get_option( self::VERSION_OPTION );

		if ( is_string( $stored_version ) && '' !== $stored_version && version_compare( $stored_version, GQ_BIOECONOMIA_VERSION, '>=' ) ) {
			return false;
		}

		LegacyRename::run();
		Taxonomies::seedLibraryTerms();
		Taxonomies::seedOpportunityTerms();
		Capabilities::removeObsolete();
		Capabilities::sync();
		update_option( self::VERSION_OPTION, GQ_BIOECONOMIA_VERSION );

		return true;
	}

	/**
	 * Runs on activation.
	 */
	public static function activate(): void {
		PostTypes::registerContentTypes();
		self::upgrade();
		flush_rewrite_rules();
	}

	/**
	 * Runs on deactivation.
	 */
	public static function deactivate(): void {
		flush_rewrite_rules();
	}

	/**
	 * Removes the plugin's own state on uninstall.
	 *
	 * Editorial content, including post metadata and media references, stays:
	 * it must survive the plugin.
	 */
	public static function uninstall(): void {
		Capabilities::removeAll();

		foreach ( self::ownedOptions() as $option_name ) {
			delete_option( $option_name );
		}
	}

	/**
	 * The options only this plugin uses.
	 *
	 * @return string[]
	 */
	public static function ownedOptions(): array {
		return [
			'gq_bioeconomia_footer_logo_ids',
			'gq_bioeconomia_contact',
			self::VERSION_OPTION,
		];
	}
}
