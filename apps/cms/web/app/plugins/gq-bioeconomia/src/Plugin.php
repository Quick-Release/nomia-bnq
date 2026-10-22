<?php
/**
 * Plugin.
 *
 * @package GetQuick\Bioeconomia
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia;

use GetQuick\Bioeconomia\Admin\AdminMenu;
use GetQuick\Bioeconomia\Admin\ContactSettings;
use GetQuick\Bioeconomia\Admin\ContentLists;
use GetQuick\Bioeconomia\Admin\FooterSettings;
use GetQuick\Bioeconomia\Admin\Galleries;
use GetQuick\Bioeconomia\Blocks\BlockPolicy;
use GetQuick\Bioeconomia\Blocks\ContractBlocks;
use GetQuick\Bioeconomia\Blocks\EditorAssets;
use GetQuick\Bioeconomia\Blocks\HeaderNavigation;
use GetQuick\Bioeconomia\Content\PostTypes;
use GetQuick\Bioeconomia\Content\ThematicColors;
use GetQuick\Bioeconomia\Details\LibraryDetails;
use GetQuick\Bioeconomia\Details\PostDetails;
use GetQuick\Bioeconomia\Editor\PageBackground;
use GetQuick\Bioeconomia\GraphQL\BlocksJson;
use GetQuick\Bioeconomia\Lifecycle\Lifecycle;

/**
 * Wires Nomia's content model and blocks into WordPress.
 */
final class Plugin {

	public const TEXT_DOMAIN = 'gq-bioeconomia';

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
		( new PostTypes() )->register();
		( new ThematicColors() )->register();
		( new PostDetails() )->register();
		( new LibraryDetails() )->register();
		( new Galleries() )->register();
		( new FooterSettings() )->register();
		( new ContactSettings() )->register();
		( new ContentLists() )->register();
		( new AdminMenu() )->register();
		( new Lifecycle() )->register();
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
			dirname( plugin_basename( GQ_BIOECONOMIA_PLUGIN_FILE ) ) . '/languages',
		);
	}
}
