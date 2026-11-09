<?php

/**
 * Real WordPress regression tests for gq-bioeconomia. Run locally with:
 * ddev wp eval-file tests/integration/gq-bioeconomia.php
 * Creates disposable draft fixtures and removes them even on failure.
 */

use GetQuick\Bioeconomia\Lifecycle\LegacyRename;
use GetQuick\Bioeconomia\Submissions\PartilheForm;
use GetQuick\Bioeconomia\Submissions\Submissions;

if (wp_get_environment_type() !== 'development' && wp_get_environment_type() !== 'local') {
    throw new RuntimeException('These tests require a local/development WordPress database.');
}

$fixture_ids = [];
$submission_entry = 0;
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

    if (class_exists('GFAPI')) {
        // A Partilhe entry handled while an administrator is logged in: the post
        // still has no author, and the submitter stays out of REST and GraphQL.
        wp_set_current_user($admin->ID);
        $submission_entry = 2000000000 + random_int(0, 99999999);
        $form = PartilheForm::definition() + ['id' => 999999];
        $entry = ['id' => (string) $submission_entry, 'status' => 'active', '1.3' => 'Ana', '1.6' => 'Silva', '2' => 'ana@example.org', '3' => 'eventos', '4' => 'gq-bioeconomia regression fixture', '5' => 'Texto.', '6' => ''];
        (new Submissions())->handle($entry, $form);
        $submitted = (int) gform_get_meta($submission_entry, Submissions::ENTRY_META_POST_ID);
        $fixture_ids[] = $submitted;
        $check(get_post_status($submitted), 'pending', 'A submission is pending');
        $check((int) get_post_field('post_author', $submitted), 0, 'A submission has no author');
        $check(get_post_meta($submitted, Submissions::META_SUBMITTER_EMAIL, true), 'ana@example.org', 'The submitter is kept');
        $data = rest_do_request(new WP_REST_Request('GET', '/wp/v2/eventos/' . $submitted))->get_data();
        $check(str_contains((string) wp_json_encode($data), 'ana@example.org'), false, 'REST does not expose the submitter');
        $response = graphql(['query' => '{ evento(id: "' . $submitted . '", idType: DATABASE_ID) { title } }']);
        $check(str_contains((string) wp_json_encode($response), 'ana@example.org'), false, 'GraphQL does not expose the submitter');
        $entry['3'] = 'page';
        $entry['id'] = (string) ($submission_entry + 1);
        (new Submissions())->handle($entry, $form);
        $check(gform_get_meta($submission_entry + 1, Submissions::ENTRY_META_POST_ID), false, 'Another post type creates nothing');
        echo "PASS Partilhe submissions\n";
    }
} finally {
    foreach ($fixture_ids as $fixture_id) {
        wp_delete_post($fixture_id, true);
    }
    delete_option('nomia_cpt_plugin_version');
    if ($submission_entry && class_exists('GFAPI')) {
        foreach ([$submission_entry, $submission_entry + 1] as $entry_id) {
            gform_delete_meta($entry_id);
            foreach (GFAPI::get_notes(['entry_id' => $entry_id]) ?: [] as $note) {
                GFAPI::delete_note($note->id);
            }
        }
    }
    wp_set_current_user($initial_user);
}
