<?php

/**
 * Runs every SVG attachment through safe-svg's sanitizer, as an upload
 * through the media screens would. `wp import` side-loads files without
 * safe-svg's upload filters (which only apply to the admin's upload
 * screens), so the import allows SVG for its own run and this cleans them:
 *
 *   wp --exec='WP_CLI::add_wp_hook("upload_mimes", static fn($m) => $m + ["svg" => "image/svg+xml"]);' \
 *     import export.wxr --authors=create
 *   wp eval-file sanitize-svgs.php
 *
 * A file the sanitizer can't parse is reported and left for review. Running
 * it again rewrites nothing that is already clean.
 */
if (! defined('WP_CLI') || ! WP_CLI) {
    exit(1);
}
if (! class_exists(\enshrined\svgSanitize\Sanitizer::class)) {
    WP_CLI::error('safe-svg is not active: its sanitizer is missing.');
}

$sanitizer = new \enshrined\svgSanitize\Sanitizer();
$sanitizer->minify(true);
$ids = get_posts(['post_type' => 'attachment', 'post_mime_type' => 'image/svg+xml', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids']);
foreach ($ids as $id) {
    $file  = get_attached_file($id);
    $dirty = $file ? @file_get_contents($file) : false;
    if ($dirty === false) {
        WP_CLI::warning("attachment {$id}: can't read {$file}");
        continue;
    }
    $clean = $sanitizer->sanitize($dirty);
    if ($clean === false) {
        WP_CLI::warning("attachment {$id}: not a valid SVG; left for review ({$file})");
        continue;
    }
    if ($clean !== $dirty) {
        file_put_contents($file, $clean);
        WP_CLI::log("attachment {$id}: sanitized");
    }
}
WP_CLI::success(sprintf('%d SVG attachment(s) checked.', count($ids)));
