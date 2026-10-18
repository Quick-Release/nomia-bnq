<?php

declare(strict_types=1);

use GetQuick\NomiaBlocks\Blocks\EditorAssets;
use GetQuick\NomiaBlocks\Contracts;

/*
|--------------------------------------------------------------------------
| Editor settings
|--------------------------------------------------------------------------
|
| An inline script before the shared editor script sets
| `window.getquickNomiaBlocksSettings` (the Frontend preview's base URL and
| token, both filterable) and `window.getquickNomiaBlocksContracts`.
*/

/**
 * The inline script added before the shared editor script.
 */
function nomia_blocks_settings_script(): string {
	$inline = $GLOBALS['nomia_blocks_test_state']['inline_scripts'][ EditorAssets::HANDLE ] ?? [];

	expect( $inline )->toHaveCount( 1 )
		->and( $inline[0]['position'] )->toBe( 'before' );

	return $inline[0]['data'];
}

/**
 * Decode the JSON a `window.<name> = …;` line of the settings script assigns.
 */
function nomia_blocks_settings_global( string $name ): mixed {
	preg_match( '/^window\.' . $name . ' = (.*);$/m', nomia_blocks_settings_script(), $matches );

	return json_decode( $matches[1] ?? 'null', true );
}

function nomia_blocks_apply_filters_calls( string $hook ): array {
	return array_values( array_filter(
		$GLOBALS['nomia_blocks_test_state']['apply_filters_calls'],
		static fn( $call ) => $call['hook'] === $hook
	) );
}

test( 'the settings default the Frontend to home_url() with no preview token', function () {
	expect( nomia_blocks_settings_global( 'getquickNomiaBlocksSettings' ) )->toBe(
		[
			'nomiaFeBaseUrl' => 'https://example.com/',
			'previewToken'   => '',
		]
	);
} );

test( 'the editor receives the generated contracts', function () {
	expect( nomia_blocks_settings_global( 'getquickNomiaBlocksContracts' ) )->toEqual( Contracts::all() );
} );

test( 'the base URL and token go through their filters', function () {
	expect( nomia_blocks_apply_filters_calls( 'getquick_nomia_blocks_preview_base_url' )[0]['value'] ?? null )
		->toBe( 'https://example.com/' )
		->and( nomia_blocks_apply_filters_calls( 'getquick_nomia_blocks_preview_token' )[0]['value'] ?? null )
		->toBe( '' );

	add_filter( 'getquick_nomia_blocks_preview_base_url', static fn() => 'https://fe.nomia.example/' );
	add_filter( 'getquick_nomia_blocks_preview_token', static fn() => 'secret-token-123' );

	$script = ( new EditorAssets() )->settingsScript();

	expect( $script )->toContain( '"nomiaFeBaseUrl":"https:\/\/fe.nomia.example\/"' )
		->and( $script )->toContain( '"previewToken":"secret-token-123"' );
} );
