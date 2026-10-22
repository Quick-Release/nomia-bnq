<?php

/**
 * Real WordPress regression tests for gq-bioeconomia. Run locally with:
 * ddev wp eval-file tests/integration/gq-bioeconomia.php
 * Creates disposable draft fixtures and removes them even on failure.
 */

use GetQuick\Bioeconomia\Lifecycle\LegacyRename;

if (wp_get_environment_type() !== 'development' && wp_get_environment_type() !== 'local') {
    throw new RuntimeException('These tests require a local/development WordPress database.');
}

$fixture_ids = [];
$initial_user = get_current_user_id();
$check = static function ($actual, $expected, $message) {
    if ($actual !== $expected) {
        throw new RuntimeException($message . ': ' . var_export($actual, true));
    }
};
$fixture = static function ($type, $meta = []) use (&$fixture_ids) {
    $id = wp_insert_post(['post_type' => $type, 'post_status' => 'draft', 'post_title' => 'gq-bioeconomia regression fixture'], true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    $fixture_ids[] = $id;
    foreach ($meta as $key => $value) {
        update_post_meta($id, $key, $value);
    }

    return $id;
};

try {
    $check(is_plugin_active('gq-bioeconomia/gq-bioeconomia.php'), true, 'gq-bioeconomia is active');
    $check(is_plugin_active('nomia-cpt/nomia-cpt.php') || is_plugin_active('nomia-blocks/getquick-nomia-blocks.php'), false, 'The replaced plugins are inactive');
    $check(post_type_exists('gq_bio_gallery') && ! post_type_exists('nomia_gallery'), true, 'The gallery post type is renamed');
    $check(get_option('nomia_cpt_plugin_version'), false, 'The legacy version option is gone');
    echo "PASS plugin activation and post types\n";

    $admin = get_users(['role' => 'administrator', 'number' => 1])[0] ?? null;
    if (! $admin) {
        throw new RuntimeException('An administrator is required.');
    }
    $check(user_can($admin, 'edit_gq_bioeconomia_galleries'), true, 'Administrators hold the renamed capabilities');
    $check(isset(get_role('administrator')->capabilities['edit_nomia_cpt_galleries']), false, 'The legacy capabilities are removed');
    echo "PASS capabilities\n";

    $graph = $fixture('indicadores', ['gq_bioeconomia_graphic_data_points' => [['x' => '', 'y' => '0.00']], 'gq_bioeconomia_graphic_specialization' => ['N']]);
    $event = $fixture('eventos', ['gq_bioeconomia_event_venue' => 'Aveiro']);
    wp_set_current_user($admin->ID);
    $base = get_post_type_object('indicadores')->rest_base ?: 'indicadores';
    $request = new WP_REST_Request('POST', '/wp/v2/' . $base . '/' . $graph);
    $request->set_param('meta', ['gq_bioeconomia_graphic_data_points' => [['x' => '1', 'y' => '2']]]);
    $response = rest_do_request($request);
    $check($response->get_status(), 200, 'Authorized REST update succeeds');
    $check($response->get_data()['meta']['gq_bioeconomia_graphic_data_points'], [['x' => '1', 'y' => '2']], 'REST returns typed points');
    $response = graphql(['query' => '{ indicador(id: "' . $graph . '", idType: DATABASE_ID) { gqBioeconomiaGraphicDataPoints { x y } gqBioeconomiaGraphicSpecialization gqBioeconomiaGraphicGeographicArea } }']);
    $check($response['errors'] ?? [], [], 'Indicator GraphQL has no schema errors');
    $check($response['data']['indicador'], ['gqBioeconomiaGraphicDataPoints' => [['x' => '1', 'y' => '2']], 'gqBioeconomiaGraphicSpecialization' => ['N'], 'gqBioeconomiaGraphicGeographicArea' => 'NUTS 0'], 'GraphQL exposes typed details and defaults');
    $response = graphql(['query' => '{ evento(id: "' . $event . '", idType: DATABASE_ID) { gqBioeconomiaEventVenue } }']);
    $check($response['data']['evento']['gqBioeconomiaEventVenue'] ?? null, 'Aveiro', 'Event GraphQL returns the venue');
    wp_set_current_user(0);
    $check(in_array(rest_do_request($request)->get_status(), [401, 403], true), true, 'Anonymous REST update is denied');
    echo "PASS details through REST and GraphQL\n";

    $response = graphql(['query' => '{ pages(first: 1) { nodes { gqBioeconomiaPageBackgroundColor gqBioeconomiaThematicColors { slug color } } } }']);
    $check($response['errors'] ?? [], [], 'Page GraphQL extension fields resolve');
    $check(rest_do_request(new WP_REST_Request('GET', '/gq-bioeconomia/v1/contact'))->get_status(), 200, 'The contact REST route is renamed');
    echo "PASS page fields and REST routes\n";

    wp_set_current_user($admin->ID);
    $legacy = $fixture('eventos', ['nomia_cpt_event_venue' => 'Porto']);
    $gallery = wp_insert_post(['post_type' => 'nomia_gallery', 'post_status' => 'draft', 'post_title' => 'Legacy gallery fixture'], true);
    $fixture_ids[] = $gallery;
    update_option('nomia_cpt_plugin_version', '0.3.7');
    $check(LegacyRename::run(), true, 'The rename runs while the legacy version exists');
    $check(get_post_meta($legacy, 'gq_bioeconomia_event_venue', true), 'Porto', 'Legacy meta is renamed');
    $check(metadata_exists('post', $legacy, 'nomia_cpt_event_venue'), false, 'Legacy meta key is gone');
    $check(get_post_type($gallery), 'gq_bio_gallery', 'Legacy galleries move to the new post type');
    $check(LegacyRename::run(), false, 'The rename runs once');
    echo "PASS legacy rename\n";
} finally {
    foreach ($fixture_ids as $fixture_id) {
        wp_delete_post($fixture_id, true);
    }
    delete_option('nomia_cpt_plugin_version');
    wp_set_current_user($initial_user);
}
