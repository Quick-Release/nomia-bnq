<?php
/**
 * Plugin Name: nomia-cpt
 * Description: Regista os tipos de conteúdo e taxonomias
 * Version: 0.3.5
 * Author: GETQUICK
 * Author URI: https://getquick.io
 * Text Domain: nomia-cpt
 * License: GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 6.7
 * Requires PHP: 8.4
 * Tested up to: 7.1.1
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'NOMIA_CPT_PLUGIN_BOOTSTRAPPED' ) ) {
	return;
}

define( 'NOMIA_CPT_PLUGIN_BOOTSTRAPPED', true );
define( 'NOMIA_CPT_PLUGIN_VERSION', '0.3.5' );
define( 'NOMIA_CPT_PLUGIN_FILE', __FILE__ );
define( 'NOMIA_CPT_PLUGIN_DIR', __DIR__ . '/' );

require_once NOMIA_CPT_PLUGIN_DIR . 'includes/capabilities.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/post-types.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/taxonomies.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/content-model.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/media.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/media-picker.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/admin.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/gallery-admin.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/footer-admin.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/contact-admin.php';
require_once NOMIA_CPT_PLUGIN_DIR . 'includes/lifecycle.php';

add_action( 'init', 'nomia_cpt_load_textdomain' );
add_action( 'init', 'nomia_cpt_register_content_types' );
add_action( 'init', 'nomia_cpt_register_gallery_meta' );
add_action( 'init', 'nomia_cpt_run_upgrade_routines_and_flush_rewrites', 20 );
add_action( 'after_setup_theme', 'nomia_cpt_ensure_featured_image_support' );
add_action( 'admin_menu', 'nomia_cpt_register_global_taxonomy_menu' );
add_action( 'admin_menu', 'nomia_cpt_register_footer_admin_page' );
add_action( 'admin_menu', 'nomia_cpt_register_contact_admin_page' );
add_action( 'admin_init', 'nomia_cpt_register_footer_settings' );
add_action( 'admin_init', 'nomia_cpt_register_contact_settings' );
add_action( 'admin_menu', 'nomia_cpt_cleanup_tools_admin_menu', 999 );
add_action( 'admin_head', 'nomia_cpt_cleanup_tools_admin_menu' );
add_action( 'add_meta_boxes_nomia_gallery', 'nomia_cpt_register_gallery_meta_box' );
add_action( 'save_post_nomia_gallery', 'nomia_cpt_save_gallery_meta_box', 10, 2 );
add_action( 'admin_enqueue_scripts', 'nomia_cpt_enqueue_gallery_admin_assets' );
add_action( 'admin_enqueue_scripts', 'nomia_cpt_enqueue_footer_admin_assets' );
add_action( 'rest_api_init', 'nomia_cpt_register_gallery_rest_routes' );
add_action( 'rest_api_init', 'nomia_cpt_register_footer_rest_routes' );
add_action( 'rest_api_init', 'nomia_cpt_register_contact_rest_routes' );
add_action( 'pre_get_posts', 'nomia_cpt_order_admin_content_lists' );
add_action( 'restrict_manage_posts', 'nomia_cpt_render_library_category_filter' );
add_filter( 'manage_biblioteca_posts_columns', 'nomia_cpt_get_library_admin_columns' );
add_action( 'manage_biblioteca_posts_custom_column', 'nomia_cpt_render_library_admin_column', 10, 2 );
add_filter( 'manage_glossario_posts_columns', 'nomia_cpt_get_glossary_admin_columns' );
add_action( 'manage_glossario_posts_custom_column', 'nomia_cpt_render_glossary_admin_column', 10, 2 );
add_filter( 'manage_nomia_gallery_posts_columns', 'nomia_cpt_get_gallery_admin_columns' );
add_action( 'manage_nomia_gallery_posts_custom_column', 'nomia_cpt_render_gallery_admin_column', 10, 2 );

register_activation_hook( __FILE__, 'nomia_cpt_activate_plugin' );
register_deactivation_hook( __FILE__, 'nomia_cpt_deactivate_plugin' );
