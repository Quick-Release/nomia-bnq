<?php

/**
 * Real WordPress regression tests. Run locally with:
 * ddev wp eval-file tests/integration/details.php
 * Creates disposable draft fixtures and removes them even on failure.
 */

if (wp_get_environment_type() !== 'development' && wp_get_environment_type() !== 'local') {
    throw new RuntimeException('These tests require a local/development WordPress database.');
}

$fixture_ids = [];
$initial_user = get_current_user_id();
$initial_version = get_option('nomia_cpt_plugin_version');
$initial_errors = get_option('nomia_cpt_details_migration_errors');
$check = static function ($actual, $expected, $message) {
    if ($actual !== $expected) {
        throw new RuntimeException($message . ': ' . var_export($actual, true));
    }
};
$fixture = static function ($type, $content) use (&$fixture_ids) {
    $id = wp_insert_post(wp_slash(['post_type' => $type, 'post_status' => 'draft', 'post_title' => 'Issue 48 regression fixture', 'post_content' => $content]), true);
    if (is_wp_error($id)) {
        throw new RuntimeException($id->get_error_message());
    }
    $fixture_ids[] = $id;

    return $id;
};

try {
    $id = $fixture('podcasts', '<!-- wp:nomia/podcast-details {"episodeNumber":"01","abstract":"Linha 1\\nLinha 2"} --><article>Old presentation</article><!-- /wp:nomia/podcast-details -->' . "\n" . '<!-- wp:paragraph --><p><a target="_blank" href="https://example.test/?a=1&amp;b=2">Texto</a></p><!-- /wp:paragraph -->');
    $result = nomia_cpt_migrate_details_blocks();
    $check($result['errors'], [], 'Migration succeeds');
    $check(get_post_meta($id, 'nomia_cpt_podcast_episode_number', true), '01', 'Episode stays a string');
    $check(get_post_meta($id, 'nomia_cpt_podcast_abstract', true), "Linha 1\nLinha 2", 'Abstract keeps line breaks');
    $check(get_post_field('post_content', $id), "\n" . '<!-- wp:paragraph --><p><a target="_blank" href="https://example.test/?a=1&amp;b=2">Texto</a></p><!-- /wp:paragraph -->', 'Paired block removal preserves surrounding bytes');
    $check(count(wp_get_post_revisions($id)) > 0, true, 'Source has a recovery revision');
    $check(nomia_cpt_migrate_details_blocks(), ['migrated' => 0, 'errors' => []], 'Rerun is a no-op');
    echo "PASS paired podcast, strings, recovery, content preservation, idempotence\n";

    $graph = $fixture('indicadores', '<!-- wp:group --><div class="wp-block-group"><!-- wp:nomia/graphic-metadata {"internalGraphName":"IG.4","specialization":["N","S"],"dataPoints":[{"x":"15.640","y":"2022"},{"x":"","y":"2021"}]} --><article>Old graph</article><!-- /wp:nomia/graphic-metadata --></div><!-- /wp:group -->');
    update_post_meta($graph, 'nomia_cpt_graphic_source_name', '');
    update_post_meta($graph, 'nomia_cpt_graphic_specialization', []);
    $check(nomia_cpt_migrate_details_blocks()['errors'], [], 'Graph migration succeeds');
    $check(get_post_meta($graph, 'nomia_cpt_graphic_data_points', true), [['x' => '15.640', 'y' => '2022'], ['x' => '', 'y' => '2021']], 'Coordinates and incomplete rows survive');
    $check(get_post_meta($graph, 'nomia_cpt_graphic_geographic_area', true), 'NUTS 0', 'Omitted geographic default is recovered');
    $check(get_post_meta($graph, 'nomia_cpt_graphic_x_axis_type', true), 'number', 'Omitted axis default is recovered');
    $check(get_post_meta($graph, 'nomia_cpt_graphic_specialization', true), [], 'Deliberately empty list wins');
    $check(get_post_field('post_content', $graph), '<!-- wp:group --><div class="wp-block-group"></div><!-- /wp:group -->', 'Nested extraction leaves the wrapper untouched');
    $platform = $fixture('plataformas', '<!-- wp:nomia/platform-details {"setorAtividadeTermId":17,"setorAtividade":"Legacy label","localizacao":"Lisboa"} /-->');
    update_post_meta($platform, 'nomia_cpt_platform_setor_atividade_term_id', 0);
    $sector = wp_insert_term('Issue 48 sector', 'setor_atividade');
    if (is_wp_error($sector)) {
        throw new RuntimeException($sector->get_error_message());
    }
    wp_set_object_terms($platform, [$sector['term_id']], 'setor_atividade');
    try {
        $check(nomia_cpt_migrate_details_blocks()['errors'], [], 'Platform migration succeeds');
        $check(get_post_meta($platform, 'nomia_cpt_platform_setor_atividade_term_id', true), '0', 'Explicit zero wins over stale legacy ID');
        $check(get_post_meta($platform, 'nomia_cpt_platform_setor_atividade', true), 'Legacy label', 'Imported label survives');
        $check(wp_get_object_terms($platform, 'setor_atividade', ['fields' => 'ids']), [$sector['term_id']], 'Taxonomy assignments are untouched');
    } finally {
        wp_delete_term($sector['term_id'], 'setor_atividade');
    }
    $broken = $fixture('eventos', '<!-- wp:nomia/event-details {invalid} /-->');
    $duplicate = $fixture('eventos', '<!-- wp:nomia/event-details {"venue":"A"} /--><!-- wp:nomia/event-details {"venue":"B"} /-->');
    $unclosed = $fixture('podcasts', '<!-- wp:nomia/podcast-details {"episodeNumber":"1"} -->Unclosed');
    $partial = $fixture('podcasts', '<!-- wp:nomia/podcast-details /--><!-- wp:nomia/podcast-details {');
    $before = get_post_field('post_content', $broken);
    $result = nomia_cpt_migrate_details_blocks();
    $check(array_keys($result['errors']), [$broken, $duplicate, $unclosed, $partial], 'Malformed and conflicting sources are reported');
    $check(get_post_field('post_content', $broken), $before, 'Malformed source remains recoverable');
    foreach ([$broken, $duplicate, $unclosed, $partial] as $bad_id) {
        wp_delete_post($bad_id, true);
    }
    $event = $fixture('eventos', '<!-- wp:nomia/event-details {"venue":"Aveiro","mapUrl":"https://example.test/?a=1\\u0026b=2"} /-->');
    $fail_meta = static function ($check, $object_id, $key) use ($event) {
        return $object_id === $event && $key === 'nomia_cpt_event_venue' ? false : $check;
    };
    add_filter('update_post_metadata', $fail_meta, 10, 3);
    $result = nomia_cpt_migrate_details_blocks();
    remove_filter('update_post_metadata', $fail_meta, 10);
    $check(isset($result['errors'][$event]), true, 'Metadata write failures are reported');
    $check(str_contains(get_post_field('post_content', $event), 'wp:nomia/event-details'), true, 'Failed writes retain source');
    $check(nomia_cpt_migrate_details_blocks(), ['migrated' => 1, 'errors' => []], 'Failed metadata write can be retried');
    $check(get_post_meta($event, 'nomia_cpt_event_map_url', true), 'https://example.test/?a=1&b=2', 'Escaped URL query string survives');
    echo "PASS graph arrays/defaults/nesting, falsy metadata, taxonomy isolation, malformed/duplicate blocks, failure/retry\n";

    $editable = $fixture('eventos', '<!-- wp:nomia/event-details {"venue":"Original"} /-->');
    $block_write = static function ($check, $post_id, $key) use ($editable) {
        return $post_id === $editable && $key === 'nomia_cpt_event_venue' ? false : $check;
    };
    add_filter('update_post_metadata', $block_write, 10, 3);
    $check(isset(nomia_cpt_migrate_details_blocks()['errors'][$editable]), true, 'Partial write fails');
    remove_filter('update_post_metadata', $block_write, 10);
    wp_update_post(['ID' => $editable, 'post_content' => '<!-- wp:nomia/event-details {"venue":"Corrected"} /-->']);
    $check(nomia_cpt_migrate_details_blocks()['errors'], [], 'Corrected source can retry after a partial failure');
    $check(get_post_meta($editable, 'nomia_cpt_event_venue', true), 'Corrected', 'Retry uses corrected source for the missing meta');
    $filtered = $fixture('eventos', '<!-- wp:nomia/event-details {"venue":"Porto"} /--><p>Original</p>');
    $alter_content = static function ($data, $postarr) use ($filtered) {
        if ((int) ($postarr['ID'] ?? 0) === $filtered) {
            $data['post_content'] = str_replace('Original', 'Altered', $data['post_content']);
        }
        return $data;
    };
    add_filter('wp_insert_post_data', $alter_content, 10, 2);
    $check(isset(nomia_cpt_migrate_details_blocks()['errors'][$filtered]), true, 'Unexpected save filtering is reported');
    $check(get_post_field('post_content', $filtered), '<!-- wp:nomia/event-details {"venue":"Porto"} /--><p>Original</p>', 'Failed verification restores source bytes');
    $check(isset(nomia_cpt_migrate_details_blocks()['errors'][$filtered]), true, 'Repeated save filtering cannot silently complete');
    remove_filter('wp_insert_post_data', $alter_content, 10);
    $check(nomia_cpt_migrate_details_blocks()['errors'], [], 'Content failure can retry');
    echo "PASS corrected-source retry and content failure recovery\n";

    $registered = get_registered_meta_keys('post', 'indicadores');
    $check(isset($registered['nomia_cpt_graphic_data_points']), true, 'Graph point meta is registered');
    $admin = get_users(['role' => 'administrator', 'number' => 1])[0];
    $previous_user = get_current_user_id();
    wp_set_current_user($admin->ID);
    $base = get_post_type_object('indicadores')->rest_base ?: 'indicadores';
    $request = new WP_REST_Request('POST', '/wp/v2/' . $base . '/' . $graph);
    $request->set_param('meta', ['nomia_cpt_graphic_data_points' => [['x' => '', 'y' => '0.00']], 'nomia_cpt_graphic_specialization' => ['N']]);
    $response = rest_do_request($request);
    $check($response->get_status(), 200, 'Authorized REST update succeeds');
    $check($response->get_data()['meta']['nomia_cpt_graphic_data_points'], [['x' => '', 'y' => '0.00']], 'REST returns typed points');
    $invalid = new WP_REST_Request('POST', '/wp/v2/' . $base . '/' . $graph);
    $invalid->set_param('meta', ['nomia_cpt_graphic_data_points' => [['x' => ['invalid'], 'y' => '2']]]);
    $check(rest_do_request($invalid)->get_status(), 400, 'REST rejects malformed point objects');
    $query = '{ indicador(id: "' . $graph . '", idType: DATABASE_ID) { nomiaGraphicGeographicArea nomiaGraphicDataPoints { x y } nomiaGraphicSpecialization nomiaGraphicSourceName } }';
    $response = graphql(['query' => $query]);
    $check($response['errors'] ?? [], [], 'GraphQL query has no schema errors');
    $check($response['data']['indicador'], ['nomiaGraphicGeographicArea' => 'NUTS 0', 'nomiaGraphicDataPoints' => [['x' => '', 'y' => '0.00']], 'nomiaGraphicSpecialization' => ['N'], 'nomiaGraphicSourceName' => null], 'GraphQL exposes typed lists, defaults and null scalars');
    wp_set_current_user(0);
    $denied = rest_do_request($request);
    $check(in_array($denied->get_status(), [401, 403], true), true, 'Anonymous REST update is denied');
    wp_set_current_user($previous_user);
    echo "PASS REST authorization/schema and typed GraphQL lists/defaults/nulls\n";

    foreach ([
        ['eventos', 'evento', $event, 'nomia_cpt_event_venue', 'nomiaEventVenue', 'Aveiro'],
        ['plataformas', 'plataforma', $platform, 'nomia_cpt_platform_setor_atividade', 'nomiaPlatformSetorAtividade', 'Legacy label'],
        ['podcasts', 'podcast', $id, 'nomia_cpt_podcast_episode_number', 'nomiaPodcastEpisodeNumber', '01'],
    ] as [$post_type, $graphql_type, $record_id, $key, $graphql_field, $expected]) {
        wp_set_current_user($admin->ID);
        $request = new WP_REST_Request('GET', '/wp/v2/' . $post_type . '/' . $record_id);
        $request->set_param('context', 'edit');
        $check(rest_do_request($request)->get_data()['meta'][$key], $expected, $post_type . ' REST returns migrated metadata');
        $response = graphql(['query' => '{ ' . $graphql_type . '(id: "' . $record_id . '", idType: DATABASE_ID) { ' . $graphql_field . ' } }']);
        $check($response['errors'] ?? [], [], $post_type . ' GraphQL has no errors');
        $check($response['data'][$graphql_type][$graphql_field], $expected, $post_type . ' GraphQL returns migrated metadata');
    }
    echo "PASS REST and GraphQL scalar fields on events, platforms, podcasts\n";

    $check(get_post_type_object('eventos')->template, [], 'New events have no legacy template');
    $check(get_post_type_object('plataformas')->template, [], 'New platforms have no legacy template');
    wp_set_current_user($admin->ID);
    $gate = $fixture('eventos', '<!-- wp:nomia/event-details {invalid} /-->');
    $version = get_option('nomia_cpt_plugin_version');
    update_option('nomia_cpt_plugin_version', '0.3.6');
    $check(nomia_cpt_run_upgrade_routines(), false, 'Failed migration does not complete the upgrade');
    $check(get_option('nomia_cpt_plugin_version'), '0.3.6', 'Failed migration keeps old version');
    $check(isset(get_option('nomia_cpt_details_migration_errors')[$gate]), true, 'Upgrade surfaces the affected record');
    wp_update_post(['ID' => $gate, 'post_content' => '<!-- wp:nomia/event-details /-->']);
    $check(nomia_cpt_run_upgrade_routines(), true, 'Upgrade retries after fixing the source');
    $check(get_option('nomia_cpt_plugin_version'), NOMIA_CPT_PLUGIN_VERSION, 'Successful upgrade advances version');
    $check(nomia_cpt_run_upgrade_routines(), false, 'Version gate skips repeat upgrades');
    update_option('nomia_cpt_plugin_version', $version);
    echo "PASS templates and failure-safe version gate\n";

} finally {
    foreach ($fixture_ids as $fixture_id) {
        wp_delete_post($fixture_id, true);
    }
    wp_set_current_user($initial_user);
    update_option('nomia_cpt_plugin_version', $initial_version);
    if (false === $initial_errors) {
        delete_option('nomia_cpt_details_migration_errors');
    } else {
        update_option('nomia_cpt_details_migration_errors', $initial_errors);
    }
}
