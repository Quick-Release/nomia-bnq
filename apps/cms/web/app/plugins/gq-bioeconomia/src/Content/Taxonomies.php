<?php
/**
 * Taxonomies.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

/**
 * Nomia's taxonomies and their default terms. `PostTypes` registers them.
 */
final class Taxonomies {

	/**
	 * Devolve os tipos de conteudo do plugin que devem partilhar taxonomias globais.
	 *
	 * @return string[]
	 */
	public static function globalPostTypes() {
		$post_types = [ 'post' ];

		foreach ( PostTypes::definitions() as $post_type => $definition ) {
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
	public static function globalNames() {
		return [
			'tematicas',
			'setor_atividade',
		];
	}

	/**
	 * Devolve a configuracao declarativa das taxonomias ativas do plugin.
	 *
	 * @return array<string, array{object_type: string[], args: array<string, mixed>}>
	 */
	public static function definitions() {
		return [
			'categoria_biblioteca'   => [
				'object_type' => [ 'biblioteca' ],
				'args'        => [
					'hierarchical'      => true,
					'labels'            => [
						'name'              => __( 'Categorias da Biblioteca', 'gq-bioeconomia' ),
						'singular_name'     => __( 'Categoria da Biblioteca', 'gq-bioeconomia' ),
						'search_items'      => __( 'Pesquisar Categorias da Biblioteca', 'gq-bioeconomia' ),
						'all_items'         => __( 'Todas as Categorias da Biblioteca', 'gq-bioeconomia' ),
						'parent_item'       => __( 'Categoria Principal', 'gq-bioeconomia' ),
						'parent_item_colon' => __( 'Categoria Principal:', 'gq-bioeconomia' ),
						'edit_item'         => __( 'Editar Categoria da Biblioteca', 'gq-bioeconomia' ),
						'view_item'         => __( 'Ver Categoria da Biblioteca', 'gq-bioeconomia' ),
						'update_item'       => __( 'Atualizar Categoria da Biblioteca', 'gq-bioeconomia' ),
						'add_new_item'      => __( 'Adicionar Nova Categoria da Biblioteca', 'gq-bioeconomia' ),
						'new_item_name'     => __( 'Nome da Nova Categoria da Biblioteca', 'gq-bioeconomia' ),
						'menu_name'         => __( 'Categorias', 'gq-bioeconomia' ),
						'not_found'         => __( 'Nenhuma categoria encontrada.', 'gq-bioeconomia' ),
					],
					'show_ui'           => true,
					'show_admin_column' => true,
					'query_var'         => true,
					'show_in_rest'      => true,
					'capabilities'      => Capabilities::libraryCategories(),
					'rewrite'           => [
						'slug'       => 'categoria_biblioteca',
						'with_front' => false,
					],
				],
			],
			'tipo_evento'            => [
				'object_type' => [ 'eventos' ],
				'args'        => [
					'hierarchical'      => true,
					'labels'            => [
						'name'              => __( 'Tipos de evento', 'gq-bioeconomia' ),
						'singular_name'     => __( 'Tipo de evento', 'gq-bioeconomia' ),
						'search_items'      => __( 'Pesquisar tipos de evento', 'gq-bioeconomia' ),
						'all_items'         => __( 'Todos os tipos de evento', 'gq-bioeconomia' ),
						'parent_item'       => __( 'Tipo principal', 'gq-bioeconomia' ),
						'parent_item_colon' => __( 'Tipo principal:', 'gq-bioeconomia' ),
						'edit_item'         => __( 'Editar tipo de evento', 'gq-bioeconomia' ),
						'view_item'         => __( 'Ver tipo de evento', 'gq-bioeconomia' ),
						'update_item'       => __( 'Atualizar tipo de evento', 'gq-bioeconomia' ),
						'add_new_item'      => __( 'Adicionar novo tipo de evento', 'gq-bioeconomia' ),
						'new_item_name'     => __( 'Nome do novo tipo de evento', 'gq-bioeconomia' ),
						'menu_name'         => __( 'Tipo de evento', 'gq-bioeconomia' ),
						'not_found'         => __( 'Nenhum tipo de evento encontrado.', 'gq-bioeconomia' ),
					],
					'show_ui'           => true,
					'show_admin_column' => true,
					'query_var'         => true,
					'show_in_rest'      => true,
					'rewrite'           => [
						'slug'       => 'tipo_evento',
						'with_front' => false,
					],
				],
			],
			'tematicas'              => [
				'object_type' => self::globalPostTypes(),
				'args'        => [
					'hierarchical'      => true,
					'labels'            => [
						'name'              => __( 'Temáticas', 'gq-bioeconomia' ),
						'singular_name'     => __( 'Temática', 'gq-bioeconomia' ),
						'search_items'      => __( 'Pesquisar Temáticas', 'gq-bioeconomia' ),
						'all_items'         => __( 'Todas as Temáticas', 'gq-bioeconomia' ),
						'parent_item'       => __( 'Temática Principal', 'gq-bioeconomia' ),
						'parent_item_colon' => __( 'Temática Principal:', 'gq-bioeconomia' ),
						'edit_item'         => __( 'Editar Temática', 'gq-bioeconomia' ),
						'view_item'         => __( 'Ver Temática', 'gq-bioeconomia' ),
						'update_item'       => __( 'Atualizar Temática', 'gq-bioeconomia' ),
						'add_new_item'      => __( 'Adicionar Nova Temática', 'gq-bioeconomia' ),
						'new_item_name'     => __( 'Nome da Nova Temática', 'gq-bioeconomia' ),
						'menu_name'         => __( 'Temáticas', 'gq-bioeconomia' ),
						'not_found'         => __( 'Nenhuma temática encontrada.', 'gq-bioeconomia' ),
					],
					'show_ui'           => true,
					'show_admin_column' => true,
					'query_var'         => true,
					'show_in_rest'      => true,
					'rewrite'           => [
						'slug'       => 'tematica-indicadores',
						'with_front' => false,
					],
				],
			],
			'setor_atividade'        => [
				'object_type' => self::globalPostTypes(),
				'args'        => [
					'hierarchical'        => true,
					'labels'              => [
						'name'              => __( 'Setores de Atividade', 'gq-bioeconomia' ),
						'singular_name'     => __( 'Setor de Atividade', 'gq-bioeconomia' ),
						'search_items'      => __( 'Pesquisar Setores de Atividade', 'gq-bioeconomia' ),
						'all_items'         => __( 'Todos os Setores de Atividade', 'gq-bioeconomia' ),
						'parent_item'       => __( 'Setor Principal', 'gq-bioeconomia' ),
						'parent_item_colon' => __( 'Setor Principal:', 'gq-bioeconomia' ),
						'edit_item'         => __( 'Editar Setor de Atividade', 'gq-bioeconomia' ),
						'view_item'         => __( 'Ver Setor de Atividade', 'gq-bioeconomia' ),
						'update_item'       => __( 'Atualizar Setor de Atividade', 'gq-bioeconomia' ),
						'add_new_item'      => __( 'Adicionar Novo Setor de Atividade', 'gq-bioeconomia' ),
						'new_item_name'     => __( 'Nome do Novo Setor de Atividade', 'gq-bioeconomia' ),
						'menu_name'         => __( 'Setor de Atividade', 'gq-bioeconomia' ),
						'not_found'         => __( 'Nenhum setor de atividade encontrado.', 'gq-bioeconomia' ),
					],
					'show_ui'             => true,
					'show_admin_column'   => true,
					'query_var'           => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'SetorAtividade',
					'graphql_plural_name' => 'SetoresAtividade',
					'rewrite'             => [
						'slug'       => 'setor-atividade',
						'with_front' => false,
					],
				],
			],
			'categoria_oportunidade' => [
				'object_type' => [ 'oportunidades' ],
				'args'        => [
					'hierarchical'      => true,
					'labels'            => [
						'name'              => __( 'Categorias de Oportunidades', 'gq-bioeconomia' ),
						'singular_name'     => __( 'Categoria de Oportunidade', 'gq-bioeconomia' ),
						'search_items'      => __( 'Pesquisar Categorias de Oportunidades', 'gq-bioeconomia' ),
						'all_items'         => __( 'Todas as Categorias de Oportunidades', 'gq-bioeconomia' ),
						'parent_item'       => __( 'Categoria Principal', 'gq-bioeconomia' ),
						'parent_item_colon' => __( 'Categoria Principal:', 'gq-bioeconomia' ),
						'edit_item'         => __( 'Editar Categoria de Oportunidade', 'gq-bioeconomia' ),
						'view_item'         => __( 'Ver Categoria de Oportunidade', 'gq-bioeconomia' ),
						'update_item'       => __( 'Atualizar Categoria de Oportunidade', 'gq-bioeconomia' ),
						'add_new_item'      => __( 'Adicionar Nova Categoria de Oportunidade', 'gq-bioeconomia' ),
						'new_item_name'     => __( 'Nome da Nova Categoria de Oportunidade', 'gq-bioeconomia' ),
						'menu_name'         => __( 'Categorias de Oportunidades', 'gq-bioeconomia' ),
						'not_found'         => __( 'Nenhuma categoria encontrada.', 'gq-bioeconomia' ),
					],
					'show_ui'           => true,
					'show_admin_column' => true,
					'query_var'         => true,
					'show_in_rest'      => true,
					'rewrite'           => [
						'slug'       => 'categoria_oportunidade',
						'with_front' => false,
					],
				],
			],
		];
	}

	/**
	 * Regista uma taxonomia a partir da configuracao declarativa.
	 *
	 * @param string $taxonomy   Nome interno da taxonomia.
	 * @param array  $definition Configuracao declarativa.
	 * @return void
	 */
	public static function registerDefinition( $taxonomy, array $definition ) {
		register_taxonomy( $taxonomy, $definition['object_type'], $definition['args'] );
	}

	/**
	 * Regista as taxonomias ativas do plugin.
	 *
	 * @return void
	 */
	public static function registerAll() {
		foreach ( self::definitions() as $taxonomy => $definition ) {
			self::registerDefinition( $taxonomy, $definition );
		}
	}

	/**
	 * Devolve a lista de termos padrão para a taxonomia da biblioteca.
	 *
	 * @return string[]
	 */
	public static function defaultLibraryTerms() {
		return [
			'Legislação',
			'Publicações',
			'Boas práticas',
			'Newsletters',
		];
	}

	/**
	 * Devolve a lista de termos padrão para a taxonomia de oportunidades.
	 *
	 * @return string[]
	 */
	public static function defaultOpportunityTerms() {
		return [
			'Avisos',
			'Concursos',
			'Formação',
			'Prêmios',
		];
	}

	/**
	 * Insere termos padrão numa taxonomia se ainda não existirem.
	 *
	 * @param string   $taxonomy Nome interno da taxonomia.
	 * @param string[] $terms    Lista de termos padrão.
	 * @return bool
	 */
	public static function seedTerms( $taxonomy, array $terms ) {
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
				[
					'slug' => sanitize_title( $term_name ),
				],
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
	public static function seedLibraryTerms() {
		return self::seedTerms( 'categoria_biblioteca', self::defaultLibraryTerms() );
	}

	/**
	 * Insere os termos padrão da taxonomia de oportunidades se ainda não existirem.
	 *
	 * @return bool
	 */
	public static function seedOpportunityTerms() {
		return self::seedTerms( 'categoria_oportunidade', self::defaultOpportunityTerms() );
	}
}
