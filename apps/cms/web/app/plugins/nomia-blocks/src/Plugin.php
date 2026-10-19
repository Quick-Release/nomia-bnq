<?php
/**
 * Plugin.
 *
 * @package GetQuick\NomiaBlocks
 */

declare(strict_types=1);

namespace GetQuick\NomiaBlocks;

use GetQuick\NomiaBlocks\Blocks\BlockPolicy;
use GetQuick\NomiaBlocks\Blocks\ContractBlocks;
use GetQuick\NomiaBlocks\Blocks\EditorAssets;
use GetQuick\NomiaBlocks\Blocks\HeaderNavigation;
use GetQuick\NomiaBlocks\Editor\PageBackground;
use GetQuick\NomiaBlocks\GraphQL\BlocksJson;

/**
 * Wires Nomia's blocks into WordPress.
 */
final class Plugin {

	public const TEXT_DOMAIN = 'getquick-nomia-blocks';

	/**
	 * Boots the plugin once.
	 */
	public function boot(): void {
		static $booted = false;

		if ( $booted ) {
			return;
		}

		$booted = true;

		add_action( 'init', [ $this, 'loadTextDomain' ] );
		( new PageBackground() )->register();
		( new EditorAssets() )->register();
		( new ContractBlocks() )->register();
		( new BlockPolicy() )->register();
		( new HeaderNavigation() )->register();
		( new BlocksJson() )->register();
	}

	/**
	 * Loads the plugin's translations.
	 *
	 * Source strings are Portuguese, because Portuguese is what this CMS is
	 * edited in; `languages/` carries the catalogs that translate them for any
	 * other locale. Loading on `init` (never earlier) is what WordPress asks
	 * for, so nothing is translated before the textdomain exists.
	 */
	public function loadTextDomain(): void {
		load_plugin_textdomain(
			self::TEXT_DOMAIN,
			false,
			dirname( plugin_basename( GETQUICK_NOMIA_BLOCKS_PLUGIN_FILE ) ) . '/languages',
		);
	}
}
