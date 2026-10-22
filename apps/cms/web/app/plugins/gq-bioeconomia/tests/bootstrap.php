<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| PHPUnit bootstrap
|--------------------------------------------------------------------------
|
| Loaded once by PHPUnit before Pest runs any test. We load the WP function
| shims (defines ABSPATH) and the plugin, then fire the actions it hooks the
| way WordPress would: `plugins_loaded` boots it, `init` registers its assets
| and blocks, `graphql_register_types` its fields. Tests then read the recorded
| state from tests/Support/WordPressStubs.php.
|
| Tests are effectively read-only over that single boot.
*/

// The plugin's own test dependencies when installed, else the CMS's: the CMS
// suite (`composer test` in apps/cms) runs these tests with its Pest.
require_once is_file( __DIR__ . '/../vendor/autoload.php' )
	? __DIR__ . '/../vendor/autoload.php'
	: __DIR__ . '/../../../../../vendor/autoload.php';
require_once __DIR__ . '/Support/WordPressStubs.php';
require_once __DIR__ . '/../gq-bioeconomia.php';

gq_bioeconomia_do_action( 'plugins_loaded' );
gq_bioeconomia_do_action( 'init' );
gq_bioeconomia_do_action( 'graphql_register_types' );
