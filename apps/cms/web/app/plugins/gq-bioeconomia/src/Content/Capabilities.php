<?php
/**
 * Capabilities.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

/**
 * The capabilities of Nomia's post types and taxonomies, granted to
 * administrators and editors.
 */
final class Capabilities {

	/**
	 * Constroi um mapa de capabilities de post type a partir do radical singular e plural.
	 *
	 * @param string $singular Radical singular.
	 * @param string $plural   Radical plural.
	 * @return array<string, string>
	 */
	public static function forPostType( $singular, $plural ) {
		return [
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
		];
	}

	/**
	 * Devolve as capabilities do tipo de conteúdo Biblioteca.
	 *
	 * @return array<string, string>
	 */
	public static function library() {
		return self::forPostType( 'gq_bioeconomia_library', 'gq_bioeconomia_libraries' );
	}

	/**
	 * Devolve as capabilities do tipo de conteúdo Glossário.
	 *
	 * @return array<string, string>
	 */
	public static function glossary() {
		return self::forPostType( 'gq_bioeconomia_glossary', 'gq_bioeconomia_glossaries' );
	}

	/**
	 * Devolve as capabilities do tipo de conteúdo Ferramentas.
	 *
	 * @return array<string, string>
	 */
	public static function tools() {
		return self::forPostType( 'gq_bioeconomia_tool', 'gq_bioeconomia_tools' );
	}

	/**
	 * Devolve as capabilities do tipo de conteúdo Galerias.
	 *
	 * @return array<string, string>
	 */
	public static function gallery() {
		return self::forPostType( 'gq_bioeconomia_gallery', 'gq_bioeconomia_galleries' );
	}

	/**
	 * Devolve as capabilities da taxonomia da biblioteca.
	 *
	 * @return array<string, string>
	 */
	public static function libraryCategories() {
		return [
			'manage_terms' => 'manage_gq_bioeconomia_library_categories',
			'edit_terms'   => 'edit_gq_bioeconomia_library_categories',
			'delete_terms' => 'delete_gq_bioeconomia_library_categories',
			'assign_terms' => 'assign_gq_bioeconomia_library_categories',
		];
	}

	/**
	 * Devolve os perfis a gerir pelo plugin.
	 *
	 * @return string[]
	 */
	public static function managedRoles() {
		return [
			'administrator',
			'editor',
		];
	}

	/**
	 * Devolve a lista completa de capabilities criadas pelo plugin.
	 *
	 * @return string[]
	 */
	public static function all() {
		$capabilities = [];
		$definitions  = array_merge(
			PostTypes::definitions(),
			Taxonomies::definitions(),
		);

		foreach ( $definitions as $definition ) {
			$declared_capabilities = $definition['args']['capabilities'] ?? [];

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
	public static function obsolete() {
		return [
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
		];
	}

	/**
	 * Aplica um conjunto de capabilities aos perfis geridos.
	 *
	 * @param string[] $capabilities Lista de capabilities.
	 * @param string   $method       Metodo do objeto role a invocar.
	 * @return void
	 */
	public static function applyToRoles( array $capabilities, $method ) {
		foreach ( self::managedRoles() as $role_name ) {
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
	public static function sync() {
		self::applyToRoles( self::all(), 'add_cap' );
	}

	/**
	 * Remove capabilities obsoletas dos perfis geridos.
	 *
	 * @return void
	 */
	public static function removeObsolete() {
		self::applyToRoles( self::obsolete(), 'remove_cap' );
	}

	/**
	 * Remove as capabilities do plugin dos perfis geridos.
	 *
	 * @return void
	 */
	public static function removeAll() {
		self::applyToRoles(
			array_merge( self::all(), self::obsolete() ),
			'remove_cap',
		);
	}
}
