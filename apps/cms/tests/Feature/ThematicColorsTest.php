<?php

require_once dirname(__DIR__) . '/Support/WordPressStubs.php';
require_once dirname(__DIR__, 2) . '/web/app/plugins/nomia-cpt/nomia-cpt.php';

beforeEach(function () {
    $GLOBALS['lgm_test_state']['term_meta'] = [];
    $GLOBALS['lgm_test_state']['capability_overrides'] = [];
    $GLOBALS['lgm_test_state']['term_objects']['tematicas'] = [
        1 => ['slug' => 'economia-circular'],
        2 => ['slug' => 'bioeconomia-sustentavel'],
    ];
    nomia_cpt_register_taxonomies();
    $_POST = [];
});

afterEach(function () {
    $GLOBALS['lgm_test_state']['capability_overrides'] = [];
    $_POST = [];
});

test('the public term color field only allows term editors to write', function () {
    nomia_cpt_register_thematic_color_meta();
    $field = $GLOBALS['lgm_test_state']['registered_term_meta']['tematicas']['_nomia_tematica_color'];
    expect($field['show_in_rest'])->toBeTrue();
    expect($field['sanitize_callback']('#AbC'))->toBe('#aabbcc');
    expect($field['sanitize_callback']('red;display:none'))->toBe('');
    expect($field['sanitize_callback'](['#ffffff']))->toBe('');
    $GLOBALS['lgm_test_state']['capability_overrides']['edit_term'] = false;
    expect($field['auth_callback'](true, '_nomia_tematica_color', 1))->toBeFalse();
});

test('term form saves require both a valid nonce and permission', function () {
    $_POST = ['nomia_tematica_color' => '#123456'];
    nomia_cpt_save_thematic_color(1);
    expect(get_term_meta(1, '_nomia_tematica_color', true))->toBe('');
    $_POST['nomia_tematica_color_nonce'] = 'nonce';
    $GLOBALS['lgm_test_state']['capability_overrides']['manage_categories'] = false;
    nomia_cpt_save_thematic_color(1);
    expect(get_term_meta(1, '_nomia_tematica_color', true))->toBe('');
    $GLOBALS['lgm_test_state']['capability_overrides']['manage_categories'] = true;
    nomia_cpt_save_thematic_color(1);
    expect(get_term_meta(1, '_nomia_tematica_color', true))->toBe('#123456');
    $_POST['nomia_tematica_color'] = '#123456; color:red';
    nomia_cpt_save_thematic_color(1);
    expect(get_term_meta(1, '_nomia_tematica_color', true))->toBe('#123456');
    $_POST['nomia_tematica_color'] = '';
    nomia_cpt_save_thematic_color(1);
    expect(nomia_cpt_get_thematic_color(get_term(1, 'tematicas')))->toBe('');
});

test('the publication palette follows term colors and retains initial identities', function () {
    expect(nomia_cpt_get_thematic_colors())->toBe([
        ['slug' => 'economia-circular', 'color' => '#a4d663'],
        ['slug' => 'bioeconomia-sustentavel', 'color' => '#2ad2c9'],
    ]);
    update_term_meta(2, '_nomia_tematica_color', '#102030');
    expect(nomia_cpt_get_thematic_colors()[1])->toBe(['slug' => 'bioeconomia-sustentavel', 'color' => '#102030']);
});
