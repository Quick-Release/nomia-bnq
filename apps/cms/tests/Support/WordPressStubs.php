<?php

if (! defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/../../web/wp/');
}

if (! isset($GLOBALS['lgm_test_state'])) {
    $GLOBALS['lgm_test_state'] = [
        'actions'          => [],
        'filters'          => [],
        'activation_hooks' => [],
        'deactivation_hooks' => [],
        'post_types'       => [],
        'post_type_objects' => [
            'post'       => [
                'label'        => 'Posts',
                'show_in_rest' => true,
                'show_in_graphql' => true,
                'graphql_single_name' => 'Post',
            ],
            'page'       => [
                'label'        => 'Pages',
                'show_in_rest' => true,
                'show_in_graphql' => true,
                'graphql_single_name' => 'Page',
            ],
            'biblioteca' => [
                'label'        => 'Biblioteca',
                'show_in_rest' => true,
                'show_in_graphql' => true,
                'graphql_single_name' => 'Biblioteca',
            ],
            'attachment' => [
                'label'        => 'Media',
                'show_in_rest' => false,
            ],
        ],
        'taxonomies'       => [],
        'options'          => [],
        'registered_blocks' => [],
        'registered_settings' => [],
        'registered_post_meta' => [],
        'post_meta'        => [],
        'meta_boxes'       => [],
        'enqueued_media'   => false,
        'enqueued_scripts' => [],
        'registered_scripts' => [],
        'inline_scripts'   => [],
        'removed_submenu_pages' => [],
        'added_submenu_pages' => [],
        'registered_graphql_types' => [],
        'registered_graphql_fields' => [],
        'rest_routes'      => [],
        'nav_menu_locations' => [],
        'nav_menu_objects' => [],
        'nav_menu_items'   => [],
        'roles'            => [],
        'terms'            => [],
        'posts'            => [],
        'get_posts_calls'  => [],
        'post_terms'       => [],
        'post_term_ids'    => [],
        'last_dropdown'    => [],
        'term_objects'     => [],
        'theme_support'    => [],
        'flushed'          => false,
        'flush_count'      => 0,
        'is_admin'         => true,
        'current_user'     => [
            'ID' => 0,
        ],
        'home_url'         => 'https://example.com',
        'permalinks'       => [],
    ];
}

if (! class_exists('WP_User')) {
    class WP_User
    {
        public int $ID = 0;
        public object $data;

        public function __construct(int $user_id = 0)
        {
            $this->ID = $user_id;
            $this->data = (object) [
                'ID' => $user_id,
            ];
        }
    }
}

if (! class_exists('LGM_Test_Role')) {
    class LGM_Test_Role
    {
        public array $caps = [];

        public function add_cap(string $capability): void
        {
            $this->caps[ $capability ] = true;
        }

        public function remove_cap(string $capability): void
        {
            unset($this->caps[ $capability ]);
        }
    }
}

if (! class_exists('WP_Block_Type_Registry')) {
    class WP_Block_Type_Registry
    {
        private static ?WP_Block_Type_Registry $instance = null;

        public static function get_instance(): WP_Block_Type_Registry
        {
            if (null === self::$instance) {
                self::$instance = new self();
            }

            return self::$instance;
        }

        public function get_all_registered(): array
        {
            return $GLOBALS['lgm_test_state']['registered_blocks'];
        }
    }
}

if (! class_exists('WP_Admin_Bar')) {
    class WP_Admin_Bar
    {
        private array $nodes = [];

        public function add_node($args): void
        {
            if (is_object($args)) {
                $args = (array) $args;
            }

            $id = (string) ($args['id'] ?? '');

            if ('' === $id) {
                return;
            }

            $existing = $this->nodes[ $id ] ?? [];

            if (is_object($existing)) {
                $existing = (array) $existing;
            }

            $this->nodes[ $id ] = (object) array_merge($existing, $args);
        }

        public function get_node(string $id)
        {
            return $this->nodes[ $id ] ?? null;
        }

        public function remove_node(string $id): void
        {
            unset($this->nodes[ $id ]);
        }
    }
}

if (! function_exists('__')) {
    function __($text)
    {
        return $text;
    }
}

if (! function_exists('add_action')) {
    function add_action($hook, $callback, $priority = 10, $accepted_args = 1)
    {
        $GLOBALS['lgm_test_state']['actions'][] = compact('hook', 'callback', 'priority', 'accepted_args');
    }
}

if (! function_exists('add_filter')) {
    function add_filter($hook, $callback, $priority = 10, $accepted_args = 1)
    {
        $GLOBALS['lgm_test_state']['filters'][] = compact('hook', 'callback', 'priority', 'accepted_args');
    }
}

if (! function_exists('remove_filter')) {
    function remove_filter($hook, $callback, $priority = 10)
    {
        foreach ($GLOBALS['lgm_test_state']['filters'] as $index => $filter) {
            if ($filter['hook'] === $hook && $filter['callback'] === $callback && $filter['priority'] === $priority) {
                unset($GLOBALS['lgm_test_state']['filters'][ $index ]);
                return true;
            }
        }

        return false;
    }
}

if (! function_exists('apply_filters')) {
    function apply_filters($hook, $value, ...$args)
    {
        $filters = array_filter(
            $GLOBALS['lgm_test_state']['filters'],
            static fn($registered_filter) => $registered_filter['hook'] === $hook,
        );

        usort(
            $filters,
            static fn($left, $right) => $left['priority'] <=> $right['priority'],
        );

        foreach ($filters as $filter) {
            $callback = $filter['callback'];
            $params = array_merge([ $value ], array_slice($args, 0, max(0, (int) $filter['accepted_args'] - 1)));
            $value = $callback(...$params);
        }

        return $value;
    }
}

if (! function_exists('remove_submenu_page')) {
    function remove_submenu_page($menu_slug, $submenu_slug)
    {
        $GLOBALS['lgm_test_state']['removed_submenu_pages'][] = compact('menu_slug', 'submenu_slug');

        return true;
    }
}

if (! function_exists('add_submenu_page')) {
    function add_submenu_page($parent_slug, $page_title, $menu_title, $capability, $menu_slug, $callback = null)
    {
        $GLOBALS['lgm_test_state']['added_submenu_pages'][] = compact('parent_slug', 'page_title', 'menu_title', 'capability', 'menu_slug', 'callback');

        return $menu_slug;
    }
}

if (! function_exists('register_activation_hook')) {
    function register_activation_hook($file, $callback)
    {
        $GLOBALS['lgm_test_state']['activation_hooks'][] = compact('file', 'callback');
    }
}

if (! function_exists('register_deactivation_hook')) {
    function register_deactivation_hook($file, $callback)
    {
        $GLOBALS['lgm_test_state']['deactivation_hooks'][] = compact('file', 'callback');
    }
}

if (! function_exists('register_post_type')) {
    function register_post_type($post_type, $args)
    {
        $GLOBALS['lgm_test_state']['post_types'][ $post_type ] = $args;
        $GLOBALS['lgm_test_state']['post_type_objects'][ $post_type ] = array_merge(
            $GLOBALS['lgm_test_state']['post_type_objects'][ $post_type ] ?? [],
            [
                'label' => $args['labels']['singular_name'] ?? ($args['labels']['name'] ?? ucfirst($post_type)),
                'show_in_rest' => $args['show_in_rest'] ?? false,
                'show_in_graphql' => $args['show_in_graphql'] ?? false,
                'graphql_single_name' => $args['graphql_single_name'] ?? ucfirst($post_type),
                'graphql_plural_name' => $args['graphql_plural_name'] ?? ucfirst($post_type) . 's',
            ],
        );
    }
}

if (! function_exists('get_post_types')) {
    function get_post_types($args = [], $output = 'names')
    {
        $matches = [];

        foreach ($GLOBALS['lgm_test_state']['post_type_objects'] as $post_type => $object) {
            if (isset($args['show_in_rest']) && (bool) $object['show_in_rest'] !== (bool) $args['show_in_rest']) {
                continue;
            }

            if ('objects' === $output) {
                $matches[ $post_type ] = (object) array_merge(
                    [
                        'name' => $post_type,
                    ],
                    $object,
                );
                continue;
            }

            $matches[] = $post_type;
        }

        return $matches;
    }
}

if (! function_exists('register_taxonomy')) {
    function register_taxonomy($taxonomy, $object_type, $args)
    {
        $GLOBALS['lgm_test_state']['taxonomies'][ $taxonomy ] = [
            'object_type' => $object_type,
            'args'        => $args,
        ];
    }
}

if (! function_exists('taxonomy_exists')) {
    function taxonomy_exists($taxonomy)
    {
        return isset($GLOBALS['lgm_test_state']['taxonomies'][ $taxonomy ]);
    }
}

if (! function_exists('term_exists')) {
    function term_exists($term, $taxonomy)
    {
        return isset($GLOBALS['lgm_test_state']['terms'][ $taxonomy ][ $term ]);
    }
}

if (! function_exists('get_term')) {
    function get_term($term, $taxonomy = '')
    {
        $term_id = (int) $term;
        $term_object = $GLOBALS['lgm_test_state']['term_objects'][ $taxonomy ][ $term_id ] ?? null;

        if (is_array($term_object)) {
            return (object) array_merge(
                [
                    'term_id' => $term_id,
                    'taxonomy' => $taxonomy,
                ],
                $term_object,
            );
        }

        return null;
    }
}

if (! function_exists('wp_insert_term')) {
    function wp_insert_term($term, $taxonomy, $args = [])
    {
        $GLOBALS['lgm_test_state']['terms'][ $taxonomy ][ $term ] = $args;

        return [
            'term_id' => count($GLOBALS['lgm_test_state']['terms'][ $taxonomy ]),
        ];
    }
}

if (! function_exists('sanitize_title')) {
    function sanitize_title($title)
    {
        $title = strtolower($title);
        $title = preg_replace('/[^a-z0-9]+/i', '-', $title);

        return trim((string) $title, '-');
    }
}

if (! function_exists('is_wp_error')) {
    function is_wp_error($thing)
    {
        return false;
    }
}

if (! function_exists('get_option')) {
    function get_option($option, $default = false)
    {
        return $GLOBALS['lgm_test_state']['options'][ $option ] ?? $default;
    }
}

if (! function_exists('update_option')) {
    function update_option($option, $value, $autoload = null)
    {
        $GLOBALS['lgm_test_state']['options'][ $option ] = $value;

        return true;
    }
}

if (! function_exists('delete_option')) {
    function delete_option($option)
    {
        unset($GLOBALS['lgm_test_state']['options'][ $option ]);

        return true;
    }
}

if (! function_exists('get_role')) {
    function get_role($role_name)
    {
        if (! isset($GLOBALS['lgm_test_state']['roles'][ $role_name ])) {
            $GLOBALS['lgm_test_state']['roles'][ $role_name ] = new LGM_Test_Role();
        }

        return $GLOBALS['lgm_test_state']['roles'][ $role_name ];
    }
}

if (! function_exists('flush_rewrite_rules')) {
    function flush_rewrite_rules()
    {
        $GLOBALS['lgm_test_state']['flushed'] = true;
        $GLOBALS['lgm_test_state']['flush_count']++;
    }
}

if (! function_exists('load_plugin_textdomain')) {
    function load_plugin_textdomain($domain, $deprecated = false, $plugin_rel_path = false)
    {
        return compact('domain', 'deprecated', 'plugin_rel_path');
    }
}

if (! function_exists('add_theme_support')) {
    function add_theme_support($feature, ...$args)
    {
        if (0 === count($args)) {
            $GLOBALS['lgm_test_state']['theme_support'][ $feature ] = [ true ];
            return true;
        }

        $GLOBALS['lgm_test_state']['theme_support'][ $feature ] = $args;

        return true;
    }
}

if (! function_exists('get_theme_support')) {
    function get_theme_support($feature)
    {
        return $GLOBALS['lgm_test_state']['theme_support'][ $feature ] ?? false;
    }
}

if (! function_exists('register_block_type')) {
    function register_block_type($block_type, $args = [])
    {
        $metadata = [];
        $name = is_string($block_type) ? basename($block_type) : 'unknown-block';

        if (is_string($block_type) && is_dir($block_type)) {
            $metadata_file = rtrim($block_type, '/') . '/block.json';

            if (file_exists($metadata_file)) {
                $decoded = json_decode((string) file_get_contents($metadata_file), true);

                if (is_array($decoded)) {
                    $metadata = $decoded;
                    $name = $decoded['name'] ?? $name;
                }
            }
        }

        $GLOBALS['lgm_test_state']['registered_blocks'][ $name ] = [
            'name'     => $name,
            'path'     => $block_type,
            'metadata' => $metadata,
            'args'     => $args,
        ];

        return $GLOBALS['lgm_test_state']['registered_blocks'][ $name ];
    }
}

if (! function_exists('register_setting')) {
    function register_setting($option_group, $option_name, $args = [])
    {
        $GLOBALS['lgm_test_state']['registered_settings'][ $option_name ] = [
            'group' => $option_group,
            'args'  => $args,
        ];

        return true;
    }
}

if (! function_exists('register_post_meta')) {
    function register_post_meta($post_type, $meta_key, $args)
    {
        $GLOBALS['lgm_test_state']['registered_post_meta'][ $post_type ][ $meta_key ] = $args;

        return true;
    }
}

if (! function_exists('update_post_meta')) {
    function update_post_meta($post_id, $meta_key, $meta_value)
    {
        $GLOBALS['lgm_test_state']['post_meta'][ $post_id ][ $meta_key ] = $meta_value;

        return true;
    }
}

if (! function_exists('get_post_meta')) {
    function get_post_meta($post_id, $meta_key = '', $single = false)
    {
        if ('' === $meta_key) {
            return $GLOBALS['lgm_test_state']['post_meta'][ $post_id ] ?? [];
        }

        $value = $GLOBALS['lgm_test_state']['post_meta'][ $post_id ][ $meta_key ] ?? ($single ? '' : []);

        return $value;
    }
}

if (! function_exists('delete_post_meta')) {
    function delete_post_meta($post_id, $meta_key, $meta_value = '')
    {
        unset($GLOBALS['lgm_test_state']['post_meta'][ $post_id ][ $meta_key ]);

        return true;
    }
}

if (! function_exists('delete_post_thumbnail')) {
    function delete_post_thumbnail($post_id)
    {
        return delete_post_meta($post_id, '_thumbnail_id');
    }
}

if (! function_exists('__return_true')) {
    function __return_true()
    {
        return true;
    }
}

if (! function_exists('register_graphql_object_type')) {
    function register_graphql_object_type($type_name, $config)
    {
        $GLOBALS['lgm_test_state']['registered_graphql_types'][ $type_name ] = $config;
    }
}

if (! function_exists('register_graphql_field')) {
    function register_graphql_field($type_name, $field_name, $config)
    {
        $GLOBALS['lgm_test_state']['registered_graphql_fields'][ $type_name ][ $field_name ] = $config;
    }
}

if (! function_exists('register_rest_route')) {
    function register_rest_route($namespace, $route, $args)
    {
        $GLOBALS['lgm_test_state']['rest_routes'][ $namespace . $route ] = compact('namespace', 'route', 'args');

        return true;
    }
}

if (! function_exists('esc_url')) {
    function esc_url($url)
    {
        return htmlspecialchars((string) $url, ENT_QUOTES, 'UTF-8');
    }
}

if (! function_exists('esc_url_raw')) {
    function esc_url_raw($url)
    {
        return filter_var((string) $url, FILTER_SANITIZE_URL);
    }
}

if (! function_exists('sanitize_key')) {
    function sanitize_key($key)
    {
        $key = strtolower((string) $key);

        return preg_replace('/[^a-z0-9_-]/', '', $key) ?? '';
    }
}

if (! function_exists('plugin_basename')) {
    function plugin_basename($file)
    {
        return basename(dirname($file)) . '/' . basename($file);
    }
}

if (! function_exists('is_admin')) {
    function is_admin()
    {
        return (bool) $GLOBALS['lgm_test_state']['is_admin'];
    }
}

if (! function_exists('current_user_can')) {
    function current_user_can($capability, ...$args)
    {
        return $GLOBALS['lgm_test_state']['capability_overrides'][$capability] ?? true;
    }
}

if (! function_exists('get_current_user_id')) {
    function get_current_user_id()
    {
        return (int) ($GLOBALS['lgm_test_state']['current_user']['ID'] ?? 0);
    }
}

if (! function_exists('wp_get_current_user')) {
    function wp_get_current_user()
    {
        return new WP_User(get_current_user_id());
    }
}

if (! function_exists('absint')) {
    function absint($value)
    {
        return abs((int) $value);
    }
}

if (! function_exists('wp_unslash')) {
    function wp_unslash($value)
    {
        return $value;
    }
}

if (! function_exists('sanitize_text_field')) {
    function sanitize_text_field($value)
    {
        return trim(strip_tags((string) $value));
    }
}

if (! function_exists('sanitize_email')) {
    function sanitize_email($value)
    {
        return filter_var(trim((string) $value), FILTER_SANITIZE_EMAIL);
    }
}

if (! function_exists('is_email')) {
    function is_email($value)
    {
        return false !== filter_var((string) $value, FILTER_VALIDATE_EMAIL);
    }
}

if (! function_exists('wp_strip_all_tags')) {
    function wp_strip_all_tags($value)
    {
        return strip_tags((string) $value);
    }
}

if (! function_exists('wp_dropdown_categories')) {
    function wp_dropdown_categories($args = [])
    {
        $GLOBALS['lgm_test_state']['last_dropdown'] = $args;

        return '<select></select>';
    }
}

if (! function_exists('esc_html__')) {
    function esc_html__($text)
    {
        return $text;
    }
}

if (! function_exists('esc_html')) {
    function esc_html($text)
    {
        return (string) $text;
    }
}

if (! function_exists('esc_attr')) {
    function esc_attr($text)
    {
        return (string) $text;
    }
}

if (! function_exists('esc_attr__')) {
    function esc_attr__($text)
    {
        return $text;
    }
}

if (! function_exists('wp_kses_post')) {
    function wp_kses_post($text)
    {
        return (string) $text;
    }
}

if (! function_exists('get_the_post_thumbnail')) {
    function get_the_post_thumbnail($post_id, $size = 'thumbnail')
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ]['thumbnail'] ?? '';
    }
}

if (! function_exists('wp_get_attachment_image')) {
    function wp_get_attachment_image($attachment_id, $size = 'thumbnail', $icon = false, $attr = [])
    {
        $image = $GLOBALS['lgm_test_state']['posts'][ $attachment_id ]['thumbnail'] ?? '';

        if ('' === $image) {
            return '';
        }

        if (isset($attr['class']) && is_string($attr['class'])) {
            return preg_replace('/<img\s+/', '<img class="' . $attr['class'] . '" ', $image, 1) ?? $image;
        }

        return $image;
    }
}

if (! function_exists('wp_get_attachment_image_src')) {
    function wp_get_attachment_image_src($attachment_id, $size = 'thumbnail')
    {
        $src = $GLOBALS['lgm_test_state']['posts'][ $attachment_id ]['image_src'] ?? '';

        if ('' === $src) {
            return false;
        }

        return [
            $src,
            $GLOBALS['lgm_test_state']['posts'][ $attachment_id ]['image_width'] ?? 0,
            $GLOBALS['lgm_test_state']['posts'][ $attachment_id ]['image_height'] ?? 0,
        ];
    }
}

if (! function_exists('get_the_term_list')) {
    function get_the_term_list($post_id, $taxonomy, $before = '', $sep = ', ', $after = '')
    {
        $terms = $GLOBALS['lgm_test_state']['post_terms'][ $post_id ][ $taxonomy ] ?? [];

        if ([] === $terms) {
            return false;
        }

        return $before . implode($sep, $terms) . $after;
    }
}

if (! function_exists('wp_set_post_terms')) {
    function wp_set_post_terms($post_id, $terms, $taxonomy, $append = false)
    {
        $term_ids = array_values(array_filter(array_map('intval', (array) $terms)));
        $term_names = [];

        foreach ($term_ids as $term_id) {
            $term_object = $GLOBALS['lgm_test_state']['term_objects'][ $taxonomy ][ $term_id ] ?? null;

            if (is_array($term_object) && isset($term_object['name'])) {
                $term_names[] = $term_object['name'];
                continue;
            }

            $term_names[] = (string) $term_id;
        }

        $GLOBALS['lgm_test_state']['post_term_ids'][ $post_id ][ $taxonomy ] = $term_ids;
        $GLOBALS['lgm_test_state']['post_terms'][ $post_id ][ $taxonomy ] = $term_names;

        return $term_ids;
    }
}

if (! function_exists('get_the_excerpt')) {
    function get_the_excerpt($post_id)
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ]['excerpt'] ?? '';
    }
}

if (! function_exists('wp_trim_words')) {
    function wp_trim_words($text, $num_words = 55, $more = null)
    {
        $words = preg_split('/\s+/', trim((string) $text));

        if (! is_array($words) || count($words) <= $num_words) {
            return trim((string) $text);
        }

        return implode(' ', array_slice($words, 0, $num_words)) . $more;
    }
}

if (! function_exists('get_post_field')) {
    function get_post_field($field, $post_id)
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ][ $field ] ?? '';
    }
}

if (! function_exists('get_post')) {
    function get_post($post)
    {
        $post_id = is_object($post) ? (int) ($post->ID ?? 0) : (int) $post;

        if (empty($GLOBALS['lgm_test_state']['posts'][ $post_id ])) {
            return null;
        }

        return (object) $GLOBALS['lgm_test_state']['posts'][ $post_id ];
    }
}

if (! function_exists('get_post_status')) {
    function get_post_status($post_id)
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ]['post_status'] ?? '';
    }
}

if (! function_exists('get_permalink')) {
    function get_permalink($post)
    {
        $post_object = get_post($post);

        if (! $post_object) {
            return '';
        }

        return $GLOBALS['lgm_test_state']['permalinks'][ $post_object->ID ] ?? '';
    }
}

if (! function_exists('get_the_title')) {
    function get_the_title($post_id)
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ]['post_title'] ?? '';
    }
}

if (! function_exists('get_post_type')) {
    function get_post_type($post_id)
    {
        return $GLOBALS['lgm_test_state']['posts'][ $post_id ]['post_type'] ?? '';
    }
}

if (! function_exists('wp_attachment_is_image')) {
    function wp_attachment_is_image($post = null)
    {
        $post_id = is_object($post) ? (int) ($post->ID ?? 0) : (int) $post;
        $mime_type = $GLOBALS['lgm_test_state']['posts'][ $post_id ]['post_mime_type'] ?? '';

        if ('' !== $mime_type) {
            return str_starts_with($mime_type, 'image/');
        }

        return isset($GLOBALS['lgm_test_state']['posts'][ $post_id ]['image_src']);
    }
}

if (! function_exists('get_posts')) {
    function get_posts($args = [])
    {
        $GLOBALS['lgm_test_state']['get_posts_calls'][] = $args;

        $post_type = $args['post_type'] ?? 'post';
        $post__in = $args['post__in'] ?? [];
        $fields = $args['fields'] ?? '';
        $meta_query = $args['meta_query'] ?? [];

        $candidate_ids = ! empty($post__in)
            ? $post__in
            : array_keys($GLOBALS['lgm_test_state']['posts'] ?? []);

        $posts = [];

        foreach ($candidate_ids as $post_id) {
            if (($GLOBALS['lgm_test_state']['posts'][ $post_id ]['post_type'] ?? '') !== $post_type) {
                continue;
            }

            if (! empty($meta_query)) {
                $matches_meta_query = false;

                foreach ($meta_query as $clause) {
                    if ('EXISTS' !== ($clause['compare'] ?? '')) {
                        continue;
                    }

                    $meta_key = $clause['key'] ?? '';

                    if (isset($GLOBALS['lgm_test_state']['post_meta'][ $post_id ][ $meta_key ])) {
                        $matches_meta_query = true;
                        break;
                    }
                }

                if (! $matches_meta_query) {
                    continue;
                }
            }

            if ('ids' === $fields) {
                $posts[] = (int) $post_id;
                continue;
            }

            $posts[] = (object) [
                'ID' => (int) $post_id,
            ];
        }

        return $posts;
    }
}

if (! function_exists('wp_nonce_field')) {
    function wp_nonce_field($action, $name)
    {
        echo '<input type="hidden" name="' . $name . '" value="nonce" />';
    }
}

if (! function_exists('settings_fields')) {
    function settings_fields($option_group)
    {
        echo '<input type="hidden" name="option_page" value="' . $option_group . '" />';
    }
}

if (! function_exists('submit_button')) {
    function submit_button($text = null)
    {
        echo '<p class="submit"><button type="submit">' . ($text ?? 'Save Changes') . '</button></p>';
    }
}

if (! function_exists('wp_verify_nonce')) {
    function wp_verify_nonce($nonce, $action)
    {
        return 'nonce' === $nonce;
    }
}

if (! function_exists('wp_is_post_revision')) {
    function wp_is_post_revision($post_id)
    {
        return false;
    }
}

if (! function_exists('add_meta_box')) {
    function add_meta_box($id, $title, $callback, $screen, $context = 'advanced', $priority = 'default')
    {
        $GLOBALS['lgm_test_state']['meta_boxes'][] = compact('id', 'title', 'callback', 'screen', 'context', 'priority');
    }
}

if (! function_exists('plugin_dir_url')) {
    function plugin_dir_url($file)
    {
        return 'https://example.com/plugins/' . basename(dirname($file)) . '/';
    }
}

if (! function_exists('home_url')) {
    function home_url($path = '')
    {
        $base = rtrim((string) $GLOBALS['lgm_test_state']['home_url'], '/');
        $path = (string) $path;

        if ('' === $path) {
            return $base;
        }

        return $base . '/' . ltrim($path, '/');
    }
}

if (! function_exists('get_bloginfo')) {
    function get_bloginfo($show = '')
    {
        if ('charset' === $show) {
            return 'UTF-8';
        }

        return '';
    }
}

if (! function_exists('get_nav_menu_locations')) {
    function get_nav_menu_locations()
    {
        return $GLOBALS['lgm_test_state']['nav_menu_locations'];
    }
}

if (! function_exists('wp_get_nav_menu_object')) {
    function wp_get_nav_menu_object($menu_id)
    {
        return $GLOBALS['lgm_test_state']['nav_menu_objects'][ (int) $menu_id ] ?? false;
    }
}

if (! function_exists('wp_get_nav_menu_items')) {
    function wp_get_nav_menu_items($menu_id, $args = [])
    {
        return $GLOBALS['lgm_test_state']['nav_menu_items'][ (int) $menu_id ] ?? false;
    }
}

if (! function_exists('wp_parse_url')) {
    function wp_parse_url($url, $component = -1)
    {
        return parse_url((string) $url, $component);
    }
}

if (! function_exists('untrailingslashit')) {
    function untrailingslashit($value)
    {
        return rtrim((string) $value, '/');
    }
}

if (! function_exists('add_query_arg')) {
    function add_query_arg($args, $url)
    {
        $url_parts = parse_url((string) $url);
        $query = [];

        if (! empty($url_parts['query'])) {
            parse_str($url_parts['query'], $query);
        }

        foreach ((array) $args as $key => $value) {
            $query[ $key ] = $value;
        }

        $rebuilt = '';

        if (! empty($url_parts['scheme'])) {
            $rebuilt .= $url_parts['scheme'] . '://';
        }

        if (! empty($url_parts['host'])) {
            $rebuilt .= $url_parts['host'];
        }

        if (! empty($url_parts['port'])) {
            $rebuilt .= ':' . $url_parts['port'];
        }

        $rebuilt .= $url_parts['path'] ?? '';

        if ([] !== $query) {
            $rebuilt .= '?' . http_build_query($query);
        }

        if (! empty($url_parts['fragment'])) {
            $rebuilt .= '#' . $url_parts['fragment'];
        }

        return $rebuilt;
    }
}

if (! function_exists('wp_enqueue_media')) {
    function wp_enqueue_media()
    {
        $GLOBALS['lgm_test_state']['enqueued_media'] = true;
    }
}

if (! function_exists('wp_register_script')) {
    function wp_register_script($handle, $src = '', $deps = [], $ver = false, $args = [])
    {
        $GLOBALS['lgm_test_state']['registered_scripts'][ $handle ] = compact('src', 'deps', 'ver', 'args');
    }
}

if (! function_exists('wp_enqueue_script')) {
    function wp_enqueue_script($handle, $src = '', $deps = [], $ver = false, $args = [])
    {
        $GLOBALS['lgm_test_state']['enqueued_scripts'][ $handle ] = compact('src', 'deps', 'ver', 'args');
    }
}

if (! function_exists('wp_add_inline_script')) {
    function wp_add_inline_script($handle, $data, $position = 'after')
    {
        $GLOBALS['lgm_test_state']['inline_scripts'][ $handle ][] = compact('data', 'position');
    }
}

if (! function_exists('wp_json_encode')) {
    function wp_json_encode($value)
    {
        return json_encode($value);
    }
}

if (! function_exists('_n')) {
    function _n($single, $plural, $number)
    {
        return 1 === (int) $number ? $single : $plural;
    }
}

if (! function_exists('wp_date')) {
    function wp_date($format, $timestamp = null, $timezone = null)
    {
        return gmdate($format, $timestamp ?? time());
    }
}

if (! function_exists('human_time_diff')) {
    function human_time_diff($from, $to = 0)
    {
        $elapsed = abs(($to ?: time()) - $from);

        return $elapsed < 3600
            ? max(1, (int) round($elapsed / 60)) . ' mins'
            : max(1, (int) round($elapsed / 86400)) . ' days';
    }
}

if (! function_exists('wp_get_theme')) {
    function wp_get_theme($stylesheet = null)
    {
        return new Nomia_Stub_Theme($GLOBALS['lgm_test_state']['theme_headers'] ?? []);
    }
}

class Nomia_Stub_Theme
{
    /** @param array<string, string> $headers */
    public function __construct(private array $headers = []) {}

    public function get(string $header): string
    {
        return $this->headers[$header] ?? '';
    }
}


if (! function_exists('sanitize_hex_color')) {
    function sanitize_hex_color($color)
    {
        return preg_match('/^#(?:[a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $color) ? $color : null;
    }
}

if (! function_exists('register_term_meta')) {
    function register_term_meta($taxonomy, $key, $args)
    {
        $GLOBALS['lgm_test_state']['registered_term_meta'][$taxonomy][$key] = $args;
    }
}

if (! function_exists('get_term_meta')) {
    function get_term_meta($id, $key, $single = false)
    {
        return $GLOBALS['lgm_test_state']['term_meta'][$id][$key] ?? '';
    }
}

if (! function_exists('update_term_meta')) {
    function update_term_meta($id, $key, $value)
    {
        $GLOBALS['lgm_test_state']['term_meta'][$id][$key] = $value;
        return true;
    }
}

if (! function_exists('metadata_exists')) {
    function metadata_exists($type, $id, $key)
    {
        return array_key_exists($key, $GLOBALS['lgm_test_state'][$type . '_meta'][$id] ?? []);
    }
}

if (! function_exists('get_taxonomy')) {
    function get_taxonomy($taxonomy)
    {
        return isset($GLOBALS['lgm_test_state']['taxonomies'][$taxonomy])
            ? (object) ['cap' => (object) ['edit_terms' => 'manage_categories']]
            : false;
    }
}

if (! function_exists('get_terms')) {
    function get_terms($args = [])
    {
        $taxonomy = $args['taxonomy'] ?? '';
        return array_map(
            fn($id) => get_term($id, $taxonomy),
            array_keys($GLOBALS['lgm_test_state']['term_objects'][$taxonomy] ?? []),
        );
    }
}
