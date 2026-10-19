<?php

declare(strict_types=1);

use GetQuick\NomiaBlocks\Blocks\ContractBlocks;
use GetQuick\NomiaBlocks\Blocks\HeaderNavigation;

/*
|--------------------------------------------------------------------------
| Header navigation
|--------------------------------------------------------------------------
|
| The editor picks a menu from `window.getquickNomiaMenus`; `wpBlocksJson`
| carries the menu's items inside each navigation block (`menuItems`), since
| the Frontend can't read a menu by ID through WPGraphQL.
*/

/**
 * A menu item as `wp_get_nav_menu_items()` returns it.
 */
function nomia_blocks_menu_item( int $id, int $parent, string $title, string $url, array $extra = [] ): WP_Post {
	return new WP_Post( $extra + [
		'ID'               => $id,
		'menu_item_parent' => (string) $parent,
		'title'            => $title,
		'url'              => $url,
		'target'           => '',
	] );
}

afterEach( function () {
	unset( $GLOBALS['nomia_blocks_test_state']['nav_menus'], $GLOBALS['nomia_blocks_test_state']['nav_menu_items'] );
} );

test('the editor gets the site menus before the block script', function () {
	$GLOBALS['nomia_blocks_test_state']['nav_menus'] = [
		(object) [ 'term_id' => 7, 'name' => 'Principal' ],
		(object) [ 'term_id' => 9, 'name' => 'Rodapé' ],
	];
	$handle = ContractBlocks::editorHandle( 'header-navigation' );
	$before = $GLOBALS['nomia_blocks_test_state']['inline_scripts'][ $handle ] ?? [];

	( new HeaderNavigation() )->exposeMenus();

	$inline = array_slice( $GLOBALS['nomia_blocks_test_state']['inline_scripts'][ $handle ], count( $before ) );
	expect( $inline )->toHaveCount( 1 )
		->and( $inline[0]['position'] )->toBe( 'before' );

	preg_match( '/^window\.getquickNomiaMenus = (.*);$/', $inline[0]['data'], $matches );
	expect( json_decode( $matches[1] ?? 'null', true ) )->toBe( [
		[ 'id' => 7, 'name' => 'Principal' ],
		[ 'id' => 9, 'name' => 'Rodapé' ],
	] );
} );

test('navigation blocks carry their menu items, nested ones included', function () {
	$GLOBALS['nomia_blocks_test_state']['nav_menu_items'][7] = [
		nomia_blocks_menu_item( 11, 0, 'Bioeconomia &amp; <b>circular</b>', 'https://example.com/bioeconomia/' ),
		nomia_blocks_menu_item( 12, 11, 'Barómetro', 'https://example.com/barometro/', [ 'target' => '_blank' ] ),
		nomia_blocks_menu_item( 13, 0, 'Página apagada', '', [ '_invalid' => true ] ),
	];

	$blocks = HeaderNavigation::withMenus( [
		[ 'blockName' => 'getquick/header-navigation', 'attrs' => [ 'menuId' => 7 ], 'innerBlocks' => [] ],
		[
			'blockName'   => 'getquick/section',
			'attrs'       => [],
			'innerBlocks' => [
				[ 'blockName' => 'getquick/header-navigation', 'attrs' => [ 'menuId' => 7 ], 'innerBlocks' => [] ],
			],
		],
	] );

	$expected = [
		[ 'id' => 11, 'parentId' => 0, 'label' => 'Bioeconomia & circular', 'url' => 'https://example.com/bioeconomia/', 'target' => '' ],
		[ 'id' => 12, 'parentId' => 11, 'label' => 'Barómetro', 'url' => 'https://example.com/barometro/', 'target' => '_blank' ],
	];
	expect( $blocks[0]['attrs']['menuItems'] )->toBe( $expected )
		->and( $blocks[1]['innerBlocks'][0]['attrs']['menuItems'] )->toBe( $expected )
		->and( $blocks[1]['attrs'] )->not()->toHaveKey( 'menuItems' );
} );

test('a block without a menu, or with a deleted one, has no items', function () {
	$blocks = HeaderNavigation::withMenus( [
		[ 'blockName' => 'getquick/header-navigation', 'attrs' => [], 'innerBlocks' => [] ],
		[ 'blockName' => 'getquick/header-navigation', 'attrs' => [ 'menuId' => 404 ], 'innerBlocks' => [] ],
	] );

	expect( $blocks[0]['attrs']['menuItems'] )->toBe( [] )
		->and( $blocks[1]['attrs']['menuItems'] )->toBe( [] );
} );

test('a saved menuItems attribute is replaced by the menu', function () {
	$blocks = HeaderNavigation::withMenus( [
		[
			'blockName'   => 'getquick/header-navigation',
			'attrs'       => [ 'menuId' => 0, 'menuItems' => [ [ 'id' => 1, 'label' => 'Forged', 'url' => '/x/' ] ] ],
			'innerBlocks' => [],
		],
	] );

	expect( $blocks[0]['attrs']['menuItems'] )->toBe( [] );
} );
