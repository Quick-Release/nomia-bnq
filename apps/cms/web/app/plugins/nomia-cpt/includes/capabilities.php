<?php
/**
 * Capability helpers for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Constroi um mapa de capabilities de post type a partir do radical singular e plural.
 *
 * @param string $singular Radical singular.
 * @param string $plural   Radical plural.
 * @return array<string, string>
 */
function nomia_cpt_get_post_type_capabilities( $singular, $plural ) {
	return array(
		'edit_post'              => 'edit_' . $singular,
		'read_post'              => 'read_' . $singular,
		'delete_post'            => 'delete_' . $singular,
		'edit_posts'             => 'edit_' . $plural,
		'edit_others_posts'      => 'edit_others_' . $plural,
		'publish_posts'          => 'publish_' . $plural,
		'read_private_posts'     => 'read_private_' . $plural,
		'delete_posts'           => 'delete_' . $plural,
		'delete_private_posts'   => 'delete_private_' . $plural,
		'delete_published_posts' => 'delete_published_' . $plural,
		'delete_others_posts'    => 'delete_others_' . $plural,
		'edit_private_posts'     => 'edit_private_' . $plural,
		'edit_published_posts'   => 'edit_published_' . $plural,
		'create_posts'           => 'create_' . $plural,
	);
}

/**
 * Devolve as capabilities do tipo de conteúdo Biblioteca.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_library_capabilities() {
	return nomia_cpt_get_post_type_capabilities( 'nomia_cpt_library', 'nomia_cpt_libraries' );
}

/**
 * Devolve as capabilities do tipo de conteúdo Glossário.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_glossary_capabilities() {
	return nomia_cpt_get_post_type_capabilities( 'nomia_cpt_glossary', 'nomia_cpt_glossaries' );
}

/**
 * Devolve as capabilities do tipo de conteúdo Ferramentas.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_tools_capabilities() {
	return nomia_cpt_get_post_type_capabilities( 'nomia_cpt_tool', 'nomia_cpt_tools' );
}

/**
 * Devolve as capabilities do tipo de conteúdo Galerias.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_gallery_capabilities() {
	return nomia_cpt_get_post_type_capabilities( 'nomia_cpt_gallery', 'nomia_cpt_galleries' );
}

/**
 * Devolve as capabilities da taxonomia da biblioteca.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_library_category_capabilities() {
	return array(
		'manage_terms' => 'manage_nomia_cpt_library_categories',
		'edit_terms'   => 'edit_nomia_cpt_library_categories',
		'delete_terms' => 'delete_nomia_cpt_library_categories',
		'assign_terms' => 'assign_nomia_cpt_library_categories',
	);
}

/**
 * Devolve os perfis a gerir pelo plugin.
 *
 * @return string[]
 */
function nomia_cpt_get_managed_role_names() {
	return array(
		'administrator',
		'editor',
	);
}

/**
 * Devolve a lista completa de capabilities criadas pelo plugin.
 *
 * @return string[]
 */
function nomia_cpt_get_all_custom_capabilities() {
	$capabilities = array();
	$definitions  = array_merge(
		nomia_cpt_get_post_type_definitions(),
		nomia_cpt_get_taxonomy_definitions(),
	);

	foreach ( $definitions as $definition ) {
		$declared_capabilities = $definition['args']['capabilities'] ?? array();

		if ( ! is_array( $declared_capabilities ) ) {
			continue;
		}

		foreach ( $declared_capabilities as $capability ) {
			if ( is_string( $capability ) && '' !== $capability ) {
				$capabilities[] = $capability;
			}
		}
	}

	return array_values( array_unique( $capabilities ) );
}

/**
 * Devolve a lista de capabilities obsoletas a limpar em upgrades.
 *
 * @return string[]
 */
function nomia_cpt_get_obsolete_custom_capabilities() {
	return array(
		'edit_lgm_library',
		'read_lgm_library',
		'delete_lgm_library',
		'edit_lgm_libraries',
		'edit_others_lgm_libraries',
		'publish_lgm_libraries',
		'read_private_lgm_libraries',
		'delete_lgm_libraries',
		'delete_private_lgm_libraries',
		'delete_published_lgm_libraries',
		'delete_others_lgm_libraries',
		'edit_private_lgm_libraries',
		'edit_published_lgm_libraries',
		'create_lgm_libraries',
		'edit_lgm_glossary',
		'read_lgm_glossary',
		'delete_lgm_glossary',
		'edit_lgm_glossaries',
		'edit_others_lgm_glossaries',
		'publish_lgm_glossaries',
		'read_private_lgm_glossaries',
		'delete_lgm_glossaries',
		'delete_private_lgm_glossaries',
		'delete_published_lgm_glossaries',
		'delete_others_lgm_glossaries',
		'edit_private_lgm_glossaries',
		'edit_published_lgm_glossaries',
		'create_lgm_glossaries',
		'edit_lgm_gallery',
		'read_lgm_gallery',
		'delete_lgm_gallery',
		'edit_lgm_galleries',
		'edit_others_lgm_galleries',
		'publish_lgm_galleries',
		'read_private_lgm_galleries',
		'delete_lgm_galleries',
		'delete_private_lgm_galleries',
		'delete_published_lgm_galleries',
		'delete_others_lgm_galleries',
		'edit_private_lgm_galleries',
		'edit_published_lgm_galleries',
		'create_lgm_galleries',
		'edit_lgm_tool',
		'read_lgm_tool',
		'delete_lgm_tool',
		'edit_lgm_tools',
		'edit_others_lgm_tools',
		'publish_lgm_tools',
		'read_private_lgm_tools',
		'delete_lgm_tools',
		'delete_private_lgm_tools',
		'delete_published_lgm_tools',
		'delete_others_lgm_tools',
		'edit_private_lgm_tools',
		'edit_published_lgm_tools',
		'create_lgm_tools',
		'manage_lgm_library_categories',
		'edit_lgm_library_categories',
		'delete_lgm_library_categories',
		'assign_lgm_library_categories',
		'manage_lgm_tool_categories',
		'edit_lgm_tool_categories',
		'delete_lgm_tool_categories',
		'assign_lgm_tool_categories',
		'manage_nomia_cpt_tool_categories',
		'edit_nomia_cpt_tool_categories',
		'delete_nomia_cpt_tool_categories',
		'assign_nomia_cpt_tool_categories',
	);
}

/**
 * Aplica um conjunto de capabilities aos perfis geridos.
 *
 * @param string[] $capabilities Lista de capabilities.
 * @param string   $method       Metodo do objeto role a invocar.
 * @return void
 */
function nomia_cpt_apply_capabilities_to_roles( array $capabilities, $method ) {
	foreach ( nomia_cpt_get_managed_role_names() as $role_name ) {
		$role = get_role( $role_name );

		if ( ! $role || ! method_exists( $role, $method ) ) {
			continue;
		}

		foreach ( $capabilities as $capability ) {
			$role->{$method}( $capability );
		}
	}
}

/**
 * Sincroniza as capabilities do plugin com os perfis geridos.
 *
 * @return void
 */
function nomia_cpt_sync_custom_capabilities() {
	nomia_cpt_apply_capabilities_to_roles( nomia_cpt_get_all_custom_capabilities(), 'add_cap' );
}

/**
 * Remove capabilities obsoletas dos perfis geridos.
 *
 * @return void
 */
function nomia_cpt_remove_obsolete_custom_capabilities() {
	nomia_cpt_apply_capabilities_to_roles( nomia_cpt_get_obsolete_custom_capabilities(), 'remove_cap' );
}

/**
 * Remove as capabilities do plugin dos perfis geridos.
 *
 * @return void
 */
function nomia_cpt_remove_custom_capabilities() {
	nomia_cpt_apply_capabilities_to_roles(
		array_merge( nomia_cpt_get_all_custom_capabilities(), nomia_cpt_get_obsolete_custom_capabilities() ),
		'remove_cap',
	);
}
