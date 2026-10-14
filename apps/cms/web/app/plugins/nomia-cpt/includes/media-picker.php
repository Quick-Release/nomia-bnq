<?php
/**
 * Shared admin media picker registration.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the shared admin media picker script.
 *
 * @return void
 */
function nomia_cpt_register_media_picker_script() {
	wp_register_script(
		'nomia-cpt-media-picker',
		plugin_dir_url( NOMIA_CPT_PLUGIN_FILE ) . 'assets/js/media-picker.js',
		array( 'jquery', 'media-editor', 'media-models', 'media-views' ),
		NOMIA_CPT_PLUGIN_VERSION,
		true,
	);
}
