<?php
/**
 * Admin menu.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

use GetQuick\Bioeconomia\Content\PostTypes;
use GetQuick\Bioeconomia\Content\Taxonomies;

/**
 * Keeps the tools post types and the global taxonomies in the admin menu
 * entries they belong to.
 */
final class AdminMenu {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'cleanup' ], 999 );
		add_action( 'admin_head', [ $this, 'cleanup' ] );
	}

	/**
	 * Remove entradas automáticas desnecessárias do menu Ferramentas.
	 *
	 * @return void
	 */
	public function cleanup() {
		remove_submenu_page( 'edit.php?post_type=ferramentas', 'edit.php?post_type=ferramentas' );
		remove_submenu_page( 'edit.php?post_type=ferramentas', 'post-new.php?post_type=ferramentas' );

		foreach ( self::taxonomyMenuRemovals() as $removal ) {
			self::removeSubmenuVariants( $removal['menu_slug'], $removal['submenu_slug'] );
		}
	}

	/**
	 * Remove uma entrada de submenu considerando variacoes normalizadas do slug.
	 *
	 * O WordPress armazena algumas entradas de taxonomias com "&amp;" no slug do submenu.
	 *
	 * @param string $menu_slug    Slug do menu pai.
	 * @param string $submenu_slug Slug base do submenu.
	 * @return void
	 */
	public static function removeSubmenuVariants( $menu_slug, $submenu_slug ) {
		$submenu_slug_variants = array_unique(
			[
				$submenu_slug,
				str_replace( '&', '&amp;', $submenu_slug ),
			],
		);

		foreach ( $submenu_slug_variants as $submenu_slug_variant ) {
			remove_submenu_page( $menu_slug, $submenu_slug_variant );
		}
	}

	/**
	 * Devolve as entradas de submenu da taxonomia global que devem ser removidas dos menus de CPT.
	 *
	 * @return array<int, array{menu_slug: string, submenu_slug: string}>
	 */
	public static function taxonomyMenuRemovals() {
		$removals                   = [];
		$global_taxonomy_post_types = Taxonomies::globalPostTypes();

		foreach ( Taxonomies::globalNames() as $taxonomy ) {
			foreach ( $global_taxonomy_post_types as $post_type ) {
				if ( ! is_string( $post_type ) || '' === $post_type ) {
					continue;
				}

				$menu_slug = self::postTypeMenuSlug( $post_type );

				if ( '' === $menu_slug ) {
					continue;
				}

				$removals[] = [
					'menu_slug'    => $menu_slug,
					'submenu_slug' => 'edit-tags.php?taxonomy=' . $taxonomy . '&post_type=' . $post_type,
				];
			}
		}

		return $removals;
	}

	/**
	 * Devolve o slug do menu admin associado a um tipo de conteúdo.
	 *
	 * @param string $post_type Nome interno do tipo de conteúdo.
	 * @return string
	 */
	public static function postTypeMenuSlug( $post_type ) {
		$post_type_definitions = PostTypes::definitions();
		$post_type_definition  = $post_type_definitions[ $post_type ] ?? [];
		$show_in_menu          = $post_type_definition['args']['show_in_menu'] ?? null;

		if ( is_string( $show_in_menu ) && '' !== $show_in_menu ) {
			return $show_in_menu;
		}

		if ( true === $show_in_menu ) {
			return 'edit.php?post_type=' . $post_type;
		}

		return '';
	}
}
