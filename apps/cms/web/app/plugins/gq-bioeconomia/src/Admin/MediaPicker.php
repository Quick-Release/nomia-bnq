<?php
/**
 * Media picker.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

/**
 * The admin media picker shared by the gallery and footer screens.
 */
final class MediaPicker {

	public const HANDLE = 'gq-bioeconomia-media-picker';

	/**
	 * Registers the shared admin media picker script.
	 *
	 * @return void
	 */
	public static function registerScript() {
		wp_register_script(
			self::HANDLE,
			plugin_dir_url( GQ_BIOECONOMIA_PLUGIN_FILE ) . 'assets/media-picker.js',
			[ 'jquery', 'media-editor', 'media-models', 'media-views' ],
			GQ_BIOECONOMIA_VERSION,
			true,
		);
	}
}
