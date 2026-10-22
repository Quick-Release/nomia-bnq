<?php
/**
 * Content lists.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

/**
 * Ordering, filters and columns of the biblioteca and glossário admin lists.
 */
final class ContentLists {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'pre_get_posts', [ $this, 'orderLists' ] );
		add_action( 'restrict_manage_posts', [ $this, 'renderLibraryCategoryFilter' ] );
		add_filter( 'manage_biblioteca_posts_columns', [ $this, 'libraryColumns' ] );
		add_action( 'manage_biblioteca_posts_custom_column', [ $this, 'renderLibraryColumn' ], 10, 2 );
		add_filter( 'manage_glossario_posts_columns', [ $this, 'glossaryColumns' ] );
		add_action( 'manage_glossario_posts_custom_column', [ $this, 'renderGlossaryColumn' ], 10, 2 );
	}

	/**
	 * Define a ordenação padrão nas listagens do admin para os conteúdos do plugin.
	 *
	 * @param WP_Query $query Consulta do WordPress.
	 * @return void
	 */
	public function orderLists( $query ) {
		if ( ! is_admin() || ! method_exists( $query, 'is_main_query' ) || ! $query->is_main_query() ) {
			return;
		}

		$post_type     = $query->get( 'post_type' );
		$category_slug = self::selectedLibraryCategory();

		if ( 'biblioteca' === $post_type && '' !== $category_slug ) {
			$query->set(
				'tax_query',
				[
					[
						'taxonomy' => 'categoria_biblioteca',
						'field'    => 'slug',
						'terms'    => $category_slug,
					],
				],
			);
		}

		if ( ! in_array( $post_type, [ 'biblioteca', 'glossario' ], true ) ) {
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
	public static function selectedLibraryCategory() {
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
	public function renderLibraryCategoryFilter() {
		global $typenow;

		if ( ! is_admin() || 'biblioteca' !== $typenow || ! current_user_can( 'edit_gq_bioeconomia_libraries' ) ) {
			return;
		}

		wp_dropdown_categories(
			[
				'show_option_all' => __( 'Todas as categorias', 'gq-bioeconomia' ),
				'taxonomy'        => 'categoria_biblioteca',
				'name'            => 'categoria_biblioteca',
				'orderby'         => 'name',
				'selected'        => self::selectedLibraryCategory(),
				'show_count'      => true,
				'hide_empty'      => false,
				'value_field'     => 'slug',
			],
		);
	}

	/**
	 * Devolve as colunas da listagem da biblioteca.
	 *
	 * @param array<string, string> $columns Colunas atuais.
	 * @return array<string, string>
	 */
	public function libraryColumns( $columns ) {
		$new_columns = [];

		foreach ( $columns as $key => $label ) {
			if ( 'date' === $key ) {
				continue;
			}

			$new_columns[ $key ] = $label;

			if ( 'title' === $key ) {
				$new_columns['gq_bioeconomia_library_categories'] = __( 'Categorias', 'gq-bioeconomia' );
				$new_columns['gq_bioeconomia_library_excerpt']    = __( 'Resumo', 'gq-bioeconomia' );
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
	public function renderLibraryColumn( $column, $post_id ) {
		if ( 'gq_bioeconomia_thumbnail' === $column ) {
			$thumbnail = get_the_post_thumbnail( $post_id, [ 60, 60 ] );

			echo $thumbnail ? wp_kses_post( $thumbnail ) : esc_html__( 'Sem imagem', 'gq-bioeconomia' );
			return;
		}

		if ( 'gq_bioeconomia_library_categories' === $column ) {
			$terms = get_the_term_list( $post_id, 'categoria_biblioteca', '', ', ' );

			echo $terms ? wp_kses_post( $terms ) : esc_html__( 'Sem categorias', 'gq-bioeconomia' );
			return;
		}

		if ( 'gq_bioeconomia_library_excerpt' === $column ) {
			echo esc_html( wp_trim_words( get_the_excerpt( $post_id ), 18, '...' ) );
		}
	}

	/**
	 * Devolve as colunas da listagem do glossário.
	 *
	 * @param array<string, string> $columns Colunas atuais.
	 * @return array<string, string>
	 */
	public function glossaryColumns( $columns ) {
		$new_columns = [];

		foreach ( $columns as $key => $label ) {
			$new_columns[ $key ] = $label;

			if ( 'title' === $key ) {
				$new_columns['gq_bioeconomia_glossary_slug'] = __( 'Slug', 'gq-bioeconomia' );
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
	public function renderGlossaryColumn( $column, $post_id ) {
		if ( 'gq_bioeconomia_glossary_slug' !== $column ) {
			return;
		}

		echo esc_html( get_post_field( 'post_name', $post_id ) );
	}
}
