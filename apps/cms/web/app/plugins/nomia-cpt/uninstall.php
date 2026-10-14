<?php
/**
 * Uninstall handler for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/includes/capabilities.php';
require_once __DIR__ . '/includes/lifecycle.php';

nomia_cpt_uninstall_plugin();
