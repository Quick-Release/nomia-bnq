<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Bootstrap idempotency
|--------------------------------------------------------------------------
|
| getquick_nomia_blocks_bootstrap() uses a `static $bootstrapped` guard so the
| `init` hook can fire it repeatedly without re-registering. beforeAll ran it
| once; here we assert that re-invoking it registers nothing new.
*/

test('the plugin registers only its three entrypoint actions at load', function () {
	expect( $GLOBALS['nomia_blocks_test_state']['actions'] )
		->toBe(
			array(
				array(
					'hook'          => 'init',
					'callback'      => 'getquick_nomia_blocks_bootstrap',
					'priority'      => 10,
					'accepted_args' => 1,
				),
				array(
					'hook'          => 'rest_api_init',
					'callback'      => 'getquick_nomia_blocks_register_release_route',
					'priority'      => 10,
					'accepted_args' => 1,
				),
				array(
					'hook'          => 'graphql_register_types',
					'callback'      => 'getquick_nomia_blocks_register_graphql_fields',
					'priority'      => 10,
					'accepted_args' => 1,
				),
			)
		);
} );

test('wpBlocksJson is registered on pages and posts for the Astro Frontend', function () {
	getquick_nomia_blocks_register_graphql_fields();
	$fields = $GLOBALS['nomia_blocks_test_state']['registered_graphql_fields'];

	expect( $fields['Page']['wpBlocksJson']['type'] ?? null )->toBe( 'String' )
		->and( $fields['Post']['wpBlocksJson']['resolve'] ?? null )->toBe( 'getquick_nomia_blocks_graphql_blocks_json' );
} );

test('bootstrap registered the editor script, style, and blocks', function () {
	expect( $GLOBALS['nomia_blocks_test_state']['registered_scripts'] )
		->toHaveKey( GETQUICK_NOMIA_BLOCKS_HANDLE )
		->and( $GLOBALS['nomia_blocks_test_state']['registered_styles'] )
		->toHaveKey( GETQUICK_NOMIA_BLOCKS_STYLE_HANDLE )
		->and( $GLOBALS['nomia_blocks_test_state']['registered_blocks'] )
		->not()->toBeEmpty();
} );

test('bootstrap registers page background color metadata and GraphQL field', function () {
	$registered_script = $GLOBALS['nomia_blocks_test_state']['registered_scripts'][ GETQUICK_NOMIA_BLOCKS_HANDLE ];
	$graphql_field     = $GLOBALS['nomia_blocks_test_state']['registered_graphql_fields']['Page']['nomiaPageBackgroundColor'];

	$GLOBALS['nomia_blocks_test_state']['post_meta'][123][ GETQUICK_NOMIA_BLOCKS_PAGE_BACKGROUND_META_KEY ] = '#E4F7F5';
	$page = new class {
		public function __isset( $name ): bool {
			return 'databaseId' === $name;
		}

		public function __get( $name ): mixed {
			return 'databaseId' === $name ? 123 : null;
		}
	};

	expect( $GLOBALS['nomia_blocks_test_state']['registered_post_meta']['page'] )
		->toHaveKey( GETQUICK_NOMIA_BLOCKS_PAGE_BACKGROUND_META_KEY )
		->and( $registered_script['deps'] )
		->toContain( 'wp-plugins' )
		// `wp-editor`, not `wp-edit-post`: the document setting panel moved in
		// WordPress 6.6 and `wp.editPost` only re-exports it, deprecated.
		->toContain( 'wp-editor' )
		->not()->toContain( 'wp-edit-post' )
		->and( $graphql_field )
		->toHaveKey( 'resolve' )
		->and( $graphql_field['resolve']( $page ) )
		->toBe( '#e4f7f5' );
} );

test('bootstrap is idempotent: re-invoking it registers nothing new', function () {
	$scripts_before = count( $GLOBALS['nomia_blocks_test_state']['registered_scripts'] );
	$styles_before  = count( $GLOBALS['nomia_blocks_test_state']['registered_styles'] );
	$blocks_before  = count( $GLOBALS['nomia_blocks_test_state']['registered_blocks'] );
	$filters_before = count( $GLOBALS['nomia_blocks_test_state']['filters'] );

	getquick_nomia_blocks_bootstrap();

	expect( $GLOBALS['nomia_blocks_test_state']['registered_scripts'] )->toHaveCount( $scripts_before )
		->and( $GLOBALS['nomia_blocks_test_state']['registered_styles'] )->toHaveCount( $styles_before )
		->and( $GLOBALS['nomia_blocks_test_state']['registered_blocks'] )->toHaveCount( $blocks_before )
		->and( $GLOBALS['nomia_blocks_test_state']['filters'] )->toHaveCount( $filters_before );
} );
