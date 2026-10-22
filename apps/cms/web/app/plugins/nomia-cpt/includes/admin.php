<?php
/**
 * Admin behavior for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Carrega o text domain do plugin.
 *
 * @return void
 */
function nomia_cpt_load_textdomain() {
	load_plugin_textdomain( 'nomia-cpt', false, dirname( plugin_basename( NOMIA_CPT_PLUGIN_FILE ) ) . '/languages' );
}

/**
 * Define a ordenação padrão nas listagens do admin para os conteúdos do plugin.
 *
 * @param WP_Query $query Consulta do WordPress.
 * @return void
 */
function nomia_cpt_order_admin_content_lists( $query ) {
	if ( ! is_admin() || ! method_exists( $query, 'is_main_query' ) || ! $query->is_main_query() ) {
		return;
	}

	$post_type     = $query->get( 'post_type' );
	$category_slug = nomia_cpt_get_selected_library_category_slug();

	if ( 'biblioteca' === $post_type && '' !== $category_slug ) {
		$query->set(
			'tax_query',
			array(
				array(
					'taxonomy' => 'categoria_biblioteca',
					'field'    => 'slug',
					'terms'    => $category_slug,
				),
			),
		);
	}

	if ( ! in_array( $post_type, array( 'biblioteca', 'glossario' ), true ) ) {
		return;
	}

	if ( $query->get( 'orderby' ) ) {
		return;
	}

	$query->set( 'orderby', 'title' );
	$query->set( 'order', 'ASC' );
}

/**
 * Devolve o slug da categoria selecionada no filtro do admin.
 *
 * @return string
 */
function nomia_cpt_get_selected_library_category_slug() {
	// This query argument filters an admin list and does not trigger a state change.
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	if ( ! isset( $_GET['categoria_biblioteca'] ) ) {
		return '';
	}

	$category_slug = sanitize_title( wp_unslash( $_GET['categoria_biblioteca'] ) );
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	return $category_slug;
}

/**
 * Renderiza o filtro de categorias na listagem da biblioteca.
 *
 * @return void
 */
function nomia_cpt_render_library_category_filter() {
	global $typenow;

	if ( ! is_admin() || 'biblioteca' !== $typenow || ! current_user_can( 'edit_nomia_cpt_libraries' ) ) {
		return;
	}

	wp_dropdown_categories(
		array(
			'show_option_all' => __( 'Todas as categorias', 'nomia-cpt' ),
			'taxonomy'        => 'categoria_biblioteca',
			'name'            => 'categoria_biblioteca',
			'orderby'         => 'name',
			'selected'        => nomia_cpt_get_selected_library_category_slug(),
			'show_count'      => true,
			'hide_empty'      => false,
			'value_field'     => 'slug',
		),
	);
}

/**
 * Remove entradas automáticas desnecessárias do menu Ferramentas.
 *
 * @return void
 */
function nomia_cpt_cleanup_tools_admin_menu() {
	remove_submenu_page( 'edit.php?post_type=ferramentas', 'edit.php?post_type=ferramentas' );
	remove_submenu_page( 'edit.php?post_type=ferramentas', 'post-new.php?post_type=ferramentas' );

	foreach ( nomia_cpt_get_taxonomy_menu_removals() as $removal ) {
		nomia_cpt_remove_submenu_page_variants( $removal['menu_slug'], $removal['submenu_slug'] );
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
function nomia_cpt_remove_submenu_page_variants( $menu_slug, $submenu_slug ) {
	$submenu_slug_variants = array_unique(
		array(
			$submenu_slug,
			str_replace( '&', '&amp;', $submenu_slug ),
		),
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
function nomia_cpt_get_taxonomy_menu_removals() {
	$removals                   = array();
	$global_taxonomy_post_types = nomia_cpt_get_global_taxonomy_post_types();

	foreach ( nomia_cpt_get_global_taxonomy_names() as $taxonomy ) {
		foreach ( $global_taxonomy_post_types as $post_type ) {
			if ( ! is_string( $post_type ) || '' === $post_type ) {
				continue;
			}

			$menu_slug = nomia_cpt_get_post_type_menu_slug( $post_type );

			if ( '' === $menu_slug ) {
				continue;
			}

			$removals[] = array(
				'menu_slug'    => $menu_slug,
				'submenu_slug' => 'edit-tags.php?taxonomy=' . $taxonomy . '&post_type=' . $post_type,
			);
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
function nomia_cpt_get_post_type_menu_slug( $post_type ) {
	$post_type_definitions = nomia_cpt_get_post_type_definitions();
	$post_type_definition  = $post_type_definitions[ $post_type ] ?? array();
	$show_in_menu          = $post_type_definition['args']['show_in_menu'] ?? null;

	if ( is_string( $show_in_menu ) && '' !== $show_in_menu ) {
		return $show_in_menu;
	}

	if ( true === $show_in_menu ) {
		return 'edit.php?post_type=' . $post_type;
	}

	return '';
}

/**
 * Devolve as colunas da listagem da biblioteca.
 *
 * @param array<string, string> $columns Colunas atuais.
 * @return array<string, string>
 */
function nomia_cpt_get_library_admin_columns( $columns ) {
	$new_columns = array();

	foreach ( $columns as $key => $label ) {
		if ( 'date' === $key ) {
			continue;
		}

		$new_columns[ $key ] = $label;

		if ( 'title' === $key ) {
			$new_columns['nomia_cpt_library_categories'] = __( 'Categorias', 'nomia-cpt' );
			$new_columns['nomia_cpt_library_excerpt']    = __( 'Resumo', 'nomia-cpt' );
		}
	}

	return $new_columns;
}

/**
 * Renderiza o conteúdo das colunas da listagem da biblioteca.
 *
 * @param string $column  Nome da coluna.
 * @param int    $post_id ID do conteúdo.
 * @return void
 */
function nomia_cpt_render_library_admin_column( $column, $post_id ) {
	if ( 'nomia_cpt_thumbnail' === $column ) {
		$thumbnail = get_the_post_thumbnail( $post_id, array( 60, 60 ) );

		echo $thumbnail ? wp_kses_post( $thumbnail ) : esc_html__( 'Sem imagem', 'nomia-cpt' );
		return;
	}

	if ( 'nomia_cpt_library_categories' === $column ) {
		$terms = get_the_term_list( $post_id, 'categoria_biblioteca', '', ', ' );

		echo $terms ? wp_kses_post( $terms ) : esc_html__( 'Sem categorias', 'nomia-cpt' );
		return;
	}

	if ( 'nomia_cpt_library_excerpt' === $column ) {
		echo esc_html( wp_trim_words( get_the_excerpt( $post_id ), 18, '...' ) );
	}
}

/**
 * Devolve as colunas da listagem do glossário.
 *
 * @param array<string, string> $columns Colunas atuais.
 * @return array<string, string>
 */
function nomia_cpt_get_glossary_admin_columns( $columns ) {
	$new_columns = array();

	foreach ( $columns as $key => $label ) {
		$new_columns[ $key ] = $label;

		if ( 'title' === $key ) {
			$new_columns['nomia_cpt_glossary_slug'] = __( 'Slug', 'nomia-cpt' );
		}
	}

	return $new_columns;
}

/**
 * Renderiza o conteúdo das colunas da listagem do glossário.
 *
 * @param string $column  Nome da coluna.
 * @param int    $post_id ID do conteúdo.
 * @return void
 */
function nomia_cpt_render_glossary_admin_column( $column, $post_id ) {
	if ( 'nomia_cpt_glossary_slug' !== $column ) {
		return;
	}

	echo esc_html( get_post_field( 'post_name', $post_id ) );
}
