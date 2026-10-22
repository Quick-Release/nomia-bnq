<?php
/**
 * Custom post type registration for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve a configuracao declarativa dos tipos de conteudo do plugin.
 *
 * Biblioteca, Eventos, Recursos Educativos, Oportunidades e Ferramentas sao
 * servidos por Paginas com o mesmo caminho (/biblioteca/, /oportunidades/avisos/,
 * ...). Estes tipos nao tem arquivo, e os que tem Paginas filhas colocam os
 * seus conteudos num segmento proprio (/biblioteca/documento/<slug>/), para que
 * nodeByUri resolva esses caminhos para a Pagina e nao para o tipo de conteudo.
 *
 * @return array<string, array{labels: array<string, string>, policies?: array{global_taxonomies?: bool}, args: array<string, mixed>}>
 */
function nomia_cpt_get_post_type_definitions() {
	return array(
		'nomia_gallery'       => array(
			'labels' => array(
				'name'                  => __( 'Galerias', 'nomia-cpt' ),
				'singular_name'         => __( 'Galeria', 'nomia-cpt' ),
				'menu_name'             => __( 'Galerias', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Galeria', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Galeria', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Galeria', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Galeria', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Galeria', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Galeria', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Galerias', 'nomia-cpt' ),
				'all_items'             => __( 'Galerias', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Galerias', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma galeria encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma galeria encontrada no lixo.', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Galerias', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na galeria', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta galeria', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de galerias', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de galerias', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de galerias', 'nomia-cpt' ),
			),
			'args'   => array(
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => 'upload.php',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Galeria',
				'graphql_plural_name' => 'Galerias',
				'capability_type'     => array( 'nomia_cpt_gallery', 'nomia_cpt_galleries' ),
				'capabilities'        => nomia_cpt_get_gallery_capabilities(),
				'map_meta_cap'        => true,
				'hierarchical'        => false,
				'menu_icon'           => 'dashicons-format-gallery',
				'supports'            => array( 'title', 'revisions' ),
				'rewrite'             => false,
				'query_var'           => false,
				'delete_with_user'    => false,
			),
		),
		'biblioteca'          => array(
			'labels'   => array(
				'name'                  => __( 'Biblioteca', 'nomia-cpt' ),
				'singular_name'         => __( 'Documento', 'nomia-cpt' ),
				'menu_name'             => __( 'Biblioteca', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Documento', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Documento', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Documento', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Documento', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Documento', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Documento', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Biblioteca', 'nomia-cpt' ),
				'all_items'             => __( 'Todos os Documentos', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Biblioteca', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Documento Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum documento encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum documento encontrado no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo da Biblioteca', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no documento', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este documento', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista da biblioteca', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista da biblioteca', 'nomia-cpt' ),
				'items_list'            => __( 'Lista da biblioteca', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Biblioteca',
				'graphql_plural_name' => 'Bibliotecas',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'biblioteca/documento',
					'with_front' => false,
				),
				'capability_type'     => array( 'nomia_cpt_library', 'nomia_cpt_libraries' ),
				'capabilities'        => nomia_cpt_get_library_capabilities(),
				'map_meta_cap'        => true,
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => 20,
				'menu_icon'           => 'dashicons-book-alt',
				'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'glossario'           => array(
			'labels'   => array(
				'name'                  => __( 'Glossário', 'nomia-cpt' ),
				'singular_name'         => __( 'Termo', 'nomia-cpt' ),
				'menu_name'             => __( 'Glossário', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Termo', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Termo', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Termo', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Termo', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Termo', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Termo', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Glossário', 'nomia-cpt' ),
				'all_items'             => __( 'Todos os Termos', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Glossário', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Termo Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum termo encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum termo encontrado no lixo.', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo do Glossário', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no termo', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este termo', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista do glossário', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista do glossário', 'nomia-cpt' ),
				'items_list'            => __( 'Lista do glossário', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Glossario',
				'graphql_plural_name' => 'Glossarios',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'glossario',
					'with_front' => false,
				),
				'capability_type'     => array( 'nomia_cpt_glossary', 'nomia_cpt_glossaries' ),
				'capabilities'        => nomia_cpt_get_glossary_capabilities(),
				'map_meta_cap'        => true,
				'has_archive'         => 'glossario',
				'hierarchical'        => false,
				'menu_position'       => 21,
				'menu_icon'           => 'dashicons-editor-spellcheck',
				'supports'            => array( 'title', 'editor', 'custom-fields' ),
			),
		),
		'recursos_educativos' => array(
			'labels'   => array(
				'name'                  => __( 'Recursos Educativos', 'nomia-cpt' ),
				'singular_name'         => __( 'Recurso Educativo', 'nomia-cpt' ),
				'menu_name'             => __( 'Recursos Educativos', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Recurso Educativo', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Recurso Educativo', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Recurso Educativo', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Recurso Educativo', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Recurso Educativo', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Recurso Educativo', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Recursos Educativos', 'nomia-cpt' ),
				'all_items'             => __( 'Todos os Recursos Educativos', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Recursos Educativos', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Recurso Educativo Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum recurso educativo encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum recurso educativo encontrado no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Recursos Educativos', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no recurso educativo', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este recurso educativo', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de recursos educativos', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de recursos educativos', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de recursos educativos', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'RecursoEducativo',
				'graphql_plural_name' => 'RecursosEducativos',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'recursos-educativos',
					'with_front' => false,
				),
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => 22,
				'menu_icon'           => 'dashicons-welcome-learn-more',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'eventos'             => array(
			'labels'   => array(
				'name'                  => __( 'Eventos', 'nomia-cpt' ),
				'singular_name'         => __( 'Evento', 'nomia-cpt' ),
				'menu_name'             => __( 'Eventos', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Evento', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Evento', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Evento', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Evento', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Evento', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Evento', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Eventos', 'nomia-cpt' ),
				'all_items'             => __( 'Todos os Eventos', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Eventos', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Evento Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum evento encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum evento encontrado no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Eventos', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no evento', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este evento', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de eventos', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de eventos', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de eventos', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Evento',
				'graphql_plural_name' => 'Eventos',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'eventos',
					'with_front' => false,
				),
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => 25,
				'menu_icon'           => 'dashicons-calendar-alt',
				'template'            => array(
					array(
						'nomia/event-details',
						array(
							'lock' => array(
								'move'   => true,
								'remove' => true,
							),
						),
					),
				),
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'indicadores'         => array(
			'labels'   => array(
				'name'                  => __( 'Indicadores', 'nomia-cpt' ),
				'singular_name'         => __( 'Indicador', 'nomia-cpt' ),
				'menu_name'             => __( 'Indicadores', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Indicador', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Indicador', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Indicador', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Indicador', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Indicador', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Indicador', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Indicadores', 'nomia-cpt' ),
				'all_items'             => __( 'Todos os Indicadores', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Indicadores', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Indicador Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum indicador encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum indicador encontrado no lixo.', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Indicadores', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no indicador', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este indicador', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de indicadores', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de indicadores', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de indicadores', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Indicador',
				'graphql_plural_name' => 'Indicadores',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'indicadores',
					'with_front' => false,
				),
				'has_archive'         => 'indicadores',
				'hierarchical'        => false,
				'menu_position'       => 24,
				'menu_icon'           => 'dashicons-chart-bar',
				'supports'            => array( 'title', 'editor', 'revisions', 'custom-fields' ),
			),
		),
		'podcasts'            => array(
			'labels'   => array(
				'name'                  => __( 'Podcasts', 'nomia-cpt' ),
				'singular_name'         => __( 'Podcast', 'nomia-cpt' ),
				'menu_name'             => __( 'Podcasts', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Podcast', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Podcast', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Podcast', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Podcast', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Podcast', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Podcast', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Podcasts', 'nomia-cpt' ),
				'all_items'             => __( 'Podcasts', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Podcasts', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Podcast Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum podcast encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum podcast encontrado no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Podcasts', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no podcast', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este podcast', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de podcasts', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de podcasts', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de podcasts', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => 'upload.php',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Podcast',
				'graphql_plural_name' => 'Podcasts',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'podcasts',
					'with_front' => false,
				),
				'has_archive'         => 'podcasts',
				'hierarchical'        => false,
				'menu_position'       => 26,
				'menu_icon'           => 'dashicons-microphone',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'videos'              => array(
			'labels'   => array(
				'name'                  => __( 'Videos', 'nomia-cpt' ),
				'singular_name'         => __( 'Video', 'nomia-cpt' ),
				'menu_name'             => __( 'Videos', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Video', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Video', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Video', 'nomia-cpt' ),
				'new_item'              => __( 'Novo Video', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Video', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Video', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Videos', 'nomia-cpt' ),
				'all_items'             => __( 'Videos', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Videos', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Video Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhum video encontrado.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhum video encontrado no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Videos', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir no video', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para este video', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de videos', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de videos', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de videos', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => 'upload.php',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Video',
				'graphql_plural_name' => 'Videos',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'videos',
					'with_front' => false,
				),
				'has_archive'         => 'videos',
				'hierarchical'        => false,
				'menu_position'       => 27,
				'menu_icon'           => 'dashicons-video-alt3',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'infografias'         => array(
			'labels'   => array(
				'name'                  => __( 'Infografias', 'nomia-cpt' ),
				'singular_name'         => __( 'Infografia', 'nomia-cpt' ),
				'menu_name'             => __( 'Infografias', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Infografia', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Infografia', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Infografia', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Infografia', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Infografia', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Infografia', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Infografias', 'nomia-cpt' ),
				'all_items'             => __( 'Infografias', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Infografias', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Infografia Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma infografia encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma infografia encontrada no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Infografias', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na infografia', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta infografia', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de infografias', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de infografias', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de infografias', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => 'upload.php',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Infografia',
				'graphql_plural_name' => 'Infografias',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'infografias',
					'with_front' => false,
				),
				'has_archive'         => 'infografias',
				'hierarchical'        => false,
				'menu_position'       => 28,
				'menu_icon'           => 'dashicons-chart-pie',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'oportunidades'       => array(
			'labels'   => array(
				'name'                  => __( 'Oportunidades', 'nomia-cpt' ),
				'singular_name'         => __( 'Oportunidade', 'nomia-cpt' ),
				'menu_name'             => __( 'Oportunidades', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Oportunidade', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Oportunidade', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Oportunidade', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Oportunidade', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Oportunidade', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Oportunidade', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Oportunidades', 'nomia-cpt' ),
				'all_items'             => __( 'Todas as Oportunidades', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Oportunidades', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Oportunidade Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma oportunidade encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma oportunidade encontrada no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo de Oportunidades', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na oportunidade', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta oportunidade', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista de oportunidades', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista de oportunidades', 'nomia-cpt' ),
				'items_list'            => __( 'Lista de oportunidades', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Oportunidade',
				'graphql_plural_name' => 'Oportunidades',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'oportunidades/oportunidade',
					'with_front' => false,
				),
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => 22,
				'menu_icon'           => 'dashicons-megaphone',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'ferramentas'         => array(
			'labels'   => array(
				'name'                  => __( 'Ferramentas', 'nomia-cpt' ),
				'singular_name'         => __( 'Ferramenta', 'nomia-cpt' ),
				'menu_name'             => __( 'Ferramentas', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Ferramenta', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Ferramenta', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Ferramenta', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Ferramenta', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Ferramenta', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Ferramenta', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Ferramentas', 'nomia-cpt' ),
				'all_items'             => __( 'Todas as Ferramentas', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Ferramentas', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Ferramenta Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma ferramenta encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma ferramenta encontrada no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo das Ferramentas', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na ferramenta', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta ferramenta', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista das ferramentas', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista das ferramentas', 'nomia-cpt' ),
				'items_list'            => __( 'Lista das ferramentas', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Ferramenta',
				'graphql_plural_name' => 'Ferramentas',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'ferramentas/ferramenta',
					'with_front' => false,
				),
				'capability_type'     => array( 'nomia_cpt_tool', 'nomia_cpt_tools' ),
				'capabilities'        => nomia_cpt_get_tools_capabilities(),
				'map_meta_cap'        => true,
				'has_archive'         => false,
				'hierarchical'        => false,
				'menu_position'       => 23,
				'menu_icon'           => 'dashicons-admin-tools',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ),
			),
		),
		'plataformas'         => array(
			'labels'   => array(
				'name'                  => __( 'Plataformas', 'nomia-cpt' ),
				'singular_name'         => __( 'Plataforma', 'nomia-cpt' ),
				'menu_name'             => __( 'Plataformas', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Plataforma', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Plataforma', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Plataforma', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Plataforma', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Plataforma', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Plataforma', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Plataformas', 'nomia-cpt' ),
				'all_items'             => __( 'Plataformas', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Plataformas', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Plataforma Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma plataforma encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma plataforma encontrada no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo das Plataformas', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na plataforma', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta plataforma', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista das plataformas', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista das plataformas', 'nomia-cpt' ),
				'items_list'            => __( 'Lista das plataformas', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => 'edit.php?post_type=ferramentas',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Plataforma',
				'graphql_plural_name' => 'Plataformas',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'plataformas',
					'with_front' => false,
				),
				'capability_type'     => array( 'nomia_cpt_tool', 'nomia_cpt_tools' ),
				'capabilities'        => nomia_cpt_get_tools_capabilities(),
				'map_meta_cap'        => true,
				'has_archive'         => 'plataformas',
				'hierarchical'        => false,
				'menu_icon'           => 'dashicons-screenoptions',
				'template'            => array(
					array(
						'nomia/platform-details',
						array(
							'lock' => array(
								'move'   => true,
								'remove' => true,
							),
						),
					),
				),
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions' ),
			),
		),
		'bases_de_dados'      => array(
			'labels'   => array(
				'name'                  => __( 'Bases de Dados', 'nomia-cpt' ),
				'singular_name'         => __( 'Base de Dados', 'nomia-cpt' ),
				'menu_name'             => __( 'Bases de Dados', 'nomia-cpt' ),
				'name_admin_bar'        => __( 'Base de Dados', 'nomia-cpt' ),
				'add_new'               => __( 'Adicionar Base de Dados', 'nomia-cpt' ),
				'add_new_item'          => __( 'Adicionar Base de Dados', 'nomia-cpt' ),
				'new_item'              => __( 'Nova Base de Dados', 'nomia-cpt' ),
				'edit_item'             => __( 'Editar Base de Dados', 'nomia-cpt' ),
				'view_item'             => __( 'Ver Base de Dados', 'nomia-cpt' ),
				'view_items'            => __( 'Ver Bases de Dados', 'nomia-cpt' ),
				'all_items'             => __( 'Bases de Dados', 'nomia-cpt' ),
				'search_items'          => __( 'Pesquisar Bases de Dados', 'nomia-cpt' ),
				'parent_item_colon'     => __( 'Base de Dados Superior:', 'nomia-cpt' ),
				'not_found'             => __( 'Nenhuma base de dados encontrada.', 'nomia-cpt' ),
				'not_found_in_trash'    => __( 'Nenhuma base de dados encontrada no lixo.', 'nomia-cpt' ),
				'featured_image'        => __( 'Imagem destacada', 'nomia-cpt' ),
				'set_featured_image'    => __( 'Definir imagem destacada', 'nomia-cpt' ),
				'remove_featured_image' => __( 'Remover imagem destacada', 'nomia-cpt' ),
				'use_featured_image'    => __( 'Usar como imagem destacada', 'nomia-cpt' ),
				'archives'              => __( 'Arquivo das Bases de Dados', 'nomia-cpt' ),
				'insert_into_item'      => __( 'Inserir na base de dados', 'nomia-cpt' ),
				'uploaded_to_this_item' => __( 'Enviado para esta base de dados', 'nomia-cpt' ),
				'filter_items_list'     => __( 'Filtrar lista das bases de dados', 'nomia-cpt' ),
				'items_list_navigation' => __( 'Navegação da lista das bases de dados', 'nomia-cpt' ),
				'items_list'            => __( 'Lista das bases de dados', 'nomia-cpt' ),
			),
			'policies' => array(
				'global_taxonomies' => true,
			),
			'args'     => array(
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'show_in_menu'        => 'edit.php?post_type=ferramentas',
				'show_in_rest'        => true,
				'show_in_graphql'     => true,
				'graphql_single_name' => 'BaseDeDados',
				'graphql_plural_name' => 'BasesDeDados',
				'query_var'           => true,
				'rewrite'             => array(
					'slug'       => 'bases-de-dados',
					'with_front' => false,
				),
				'capability_type'     => array( 'nomia_cpt_tool', 'nomia_cpt_tools' ),
				'capabilities'        => nomia_cpt_get_tools_capabilities(),
				'map_meta_cap'        => true,
				'has_archive'         => 'bases-de-dados',
				'hierarchical'        => false,
				'menu_icon'           => 'dashicons-database',
				'supports'            => array( 'title', 'editor', 'thumbnail', 'revisions' ),
			),
		),
	);
}

/**
 * Regista um tipo de conteudo a partir da configuracao declarativa.
 *
 * @param string $post_type  Nome interno do tipo de conteudo.
 * @param array  $definition Configuracao do tipo de conteudo.
 * @return void
 */
function nomia_cpt_register_post_type_definition( $post_type, array $definition ) {
	$args           = $definition['args'];
	$args['labels'] = $definition['labels'];

	register_post_type( $post_type, $args );
}

/**
 * Regista os tipos de conteudo do plugin.
 *
 * @return void
 */
function nomia_cpt_register_post_types() {
	foreach ( nomia_cpt_get_post_type_definitions() as $post_type => $definition ) {
		nomia_cpt_register_post_type_definition( $post_type, $definition );
	}
}

/**
 * Devolve os tipos de conteudo do plugin que requerem imagem destacada.
 *
 * @return string[]
 */
function nomia_cpt_get_post_types_with_featured_images() {
	$post_types = array();

	foreach ( nomia_cpt_get_post_type_definitions() as $post_type => $definition ) {
		$supports = $definition['args']['supports'] ?? array();

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
function nomia_cpt_ensure_featured_image_support() {
	$post_types    = nomia_cpt_get_post_types_with_featured_images();
	$theme_support = get_theme_support( 'post-thumbnails' );

	if ( false === $theme_support ) {
		add_theme_support( 'post-thumbnails', $post_types );
		return;
	}

	$current_post_types = array();

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
function nomia_cpt_register_content_types() {
	nomia_cpt_register_post_types();
	nomia_cpt_register_taxonomies();
}
