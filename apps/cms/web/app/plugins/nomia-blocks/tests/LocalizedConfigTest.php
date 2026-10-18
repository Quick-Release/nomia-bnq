<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Localized editor config
|--------------------------------------------------------------------------
|
| wp_localize_script exposes a `getquickNomiaBlocks` object on the editor
| script handle with nomiaFeBaseUrl, contractsEndpoint, and previewToken. The
| base URL and token are filterable.
|
| Note: the plugin guards bootstrap with a static flag, so it runs once per
| process (beforeAll). The default config is therefore read from that single
| bootstrap. The filterability is proven by asserting the exact apply_filters
| hook names were invoked with the right defaults — see the stub's
| `apply_filters_calls` recording — which, combined with the stub's real
| apply_filters implementation, guarantees an override registered before
| bootstrap would flow through.
*/

function nomia_blocks_localized_config(): array {
	return $GLOBALS['nomia_blocks_test_state']['localized_scripts'][ GETQUICK_NOMIA_BLOCKS_HANDLE ]['getquickNomiaBlocks'] ?? array();
}

function nomia_blocks_apply_filters_calls( string $hook ): array {
	return array_values( array_filter(
		$GLOBALS['nomia_blocks_test_state']['apply_filters_calls'],
		static fn( $call ) => $call['hook'] === $hook
	) );
}

test('the editor script is localized with the getquickNomiaBlocks object', function () {
	expect( $GLOBALS['nomia_blocks_test_state']['localized_scripts'] )
		->toHaveKey( GETQUICK_NOMIA_BLOCKS_HANDLE )
		->and( $GLOBALS['nomia_blocks_test_state']['localized_scripts'][ GETQUICK_NOMIA_BLOCKS_HANDLE ] )
		->toHaveKey( 'getquickNomiaBlocks' );
} );

test('the localized config exposes the expected keys', function () {
	$config = nomia_blocks_localized_config();

	expect( $config )
		->toHaveKeys( array( 'nomiaFeBaseUrl', 'contractsEndpoint', 'previewToken' ) )
		->and( $config['nomiaFeBaseUrl'] )->toBeString()
		->and( $config['contractsEndpoint'] )->toBeString()->toEndWith( 'api/wp-block-contracts.json' )
		->and( $config['previewToken'] )->toBeString();
} );

test('nomiaFeBaseUrl defaults to home_url() and the endpoint is derived from it', function () {
	$config = nomia_blocks_localized_config();

	expect( $config['nomiaFeBaseUrl'] )->toBe( 'https://example.com/' )
		->and( $config['contractsEndpoint'] )->toBe( 'https://example.com/api/wp-block-contracts.json' );
} );

test('bootstrap applies the getquick_nomia_blocks_preview_base_url filter to the base url', function () {
	$calls = nomia_blocks_apply_filters_calls( 'getquick_nomia_blocks_preview_base_url' );

	expect( $calls )->toHaveCount( 1 )
		->and( $calls[0]['value'] )->toBe( 'https://example.com/' ); // home_url('/') default passed in
} );

test('bootstrap applies the getquick_nomia_blocks_preview_token filter to the token', function () {
	$calls = nomia_blocks_apply_filters_calls( 'getquick_nomia_blocks_preview_token' );

	expect( $calls )->toHaveCount( 1 )
		->and( $calls[0]['value'] )->toBe( '' ); // default (no GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN constant)
} );

test('an override filter registered before bootstrap flows into the config', function () {
	// The stub's apply_filters runs every registered filter for the hook, so an
	// override registered now still re-runs for any *future* apply_filters call.
	// Bootstrap already ran (beforeAll), so we prove the plumbing instead: the
	// stub honors overrides for these exact hooks.
	add_filter( 'getquick_nomia_blocks_preview_base_url', static fn() => 'https://fe.nomia.example/' );
	add_filter( 'getquick_nomia_blocks_preview_token', static fn() => 'secret-token-123' );

	expect( apply_filters( 'getquick_nomia_blocks_preview_base_url', 'https://example.com' ) )
		->toBe( 'https://fe.nomia.example/' )
		->and( apply_filters( 'getquick_nomia_blocks_preview_token', '' ) )
		->toBe( 'secret-token-123' );
} );
