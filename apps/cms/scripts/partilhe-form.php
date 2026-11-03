<?php

/**
 * Creates the Partilhe form (/partilhe/) in Gravity Forms, or keeps its
 * content types in step with gq-bioeconomia's post types:
 *
 *   wp --user=<admin> eval-file scripts/partilhe-form.php            # from apps/cms
 *   wp --user=<admin> eval-file scripts/partilhe-form.php dry-run    # report only
 *   wp eval-file scripts/partilhe-form.php export > partilhe.json    # Forms → Import Forms
 *
 * The form is the one whose CSS class includes `gq-bioeconomia-partilhe`
 * (GetQuick\Bioeconomia\Submissions\PartilheForm). Without one, the script
 * creates it from PartilheForm::definition(). With one, it only replaces the
 * "Tipo de conteúdo" choices when they differ from the post types, so labels,
 * notifications and confirmations edited in the CMS are kept. Running it again
 * changes nothing. docs/plans/partilhe-submissions.md describes the form.
 *
 * @package NomiaBnq
 */

use GetQuick\Bioeconomia\Submissions\PartilheForm;

if (! defined('WP_CLI') || ! WP_CLI) {
    return;
}

if (! class_exists('GFAPI') || ! class_exists(PartilheForm::class)) {
    WP_CLI::error('Gravity Forms and gq-bioeconomia must be active.');
}

$args = $args ?? [];

if (in_array('export', $args, true)) {
    WP_CLI::line((string) wp_json_encode(['0' => PartilheForm::definition(), 'version' => GFForms::$version], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    return;
}

if (! current_user_can('gform_full_access') && ! current_user_can('gravityforms_create_form')) {
    WP_CLI::error('Run as an administrator: wp --user=<admin> eval-file scripts/partilhe-form.php');
}

$dry_run = in_array('dry-run', $args, true);
$forms = array_values(array_filter(GFAPI::get_forms(null, false), [PartilheForm::class, 'isPartilheForm']));

if (count($forms) > 1) {
    WP_CLI::error(sprintf('More than one form has the CSS class %s: %s.', PartilheForm::CSS_CLASS, implode(', ', array_column($forms, 'id'))));
}

if ([] === $forms) {
    if ($dry_run) {
        WP_CLI::success('Dry run: would create the Partilhe form.');

        return;
    }

    $form_id = GFAPI::add_form(PartilheForm::definition());
    if (is_wp_error($form_id)) {
        WP_CLI::error($form_id->get_error_message());
    }

    WP_CLI::success(sprintf('Created the Partilhe form: id %d.', $form_id));

    return;
}

$form = $forms[0];
$choices = PartilheForm::contentTypeChoices();

foreach ($form['fields'] as $field) {
    if (PartilheForm::LABEL_CONTENT_TYPE !== ($field->adminLabel ?? '')) {
        continue;
    }

    $current = array_map(static fn($choice) => [$choice['value'] ?? '', $choice['text'] ?? ''], (array) $field->choices);
    $wanted = array_map(static fn($choice) => [$choice['value'], $choice['text']], $choices);

    if ($current === $wanted) {
        WP_CLI::success(sprintf('The Partilhe form (id %d) is up to date.', $form['id']));

        return;
    }

    if ($dry_run) {
        WP_CLI::success(sprintf('Dry run: would update the content types of the Partilhe form (id %d).', $form['id']));

        return;
    }

    $field->choices = $choices;
    $result = GFAPI::update_form($form);
    if (is_wp_error($result)) {
        WP_CLI::error($result->get_error_message());
    }

    WP_CLI::success(sprintf('Updated the content types of the Partilhe form (id %d).', $form['id']));

    return;
}

WP_CLI::error(sprintf('The Partilhe form (id %d) has no field with the admin label %s.', $form['id'], PartilheForm::LABEL_CONTENT_TYPE));
