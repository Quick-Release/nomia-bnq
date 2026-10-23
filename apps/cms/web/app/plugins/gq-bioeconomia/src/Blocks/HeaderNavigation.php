<?php
/**
 * Header navigation block.
 *
 * @package GetQuick\Bioeconomia\Blocks
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Blocks;

use GetQuick\Bioeconomia\Content\ThematicColors;
use WP_Post;

/**
 * The menu behind `getquick/header-navigation`.
 *
 * The editor stores only the chosen menu's ID (`menuId`). Its items reach the
 * Astro Frontend inside the block: `wpBlocksJson` passes the parsed blocks
 * through `withMenus()`, which sets each navigation block's `menuItems`.
 * WPGraphQL shows anonymous callers only the menus assigned to a theme
 * location, so the Frontend can't read a menu by ID itself.
 *
 * In GQ Design's layouts (a Header & Footer pattern, as `designPattern`
 * serves it), the block is declared in GQ Design's catalog as menu-backed, so
 * GQ Design keeps its `menuId` and fills `menuItems` itself (`docs/site-blocks.md`
 * in gq-design, 0.4.2+). Undeclared, it would reach the Frontend with no
 * attributes at all. GQ Design also serves it the thematic term colors
 * (`thematicColors`, as `gqBioeconomiaThematicColors` lists them), since the
 * header sits outside the page whose content carries that palette.
 */
final class HeaderNavigation {

	public const NAME = 'getquick/header-navigation';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'enqueue_block_editor_assets', [ $this, 'exposeMenus' ] );
		add_filter( 'getquick_design_block_definitions', [ $this, 'declareToDesign' ] );
		add_filter( 'getquick_design_block_attributes', [ $this, 'addThematicColors' ], 10, 2 );
	}

	/**
	 * Adds the block to GQ Design's headless catalog as menu-backed.
	 *
	 * @param mixed $definitions GQ Design's block definitions, keyed by block name.
	 * @return mixed The definitions, with this block's.
	 */
	public function declareToDesign( $definitions ) {
		if ( ! is_array( $definitions ) ) {
			return $definitions;
		}

		$definitions[ self::NAME ] = [
			'source'            => 'site',
			'regions'           => [ 'header', 'footer', 'content' ],
			'data_requirements' => [],
			'attributes'        => [
				'menuId'         => 'integer',
				'menuItems'      => 'array',
				'thematicColors' => 'array',
			],
			'tokens'            => [],
			'allowed_children'  => [],
			'renderer_fixture'  => null,
			'enabled'           => true,
		];

		return $definitions;
	}

	/**
	 * Adds the thematic term colors to the block as GQ Design serves it.
	 *
	 * @param mixed  $attributes The block's public attributes.
	 * @param string $name       The block's name.
	 * @return mixed The attributes, with `thematicColors` on this block's.
	 */
	public function addThematicColors( $attributes, $name ) {
		if ( self::NAME !== $name || ! is_array( $attributes ) ) {
			return $attributes;
		}

		$attributes['thematicColors'] = ThematicColors::colors();

		return $attributes;
	}

	/**
	 * Gives the block's editor the site's menus, as `window.gqBioeconomiaMenus`.
	 */
	public function exposeMenus(): void {
		$menus = array_map(
			static fn( $menu ): array => [
				'id'   => (int) $menu->term_id,
				'name' => (string) $menu->name,
			],
			wp_get_nav_menus(),
		);

		wp_add_inline_script(
			ContractBlocks::editorHandle( 'header-navigation' ),
			'window.gqBioeconomiaMenus = ' . wp_json_encode( $menus ) . ';',
			'before',
		);
	}

	/**
	 * Sets `menuItems` on every navigation block, nested ones included.
	 *
	 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
	 * @return array<int, array<string, mixed>> The blocks, with their menus.
	 */
	public static function withMenus( array $blocks ): array {
		return array_map(
			static function ( array $block ): array {
				if ( self::NAME === ( $block['blockName'] ?? null ) ) {
					$attrs              = is_array( $block['attrs'] ?? null ) ? $block['attrs'] : [];
					$attrs['menuItems'] = self::menuItems( (int) ( $attrs['menuId'] ?? 0 ) );
					$block['attrs']     = $attrs;
				}

				if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
					$block['innerBlocks'] = self::withMenus( $block['innerBlocks'] );
				}

				return $block;
			},
			$blocks,
		);
	}

	/**
	 * A menu's published items, in menu order.
	 *
	 * Items whose page, post or term is gone (`_invalid`) are left out, as
	 * WordPress leaves them out of the menus it renders. A missing menu has none.
	 *
	 * @param int $menu_id The menu's term ID.
	 * @return array<int, array{id: int, parentId: int, label: string, url: string, target: string}>
	 */
	public static function menuItems( int $menu_id ): array {
		$items = $menu_id > 0 ? wp_get_nav_menu_items( $menu_id ) : false;

		if ( ! is_array( $items ) ) {
			return [];
		}

		$rows = [];

		foreach ( $items as $item ) {
			if ( ! $item instanceof WP_Post || ! empty( $item->_invalid ) ) {
				continue;
			}

			$rows[] = [
				'id'       => (int) $item->ID,
				'parentId' => (int) $item->menu_item_parent,
				'label'    => wp_strip_all_tags( html_entity_decode( (string) $item->title, ENT_QUOTES, 'UTF-8' ) ),
				'url'      => (string) $item->url,
				'target'   => (string) $item->target,
			];
		}

		return $rows;
	}
}
