<?php
/**
 * Legacy rename.
 *
 * @package GetQuick\Bioeconomia\Lifecycle
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Lifecycle;

use GetQuick\Bioeconomia\Admin\Galleries;
use GetQuick\Bioeconomia\Content\Capabilities;
use GetQuick\Bioeconomia\Content\ThematicColors;
use GetQuick\Bioeconomia\Editor\PageBackground;

/**
 * Moves the data nomia-cpt and nomia-blocks stored to gq-bioeconomia's names.
 *
 * It runs only while nomia-cpt's version option exists, and deletes that
 * option last, so an interrupted run repeats. Each step skips what is already
 * renamed: an option whose new name exists keeps its value.
 */
final class LegacyRename {

	public const LEGACY_VERSION_OPTION = 'nomia_cpt_plugin_version';

	/**
	 * The plugins this one replaces, as `active_plugins` lists them.
	 */
	public const LEGACY_PLUGINS = [
		'nomia-cpt/nomia-cpt.php',
		'nomia-blocks/getquick-nomia-blocks.php',
	];

	/**
	 * Renames the legacy data, if there is any.
	 *
	 * @return bool Whether it ran.
	 */
	public static function run(): bool {
		if ( false === get_option( self::LEGACY_VERSION_OPTION ) ) {
			return false;
		}

		self::renameOptions();
		self::renamePostMeta();
		self::renameTermMeta();
		self::renameGalleries();
		Capabilities::applyToRoles( self::legacyCapabilities(), 'remove_cap' );
		self::deactivateLegacyPlugins();
		wp_cache_flush();
		delete_option( 'nomia_cpt_details_migration_errors' );
		delete_option( self::LEGACY_VERSION_OPTION );

		return true;
	}

	/**
	 * The legacy name of a renamed key: `gq_bioeconomia_` was `nomia_cpt_`.
	 *
	 * @param string $name The current name.
	 */
	public static function legacyName( string $name ): string {
		return str_replace( 'gq_bioeconomia_', 'nomia_cpt_', $name );
	}

	/**
	 * The capabilities nomia-cpt granted, under their legacy names.
	 *
	 * @return string[]
	 */
	public static function legacyCapabilities(): array {
		return array_map( [ self::class, 'legacyName' ], Capabilities::all() );
	}

	/**
	 * Renames every `nomia_cpt_*` option to `gq_bioeconomia_*`.
	 */
	private static function renameOptions(): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-time rename; the options are read through the API below.
		$names = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( 'nomia_cpt_' ) . '%',
			),
		);

		foreach ( $names as $legacy_name ) {
			if ( in_array( $legacy_name, [ self::LEGACY_VERSION_OPTION, 'nomia_cpt_details_migration_errors' ], true ) ) {
				continue;
			}

			$name = 'gq_bioeconomia_' . substr( $legacy_name, strlen( 'nomia_cpt_' ) );

			if ( false === get_option( $name ) ) {
				add_option( $name, get_option( $legacy_name ) );
			}

			delete_option( $legacy_name );
		}
	}

	/**
	 * Renames the post meta keys: `nomia_cpt_*`, `_nomia_cpt_*` and the page
	 * background color.
	 */
	private static function renamePostMeta(): void {
		self::renameMetaPrefix( 'postmeta', 'nomia_cpt_', 'gq_bioeconomia_' );
		self::renameMetaPrefix( 'postmeta', '_nomia_cpt_', '_gq_bioeconomia_' );
		self::renameMetaPrefix( 'postmeta', '_nomia_page_background_color', PageBackground::META_KEY );
	}

	/**
	 * Renames the thematic color term meta.
	 */
	private static function renameTermMeta(): void {
		self::renameMetaPrefix( 'termmeta', '_nomia_tematica_color', ThematicColors::META_KEY );
	}

	/**
	 * Renames the keys starting with a prefix in a meta table.
	 *
	 * @param string $table  `postmeta` or `termmeta`.
	 * @param string $prefix The legacy prefix.
	 * @param string $target Its replacement.
	 */
	private static function renameMetaPrefix( string $table, string $prefix, string $target ): void {
		global $wpdb;

		$table_name = 'termmeta' === $table ? $wpdb->termmeta : $wpdb->postmeta;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-time rename; run() flushes the object cache afterwards.
		$wpdb->query(
			$wpdb->prepare(
				'UPDATE %i SET meta_key = CONCAT( %s, SUBSTRING( meta_key, %d ) ) WHERE meta_key LIKE %s',
				$table_name,
				$target,
				strlen( $prefix ) + 1,
				$wpdb->esc_like( $prefix ) . '%',
			),
		);
	}

	/**
	 * Moves the `nomia_gallery` posts, and menu items pointing at them, to the
	 * gallery post type.
	 */
	private static function renameGalleries(): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-time rename; run() flushes the object cache afterwards.
		$wpdb->update( $wpdb->posts, [ 'post_type' => Galleries::POST_TYPE ], [ 'post_type' => 'nomia_gallery' ] );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- As above.
		$wpdb->update(
			$wpdb->postmeta,
			[ 'meta_value' => Galleries::POST_TYPE ], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- One-time rename.
			[
				'meta_key'   => '_menu_item_object', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- One-time rename.
				'meta_value' => 'nomia_gallery', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- One-time rename.
			],
		);
	}

	/**
	 * Drops the replaced plugins from `active_plugins`: their files are gone,
	 * and WordPress would otherwise keep listing them until someone opens the
	 * Plugins screen.
	 */
	private static function deactivateLegacyPlugins(): void {
		$active = get_option( 'active_plugins', [] );

		if ( ! is_array( $active ) ) {
			return;
		}

		$remaining = array_values( array_diff( $active, self::LEGACY_PLUGINS ) );

		if ( count( $remaining ) !== count( $active ) ) {
			update_option( 'active_plugins', $remaining );
		}
	}
}
