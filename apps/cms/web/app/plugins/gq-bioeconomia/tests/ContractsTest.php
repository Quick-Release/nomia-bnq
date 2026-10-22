<?php

declare(strict_types=1);

use GetQuick\Bioeconomia\Blocks\BlockPolicy;
use GetQuick\Bioeconomia\Blocks\ContractBlocks;
use GetQuick\Bioeconomia\Blocks\EditorAssets;
use GetQuick\Bioeconomia\Contracts;

/*
|--------------------------------------------------------------------------
| Contracts
|--------------------------------------------------------------------------
|
| Every entry from Contracts::all() must be shaped so that
| register_block_type would accept it, and the same set must end up registered
| after the single bootstrap (beforeAll).
*/

/**
 * Valid WordPress block attribute "type" values.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function gq_bioeconomia_valid_attribute_types(): array {
	return array( 'string', 'boolean', 'number', 'integer', 'array', 'object', 'null' );
}

test('the plugin exposes a non-empty contracts list', function () {
	expect( Contracts::all() )->not()->toBeEmpty();
} );

test('every contract has the required keys with correct types', function () {
	foreach ( Contracts::all() as $contract ) {
		expect( $contract )->toHaveKeys( array( 'blockName', 'title', 'status', 'inserter', 'attributes' ) )
			->and( $contract['blockName'] )->toBeString()->toStartWith( 'getquick/' )
			->and( $contract['title'] )->toBeString()
			->and( $contract['status'] )->toBeIn( array( 'active', 'legacy' ) )
			->and( $contract['inserter'] )->toBeBool()
			->and( $contract['attributes'] )->toBeArray();
	}
} );

test('every declared attribute has a valid WordPress type', function () {
	$valid = gq_bioeconomia_valid_attribute_types();

	foreach ( Contracts::all() as $contract ) {
		foreach ( $contract['attributes'] as $name => $attribute ) {
			expect( $attribute )->toBeArray()
				->and( $attribute )->toHaveKey( 'type' )
				->and( $attribute['type'] )->toBeIn( $valid, "Block {$contract['blockName']} attribute {$name} has invalid type {$attribute['type']}" );
		}
	}
} );

test('block names are unique across contracts', function () {
	$names = array_map( static fn( $contract ) => $contract['blockName'], Contracts::all() );

	expect( $names )->toHaveCount( count( array_unique( $names ) ) );
} );

test('allowed block types keep the editor focused on supported Nomia content', function () {
	$registered = $GLOBALS['gq_bioeconomia_test_state']['registered_blocks'];
	register_block_type( 'getquick-design/container' );
	register_block_type( 'getquick-design/video-hero' );
	register_block_type( 'other-vendor/widget' );
	$allowed = BlockPolicy::supportedBlockTypes();
	$GLOBALS['gq_bioeconomia_test_state']['registered_blocks'] = $registered;

	expect( $allowed )->toContain( 'core/paragraph' )
		->and( $allowed )->toContain( 'core/heading' )
		->and( $allowed )->toContain( 'core/file' )
		->and( $allowed )->toContain( 'core/image' )
		->and( $allowed )->toContain( 'core/list' )
		->and( $allowed )->toContain( 'core/quote' )
		->and( $allowed )->toContain( 'core/columns' )
		->and( $allowed )->toContain( 'core/column' )
		->and( $allowed )->toContain( 'core/buttons' )
		->and( $allowed )->toContain( 'core/button' )
		->and( $allowed )->toContain( 'getquick-design/container' )
		->and( $allowed )->toContain( 'getquick-design/video-hero' )
		->and( $allowed )->not->toContain( 'other-vendor/widget' )
		->and( $allowed )->not->toContain( 'gravityforms/form' )
		->and( $allowed )->toContain( 'getquick/page-hero-static' )
		->and( $allowed )->toContain( 'getquick/library-grid' )
		->and( $allowed )->not->toContain( 'getquick/circular-economy-overview' )
		->and( $allowed )->not->toContain( 'core/html' )
		->and( $allowed )->toContain( 'core/group' )
		->and( $allowed )->toContain( 'core/table' )
		->and( $allowed )->toContain( 'core/gallery' )
		->and( $allowed )->not->toContain( 'core/freeform' )
		->and( $allowed )->not->toContain( 'core/query' )
		->and( $allowed )->not->toContain( 'core/latest-posts' )
		->and( $allowed )->not->toContain( 'core/accordion' )
		->and( $allowed )->not->toContain( 'core/embed' );
} );

test('every contract is registered from its generated block.json metadata', function () {
	$registered  = $GLOBALS['gq_bioeconomia_test_state']['registered_blocks'];
	$blocks_root = dirname( __DIR__ ) . '/blocks';

	foreach ( Contracts::all() as $contract ) {
		expect( $registered )->toHaveKey( $contract['blockName'] );

		$block    = $registered[ $contract['blockName'] ];
		$metadata = $block['metadata'];
		expect( $block['path'] )->toBe( $blocks_root . '/' . $contract['catalogId'] )
			->and( $metadata['apiVersion'] )->toBe( 3 )
			->and( $metadata['title'] )->toBe( $contract['title'] )
			->and( $metadata['description'] )->toBe( $contract['description'] )
			->and( $metadata['textdomain'] )->toBe( 'gq-bioeconomia' )
			// GQ Design's category, which site block plugins share.
			->and( $metadata['category'] )->toBe( 'getquick-design' )
			->and( array_keys( $metadata['attributes'] ) )->toBe( array_keys( $contract['attributes'] ) )
			->and( $metadata )->not()->toHaveKey( 'editorScript' )
			->and( (array) $metadata['editorStyle'] )->toContain( EditorAssets::HANDLE )
			->and( $block['args']['editor_script'] )->toBe( ContractBlocks::editorHandle( $contract['catalogId'] ) )
			->and( $metadata['supports']['html'] )->toBeFalse()
			->and( $metadata['supports']['inserter'] )->toBe( $contract['inserter'] )
			->and( $metadata['example']['attributes'] )->toEqual( $contract['example'] );
	}
} );

test('every block registers its own editor script, as GQ Design blocks do', function () {
	$scripts      = $GLOBALS['gq_bioeconomia_test_state']['registered_scripts'];
	$translations = $GLOBALS['gq_bioeconomia_test_state']['script_translations'];
	$blocks_root  = dirname( __DIR__ ) . '/blocks';

	foreach ( Contracts::all() as $contract ) {
		$handle = ContractBlocks::editorHandle( $contract['catalogId'] );
		$script = $blocks_root . '/' . $contract['catalogId'] . '/index.js';

		expect( $scripts[ $handle ]['src'] )->toEndWith( 'blocks/' . $contract['catalogId'] . '/index.js' )
			->and( $scripts[ $handle ]['deps'] )->toContain( EditorAssets::HANDLE )
			->and( $translations[ $handle ]['domain'] )->toBe( 'gq-bioeconomia' )
			->and( (string) file_get_contents( $script ) )->toContain( '"' . $contract['blockName'] . '"' );
	}
} );

test('blocks register through one metadata collection that matches every block.json', function () {
	$blocks_root = dirname( __DIR__ ) . '/blocks';
	$collections = $GLOBALS['gq_bioeconomia_test_state']['block_metadata_collections'];

	expect( $collections )->toBe( array( $blocks_root => $blocks_root . '/blocks-manifest.php' ) );

	$manifest = require $blocks_root . '/blocks-manifest.php';
	foreach ( Contracts::all() as $contract ) {
		$json = file_get_contents( $blocks_root . '/' . $contract['catalogId'] . '/block.json' );
		expect( $json )->not()->toBeFalse();
		expect( $manifest[ $contract['catalogId'] ] )
			->toEqual( json_decode( (string) $json, true, 512, JSON_THROW_ON_ERROR ) );
	}
} );

test('block.json attributes carry only WordPress schema keywords', function () {
	$contract_only = array( 'ui', 'legacyReads' );
	$walk          = static function ( array $schema, string $path ) use ( &$walk, $contract_only ): void {
		foreach ( $contract_only as $keyword ) {
			expect( $schema )->not()->toHaveKey( $keyword, "{$path} leaks the contract-only `{$keyword}` keyword" );
		}
		foreach ( $schema['properties'] ?? array() as $name => $property ) {
			$walk( $property, "{$path}.properties.{$name}" );
		}
		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$walk( $schema['items'], "{$path}.items" );
		}
	};

	foreach ( $GLOBALS['gq_bioeconomia_test_state']['registered_blocks'] as $name => $block ) {
		foreach ( $block['metadata']['attributes'] as $attribute => $schema ) {
			$walk( $schema, "{$name}.{$attribute}" );
		}
	}
} );
