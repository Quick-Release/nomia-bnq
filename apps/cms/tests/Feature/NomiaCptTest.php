<?php

require_once dirname(__DIR__) . '/Support/WordPressStubs.php';
require_once dirname(__DIR__, 2) . '/web/app/plugins/nomia-cpt/nomia-cpt.php';

beforeEach(function () {
    $GLOBALS['lgm_test_state']['post_types'] = [];
    $GLOBALS['lgm_test_state']['taxonomies'] = [];
    $GLOBALS['lgm_test_state']['options'] = [];
    $GLOBALS['lgm_test_state']['terms'] = [];
    $GLOBALS['lgm_test_state']['roles'] = [];
    $GLOBALS['lgm_test_state']['posts'] = [];
    $GLOBALS['lgm_test_state']['get_posts_calls'] = [];
    unset($GLOBALS['nomia_cpt_media_cache']);
    $GLOBALS['lgm_test_state']['post_terms'] = [];
    $GLOBALS['lgm_test_state']['registered_post_meta'] = [];
    $GLOBALS['lgm_test_state']['registered_settings'] = [];
    $GLOBALS['lgm_test_state']['meta_boxes'] = [];
    $GLOBALS['lgm_test_state']['enqueued_media'] = false;
    $GLOBALS['lgm_test_state']['enqueued_scripts'] = [];
    $GLOBALS['lgm_test_state']['registered_scripts'] = [];
    $GLOBALS['lgm_test_state']['inline_scripts'] = [];
    $GLOBALS['lgm_test_state']['last_dropdown'] = [];
    $GLOBALS['lgm_test_state']['removed_submenu_pages'] = [];
    $GLOBALS['lgm_test_state']['added_submenu_pages'] = [];
    $GLOBALS['lgm_test_state']['theme_support'] = [];
    $GLOBALS['lgm_test_state']['flushed'] = false;
    $GLOBALS['lgm_test_state']['flush_count'] = 0;
    $GLOBALS['lgm_test_state']['is_admin'] = true;
    $_GET = [];
    $_POST = [];
});

test('footer settings page is registered under appearance', function () {
    nomia_cpt_register_footer_admin_page();

    expect($GLOBALS['lgm_test_state']['added_submenu_pages'])->toContain(
        [
            'parent_slug' => 'themes.php',
            'page_title' => 'Footer',
            'menu_title' => 'Footer',
            'capability' => 'edit_theme_options',
            'menu_slug' => 'nomia-footer',
            'callback' => 'nomia_cpt_render_footer_admin_page',
        ],
    );
});

test('contact settings page is registered under appearance', function () {
    nomia_cpt_register_contact_admin_page();

    expect($GLOBALS['lgm_test_state']['added_submenu_pages'])->toContain(
        [
            'parent_slug' => 'themes.php',
            'page_title' => 'Contacto',
            'menu_title' => 'Contacto',
            'capability' => 'edit_theme_options',
            'menu_slug' => 'nomia-contact',
            'callback' => 'nomia_cpt_render_contact_admin_page',
        ],
    );
});

test('footer logo option is registered and sanitized', function () {
    nomia_cpt_register_footer_settings();

    $setting = $GLOBALS['lgm_test_state']['registered_settings']['nomia_cpt_footer_logo_ids'];
    $sanitized = $setting['args']['sanitize_callback']('12,0,18,12,abc,24');

    expect($setting['group'])->toBe('nomia_cpt_footer_settings')
        ->and($setting['args']['type'])->toBe('array')
        ->and($sanitized)->toBe([ 12, 18, 24 ]);
});

test('contact option is registered and sanitized', function () {
    nomia_cpt_register_contact_settings();

    $setting = $GLOBALS['lgm_test_state']['registered_settings']['nomia_cpt_contact'];
    $sanitized = $setting['args']['sanitize_callback'](
        [
            'address' => ' Rua <b>O Século</b>, 51 ',
            'phone' => ' +351 210 000 000 ',
            'email' => ' contacto@example.test ',
            'gps_coordinates' => ' 38.7101, -9.1472 ',
        ],
    );

    expect($setting['group'])->toBe('nomia_cpt_contact_settings')
        ->and($setting['args']['type'])->toBe('array')
        ->and($sanitized)->toBe(
            [
                'address' => 'Rua O Século, 51',
                'phone' => '+351 210 000 000',
                'email' => 'contacto@example.test',
                'gps_coordinates' => '38.7101, -9.1472',
            ],
        );
});

test('contact settings page renders saved fields', function () {
    update_option(
        'nomia_cpt_contact',
        [
            'address' => 'Rua O Século, 51',
            'phone' => '+351 210 000 000',
            'email' => 'contacto@example.test',
            'gps_coordinates' => '38.7101, -9.1472',
        ],
    );

    ob_start();
    nomia_cpt_render_contact_admin_page();
    $markup = ob_get_clean();

    expect($markup)->toContain('<h1>Contacto</h1>')
        ->and($markup)->toContain('nomia_cpt_contact[address]')
        ->and($markup)->toContain('Rua O Século, 51')
        ->and($markup)->toContain('contacto@example.test');
});

test('footer settings page renders selected logos in saved order', function () {
    $GLOBALS['lgm_test_state']['posts'][ 501 ] = [
        'post_type'   => 'attachment',
        'post_title'  => 'Logo A',
        'image_src'   => 'https://example.com/logo-a.png',
        'thumbnail'   => '<img src="https://example.com/logo-a-thumb.png" alt="" />',
    ];
    $GLOBALS['lgm_test_state']['posts'][ 502 ] = [
        'post_type'   => 'attachment',
        'post_title'  => 'Logo B',
        'image_src'   => 'https://example.com/logo-b.png',
        'thumbnail'   => '<img src="https://example.com/logo-b-thumb.png" alt="" />',
    ];
    update_option('nomia_cpt_footer_logo_ids', [ 502, 501 ]);

    ob_start();
    nomia_cpt_render_footer_admin_page();
    $markup = ob_get_clean();

    expect($markup)->toContain('<h1>Footer</h1>')
        ->and($markup)->toContain('nomia_cpt_footer_logo_ids')
        ->and(strpos($markup, 'Logo B'))->toBeLessThan(strpos($markup, 'Logo A'))
        ->and($markup)->toContain('Adicionar logótipos');
});

test('footer admin assets are only enqueued on footer settings page', function () {
    nomia_cpt_enqueue_footer_admin_assets('appearance_page_nomia-footer');

    expect($GLOBALS['lgm_test_state']['enqueued_media'])->toBeTrue()
        ->and($GLOBALS['lgm_test_state']['registered_scripts'])->toHaveKey('nomia-cpt-media-picker')
        ->and($GLOBALS['lgm_test_state']['registered_scripts']['nomia-cpt-media-picker']['src'])->toContain('assets/js/media-picker.js')
        ->and($GLOBALS['lgm_test_state']['registered_scripts']['nomia-cpt-media-picker']['deps'])->toBe([ 'jquery', 'media-editor', 'media-models', 'media-views' ])
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts'])->toHaveKey('nomia-cpt-footer-admin')
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts']['nomia-cpt-footer-admin']['src'])->toContain('assets/js/footer-admin.js')
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts']['nomia-cpt-footer-admin']['deps'])->toBe([ 'nomia-cpt-media-picker' ])
        ->and($GLOBALS['lgm_test_state']['inline_scripts']['nomia-cpt-footer-admin'][0]['data'])->toContain('"removeLabel":"Remover"');
});

test('ordered media projection memoizes valid and missing IDs for the request', function () {
    $GLOBALS['lgm_test_state']['posts'][ 904 ] = [
        'post_type'      => 'attachment',
        'post_mime_type' => 'image/jpeg',
        'post_title'     => 'Imagem em cache',
        'image_src'      => 'https://example.com/cache.jpg',
        'image_width'    => 1200,
        'image_height'   => 800,
    ];

    nomia_cpt_get_ordered_media([ 904, 999 ]);
    nomia_cpt_get_ordered_media([ 999, 904 ]);

    $attachment_queries = array_values(
        array_filter(
            $GLOBALS['lgm_test_state']['get_posts_calls'],
            static fn($args) => 'attachment' === ($args['post_type'] ?? ''),
        ),
    );

    expect($attachment_queries)->toHaveCount(1);
});

test('tools admin menu removes default ferramenta and taxonomy submenu items', function () {
    nomia_cpt_cleanup_tools_admin_menu();

    $expected_removed_submenu_pages = [
        [
            'menu_slug' => 'edit.php?post_type=ferramentas',
            'submenu_slug' => 'edit.php?post_type=ferramentas',
        ],
        [
            'menu_slug' => 'edit.php?post_type=ferramentas',
            'submenu_slug' => 'post-new.php?post_type=ferramentas',
        ],
    ];

    foreach (nomia_cpt_get_taxonomy_menu_removals() as $removal) {
        $expected_removed_submenu_pages[] = $removal;
        $expected_removed_submenu_pages[] = [
            'menu_slug' => $removal['menu_slug'],
            'submenu_slug' => str_replace('&', '&amp;', $removal['submenu_slug']),
        ];
    }

    expect($GLOBALS['lgm_test_state']['removed_submenu_pages'])->toBe(
        $expected_removed_submenu_pages,
    );
});

test('global taxonomy menus come from core under posts only', function () {
    $definitions = nomia_cpt_get_taxonomy_definitions();

    foreach (nomia_cpt_get_global_taxonomy_names() as $taxonomy) {
        expect($definitions[$taxonomy]['object_type'])->toContain('post');
        expect($definitions[$taxonomy]['args']['show_ui'])->toBeTrue();
        expect($definitions[$taxonomy]['args'])->not->toHaveKey('show_in_menu');
    }

    expect(function_exists('nomia_cpt_register_global_taxonomy_menu'))->toBeFalse();
});

test('gallery image meta is registered for REST and sanitized before saving', function () {
    nomia_cpt_register_gallery_meta();

    $meta = $GLOBALS['lgm_test_state']['registered_post_meta']['nomia_gallery']['nomia_cpt_gallery_image_ids'];
    $sanitized = $meta['sanitize_callback']([ '12', 0, '18', '12', 'abc', '24' ]);

    expect($meta['type'])->toBe('array')
        ->and($meta['single'])->toBeTrue()
        ->and($meta['show_in_rest']['schema']['items']['type'])->toBe('integer')
        ->and($sanitized)->toBe([ 12, 18, 24 ]);
});

test('gallery admin assets are only enqueued on gallery editor screens', function () {
    $_GET['post_type'] = 'nomia_gallery';

    nomia_cpt_enqueue_gallery_admin_assets('post.php');

    expect($GLOBALS['lgm_test_state']['enqueued_media'])->toBeTrue()
        ->and($GLOBALS['lgm_test_state']['registered_scripts'])->toHaveKey('nomia-cpt-media-picker')
        ->and($GLOBALS['lgm_test_state']['registered_scripts']['nomia-cpt-media-picker']['src'])->toContain('assets/js/media-picker.js')
        ->and($GLOBALS['lgm_test_state']['registered_scripts']['nomia-cpt-media-picker']['deps'])->toBe([ 'jquery', 'media-editor', 'media-models', 'media-views' ])
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts'])->toHaveKey('nomia-cpt-gallery-admin')
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts']['nomia-cpt-gallery-admin']['src'])->toContain('assets/js/gallery-admin.js')
        ->and($GLOBALS['lgm_test_state']['enqueued_scripts']['nomia-cpt-gallery-admin']['deps'])->toBe([ 'nomia-cpt-media-picker' ])
        ->and($GLOBALS['lgm_test_state']['inline_scripts']['nomia-cpt-gallery-admin'][0]['data'])->toContain('Nenhuma imagem selecionada.');
});

test('content model registry declares derived policy membership', function () {
    $definitions = nomia_cpt_get_post_type_definitions();

    expect($definitions['nomia_gallery']['policies'] ?? [])->toBe([])
        ->and($definitions['biblioteca']['policies']['global_taxonomies'])->toBeTrue()
        ->and($definitions['plataformas']['policies']['global_taxonomies'])->toBeTrue()
        ->and($definitions['bases_de_dados']['policies']['global_taxonomies'])->toBeTrue()
        ->and(nomia_cpt_get_global_taxonomy_post_types())->toBe(
            [
                'post',
                'biblioteca',
                'glossario',
                'recursos_educativos',
                'eventos',
                'indicadores',
                'podcasts',
                'videos',
                'infografias',
                'oportunidades',
                'ferramentas',
                'plataformas',
                'bases_de_dados',
            ],
        )
        ->and(nomia_cpt_get_post_types_with_featured_images())->toBe(
            [
                'biblioteca',
                'recursos_educativos',
                'eventos',
                'podcasts',
                'videos',
                'infografias',
                'oportunidades',
                'ferramentas',
                'plataformas',
                'bases_de_dados',
            ],
        );
});

test('content model registry passes invariant validation', function () {
    expect(nomia_cpt_get_content_model_validation_errors())->toBe([]);
});

test('content model validation reports malformed definitions and references', function () {
    $errors = nomia_cpt_get_content_model_validation_errors(
        [
            'invalid-post-type' => [
                'labels' => [ 'name' => 'Invalid' ],
                'policies' => [ 'global_taxonomies' => true ],
                'args' => [
                    'public'              => false,
                    'show_in_rest'        => true,
                    'show_in_graphql'     => true,
                    'graphql_single_name' => '',
                    'graphql_plural_name' => '',
                    'supports'            => [],
                    'rewrite'             => [ 'slug' => 'invalid' ],
                ],
            ],
        ],
        [
            'invalid-taxonomy' => [
                'object_type' => [ 'missing-post-type' ],
                'args'        => [
                    'labels'            => [ 'name' => 'Invalid' ],
                    'hierarchical'      => true,
                    'show_ui'           => true,
                    'show_admin_column' => true,
                    'query_var'         => true,
                    'show_in_rest'      => true,
                    'rewrite'           => [ 'slug' => 'invalid' ],
                ],
            ],
        ],
    );

    foreach (
        [
            'Post type "invalid-post-type" must use a lowercase WordPress identifier of at most 20 characters.',
            'Post type "invalid-post-type" cannot opt into global taxonomies unless it is public.',
            'Post type "invalid-post-type" must declare "graphql_single_name" when GraphQL is enabled.',
            'Taxonomy "invalid-taxonomy" must use a lowercase WordPress identifier of at most 32 characters.',
            'Taxonomy "invalid-taxonomy" references unknown object type "missing-post-type".',
        ] as $error
    ) {
        expect($errors)->toContain($error);
    }
});

test('content types are registered with rest support and custom capabilities', function () {
    nomia_cpt_register_content_types();

    $library = $GLOBALS['lgm_test_state']['post_types']['biblioteca'];
    $glossary = $GLOBALS['lgm_test_state']['post_types']['glossario'];
    $gallery = $GLOBALS['lgm_test_state']['post_types']['nomia_gallery'];
    $events = $GLOBALS['lgm_test_state']['post_types']['eventos'];
    $educational_resources = $GLOBALS['lgm_test_state']['post_types']['recursos_educativos'];
    $indicadores = $GLOBALS['lgm_test_state']['post_types']['indicadores'];
    $podcasts = $GLOBALS['lgm_test_state']['post_types']['podcasts'];
    $videos = $GLOBALS['lgm_test_state']['post_types']['videos'];
    $infografias = $GLOBALS['lgm_test_state']['post_types']['infografias'];
    $event_type_taxonomy = $GLOBALS['lgm_test_state']['taxonomies']['tipo_evento'];
    $thematic_taxonomy = $GLOBALS['lgm_test_state']['taxonomies']['tematicas'];
    $activity_sector_taxonomy = $GLOBALS['lgm_test_state']['taxonomies']['setor_atividade'];
    $opportunities = $GLOBALS['lgm_test_state']['post_types']['oportunidades'];
    $platforms = $GLOBALS['lgm_test_state']['post_types']['plataformas'];
    $databases = $GLOBALS['lgm_test_state']['post_types']['bases_de_dados'];
    $taxonomy = $GLOBALS['lgm_test_state']['taxonomies']['categoria_biblioteca'];
    $opportunity_taxonomy = $GLOBALS['lgm_test_state']['taxonomies']['categoria_oportunidade'];
    $global_taxonomy_post_types = nomia_cpt_get_global_taxonomy_post_types();

    expect($library['show_in_rest'])->toBeTrue()
        ->and($library['has_archive'])->toBe('biblioteca')
        ->and($library)->not->toHaveKey('template')
        ->and($library['supports'])->toBe([ 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($library['show_in_graphql'])->toBeTrue()
        ->and($library['graphql_single_name'])->toBe('Biblioteca')
        ->and($library['capabilities']['edit_posts'])->toBe('edit_nomia_cpt_libraries')
        ->and($glossary['show_in_rest'])->toBeTrue()
        ->and($glossary['has_archive'])->toBe('glossario')
        ->and($glossary['supports'])->toBe([ 'title', 'editor', 'custom-fields' ])
        ->and($glossary['show_in_graphql'])->toBeTrue()
        ->and($glossary['graphql_single_name'])->toBe('Glossario')
        ->and($gallery['show_in_rest'])->toBeTrue()
        ->and($gallery['show_in_menu'])->toBe('upload.php')
        ->and($gallery['public'])->toBeFalse()
        ->and($gallery['labels']['all_items'])->toBe('Galerias')
        ->and($gallery['supports'])->toBe([ 'title', 'revisions' ])
        ->and($gallery['capabilities']['edit_posts'])->toBe('edit_nomia_cpt_galleries')
        ->and($events['show_in_rest'])->toBeTrue()
        ->and($events['has_archive'])->toBe('eventos')
        ->and($events)->not->toHaveKey('template')
        ->and($events['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($events['show_in_graphql'])->toBeTrue()
        ->and($educational_resources['show_in_rest'])->toBeTrue()
        ->and($educational_resources['has_archive'])->toBe('recursos-educativos')
        ->and($educational_resources['rewrite']['slug'])->toBe('recursos-educativos')
        ->and($educational_resources['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($educational_resources['show_in_graphql'])->toBeTrue()
        ->and($educational_resources['graphql_single_name'])->toBe('RecursoEducativo')
        ->and($indicadores['show_in_rest'])->toBeTrue()
        ->and($indicadores['has_archive'])->toBe('indicadores')
        ->and($indicadores['supports'])->toBe([ 'title', 'editor', 'revisions', 'custom-fields' ])
        ->and($indicadores['show_in_graphql'])->toBeTrue()
        ->and($podcasts['show_in_rest'])->toBeTrue()
        ->and($podcasts['show_in_menu'])->toBe('upload.php')
        ->and($podcasts['labels']['all_items'])->toBe('Podcasts')
        ->and($podcasts['has_archive'])->toBe('podcasts')
        ->and($podcasts['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($podcasts['show_in_graphql'])->toBeTrue()
        ->and($podcasts['graphql_single_name'])->toBe('Podcast')
        ->and($videos['show_in_rest'])->toBeTrue()
        ->and($videos['show_in_menu'])->toBe('upload.php')
        ->and($videos['labels']['all_items'])->toBe('Videos')
        ->and($videos['has_archive'])->toBe('videos')
        ->and($videos['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($videos['show_in_graphql'])->toBeTrue()
        ->and($videos['graphql_single_name'])->toBe('Video')
        ->and($infografias['show_in_rest'])->toBeTrue()
        ->and($infografias['show_in_menu'])->toBe('upload.php')
        ->and($infografias['labels']['all_items'])->toBe('Infografias')
        ->and($infografias['has_archive'])->toBe('infografias')
        ->and($infografias['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($infografias['show_in_graphql'])->toBeTrue()
        ->and($infografias['graphql_single_name'])->toBe('Infografia')
        ->and($opportunities['show_in_rest'])->toBeTrue()
        ->and($opportunities['has_archive'])->toBe('oportunidades')
        ->and($opportunities['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($opportunities['show_in_graphql'])->toBeTrue()
        ->and($opportunities['graphql_single_name'])->toBe('Oportunidade')
        ->and($platforms['show_in_rest'])->toBeTrue()
        ->and($platforms['show_in_menu'])->toBe('edit.php?post_type=ferramentas')
        ->and($platforms['labels']['all_items'])->toBe('Plataformas')
        ->and($platforms['has_archive'])->toBe('plataformas')
        ->and($platforms)->not->toHaveKey('template')
        ->and($platforms['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions', 'custom-fields' ])
        ->and($platforms['show_in_graphql'])->toBeTrue()
        ->and($platforms['graphql_single_name'])->toBe('Plataforma')
        ->and($databases['show_in_rest'])->toBeTrue()
        ->and($databases['show_in_menu'])->toBe('edit.php?post_type=ferramentas')
        ->and($databases['labels']['all_items'])->toBe('Bases de Dados')
        ->and($databases['has_archive'])->toBe('bases-de-dados')
        ->and($databases['supports'])->toBe([ 'title', 'editor', 'thumbnail', 'revisions' ])
        ->and($databases['show_in_graphql'])->toBeTrue()
        ->and($databases['graphql_single_name'])->toBe('BaseDeDados')
        ->and($taxonomy['args']['hierarchical'])->toBeTrue()
        ->and($taxonomy['args']['labels']['menu_name'])->toBe('Categorias')
        ->and($taxonomy['args']['show_in_rest'])->toBeTrue()
        ->and($taxonomy['args']['capabilities']['manage_terms'])->toBe('manage_nomia_cpt_library_categories')
        ->and($opportunity_taxonomy['args']['hierarchical'])->toBeTrue()
        ->and($opportunity_taxonomy['args']['show_in_rest'])->toBeTrue()
        ->and($event_type_taxonomy['args']['hierarchical'])->toBeTrue()
        ->and($event_type_taxonomy['args']['show_in_rest'])->toBeTrue()
        ->and($event_type_taxonomy['object_type'])->toBe([ 'eventos' ])
        ->and($thematic_taxonomy['args']['hierarchical'])->toBeTrue()
        ->and($thematic_taxonomy['args']['show_in_rest'])->toBeTrue()
        ->and($thematic_taxonomy['object_type'])->toBe($global_taxonomy_post_types)
        ->and($thematic_taxonomy['object_type'])->toContain('post')
        ->and($activity_sector_taxonomy['args']['hierarchical'])->toBeTrue()
        ->and($activity_sector_taxonomy['args']['show_in_rest'])->toBeTrue()
        ->and($activity_sector_taxonomy['args']['show_in_graphql'])->toBeTrue()
        ->and($activity_sector_taxonomy['args']['graphql_single_name'])->toBe('SetorAtividade')
        ->and($activity_sector_taxonomy['object_type'])->toBe($global_taxonomy_post_types)
        ->and($activity_sector_taxonomy['object_type'])->toContain('post');
});

test('custom capabilities follow declared model and taxonomy maps', function () {
    $capabilities = nomia_cpt_get_all_custom_capabilities();

    expect($capabilities)->toHaveCount(60)
        ->and($capabilities[0])->toBe('edit_nomia_cpt_gallery')
        ->and($capabilities[14])->toBe('edit_nomia_cpt_library')
        ->and($capabilities[28])->toBe('edit_nomia_cpt_glossary')
        ->and($capabilities[42])->toBe('edit_nomia_cpt_tool')
        ->and($capabilities[56])->toBe('manage_nomia_cpt_library_categories')
        ->and(array_unique($capabilities))->toHaveCount(count($capabilities));
});

test('featured image theme support is extended to plataformas and other thumbnail-enabled plugin content types', function () {
    $GLOBALS['lgm_test_state']['theme_support']['post-thumbnails'] = [
        [ 'post', 'page' ],
    ];

    nomia_cpt_ensure_featured_image_support();

    $theme_support = get_theme_support('post-thumbnails');

    expect($theme_support[0])->toContain('plataformas')
        ->and($theme_support[0])->toContain('bases_de_dados')
        ->and($theme_support[0])->toContain('recursos_educativos')
        ->and($theme_support[0])->toContain('ferramentas');
});

test('admin ordering defaults to alphabetical titles for plugin content types', function () {
    $fake_query = new class {
        public array $vars = [
            'post_type' => 'biblioteca',
        ];

        public function is_main_query()
        {
            return true;
        }

        public function get($key)
        {
            return $this->vars[ $key ] ?? null;
        }

        public function set($key, $value)
        {
            $this->vars[ $key ] = $value;
        }
    };

    nomia_cpt_order_admin_content_lists($fake_query);

    expect($fake_query->vars['orderby'])->toBe('title')
        ->and($fake_query->vars['order'])->toBe('ASC');
});

test('admin columns add plugin-specific metadata for both content types', function () {
    $library_columns = nomia_cpt_get_library_admin_columns(
        [
            'cb'    => '<input type="checkbox" />',
            'title' => 'Título',
            'date'  => 'Data',
        ],
    );

    $glossary_columns = nomia_cpt_get_glossary_admin_columns(
        [
            'title' => 'Título',
            'date'  => 'Data',
        ],
    );

    expect(array_keys($library_columns))->toBe(
        [
            'cb',
            'title',
            'nomia_cpt_library_categories',
            'nomia_cpt_library_excerpt',
        ],
    )
        ->and($glossary_columns['nomia_cpt_glossary_slug'])->toBe('Slug');
});

test('library admin filter renders the taxonomy dropdown and applies the selected slug', function () {
    global $typenow;

    $typenow = 'biblioteca';
    $_GET['categoria_biblioteca'] = 'newsletters';

    $fake_query = new class {
        public array $vars = [
            'post_type' => 'biblioteca',
        ];

        public function is_main_query()
        {
            return true;
        }

        public function get($key)
        {
            return $this->vars[ $key ] ?? null;
        }

        public function set($key, $value)
        {
            $this->vars[ $key ] = $value;
        }
    };

    nomia_cpt_render_library_category_filter();
    nomia_cpt_order_admin_content_lists($fake_query);

    expect($GLOBALS['lgm_test_state']['last_dropdown']['taxonomy'])->toBe('categoria_biblioteca')
        ->and($GLOBALS['lgm_test_state']['last_dropdown']['selected'])->toBe('newsletters')
        ->and($fake_query->vars['tax_query'][0]['taxonomy'])->toBe('categoria_biblioteca')
        ->and($fake_query->vars['tax_query'][0]['terms'])->toBe('newsletters');
});

test('admin column renderers expose thumbnails, categories, excerpts, and slugs', function () {
    $GLOBALS['lgm_test_state']['posts'][ 101 ] = [
        'thumbnail' => '<img src="cover.jpg" alt="" />',
        'excerpt'   => 'Resumo do documento com algum conteúdo para mostrar na listagem.',
        'post_name' => 'termo-glossario',
    ];
    $GLOBALS['lgm_test_state']['post_terms'][ 101 ] = [
        'categoria_biblioteca' => [ 'Legislação', 'Newsletters' ],
    ];

    ob_start();
    nomia_cpt_render_library_admin_column('nomia_cpt_thumbnail', 101);
    $thumbnail = ob_get_clean();

    ob_start();
    nomia_cpt_render_library_admin_column('nomia_cpt_library_categories', 101);
    $categories = ob_get_clean();

    ob_start();
    nomia_cpt_render_library_admin_column('nomia_cpt_library_excerpt', 101);
    $excerpt = ob_get_clean();

    ob_start();
    nomia_cpt_render_glossary_admin_column('nomia_cpt_glossary_slug', 101);
    $slug = ob_get_clean();

    expect($thumbnail)->toContain('<img')
        ->and($categories)->toContain('Legislação')
        ->and($excerpt)->toContain('Resumo do documento')
        ->and($slug)->toBe('termo-glossario');
});

test('library documents keep their details in registered post meta', function () {
    nomia_cpt_register_library_details_meta();

    $meta = $GLOBALS['lgm_test_state']['registered_post_meta']['biblioteca'];

    expect(array_keys($meta))->toBe([ 'nomia_cpt_library_year', 'nomia_cpt_library_author', 'nomia_cpt_library_file_url' ])
        ->and($meta['nomia_cpt_library_year']['type'])->toBe('integer')
        ->and($meta['nomia_cpt_library_author']['show_in_rest'])->toBeTrue()
        ->and($meta['nomia_cpt_library_file_url']['sanitize_callback'])->toBe('esc_url_raw')
        ->and(nomia_cpt_sanitize_library_year('2017'))->toBe(2017)
        ->and(nomia_cpt_sanitize_library_year('-3'))->toBe(0)
        ->and(nomia_cpt_sanitize_library_year('sem ano'))->toBe(0);
});

test('the imported library-details block is split from the document content', function () {
    $content = '<!-- wp:nomia/library-details {"year":2017,"author":"Diário da República","fileUrl":"https://nomia-media.bnq.pt/2026/05/rcm190-2017.pdf","lock":{"move":true,"remove":true}} /-->'
        . "\n\n<!-- wp:paragraph -->\n<p>Resolução</p>\n<!-- /wp:paragraph -->";

    expect(nomia_cpt_extract_library_details_block($content))->toBe(
        [
            'details' => [
                'year' => 2017,
                'author' => 'Diário da República',
                'fileUrl' => 'https://nomia-media.bnq.pt/2026/05/rcm190-2017.pdf',
            ],
            'content' => "<!-- wp:paragraph -->\n<p>Resolução</p>\n<!-- /wp:paragraph -->",
        ],
    )
        ->and(nomia_cpt_extract_library_details_block('<!-- wp:nomia/library-details /-->'))->toBe([ 'details' => [], 'content' => '' ])
        ->and(nomia_cpt_extract_library_details_block('<!-- wp:paragraph --><p>x</p><!-- /wp:paragraph -->'))->toBeNull();
});
