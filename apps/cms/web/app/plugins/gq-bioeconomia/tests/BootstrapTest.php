<?php

declare(strict_types=1);

use GetQuick\Bioeconomia\Blocks\EditorAssets;
use GetQuick\Bioeconomia\Editor\PageBackground;
use GetQuick\Bioeconomia\GraphQL\BlocksJson;
use GetQuick\Bioeconomia\Plugin;

/*
|--------------------------------------------------------------------------
| Boot
|--------------------------------------------------------------------------
|
| The plugin file only hooks `plugins_loaded`; `Plugin::boot()` wires the
| rest, once. The bootstrap fired the actions, so these tests read what they
| registered.
*/

test( 'the plugin file only boots the plugin on plugins_loaded', function () {
	$hooks = array_column( $GLOBALS['gq_bioeconomia_test_state']['actions'], 'hook' );

	expect( $hooks[0] )->toBe( 'plugins_loaded' )
		->and( array_count_values( $hooks )['plugins_loaded'] )->toBe( 1 );
} );

test( 'wpBlocksJson is registered on pages and posts for the Astro Frontend', function () {
	$fields = $GLOBALS['gq_bioeconomia_test_state']['registered_graphql_fields'];

	expect( $fields['Page']['wpBlocksJson']['type'] ?? null )->toBe( 'String' )
		->and( $fields['Post']['wpBlocksJson']['resolve'] ?? null )->toBe( [ BlocksJson::class, 'resolve' ] );
} );

test( 'the shared editor scripts and style are registered', function () {
	$scripts = $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'];

	expect( $scripts )->toHaveKeys( [ EditorAssets::RULES_HANDLE, EditorAssets::LIB_HANDLE, EditorAssets::HANDLE, EditorAssets::DOCUMENT_HANDLE ] )
		->and( $scripts[ EditorAssets::HANDLE ]['src'] )->toEndWith( 'assets/editor.js' )
		->and( $scripts[ EditorAssets::HANDLE ]['deps'] )->toContain( EditorAssets::RULES_HANDLE, EditorAssets::LIB_HANDLE )
		->and( $GLOBALS['gq_bioeconomia_test_state']['registered_styles'] )->toHaveKey( EditorAssets::HANDLE );
} );

test( 'every registered script is a file the plugin ships, with no build step', function () {
	foreach ( $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'] as $handle => $script ) {
		$path = preg_replace( '#^https://example\.com/plugins/gq-bioeconomia/#', '', $script['src'] );

		expect( is_file( dirname( __DIR__ ) . '/' . $path ) )->toBeTrue( "{$handle}: {$path} does not exist" );
	}
} );

test( 'the document settings load in the block editor', function () {
	gq_bioeconomia_do_action( 'enqueue_block_editor_assets' );

	$document = $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'][ EditorAssets::DOCUMENT_HANDLE ];

	expect( $GLOBALS['gq_bioeconomia_test_state']['enqueued_scripts'] )->toContain( EditorAssets::DOCUMENT_HANDLE )
		->and( $document['deps'] )
		->toContain( 'wp-plugins' )
		// `wp-editor`, not `wp-edit-post`: the document setting panel moved in
		// WordPress 6.6 and `wp.editPost` only re-exports it, deprecated.
		->toContain( 'wp-editor' )
		->not()->toContain( 'wp-edit-post' );
} );

test( 'the page background color is registered as metadata and on GraphQL', function () {
	$graphql_field = $GLOBALS['gq_bioeconomia_test_state']['registered_graphql_fields']['Page']['gqBioeconomiaPageBackgroundColor'];

	$GLOBALS['gq_bioeconomia_test_state']['post_meta'][123][ PageBackground::META_KEY ] = '#E4F7F5';
	$page = new class() {
		public function __isset( $name ): bool {
			return 'databaseId' === $name;
		}

		public function __get( $name ): mixed {
			return 'databaseId' === $name ? 123 : null;
		}
	};

	expect( $GLOBALS['gq_bioeconomia_test_state']['registered_post_meta']['page'] )
		->toHaveKey( PageBackground::META_KEY )
		->and( $graphql_field['resolve']( $page ) )
		->toBe( '#e4f7f5' );
} );

test( 'booting again registers nothing new', function () {
	$actions_before = count( $GLOBALS['gq_bioeconomia_test_state']['actions'] );
	$filters_before = count( $GLOBALS['gq_bioeconomia_test_state']['filters'] );

	( new Plugin() )->boot();

	expect( $GLOBALS['gq_bioeconomia_test_state']['actions'] )->toHaveCount( $actions_before )
		->and( $GLOBALS['gq_bioeconomia_test_state']['filters'] )->toHaveCount( $filters_before );
} );

test( 'changing an editor script changes its cache version even without a plugin version bump', function () {
	$relative = 'assets/cache-version-test-' . uniqid() . '.js';
	$path = GQ_BIOECONOMIA_PLUGIN_DIR . '/' . $relative;
	$handle = 'gq-bioeconomia-cache-version-test';

	try {
		file_put_contents( $path, '/* previous editor */' );
		EditorAssets::registerScript( $handle, $relative, [] );
		$before = $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'][ $handle ]['ver'];

		file_put_contents( $path, '/* editor with new sidebar controls */' );
		EditorAssets::registerScript( $handle, $relative, [] );
		$after = $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'][ $handle ]['ver'];

		expect( $after )->not->toBe( $before );

		EditorAssets::registerScript( $handle, $relative, [] );
		expect( $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'][ $handle ]['ver'] )->toBe( $after );
	} finally {
		unlink( $path );
		unset( $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'][ $handle ] );
	}
} );
