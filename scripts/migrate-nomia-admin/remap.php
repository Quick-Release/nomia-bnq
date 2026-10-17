<?php

/**
 * Remaps attachment IDs recorded by the source site into the IDs assigned
 * by `wp import`, for the nomia-cpt stores that reference attachments by ID:
 *
 *   - post meta `nomia_cpt_gallery_image_ids` (nomia_gallery posts)
 *   - option `nomia_cpt_footer_logo_ids`
 *
 * Run after `wp import <file.wxr> --authors=create`:
 *
 *   wp eval-file remap.php wxr=/path/to/export.wxr
 * (wxr passed positionally: `wp eval-file` does not accept custom long flags)
 *
 * The old→new map comes from the WordPress importer's mapping option when it
 * is available; otherwise it is rebuilt from the WXR file (source
 * `wp:post_id` → target attachment matched by `_wp_attached_file`, which the
 * import preserves from the source's uploads subpath). When both are
 * available the importer option wins and the WXR fills in the gaps.
 *
 * Idempotence: an option marker records a completed remap, so re-running
 * this file cannot double-map. Delete the marker only after a reimport.
 */
if (! defined('WP_CLI') || ! WP_CLI) {
    echo "This script must run through WP-CLI (wp eval-file remap.php).\n";
    exit(1);
}

// The two nomia-cpt stores that hold attachment IDs.
const REMAP_META_KEY = 'nomia_cpt_gallery_image_ids';
const REMAP_OPTION_NAME = 'nomia_cpt_footer_logo_ids';
const REMAP_DONE_MARKER = 'nomia_cpt_migration_attachment_remap';
const REMAP_IMPORTER_OPT = 'wordpress_importer';
const REMAP_ATTACHED_FILE = '_wp_attached_file';

/**
 * Old attachment ID → new ID, from the importer's recorded mappings.
 *
 * The WordPress importer option may be stored as `processed_posts` (newer
 * plugin versions) or as plain old_id => new_id arrays. Attachment entries
 * are the ones whose new ID is an attachment post.
 *
 * @return array<int, int>
 */
function nomia_remap_map_from_importer()
{
    $option = get_option(REMAP_IMPORTER_OPT, []);

    if (! is_array($option)) {
        return [];
    }

    $processed = '';
    if (! empty($option['processed_posts']) && is_array($option['processed_posts'])) {
        $processed = $option['processed_posts'];
    } elseif (! empty($option['post']) && is_array($option['post'])) {
        $processed = $option['post'];
    }

    if (! is_array($processed)) {
        return [];
    }

    $map = [];
    foreach ($processed as $old_id => $new_id) {
        $new_id = (int) $new_id;
        if ($new_id <= 0) {
            continue;
        }
        if (get_post_type($new_id) !== 'attachment') {
            continue;
        }
        $map[(int) $old_id] = $new_id;
    }

    return $map;
}

/**
 * Parses a WXR export and returns source attachment post_id → uploads subpath.
 *
 * @param  string  $path  WXR file path.
 * @return array<int, string> {source id: subpath under uploads}
 */
function nomia_remap_wxr_attachments($path)
{
    if (! is_readable($path)) {
        WP_CLI::error("WXR file not readable: {$path}");
    }

    $use_errors = libxml_use_internal_errors(true);
    $xml = simplexml_load_file($path);
    libxml_clear_errors();
    libxml_use_internal_errors($use_errors);

    if ($xml === false) {
        WP_CLI::error('Could not parse the WXR file as XML.');
    }

    $attachment_urls = [];
    foreach ($xml->channel->item as $item) {
        $wp = $item->children('http://wordpress.org/export/1.2/');
        if (! isset($wp->post_type) || (string) $wp->post_type !== 'attachment') {
            continue;
        }
        $post_id = (int) $wp->post_id;
        $url = (string) $wp->attachment_url;
        if ($post_id <= 0 || $url === '') {
            continue;
        }
        // `_wp_attached_file` stores the part under /uploads/.
        $offset = strpos($url, '/uploads/');
        $attachment_urls[$post_id] = $offset !== false ? substr($url, $offset + strlen('/uploads/')) : basename($url);
    }

    return $attachment_urls;
}

/**
 * Old attachment ID → new ID, matching target attachments by uploads subpath.
 *
 * @param  array<int, string>  $attachment_urls  {source id: uploads subpath}
 * @return array<int, int>
 */
function nomia_remap_map_from_files($attachment_urls)
{
    global $wpdb;

    $map = [];
    foreach ($attachment_urls as $old_id => $file) {
        $new = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                REMAP_ATTACHED_FILE,
                $file,
            ),
        );
        if ($new > 0 && get_post_type($new) === 'attachment') {
            $map[$old_id] = $new;
        }
    }

    return $map;
}

/**
 * Maps one list of IDs through the map; IDs that already exist as posts are
 * kept (cover media created after the import), unknown IDs are reported.
 *
 * @param  array<int, int|string>  $ids  Raw stored IDs.
 * @param  array<int, int>  $map  Old → new attachment IDs.
 * @param  array<int, int>  $missing  Collector of unresolvable IDs (by reference).
 * @return array<int, int>
 */
function nomia_remap_ids($ids, array $map, array &$missing)
{
    $mapped = [];
    foreach ((array) $ids as $id) {
        $id = (int) $id;
        if (isset($map[$id])) {
            $mapped[] = $map[$id];

            continue;
        }
        if (get_post($id)) {
            $mapped[] = $id;
        } else {
            $missing[] = $id;
        }
    }

    return array_values(array_unique($mapped));
}

if (get_option(REMAP_DONE_MARKER)) {
    WP_CLI::warning(sprintf("'%s' is set; the remap already ran. Nothing to do.", REMAP_DONE_MARKER));
    exit(0);
}

$map = nomia_remap_map_from_importer();

$wxr = isset($assoc_args['wxr']) ? (string) $assoc_args['wxr'] : '';
if ($wxr === '' && ! empty($args)) {
    foreach ((array) $args as $arg) {
        if (strpos((string) $arg, 'wxr=') === 0) {
            $wxr = substr((string) $arg, 4);
            break;
        }
    }
}
if ($wxr) {
    $map += nomia_remap_map_from_files(nomia_remap_wxr_attachments($wxr));
}

if ($map === []) {
    WP_CLI::error('No attachment map could be built: importer mapping missing and no usable WXR provided. Pass wxr=export.wxr.');
}

WP_CLI::log('Attachment map: '.count($map).' entries.');

$missing = [];
$stores = 0;
$fewer_unmapped = 0;

$galleries = get_posts(
    [
        'post_type' => 'nomia_gallery',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'orderby' => 'ID',
        'order' => 'ASC',
    ],
);

foreach ($galleries as $gallery_id) {
    $raw = get_post_meta($gallery_id, REMAP_META_KEY, true);
    $mapped = nomia_remap_ids(array_filter(array_map('absint', (array) $raw)), $map, $missing);
    $stores += 1;
    if ($mapped !== array_map('intval', (array) $raw)) {
        update_post_meta($gallery_id, REMAP_META_KEY, array_map('absint', $mapped));
        $fewer_unmapped += 1;
    }
}

$option_raw = array_filter(array_map('absint', (array) get_option(REMAP_OPTION_NAME, [])));
$option_new = nomia_remap_ids($option_raw, $map, $missing);
$stores += 1;
if ($option_new !== $option_raw) {
    update_option(REMAP_OPTION_NAME, $option_new);
    $fewer_unmapped += 1;
}

update_option(REMAP_DONE_MARKER, gmdate('c'));

WP_CLI::success(
    sprintf(
        'remap: %d of %d stores changed (%d galleries seen). IDs left as-is (already current): %s',
        $fewer_unmapped,
        $stores,
        count($galleries),
        empty($missing) ? 'none unresolved' : implode(', ', array_unique($missing)).' (unresolved)',
    ),
);
