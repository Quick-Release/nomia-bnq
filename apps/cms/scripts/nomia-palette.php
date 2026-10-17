<?php

/**
 * Applies Nomia's palette to GQ Design's site colors (GETQUICK → Design →
 * Branding → Colors): the user Global Styles' `settings.color.palette.theme`,
 * where the Branding screen saves them. Run once per site, then the palette
 * is the editors' to change there:
 *
 *   wp eval-file scripts/nomia-palette.php            # from apps/cms
 *   wp eval-file scripts/nomia-palette.php dry-run    # report only
 *
 * It only adds what is missing: a Nomia color whose slug the palette lacks is
 * appended, and a theme color (background, foreground, accent, muted) still
 * at the theme's own value takes Nomia's. Nothing is removed, and a color an
 * editor changed is kept. Running it again changes nothing.
 *
 * @package NomiaBnq
 */

if (! defined('WP_CLI') || ! WP_CLI) {
    return;
}

$dry_run = in_array('dry-run', $args ?? [], true);
$nomia   = json_decode((string) file_get_contents(__DIR__ . '/nomia-palette.json'), true);
if (! is_array($nomia) || ! is_array($nomia['colors'] ?? null) || ! is_array($nomia['theme'] ?? null)) {
    WP_CLI::error('scripts/nomia-palette.json is not a palette.');
}

$record = WP_Theme_JSON_Resolver::get_user_data_from_wp_global_styles(wp_get_theme(), true);
if (empty($record['ID'])) {
    WP_CLI::error('The active theme has no Global Styles record.');
}

$styles = json_decode((string) $record['post_content'], true);
if (! is_array($styles)) {
    $styles = [
        'version'                     => WP_Theme_JSON::LATEST_SCHEMA,
        'isGlobalStylesUserThemeJSON' => true,
    ];
}

$theme_palette = WP_Theme_JSON_Resolver::get_theme_data()->get_settings()['color']['palette']['theme'] ?? [];
$theme_values  = array_column($theme_palette, 'color', 'slug');
// As the Branding screen does: the saved palette, else the theme's.
$palette = $styles['settings']['color']['palette']['theme'] ?? $theme_palette;
$changes = [];

foreach ($palette as $index => $entry) {
    $slug = $entry['slug'] ?? '';
    $current = strtolower((string) ($entry['color'] ?? ''));
    if (
        isset($nomia['theme'][ $slug ], $theme_values[ $slug ])
        && $current === strtolower($theme_values[ $slug ])
        && $current !== strtolower($nomia['theme'][ $slug ])
    ) {
        $palette[ $index ]['color'] = $nomia['theme'][ $slug ];
        $changes[]                  = "~ {$slug}: {$theme_values[ $slug ]} → {$nomia['theme'][ $slug ]}";
    }
}

$slugs = array_column($palette, 'slug');
foreach ($nomia['colors'] as $color) {
    if (! in_array($color['slug'], $slugs, true)) {
        $palette[] = [
            'name'  => $color['name'],
            'slug'  => $color['slug'],
            'color' => $color['color'],
        ];
        $changes[] = "+ {$color['slug']} {$color['color']}";
    }
}

if (! $changes) {
    WP_CLI::success('The palette already has Nomia\'s colors; nothing to change.');
    return;
}

foreach ($changes as $change) {
    WP_CLI::log($change);
}
if ($dry_run) {
    WP_CLI::success(sprintf('Dry run: %d change(s) pending.', count($changes)));
    return;
}

$styles['settings']['color']['palette']['theme'] = array_values($palette);
$updated = wp_update_post(
    [
        'ID'           => $record['ID'],
        'post_content' => wp_slash((string) wp_json_encode($styles)),
    ],
    true,
);
if (is_wp_error($updated)) {
    WP_CLI::error($updated->get_error_message());
}
WP_Theme_JSON_Resolver::clean_cached_data();
WP_CLI::success(sprintf('Applied %d change(s) to the site colors.', count($changes)));
