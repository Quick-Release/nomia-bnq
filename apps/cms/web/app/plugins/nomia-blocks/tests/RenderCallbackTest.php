<?php

declare(strict_types=1);

use GetQuick\NomiaBlocks\Contracts;

/*
|--------------------------------------------------------------------------
| render_callback placeholder
|--------------------------------------------------------------------------
|
| Every registered block's render_callback emits a debug HTML comment so that
| REST `content(format: RENDERED)` and non-headless views show *something*,
| without affecting the Astro-rendered output (which is sourced from
| `content(format: RAW)` / `wpBlocksJson`). This suite pins that contract.
*/

test('every registered block exposes a render_callback', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];

	foreach ( Contracts::all() as $contract ) {
		expect( $registered[ $contract['blockName'] ]['args'] )->toHaveKey( 'render_callback' );
	}
} );

test('render_callback returns a non-empty debug comment rather than blank output', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];

	foreach ( Contracts::all() as $contract ) {
		$callback = $registered[ $contract['blockName'] ]['args']['render_callback'];
		$output   = $callback( array( 'blockId' => $contract['catalogId'], 'title' => 'Hello' ) );

		expect( $output )
			->not()->toBeEmpty()
			->toStartWith( '<!-- getquick/' )
			->toEndWith( ' -->' )
			->toContain( 'rendered by Astro (Bioeconomia.pt)' )
			->toContain( $contract['catalogId'] );
	}
} );

test('render_callback echoes the serialized attributes for debuggability', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];
	$contract   = Contracts::all()[0];
	$callback   = $registered[ $contract['blockName'] ]['args']['render_callback'];

	$attributes = array( 'title' => 'A test title', 'count' => 3 );

	expect( $callback( $attributes ) )->toContain( (string) wp_json_encode( $attributes ) );
} );

test('attribute text cannot close the debug comment', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];
	$contract   = Contracts::all()[0];
	$callback   = $registered[ $contract['blockName'] ]['args']['render_callback'];

	$attributes = array( 'title' => 'Bioeconomia --> <script>alert(1)</script>' );
	$output     = $callback( $attributes );

	// One comment, ended by the callback and not by the attribute text.
	expect( substr_count( $output, '-->' ) )->toBe( 1 );
	expect( $output )->toEndWith( ' -->' );
	expect( $output )->not()->toContain( '<script' );
} );

test('escaped attributes still decode to the value an editor typed', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];
	$contract   = Contracts::all()[0];
	$callback   = $registered[ $contract['blockName'] ]['args']['render_callback'];

	$attributes = array( 'title' => 'a --> b & c <em>d</em>' );

	// The same shape the Astro-side parser matches: everything between
	// "attributes: " and the closing delimiter is the JSON payload.
	preg_match( '/attributes: (.*) -->$/', $callback( $attributes ), $matches );

	expect( json_decode( $matches[1], true ) )->toBe( $attributes );
} );

test('container blocks keep their nested content in the rendered projection', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];
	$containers = array_filter(
		Contracts::all(),
		static fn( array $contract ): bool => (bool) ( $contract['container'] ?? false )
	);

	expect( $containers )->not()->toBeEmpty();

	foreach ( $containers as $contract ) {
		$callback = $registered[ $contract['blockName'] ]['args']['render_callback'];
		$output   = $callback( array( 'blockId' => $contract['catalogId'] ), '<p>Nested child</p>' );

		expect( $output )
			->toContain( 'rendered by Astro (Bioeconomia.pt)' )
			->toEndWith( '<p>Nested child</p>' );
	}
} );

test('leaf blocks still render only the debug comment', function () {
	$registered = $GLOBALS['nomia_blocks_test_state']['registered_blocks'];

	foreach ( Contracts::all() as $contract ) {
		if ( (bool) ( $contract['container'] ?? false ) ) {
			continue;
		}

		$callback = $registered[ $contract['blockName'] ]['args']['render_callback'];

		expect( $callback( array( 'blockId' => $contract['catalogId'] ) ) )->toEndWith( ' -->' );
	}
} );
