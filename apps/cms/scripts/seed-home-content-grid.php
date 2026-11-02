<?php

/** Add the initial curated grid to the static homepage, once. Run with wp eval-file. */
declare(strict_types=1);

$home_id = (int) get_option('page_on_front');
$home = get_post($home_id);
if (! $home || get_option('show_on_front') !== 'page') {
    WP_CLI::warning('No static homepage configured; grid was not inserted.');

    return;
}
if (get_option('nomia_selected_content_grid_seeded') || has_block('getquick/selected-content-grid', $home)) {
    WP_CLI::log('Homepage grid already initialized.');

    return;
}
$groups = [
    ['post'],
    ['videos', 'podcasts', 'infografias', 'gq_bio_gallery'],
    ['eventos'],
    ['oportunidades'],
    ['ferramentas', 'plataformas', 'bases_de_dados'],
];
$items = [];
foreach ($groups as $types) {
    $posts = get_posts(['post_type' => $types, 'post_status' => 'publish', 'numberposts' => 1, 'orderby' => ['date' => 'DESC', 'ID' => 'DESC'], 'suppress_filters' => false]);
    $post = $posts[0] ?? null;
    $items[] = $post ? [
        'postId' => $post->ID,
        'postType' => $post->post_type,
        'uri' => wp_make_link_relative(get_permalink($post)),
        'title' => get_the_title($post),
    ] : new stdClass;
}
$block = serialize_block([
    'blockName' => 'getquick/selected-content-grid',
    'attrs' => ['items' => $items],
    'innerBlocks' => [],
    'innerHTML' => '',
    'innerContent' => [],
]);
$result = wp_update_post(['ID' => $home_id, 'post_content' => $home->post_content."\n\n".$block], true);
if (is_wp_error($result)) {
    WP_CLI::error($result->get_error_message());
}
update_option('nomia_selected_content_grid_seeded', true, false);
WP_CLI::success('Homepage grid added with the latest item from each content group.');
