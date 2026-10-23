<?php

use GetQuick\Bioeconomia\Content\Taxonomies;
use GetQuick\Bioeconomia\Content\ThematicColors;

require_once dirname(__DIR__) . '/Support/WordPressStubs.php';
require_once dirname(__DIR__, 2) . '/web/app/plugins/gq-bioeconomia/gq-bioeconomia.php';

beforeEach(function () {
    $GLOBALS['lgm_test_state']['term_meta'] = [];
    $GLOBALS['lgm_test_state']['capability_overrides'] = [];
    $GLOBALS['lgm_test_state']['term_objects']['tematicas'] = [
        1 => ['slug' => 'economia-circular'],
        2 => ['slug' => 'bioeconomia-sustentavel'],
    ];
    Taxonomies::registerAll();
    $_POST = [];
});

afterEach(function () {
    $GLOBALS['lgm_test_state']['capability_overrides'] = [];
    $_POST = [];
});

test('the public term color field only allows term editors to write', function () {
    (new ThematicColors())->registerMeta();
    $field = $GLOBALS['lgm_test_state']['registered_term_meta']['tematicas']['_gq_bioeconomia_tematica_color'];
    expect($field['show_in_rest'])->toBeTrue();
    expect($field['sanitize_callback']('#AbC'))->toBe('#aabbcc');
    expect($field['sanitize_callback']('red;display:none'))->toBe('');
    expect($field['sanitize_callback'](['#ffffff']))->toBe('');
    $GLOBALS['lgm_test_state']['capability_overrides']['edit_term'] = false;
    expect($field['auth_callback'](true, '_gq_bioeconomia_tematica_color', 1))->toBeFalse();
});

test('term form saves require both a valid nonce and permission', function () {
    $_POST = ['gq_bioeconomia_tematica_color' => '#123456'];
    (new ThematicColors())->save(1);
    expect(get_term_meta(1, '_gq_bioeconomia_tematica_color', true))->toBe('');
    $_POST['gq_bioeconomia_tematica_color_nonce'] = 'nonce';
    $GLOBALS['lgm_test_state']['capability_overrides']['manage_categories'] = false;
    (new ThematicColors())->save(1);
    expect(get_term_meta(1, '_gq_bioeconomia_tematica_color', true))->toBe('');
    expect($GLOBALS['lgm_test_state']['did_actions'] ?? [])->not->toContain('getquick_design_flush_layout_cache');
    $GLOBALS['lgm_test_state']['capability_overrides']['manage_categories'] = true;
    (new ThematicColors())->save(1);
    expect(get_term_meta(1, '_gq_bioeconomia_tematica_color', true))->toBe('#123456');
    // GQ Design's cached header carries the palette, so a saved color flushes it.
    expect($GLOBALS['lgm_test_state']['did_actions'])->toContain('getquick_design_flush_layout_cache');
    $_POST['gq_bioeconomia_tematica_color'] = '#123456; color:red';
    (new ThematicColors())->save(1);
    expect(get_term_meta(1, '_gq_bioeconomia_tematica_color', true))->toBe('#123456');
    $_POST['gq_bioeconomia_tematica_color'] = '';
    (new ThematicColors())->save(1);
    expect(ThematicColors::colorFor(get_term(1, 'tematicas')))->toBe('');
});

test('the publication palette follows term colors and retains initial identities', function () {
    expect(ThematicColors::colors())->toBe([
        ['slug' => 'economia-circular', 'color' => '#a4d663'],
        ['slug' => 'bioeconomia-sustentavel', 'color' => '#2ad2c9'],
    ]);
    update_term_meta(2, '_gq_bioeconomia_tematica_color', '#102030');
    expect(ThematicColors::colors()[1])->toBe(['slug' => 'bioeconomia-sustentavel', 'color' => '#102030']);
});
