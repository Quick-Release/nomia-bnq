<?php
/**
 * Shared editor assets.
 *
 * @package GetQuick\NomiaBlocks\Blocks
 */

declare(strict_types=1);

namespace GetQuick\NomiaBlocks\Blocks;

use GetQuick\NomiaBlocks\Contracts;
use GetQuick\NomiaBlocks\Plugin;

/**
 * Registers the scripts and styles every Nomia block editor shares.
 *
 * Like GQ Design's, Nomia's editors are plain scripts on WordPress's
 * `window.wp` globals, with no build step. Each block's own script
 * (`blocks/<id>/index.js`) depends on `HANDLE`, which provides the shared
 * fields, the Frontend preview and the generic contract editor.
 */
final class EditorAssets {

	/** The Frontend rules the editor shares with Astro (generated). */
	public const RULES_HANDLE = 'getquick-nomia-blocks-frontend-rules';

	/** Pure helpers. */
	public const LIB_HANDLE = 'getquick-nomia-blocks-lib';

	/** Shared editor runtime and style. */
	public const HANDLE = 'getquick-nomia-blocks-editor';

	/** The page background panel and the button variation. */
	public const DOCUMENT_HANDLE = 'getquick-nomia-blocks-document-settings';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerAssets' ], 20 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueueDocumentSettings' ] );
	}

	/**
	 * Registers the shared scripts and style.
	 */
	public function registerAssets(): void {
		$this->registerScript( self::RULES_HANDLE, 'assets/frontend-rules.js', [] );
		$this->registerScript( self::LIB_HANDLE, 'assets/editor-lib.js', [] );
		$this->registerScript(
			self::HANDLE,
			'assets/editor.js',
			[
				self::RULES_HANDLE,
				self::LIB_HANDLE,
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-data',
				'wp-element',
				'wp-i18n',
			],
		);
		wp_add_inline_script( self::HANDLE, $this->settingsScript(), 'before' );
		$this->registerScript(
			self::DOCUMENT_HANDLE,
			'assets/document-settings.js',
			[
				self::HANDLE,
				'wp-blocks',
				'wp-components',
				'wp-data',
				// `wp-editor`, not `wp-edit-post`: the document setting panel
				// moved to `wp.editor` in WordPress 6.6 and `wp.editPost` only
				// re-exports it behind a deprecation notice.
				'wp-editor',
				'wp-element',
				'wp-i18n',
				'wp-plugins',
			],
		);

		wp_register_style(
			self::HANDLE,
			plugins_url( 'assets/editor.css', GETQUICK_NOMIA_BLOCKS_PLUGIN_FILE ),
			[],
			GETQUICK_NOMIA_BLOCKS_VERSION,
		);
	}

	/**
	 * Enqueues the document-level editor additions.
	 */
	public function enqueueDocumentSettings(): void {
		wp_enqueue_script( self::DOCUMENT_HANDLE );
	}

	/**
	 * Returns the runtime settings and contracts the editor reads.
	 */
	public function settingsScript(): string {
		$frontend_url  = defined( 'GETQUICK_NOMIA_FE_URL' )
			? (string) constant( 'GETQUICK_NOMIA_FE_URL' )
			: home_url( '/' );
		$preview_token = defined( 'GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN' )
			? (string) constant( 'GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN' )
			: '';

		$settings = [
			'nomiaFeBaseUrl' => (string) apply_filters( 'getquick_nomia_blocks_preview_base_url', $frontend_url ),
			'previewToken'   => (string) apply_filters( 'getquick_nomia_blocks_preview_token', $preview_token ),
		];

		return sprintf(
			"window.getquickNomiaBlocksSettings = %s;\nwindow.getquickNomiaBlocksContracts = %s;",
			wp_json_encode( $settings ),
			wp_json_encode( Contracts::all() ),
		);
	}

	/**
	 * Registers a plugin script with its translations.
	 *
	 * @param string             $handle       The script handle.
	 * @param string             $path         The plugin-relative path.
	 * @param array<int, string> $dependencies The script dependencies.
	 */
	public static function registerScript( string $handle, string $path, array $dependencies ): void {
		wp_register_script(
			$handle,
			plugins_url( $path, GETQUICK_NOMIA_BLOCKS_PLUGIN_FILE ),
			$dependencies,
			GETQUICK_NOMIA_BLOCKS_VERSION,
			true,
		);
		wp_set_script_translations( $handle, Plugin::TEXT_DOMAIN, GETQUICK_NOMIA_BLOCKS_PLUGIN_DIR . '/languages' );
	}
}
