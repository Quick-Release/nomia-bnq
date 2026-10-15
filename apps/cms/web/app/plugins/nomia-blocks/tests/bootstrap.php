<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| PHPUnit bootstrap
|--------------------------------------------------------------------------
|
| Loaded once by PHPUnit before Pest runs any test. We load the WP function
| shims (defines ABSPATH), the plugin source, and run its bootstrap exactly
| once. The plugin guards bootstrap with `static $bootstrapped`, so the one
| call here is the only registration for the whole process; tests then read
| the recorded state from tests/Support/WordPressStubs.php.
|
| Tests are effectively read-only over that single bootstrap.
*/

// The plugin's own test dependencies when installed, else the CMS's: the CMS
// suite (`composer test` in apps/cms) runs these tests with its Pest.
require_once is_file( __DIR__ . '/../vendor/autoload.php' )
	? __DIR__ . '/../vendor/autoload.php'
	: __DIR__ . '/../../../../../vendor/autoload.php';
require_once __DIR__ . '/Support/WordPressStubs.php';
require_once __DIR__ . '/../getquick-nomia-blocks.php';

getquick_nomia_blocks_bootstrap();
