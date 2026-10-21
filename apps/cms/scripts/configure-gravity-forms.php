<?php

// Run by WP-CLI during deployment; credentials exist only in the deploy environment.
$auth = json_decode(getenv('COMPOSER_AUTH') ?: '{}', true, 512, JSON_THROW_ON_ERROR);
$license = $auth['http-basic']['composer.gravity.io']['username'] ?? '';

if (! is_string($license) || $license === '') {
    WP_CLI::error('Gravity Forms Composer credentials are missing.');
}

if (! class_exists('GFFormsModel')) {
    WP_CLI::error('Gravity Forms must be active before configuring its license.');
}

if (get_option(GFForms::LICENSE_KEY_OPT) !== md5($license)) {
    GFFormsModel::save_key($license);
}

if (get_option(GFForms::LICENSE_KEY_OPT) !== md5($license)) {
    WP_CLI::error('Gravity Forms could not register the configured license.');
}

WP_CLI::success('Gravity Forms is active and its license is configured.');
