<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| block_categories_all filter
|--------------------------------------------------------------------------
|
| Bootstrap adds a `block_categories_all` filter that prepends the
| `getquick-nomia` category. It guards against double-adding, so running the
| callback twice must not duplicate the entry. beforeAll ran bootstrap, so the
| filter is already registered; tests invoke its callback directly.
*/

/**
 * Invoke the plugin's block_categories_all filter once and return the result.
 */
function nomia_blocks_apply_category_filter( array $categories = array() ): array {
	$filters = array_values( array_filter(
		$GLOBALS['nomia_blocks_test_state']['filters'],
		static fn( $filter ) => 'block_categories_all' === $filter['hook']
	) );

	expect( $filters )->toHaveCount( 1, 'bootstrap should register exactly one block_categories_all filter' );

	return $filters[0]['callback']( $categories );
}

test('bootstrap registers exactly one block_categories_all filter', function () {
	$category_filters = array_filter(
		$GLOBALS['nomia_blocks_test_state']['filters'],
		static fn( $filter ) => 'block_categories_all' === $filter['hook']
	);

	expect( $category_filters )->toHaveCount( 1 );
} );

test('the filter adds the getquick-nomia category to an empty list', function () {
	$categories = nomia_blocks_apply_category_filter( array() );
	$slugs      = array_column( $categories, 'slug' );

	expect( $slugs )->toContain( 'getquick-nomia' )
		->and( $slugs[0] )->toBe( 'getquick-nomia' ); // array_unshift → first position
} );

test('the filter is idempotent: running it twice does not duplicate the category', function () {
	$once   = nomia_blocks_apply_category_filter( array() );
	$twice  = nomia_blocks_apply_category_filter( $once );
	$slugs  = array_column( $twice, 'slug' );
	$counts = array_count_values( $slugs );

	expect( $counts['getquick-nomia'] ?? 0 )->toBe( 1 );
} );

test('the filter preserves existing categories', function () {
	$existing = array(
		array( 'slug' => 'text', 'title' => 'Text' ),
		array( 'slug' => 'media', 'title' => 'Media' ),
	);

	$result = nomia_blocks_apply_category_filter( $existing );
	$slugs  = array_column( $result, 'slug' );

	expect( $slugs )->toContain( 'text' )
		->and( $slugs )->toContain( 'media' )
		->and( $slugs )->toContain( 'getquick-nomia' );
} );
