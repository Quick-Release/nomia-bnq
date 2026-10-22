<?php

use GetQuick\Bioeconomia\Content\Capabilities;
use GetQuick\Bioeconomia\Lifecycle\LegacyRename;
use GetQuick\Bioeconomia\Lifecycle\Lifecycle;

require_once dirname(__DIR__) . '/Support/WordPressStubs.php';
require_once dirname(__DIR__, 2) . '/web/app/plugins/gq-bioeconomia/gq-bioeconomia.php';

if (! function_exists('add_option')) {
    function add_option($option, $value = '', $deprecated = '', $autoload = null)
    {
        if (array_key_exists($option, $GLOBALS['lgm_test_state']['options'])) {
            return false;
        }

        $GLOBALS['lgm_test_state']['options'][ $option ] = $value;

        return true;
    }
}

if (! function_exists('wp_cache_flush')) {
    function wp_cache_flush()
    {
        $GLOBALS['lgm_test_state']['cache_flushed'] = true;

        return true;
    }
}

/**
 * An in-memory `$wpdb` that runs the few statements the rename issues, over
 * the stubs' options and its own meta and posts rows.
 */
final class LegacyRenameTestDatabase
{
    public string $options = 'wp_options';
    public string $postmeta = 'wp_postmeta';
    public string $termmeta = 'wp_termmeta';
    public string $posts = 'wp_posts';

    /** @var array<string, array<int, array<string, mixed>>> */
    public array $rows = ['wp_postmeta' => [], 'wp_termmeta' => [], 'wp_posts' => []];

    public function esc_like(string $text): string
    {
        return addcslashes($text, '_%\\');
    }

    public function prepare(string $query, ...$args): array
    {
        return [$query, $args];
    }

    public function get_col(array $prepared): array
    {
        [, [$like]] = $prepared;

        return array_values(array_filter(
            array_keys($GLOBALS['lgm_test_state']['options']),
            fn(string $name): bool => $this->like($name, $like),
        ));
    }

    public function query(array $prepared): int
    {
        [, [$table, $target, $start, $like]] = $prepared;
        $changed = 0;

        foreach ($this->rows[ $table ] as &$row) {
            if ($this->like($row['meta_key'], $like)) {
                $row['meta_key'] = $target . substr($row['meta_key'], $start - 1);
                ++$changed;
            }
        }

        return $changed;
    }

    public function update(string $table, array $data, array $where): int
    {
        $changed = 0;

        foreach ($this->rows[ $table ] as &$row) {
            if (array_intersect_assoc($where, $row) === $where) {
                $row = array_merge($row, $data);
                ++$changed;
            }
        }

        return $changed;
    }

    private function like(string $value, string $pattern): bool
    {
        $regex = preg_replace_callback(
            '/\\\\(.)|(%)|(_)|([^\\\\%_]+)/',
            static fn(array $m): string => match (true) {
                '' !== ($m[1] ?? '') => preg_quote($m[1], '/'),
                '' !== ($m[2] ?? '') => '.*',
                '' !== ($m[3] ?? '') => '.',
                default => preg_quote($m[4], '/'),
            },
            $pattern,
        );

        return 1 === preg_match('/^' . $regex . '$/s', $value);
    }
}

beforeEach(function () {
    $GLOBALS['lgm_test_state']['options'] = [];
    $GLOBALS['lgm_test_state']['roles'] = [];
    $GLOBALS['lgm_test_state']['taxonomies'] = [];
    $GLOBALS['lgm_test_state']['cache_flushed'] = false;
    $GLOBALS['wpdb'] = new LegacyRenameTestDatabase();
});

afterEach(function () {
    unset($GLOBALS['wpdb']);
});

test('without nomia-cpt data the rename does nothing', function () {
    $GLOBALS['lgm_test_state']['options']['nomia_cpt_contact'] = ['phone' => '1'];

    expect(LegacyRename::run())->toBeFalse()
        ->and($GLOBALS['lgm_test_state']['options'])->toBe(['nomia_cpt_contact' => ['phone' => '1']]);
});

test('nomia-cpt and nomia-blocks data moves to gq-bioeconomia names', function () {
    global $wpdb;

    $GLOBALS['lgm_test_state']['options'] = [
        'nomia_cpt_plugin_version' => '0.3.7',
        'nomia_cpt_details_migration_errors' => [],
        'nomia_cpt_contact' => ['phone' => '123'],
        'nomia_cpt_footer_logo_ids' => [4, 5],
        'nomia_cpt_migration_attachment_remap' => '2026-10-18',
        'gq_bioeconomia_footer_logo_ids' => [9],
        'active_plugins' => ['gq-design/gq-design.php', 'nomia-blocks/getquick-nomia-blocks.php', 'nomia-cpt/nomia-cpt.php'],
        'blogname' => 'Nomia',
    ];
    $wpdb->rows['wp_postmeta'] = [
        ['post_id' => 1, 'meta_key' => 'nomia_cpt_event_venue', 'meta_value' => 'Aveiro'],
        ['post_id' => 1, 'meta_key' => '_nomia_cpt_details_source', 'meta_value' => 'raw'],
        ['post_id' => 2, 'meta_key' => '_nomia_page_background_color', 'meta_value' => '#ffffff'],
        ['post_id' => 3, 'meta_key' => 'nomia_cptx_unrelated', 'meta_value' => 'x'],
        ['post_id' => 4, 'meta_key' => 'nomia_blocks_section_heading_items', 'meta_value' => 'a:0:{}'],
        ['post_id' => 5, 'meta_key' => '_menu_item_object', 'meta_value' => 'nomia_gallery'],
    ];
    $wpdb->rows['wp_termmeta'] = [
        ['term_id' => 7, 'meta_key' => '_nomia_tematica_color', 'meta_value' => '#a4d663'],
    ];
    $wpdb->rows['wp_posts'] = [
        ['ID' => 10, 'post_type' => 'nomia_gallery'],
        ['ID' => 11, 'post_type' => 'post'],
    ];
    foreach (LegacyRename::legacyCapabilities() as $capability) {
        get_role('editor')->add_cap($capability);
    }
    get_role('editor')->add_cap('edit_posts');

    expect(LegacyRename::run())->toBeTrue();

    expect($GLOBALS['lgm_test_state']['options'])->toBe([
        'gq_bioeconomia_footer_logo_ids' => [9],
        'active_plugins' => ['gq-design/gq-design.php'],
        'blogname' => 'Nomia',
        'gq_bioeconomia_contact' => ['phone' => '123'],
        'gq_bioeconomia_migration_attachment_remap' => '2026-10-18',
    ])
        ->and(array_column($wpdb->rows['wp_postmeta'], 'meta_key'))->toBe([
            'gq_bioeconomia_event_venue',
            '_gq_bioeconomia_details_source',
            '_gq_bioeconomia_page_background_color',
            'nomia_cptx_unrelated',
            'nomia_blocks_section_heading_items',
            '_menu_item_object',
        ])
        ->and($wpdb->rows['wp_postmeta'][5]['meta_value'])->toBe('gq_bio_gallery')
        ->and($wpdb->rows['wp_termmeta'][0]['meta_key'])->toBe('_gq_bioeconomia_tematica_color')
        ->and(array_column($wpdb->rows['wp_posts'], 'post_type'))->toBe(['gq_bio_gallery', 'post'])
        ->and(get_role('editor')->caps)->toBe(['edit_posts' => true])
        ->and($GLOBALS['lgm_test_state']['cache_flushed'])->toBeTrue();

    expect(LegacyRename::run())->toBeFalse();
});

test('the upgrade renames legacy data first, then grants the renamed capabilities once per version', function () {
    $GLOBALS['lgm_test_state']['options']['nomia_cpt_plugin_version'] = '0.3.7';

    expect(Lifecycle::upgrade())->toBeTrue()
        ->and(get_option('nomia_cpt_plugin_version'))->toBeFalse()
        ->and(get_option(Lifecycle::VERSION_OPTION))->toBe(GQ_BIOECONOMIA_VERSION)
        ->and(array_keys(get_role('administrator')->caps))->toBe(Capabilities::all())
        ->and(Lifecycle::upgrade())->toBeFalse();
});
