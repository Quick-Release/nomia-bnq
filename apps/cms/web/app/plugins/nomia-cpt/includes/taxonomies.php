<?php
/**
 * Taxonomy registration for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve os tipos de conteudo do plugin que devem partilhar taxonomias globais.
 *
 * @return string[]
 */
function nomia_cpt_get_global_taxonomy_post_types() {
	$post_types = array( 'post' );

	foreach ( nomia_cpt_get_post_type_definitions() as $post_type => $definition ) {
		if ( true !== ( $definition['policies']['global_taxonomies'] ?? false ) ) {
			continue;
		}

		$post_types[] = $post_type;
	}

	return $post_types;
}

/**
 * Devolve os slugs das taxonomias globais do plugin.
 *
 * @return string[]
 */
function nomia_cpt_get_global_taxonomy_names() {
	return array(
		'tematicas',
		'setor_atividade',
	);
}

/**
 * Devolve a configuracao declarativa das taxonomias ativas do plugin.
 *
 * @return array<string, array{object_type: string[], args: array<string, mixed>}>
 */
function nomia_cpt_get_taxonomy_definitions() {
	return array(
		'categoria_biblioteca'   => array(
			'object_type' => array( 'biblioteca' ),
			'args'        => array(
				'hierarchical'        => true,
				'labels'              => array(
					'name'              => __( 'Categorias da Biblioteca', 'nomia-cpt' ),
					'singular_name'     => __( 'Categoria da Biblioteca', 'nomia-cpt' ),
					'search_items'      => __( 'Pesquisar Categorias da Biblioteca', 'nomia-cpt' ),
					'all_items'         => __( 'Todas as Categorias da Biblioteca', 'nomia-cpt' ),
					'parent_item'       => __( 'Categoria Principal', 'nomia-cpt' ),
					'parent_item_colon' => __( 'Categoria Principal:', 'nomia-cpt' ),
					'edit_item'         => __( 'Editar Categoria da Biblioteca', 'nomia-cpt' ),
					'view_item'         => __( 'Ver Categoria da Biblioteca', 'nomia-cpt' ),
					'update_item'       => __( 'Atualizar Categoria da Biblioteca', 'nomia-cpt' ),
					'add_new_item'      => __( 'Adicionar Nova Categoria da Biblioteca', 'nomia-cpt' ),
					'new_item_name'     => __( 'Nome da Nova Categoria da Biblioteca', 'nomia-cpt' ),
					'menu_name'         => __( 'Categorias', 'nomia-cpt' ),
					'not_found'         => __( 'Nenhuma categoria encontrada.', 'nomia-cpt' ),
				),
				'show_ui'             => true,
				'show_admin_column'   => true,
				'query_var'           => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'CategoriaBiblioteca',
				'graphql_plural_name' => 'CategoriasBiblioteca',
				'capabilities'        => nomia_cpt_get_library_category_capabilities(),
				'rewrite'             => array(
					'slug'       => 'categoria_biblioteca',
					'with_front' => false,
				),
			),
		),
		'tipo_evento'            => array(
			'object_type' => array( 'eventos' ),
			'args'        => array(
				'hierarchical'        => true,
				'labels'              => array(
					'name'              => __( 'Tipos de evento', 'nomia-cpt' ),
					'singular_name'     => __( 'Tipo de evento', 'nomia-cpt' ),
					'search_items'      => __( 'Pesquisar tipos de evento', 'nomia-cpt' ),
					'all_items'         => __( 'Todos os tipos de evento', 'nomia-cpt' ),
					'parent_item'       => __( 'Tipo principal', 'nomia-cpt' ),
					'parent_item_colon' => __( 'Tipo principal:', 'nomia-cpt' ),
					'edit_item'         => __( 'Editar tipo de evento', 'nomia-cpt' ),
					'view_item'         => __( 'Ver tipo de evento', 'nomia-cpt' ),
					'update_item'       => __( 'Atualizar tipo de evento', 'nomia-cpt' ),
					'add_new_item'      => __( 'Adicionar novo tipo de evento', 'nomia-cpt' ),
					'new_item_name'     => __( 'Nome do novo tipo de evento', 'nomia-cpt' ),
					'menu_name'         => __( 'Tipo de evento', 'nomia-cpt' ),
					'not_found'         => __( 'Nenhum tipo de evento encontrado.', 'nomia-cpt' ),
				),
				'show_ui'             => true,
				'show_admin_column'   => true,
				'query_var'           => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'TipoEvento',
				'graphql_plural_name' => 'TiposEvento',
				'rewrite'             => array(
					'slug'       => 'tipo_evento',
					'with_front' => false,
				),
			),
		),
		'tematicas'              => array(
			'object_type' => nomia_cpt_get_global_taxonomy_post_types(),
			'args'        => array(
				'hierarchical'        => true,
				'labels'              => array(
					'name'              => __( 'Temáticas', 'nomia-cpt' ),
					'singular_name'     => __( 'Temática', 'nomia-cpt' ),
					'search_items'      => __( 'Pesquisar Temáticas', 'nomia-cpt' ),
					'all_items'         => __( 'Todas as Temáticas', 'nomia-cpt' ),
					'parent_item'       => __( 'Temática Principal', 'nomia-cpt' ),
					'parent_item_colon' => __( 'Temática Principal:', 'nomia-cpt' ),
					'edit_item'         => __( 'Editar Temática', 'nomia-cpt' ),
					'view_item'         => __( 'Ver Temática', 'nomia-cpt' ),
					'update_item'       => __( 'Atualizar Temática', 'nomia-cpt' ),
					'add_new_item'      => __( 'Adicionar Nova Temática', 'nomia-cpt' ),
					'new_item_name'     => __( 'Nome da Nova Temática', 'nomia-cpt' ),
					'menu_name'         => __( 'Temáticas', 'nomia-cpt' ),
					'not_found'         => __( 'Nenhuma temática encontrada.', 'nomia-cpt' ),
				),
				'show_ui'             => true,
				'show_admin_column'   => true,
				'query_var'           => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Tematica',
				'graphql_plural_name' => 'Tematicas',
				'rewrite'             => array(
					'slug'       => 'tematica-indicadores',
					'with_front' => false,
				),
			),
		),
		'setor_atividade'        => array(
			'object_type' => nomia_cpt_get_global_taxonomy_post_types(),
			'args'        => array(
				'hierarchical'        => true,
				'labels'              => array(
					'name'              => __( 'Setores de Atividade', 'nomia-cpt' ),
					'singular_name'     => __( 'Setor de Atividade', 'nomia-cpt' ),
					'search_items'      => __( 'Pesquisar Setores de Atividade', 'nomia-cpt' ),
					'all_items'         => __( 'Todos os Setores de Atividade', 'nomia-cpt' ),
					'parent_item'       => __( 'Setor Principal', 'nomia-cpt' ),
					'parent_item_colon' => __( 'Setor Principal:', 'nomia-cpt' ),
					'edit_item'         => __( 'Editar Setor de Atividade', 'nomia-cpt' ),
					'view_item'         => __( 'Ver Setor de Atividade', 'nomia-cpt' ),
					'update_item'       => __( 'Atualizar Setor de Atividade', 'nomia-cpt' ),
					'add_new_item'      => __( 'Adicionar Novo Setor de Atividade', 'nomia-cpt' ),
					'new_item_name'     => __( 'Nome do Novo Setor de Atividade', 'nomia-cpt' ),
					'menu_name'         => __( 'Setor de Atividade', 'nomia-cpt' ),
					'not_found'         => __( 'Nenhum setor de atividade encontrado.', 'nomia-cpt' ),
				),
				'show_ui'             => true,
				'show_admin_column'   => true,
				'query_var'           => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'SetorAtividade',
				'graphql_plural_name' => 'SetoresAtividade',
				'rewrite'             => array(
					'slug'       => 'setor-atividade',
					'with_front' => false,
				),
			),
		),
		'categoria_oportunidade' => array(
			'object_type' => array( 'oportunidades' ),
			'args'        => array(
				'hierarchical'        => true,
				'labels'              => array(
					'name'              => __( 'Categorias de Oportunidades', 'nomia-cpt' ),
					'singular_name'     => __( 'Categoria de Oportunidade', 'nomia-cpt' ),
					'search_items'      => __( 'Pesquisar Categorias de Oportunidades', 'nomia-cpt' ),
					'all_items'         => __( 'Todas as Categorias de Oportunidades', 'nomia-cpt' ),
					'parent_item'       => __( 'Categoria Principal', 'nomia-cpt' ),
					'parent_item_colon' => __( 'Categoria Principal:', 'nomia-cpt' ),
					'edit_item'         => __( 'Editar Categoria de Oportunidade', 'nomia-cpt' ),
					'view_item'         => __( 'Ver Categoria de Oportunidade', 'nomia-cpt' ),
					'update_item'       => __( 'Atualizar Categoria de Oportunidade', 'nomia-cpt' ),
					'add_new_item'      => __( 'Adicionar Nova Categoria de Oportunidade', 'nomia-cpt' ),
					'new_item_name'     => __( 'Nome da Nova Categoria de Oportunidade', 'nomia-cpt' ),
					'menu_name'         => __( 'Categorias de Oportunidades', 'nomia-cpt' ),
					'not_found'         => __( 'Nenhuma categoria encontrada.', 'nomia-cpt' ),
				),
				'show_ui'             => true,
				'show_admin_column'   => true,
				'query_var'           => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'CategoriaOportunidade',
				'graphql_plural_name' => 'CategoriasOportunidade',
				'rewrite'             => array(
					'slug'       => 'categoria_oportunidade',
					'with_front' => false,
				),
			),
		),
	);
}

/**
 * Regista uma taxonomia a partir da configuracao declarativa.
 *
 * @param string $taxonomy   Nome interno da taxonomia.
 * @param array  $definition Configuracao declarativa.
 * @return void
 */
function nomia_cpt_register_taxonomy_definition( $taxonomy, array $definition ) {
	register_taxonomy( $taxonomy, $definition['object_type'], $definition['args'] );
}

/**
 * Regista as taxonomias ativas do plugin.
 *
 * @return void
 */
function nomia_cpt_register_taxonomies() {
	foreach ( nomia_cpt_get_taxonomy_definitions() as $taxonomy => $definition ) {
		nomia_cpt_register_taxonomy_definition( $taxonomy, $definition );
	}
}

/**
 * Devolve a lista de termos padrão para a taxonomia da biblioteca.
 *
 * @return string[]
 */
function nomia_cpt_get_default_library_terms() {
	return array(
		'Legislação',
		'Publicações',
		'Boas práticas',
		'Newsletters',
	);
}

/**
 * Devolve a lista de termos padrão para a taxonomia de oportunidades.
 *
 * @return string[]
 */
function nomia_cpt_get_default_opportunity_terms() {
	return array(
		'Avisos',
		'Concursos',
		'Formação',
		'Prêmios',
	);
}

/**
 * Insere termos padrão numa taxonomia se ainda não existirem.
 *
 * @param string   $taxonomy Nome interno da taxonomia.
 * @param string[] $terms    Lista de termos padrão.
 * @return bool
 */
function nomia_cpt_seed_default_terms( $taxonomy, array $terms ) {
	$inserted = false;

	if ( ! taxonomy_exists( $taxonomy ) ) {
		return false;
	}

	foreach ( $terms as $term_name ) {
		if ( term_exists( $term_name, $taxonomy ) ) {
			continue;
		}

		$result = wp_insert_term(
			$term_name,
			$taxonomy,
			array(
				'slug' => sanitize_title( $term_name ),
			),
		);

		if ( ! is_wp_error( $result ) ) {
			$inserted = true;
		}
	}

	return $inserted;
}

/**
 * Insere os termos padrão da taxonomia da biblioteca se ainda não existirem.
 *
 * @return bool
 */
function nomia_cpt_seed_default_library_terms() {
	return nomia_cpt_seed_default_terms( 'categoria_biblioteca', nomia_cpt_get_default_library_terms() );
}

/**
 * Insere os termos padrão da taxonomia de oportunidades se ainda não existirem.
 *
 * @return bool
 */
function nomia_cpt_seed_default_opportunity_terms() {
	return nomia_cpt_seed_default_terms( 'categoria_oportunidade', nomia_cpt_get_default_opportunity_terms() );
}
