<?php

declare(strict_types=1);

use GetQuick\Bioeconomia\Blocks\EditorAssets;
use GetQuick\Bioeconomia\Contracts;

/*
|--------------------------------------------------------------------------
| Editor settings
|--------------------------------------------------------------------------
|
| An inline script before the shared editor script sets
| `window.gqBioeconomiaSettings` (the Frontend preview's base URL and
| token, both filterable) and `window.gqBioeconomiaContracts`.
*/

/**
 * The inline script added before the shared editor script.
 */
function gq_bioeconomia_settings_script(): string {
	$inline = $GLOBALS['gq_bioeconomia_test_state']['inline_scripts'][ EditorAssets::HANDLE ] ?? [];

	expect( $inline )->toHaveCount( 1 )
		->and( $inline[0]['position'] )->toBe( 'before' );

	return $inline[0]['data'];
}

/**
 * Decode the JSON a `window.<name> = …;` line of the settings script assigns.
 */
function gq_bioeconomia_settings_global( string $name ): mixed {
	preg_match( '/^window\.' . $name . ' = (.*);$/m', gq_bioeconomia_settings_script(), $matches );

	return json_decode( $matches[1] ?? 'null', true );
}

function gq_bioeconomia_apply_filters_calls( string $hook ): array {
	return array_values( array_filter(
		$GLOBALS['gq_bioeconomia_test_state']['apply_filters_calls'],
		static fn( $call ) => $call['hook'] === $hook
	) );
}

test( 'the settings default the Frontend to home_url() with no preview token', function () {
	expect( gq_bioeconomia_settings_global( 'gqBioeconomiaSettings' ) )->toBe(
		[
			'frontendBaseUrl' => 'https://example.com/',
			'previewToken'   => '',
		]
	);
} );

test( 'the editor receives the generated contracts', function () {
	expect( gq_bioeconomia_settings_global( 'gqBioeconomiaContracts' ) )->toEqual( Contracts::all() );
} );

test( 'the base URL and token go through their filters', function () {
	expect( gq_bioeconomia_apply_filters_calls( 'gq_bioeconomia_preview_base_url' )[0]['value'] ?? null )
		->toBe( 'https://example.com/' )
		->and( gq_bioeconomia_apply_filters_calls( 'gq_bioeconomia_preview_token' )[0]['value'] ?? null )
		->toBe( '' );

	add_filter( 'gq_bioeconomia_preview_base_url', static fn() => 'https://fe.nomia.example/' );
	add_filter( 'gq_bioeconomia_preview_token', static fn() => 'secret-token-123' );

	$script = ( new EditorAssets() )->settingsScript();

	expect( $script )->toContain( '"frontendBaseUrl":"https:\/\/fe.nomia.example\/"' )
		->and( $script )->toContain( '"previewToken":"secret-token-123"' );
} );
