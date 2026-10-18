<?php

/**
 * Points imported reusable-block references (`<!-- wp:block {"ref":N} /-->`)
 * at the reusable blocks `wp import` created. The importer keeps the source's
 * IDs in post content, so a ref would otherwise name another post or none.
 *
 * Run after `wp import`, with the same WXR:
 *
 *   wp eval-file block-refs.php wxr=/path/to/export.wxr
 *
 * Source reusable blocks are matched to the target's by title. A ref that
 * already names a reusable block with that title is left alone, so running
 * it again changes nothing.
 */
if (! defined('WP_CLI') || ! WP_CLI) {
    exit(1);
}

$wxr = null;
foreach ($args ?? [] as $arg) {
    if (str_starts_with($arg, 'wxr=')) {
        $wxr = substr($arg, 4);
    }
}
if (! $wxr || ! is_readable($wxr)) {
    WP_CLI::error('Pass the WXR: wp eval-file block-refs.php wxr=/path/to/export.wxr');
}

// Source reusable block ID → title, from the WXR.
$xml = simplexml_load_file($wxr);
$sources = [];
foreach ($xml->channel->item as $item) {
    $wp = $item->children('wp', true);
    if ((string) $wp->post_type === 'wp_block') {
        $sources[(int) $wp->post_id] = (string) $item->title;
    }
}

// Source ID → target ID, by title.
$map = [];
foreach ($sources as $source_id => $title) {
    $targets = get_posts(['post_type' => 'wp_block', 'post_status' => 'any', 'title' => $title, 'fields' => 'ids', 'posts_per_page' => 2]);
    if (count($targets) !== 1) {
        WP_CLI::warning(sprintf('Reusable block "%s" (source %d): %d matches here; its refs are left as they are.', $title, $source_id, count($targets)));
        continue;
    }
    $map[$source_id] = (int) $targets[0];
}

global $wpdb;
$changed = 0;
$ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_content LIKE '%<!-- wp:block {\"ref\":%' AND post_type NOT IN ('revision')");
foreach ($ids as $id) {
    $content = get_post_field('post_content', (int) $id, 'raw');
    $updated = preg_replace_callback(
        '/<!-- wp:block \{"ref":(\d+)/',
        static function (array $m) use ($map, $sources): string {
            $ref = (int) $m[1];
            // Already a reusable block with the right title: nothing to do.
            if (get_post_type($ref) === 'wp_block' && in_array(get_the_title($ref), $sources, true)) {
                return $m[0];
            }
            return isset($map[$ref]) ? '<!-- wp:block {"ref":' . $map[$ref] : $m[0];
        },
        $content,
    );
    if ($updated !== $content) {
        $wpdb->update($wpdb->posts, ['post_content' => $updated], ['ID' => (int) $id]);
        clean_post_cache((int) $id);
        $changed++;
        WP_CLI::log("refs updated in post {$id}");
    }
}
WP_CLI::success(sprintf('%d post(s) updated; map %s.', $changed, wp_json_encode($map)));
