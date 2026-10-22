<?php
/**
 * Post types.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

/**
 * Nomia's custom post types.
 */
final class PostTypes {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ self::class, 'registerContentTypes' ] );
		add_action( 'after_setup_theme', [ $this, 'ensureFeaturedImageSupport' ] );
	}

	/**
	 * Devolve a configuracao declarativa dos tipos de conteudo do plugin.
	 *
	 * @return array<string, array{labels: array<string, string>, policies?: array{global_taxonomies?: bool}, args: array<string, mixed>}>
	 */
	public static function definitions() {
		return [
			'gq_bio_gallery'      => [
				'labels' => [
					'name'                  => __( 'Galerias', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Galeria', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Galerias', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Galeria', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Galeria', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Galeria', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Galeria', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Galeria', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Galeria', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Galerias', 'gq-bioeconomia' ),
					'all_items'             => __( 'Galerias', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Galerias', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma galeria encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma galeria encontrada no lixo.', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Galerias', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na galeria', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta galeria', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de galerias', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de galerias', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de galerias', 'gq-bioeconomia' ),
				],
				'args'   => [
					'public'              => false,
					'publicly_queryable'  => false,
					'exclude_from_search' => true,
					'show_ui'             => true,
					'show_in_menu'        => 'upload.php',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Galeria',
					'graphql_plural_name' => 'Galerias',
					'capability_type'     => [ 'gq_bioeconomia_gallery', 'gq_bioeconomia_galleries' ],
					'capabilities'        => Capabilities::gallery(),
					'map_meta_cap'        => true,
					'hierarchical'        => false,
					'menu_icon'           => 'dashicons-format-gallery',
					'supports'            => [ 'title', 'revisions' ],
					'rewrite'             => false,
					'query_var'           => false,
					'delete_with_user'    => false,
				],
			],
			'biblioteca'          => [
				'labels'   => [
					'name'                  => __( 'Biblioteca', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Documento', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Biblioteca', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Documento', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Documento', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Documento', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Documento', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Documento', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Documento', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Biblioteca', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todos os Documentos', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Biblioteca', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Documento Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum documento encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum documento encontrado no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo da Biblioteca', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no documento', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este documento', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista da biblioteca', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista da biblioteca', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista da biblioteca', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Biblioteca',
					'graphql_plural_name' => 'Bibliotecas',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'biblioteca',
						'with_front' => false,
					],
					'capability_type'     => [ 'gq_bioeconomia_library', 'gq_bioeconomia_libraries' ],
					'capabilities'        => Capabilities::library(),
					'map_meta_cap'        => true,
					'has_archive'         => 'biblioteca',
					'hierarchical'        => false,
					'menu_position'       => 20,
					'menu_icon'           => 'dashicons-book-alt',
					'supports'            => [ 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'glossario'           => [
				'labels'   => [
					'name'                  => __( 'Glossário', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Termo', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Glossário', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Termo', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Termo', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Termo', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Termo', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Termo', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Termo', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Glossário', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todos os Termos', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Glossário', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Termo Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum termo encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum termo encontrado no lixo.', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo do Glossário', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no termo', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este termo', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista do glossário', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista do glossário', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista do glossário', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Glossario',
					'graphql_plural_name' => 'Glossarios',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'glossario',
						'with_front' => false,
					],
					'capability_type'     => [ 'gq_bioeconomia_glossary', 'gq_bioeconomia_glossaries' ],
					'capabilities'        => Capabilities::glossary(),
					'map_meta_cap'        => true,
					'has_archive'         => 'glossario',
					'hierarchical'        => false,
					'menu_position'       => 21,
					'menu_icon'           => 'dashicons-editor-spellcheck',
					'supports'            => [ 'title', 'editor', 'custom-fields' ],
				],
			],
			'recursos_educativos' => [
				'labels'   => [
					'name'                  => __( 'Recursos Educativos', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Recurso Educativo', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Recursos Educativos', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Recurso Educativo', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Recurso Educativo', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Recurso Educativo', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Recurso Educativo', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Recurso Educativo', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Recurso Educativo', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Recursos Educativos', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todos os Recursos Educativos', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Recursos Educativos', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Recurso Educativo Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum recurso educativo encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum recurso educativo encontrado no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Recursos Educativos', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no recurso educativo', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este recurso educativo', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de recursos educativos', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de recursos educativos', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de recursos educativos', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'RecursoEducativo',
					'graphql_plural_name' => 'RecursosEducativos',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'recursos-educativos',
						'with_front' => false,
					],
					'has_archive'         => 'recursos-educativos',
					'hierarchical'        => false,
					'menu_position'       => 22,
					'menu_icon'           => 'dashicons-welcome-learn-more',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'eventos'             => [
				'labels'   => [
					'name'                  => __( 'Eventos', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Evento', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Eventos', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Evento', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Evento', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Evento', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Evento', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Evento', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Evento', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Eventos', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todos os Eventos', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Eventos', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Evento Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum evento encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum evento encontrado no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Eventos', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no evento', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este evento', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de eventos', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de eventos', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de eventos', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Evento',
					'graphql_plural_name' => 'Eventos',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'eventos',
						'with_front' => false,
					],
					'has_archive'         => 'eventos',
					'hierarchical'        => false,
					'menu_position'       => 25,
					'menu_icon'           => 'dashicons-calendar-alt',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'indicadores'         => [
				'labels'   => [
					'name'                  => __( 'Indicadores', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Indicador', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Indicadores', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Indicador', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Indicador', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Indicador', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Indicador', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Indicador', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Indicador', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Indicadores', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todos os Indicadores', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Indicadores', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Indicador Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum indicador encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum indicador encontrado no lixo.', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Indicadores', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no indicador', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este indicador', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de indicadores', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de indicadores', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de indicadores', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Indicador',
					'graphql_plural_name' => 'Indicadores',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'indicadores',
						'with_front' => false,
					],
					'has_archive'         => 'indicadores',
					'hierarchical'        => false,
					'menu_position'       => 24,
					'menu_icon'           => 'dashicons-chart-bar',
					'supports'            => [ 'title', 'editor', 'revisions', 'custom-fields' ],
				],
			],
			'podcasts'            => [
				'labels'   => [
					'name'                  => __( 'Podcasts', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Podcast', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Podcasts', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Podcast', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Podcast', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Podcast', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Podcast', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Podcast', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Podcast', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Podcasts', 'gq-bioeconomia' ),
					'all_items'             => __( 'Podcasts', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Podcasts', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Podcast Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum podcast encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum podcast encontrado no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Podcasts', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no podcast', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este podcast', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de podcasts', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de podcasts', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de podcasts', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => 'upload.php',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Podcast',
					'graphql_plural_name' => 'Podcasts',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'podcasts',
						'with_front' => false,
					],
					'has_archive'         => 'podcasts',
					'hierarchical'        => false,
					'menu_position'       => 26,
					'menu_icon'           => 'dashicons-microphone',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'videos'              => [
				'labels'   => [
					'name'                  => __( 'Videos', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Video', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Videos', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Video', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Video', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Video', 'gq-bioeconomia' ),
					'new_item'              => __( 'Novo Video', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Video', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Video', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Videos', 'gq-bioeconomia' ),
					'all_items'             => __( 'Videos', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Videos', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Video Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhum video encontrado.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhum video encontrado no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Videos', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir no video', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para este video', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de videos', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de videos', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de videos', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => 'upload.php',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Video',
					'graphql_plural_name' => 'Videos',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'videos',
						'with_front' => false,
					],
					'has_archive'         => 'videos',
					'hierarchical'        => false,
					'menu_position'       => 27,
					'menu_icon'           => 'dashicons-video-alt3',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'infografias'         => [
				'labels'   => [
					'name'                  => __( 'Infografias', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Infografia', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Infografias', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Infografia', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Infografia', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Infografia', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Infografia', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Infografia', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Infografia', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Infografias', 'gq-bioeconomia' ),
					'all_items'             => __( 'Infografias', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Infografias', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Infografia Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma infografia encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma infografia encontrada no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Infografias', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na infografia', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta infografia', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de infografias', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de infografias', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de infografias', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => 'upload.php',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Infografia',
					'graphql_plural_name' => 'Infografias',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'infografias',
						'with_front' => false,
					],
					'has_archive'         => 'infografias',
					'hierarchical'        => false,
					'menu_position'       => 28,
					'menu_icon'           => 'dashicons-chart-pie',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'oportunidades'       => [
				'labels'   => [
					'name'                  => __( 'Oportunidades', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Oportunidade', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Oportunidades', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Oportunidade', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Oportunidade', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Oportunidade', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Oportunidade', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Oportunidade', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Oportunidade', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Oportunidades', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todas as Oportunidades', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Oportunidades', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Oportunidade Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma oportunidade encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma oportunidade encontrada no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo de Oportunidades', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na oportunidade', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta oportunidade', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista de oportunidades', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista de oportunidades', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista de oportunidades', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Oportunidade',
					'graphql_plural_name' => 'Oportunidades',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'oportunidades',
						'with_front' => false,
					],
					'has_archive'         => 'oportunidades',
					'hierarchical'        => false,
					'menu_position'       => 22,
					'menu_icon'           => 'dashicons-megaphone',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'ferramentas'         => [
				'labels'   => [
					'name'                  => __( 'Ferramentas', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Ferramenta', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Ferramentas', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Ferramenta', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Ferramenta', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Ferramenta', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Ferramenta', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Ferramenta', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Ferramenta', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Ferramentas', 'gq-bioeconomia' ),
					'all_items'             => __( 'Todas as Ferramentas', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Ferramentas', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Ferramenta Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma ferramenta encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma ferramenta encontrada no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo das Ferramentas', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na ferramenta', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta ferramenta', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista das ferramentas', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista das ferramentas', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista das ferramentas', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Ferramenta',
					'graphql_plural_name' => 'Ferramentas',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'ferramentas',
						'with_front' => false,
					],
					'capability_type'     => [ 'gq_bioeconomia_tool', 'gq_bioeconomia_tools' ],
					'capabilities'        => Capabilities::tools(),
					'map_meta_cap'        => true,
					'has_archive'         => 'ferramentas',
					'hierarchical'        => false,
					'menu_position'       => 23,
					'menu_icon'           => 'dashicons-admin-tools',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'plataformas'         => [
				'labels'   => [
					'name'                  => __( 'Plataformas', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Plataforma', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Plataformas', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Plataforma', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Plataforma', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Plataforma', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Plataforma', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Plataforma', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Plataforma', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Plataformas', 'gq-bioeconomia' ),
					'all_items'             => __( 'Plataformas', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Plataformas', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Plataforma Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma plataforma encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma plataforma encontrada no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo das Plataformas', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na plataforma', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta plataforma', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista das plataformas', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista das plataformas', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista das plataformas', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => 'edit.php?post_type=ferramentas',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'Plataforma',
					'graphql_plural_name' => 'Plataformas',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'plataformas',
						'with_front' => false,
					],
					'capability_type'     => [ 'gq_bioeconomia_tool', 'gq_bioeconomia_tools' ],
					'capabilities'        => Capabilities::tools(),
					'map_meta_cap'        => true,
					'has_archive'         => 'plataformas',
					'hierarchical'        => false,
					'menu_icon'           => 'dashicons-screenoptions',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ],
				],
			],
			'bases_de_dados'      => [
				'labels'   => [
					'name'                  => __( 'Bases de Dados', 'gq-bioeconomia' ),
					'singular_name'         => __( 'Base de Dados', 'gq-bioeconomia' ),
					'menu_name'             => __( 'Bases de Dados', 'gq-bioeconomia' ),
					'name_admin_bar'        => __( 'Base de Dados', 'gq-bioeconomia' ),
					'add_new'               => __( 'Adicionar Base de Dados', 'gq-bioeconomia' ),
					'add_new_item'          => __( 'Adicionar Base de Dados', 'gq-bioeconomia' ),
					'new_item'              => __( 'Nova Base de Dados', 'gq-bioeconomia' ),
					'edit_item'             => __( 'Editar Base de Dados', 'gq-bioeconomia' ),
					'view_item'             => __( 'Ver Base de Dados', 'gq-bioeconomia' ),
					'view_items'            => __( 'Ver Bases de Dados', 'gq-bioeconomia' ),
					'all_items'             => __( 'Bases de Dados', 'gq-bioeconomia' ),
					'search_items'          => __( 'Pesquisar Bases de Dados', 'gq-bioeconomia' ),
					'parent_item_colon'     => __( 'Base de Dados Superior:', 'gq-bioeconomia' ),
					'not_found'             => __( 'Nenhuma base de dados encontrada.', 'gq-bioeconomia' ),
					'not_found_in_trash'    => __( 'Nenhuma base de dados encontrada no lixo.', 'gq-bioeconomia' ),
					'featured_image'        => __( 'Imagem destacada', 'gq-bioeconomia' ),
					'set_featured_image'    => __( 'Definir imagem destacada', 'gq-bioeconomia' ),
					'remove_featured_image' => __( 'Remover imagem destacada', 'gq-bioeconomia' ),
					'use_featured_image'    => __( 'Usar como imagem destacada', 'gq-bioeconomia' ),
					'archives'              => __( 'Arquivo das Bases de Dados', 'gq-bioeconomia' ),
					'insert_into_item'      => __( 'Inserir na base de dados', 'gq-bioeconomia' ),
					'uploaded_to_this_item' => __( 'Enviado para esta base de dados', 'gq-bioeconomia' ),
					'filter_items_list'     => __( 'Filtrar lista das bases de dados', 'gq-bioeconomia' ),
					'items_list_navigation' => __( 'Navegação da lista das bases de dados', 'gq-bioeconomia' ),
					'items_list'            => __( 'Lista das bases de dados', 'gq-bioeconomia' ),
				],
				'policies' => [
					'global_taxonomies' => true,
				],
				'args'     => [
					'public'              => true,
					'publicly_queryable'  => true,
					'show_ui'             => true,
					'show_in_menu'        => 'edit.php?post_type=ferramentas',
					'show_in_rest'        => true,
					'show_in_graphql'     => true,
					'graphql_single_name' => 'BaseDeDados',
					'graphql_plural_name' => 'BasesDeDados',
					'query_var'           => true,
					'rewrite'             => [
						'slug'       => 'bases-de-dados',
						'with_front' => false,
					],
					'capability_type'     => [ 'gq_bioeconomia_tool', 'gq_bioeconomia_tools' ],
					'capabilities'        => Capabilities::tools(),
					'map_meta_cap'        => true,
					'has_archive'         => 'bases-de-dados',
					'hierarchical'        => false,
					'menu_icon'           => 'dashicons-database',
					'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions' ],
				],
			],
		];
	}

	/**
	 * Regista um tipo de conteudo a partir da configuracao declarativa.
	 *
	 * @param string $post_type  Nome interno do tipo de conteudo.
	 * @param array  $definition Configuracao do tipo de conteudo.
	 * @return void
	 */
	public static function registerDefinition( $post_type, array $definition ) {
		$args           = $definition['args'];
		$args['labels'] = $definition['labels'];

		register_post_type( $post_type, $args );
	}

	/**
	 * Regista os tipos de conteudo do plugin.
	 *
	 * @return void
	 */
	public static function registerAll() {
		foreach ( self::definitions() as $post_type => $definition ) {
			self::registerDefinition( $post_type, $definition );
		}
	}

	/**
	 * Devolve os tipos de conteudo do plugin que requerem imagem destacada.
	 *
	 * @return string[]
	 */
	public static function withFeaturedImages() {
		$post_types = [];

		foreach ( self::definitions() as $post_type => $definition ) {
			$supports = $definition['args']['supports'] ?? [];

			if ( in_array( 'thumbnail', $supports, true ) ) {
				$post_types[] = $post_type;
			}
		}

		return $post_types;
	}

	/**
	 * Garante que o tema permite imagem destacada para os tipos de conteudo do plugin.
	 *
	 * @return void
	 */
	public function ensureFeaturedImageSupport() {
		$post_types    = self::withFeaturedImages();
		$theme_support = get_theme_support( 'post-thumbnails' );

		if ( false === $theme_support ) {
			add_theme_support( 'post-thumbnails', $post_types );
			return;
		}

		$current_post_types = [];

		if ( isset( $theme_support[0] ) && is_array( $theme_support[0] ) ) {
			$current_post_types = $theme_support[0];
		}

		if ( empty( $current_post_types ) ) {
			return;
		}

		$merged_post_types = array_values( array_unique( array_merge( $current_post_types, $post_types ) ) );

		if ( array_values( $current_post_types ) === $merged_post_types ) {
			return;
		}

		add_theme_support( 'post-thumbnails', $merged_post_types );
	}

	/**
	 * Regista os tipos de conteudo e taxonomias do plugin.
	 *
	 * @return void
	 */
	public static function registerContentTypes() {
		self::registerAll();
		Taxonomies::registerAll();
	}
}
