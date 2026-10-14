<?php
/**
 * Lifecycle hooks for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve a versao previamente guardada do plugin.
 *
 * @return string|false
 */
function nomia_cpt_get_stored_plugin_version() {
	$stored_version = get_option( 'nomia_cpt_plugin_version' );

	if ( false === $stored_version || null === $stored_version || '' === $stored_version ) {
		return false;
	}

	return $stored_version;
}

/**
 * Guarda a versao atual do plugin.
 *
 * @return void
 */
function nomia_cpt_store_plugin_version() {
	update_option( 'nomia_cpt_plugin_version', NOMIA_CPT_PLUGIN_VERSION );
}

/**
 * Devolve as opcoes que pertencem exclusivamente ao plugin.
 *
 * Editorial content, including post metadata and media references, is not
 * included because it must survive plugin uninstall.
 *
 * @return string[]
 */
function nomia_cpt_get_plugin_owned_option_names() {
	return array(
		'nomia_cpt_footer_logo_ids',
		'nomia_cpt_contact',
		'nomia_cpt_plugin_version',
		'nomia_cpt_default_library_terms_seeded',
	);
}

/**
 * Remove o estado exclusivo do plugin durante a desinstalacao.
 *
 * @return void
 */
function nomia_cpt_uninstall_plugin() {
	nomia_cpt_remove_custom_capabilities();

	foreach ( nomia_cpt_get_plugin_owned_option_names() as $option_name ) {
		delete_option( $option_name );
	}
}

/**
 * Remove imagens destacadas de posts do tipo indicadores.
 *
 * @return void
 */
function nomia_cpt_remove_indicadores_featured_images() {
	$post_ids = get_posts(
		array(
			'post_type'              => 'indicadores',
			'post_status'            => 'any',
			'posts_per_page'         => -1,
			'fields'                 => 'ids',
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- One-time upgrade query targets only posts with legacy thumbnails.
			'meta_query'             => array(
				array(
					'key'     => '_thumbnail_id',
					'compare' => 'EXISTS',
				),
			),
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		),
	);

	foreach ( $post_ids as $post_id ) {
		delete_post_thumbnail( (int) $post_id );
	}
}

/**
 * Executa rotinas de atualizacao e configuracao inicial.
 *
 * @return bool True when a version transition was applied.
 */
function nomia_cpt_run_upgrade_routines() {
	$stored_version = nomia_cpt_get_stored_plugin_version();

	if (
		false !== $stored_version
		&& is_string( $stored_version )
		&& version_compare( $stored_version, NOMIA_CPT_PLUGIN_VERSION, '>=' )
	) {
		return false;
	}

	nomia_cpt_seed_default_library_terms();
	nomia_cpt_seed_default_opportunity_terms();
	nomia_cpt_remove_obsolete_custom_capabilities();
	nomia_cpt_sync_custom_capabilities();
	nomia_cpt_remove_indicadores_featured_images();
	nomia_cpt_store_plugin_version();

	return true;
}

/**
 * Executa upgrades e atualiza as regras de rewrite quando necessario.
 *
 * @return void
 */
function nomia_cpt_run_upgrade_routines_and_flush_rewrites() {
	if ( nomia_cpt_run_upgrade_routines() ) {
		flush_rewrite_rules();
	}
}

/**
 * Executa as rotinas de ativação.
 *
 * @return void
 */
function nomia_cpt_activate_plugin() {
	nomia_cpt_register_content_types();
	nomia_cpt_run_upgrade_routines();
	flush_rewrite_rules();
}

/**
 * Executa as rotinas de desativação.
 *
 * @return void
 */
function nomia_cpt_deactivate_plugin() {
	flush_rewrite_rules();
}
