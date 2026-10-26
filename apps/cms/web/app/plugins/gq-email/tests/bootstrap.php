<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| PHPUnit bootstrap
|--------------------------------------------------------------------------
|
| Loads the WordPress shims and the plugin, then boots it the way WordPress
| would (`plugins_loaded`). Tests read the hooks it recorded.
*/

// The plugin's own test dependencies when installed, else the CMS's: the CMS
// suite (`composer test` in apps/cms) runs these tests with its Pest.
require_once is_file( __DIR__ . '/../vendor/autoload.php' )
	? __DIR__ . '/../vendor/autoload.php'
	: __DIR__ . '/../../../../../vendor/autoload.php';
require_once __DIR__ . '/Support/WordPressStubs.php';
require_once __DIR__ . '/../gq-email.php';

gq_email_run_hook( 'actions', 'plugins_loaded' );
gq_email_run_hook( 'actions', 'rest_api_init' );
