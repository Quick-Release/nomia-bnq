<?php
/**
 * Shared editor assets.
 *
 * @package GetQuick\Bioeconomia\Blocks
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Blocks;

use GetQuick\Bioeconomia\Contracts;
use GetQuick\Bioeconomia\Plugin;

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
	public const RULES_HANDLE = 'gq-bioeconomia-frontend-rules';

	/** Pure helpers. */
	public const LIB_HANDLE = 'gq-bioeconomia-lib';

	/** Shared editor runtime and style. */
	public const HANDLE = 'gq-bioeconomia-editor';

	/** The page background panel and the button variation. */
	public const DOCUMENT_HANDLE = 'gq-bioeconomia-document-settings';

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
			plugins_url( 'assets/editor.css', GQ_BIOECONOMIA_PLUGIN_FILE ),
			[],
			GQ_BIOECONOMIA_VERSION,
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
		$frontend_url  = defined( 'GQ_BIOECONOMIA_FRONTEND_URL' )
			? (string) constant( 'GQ_BIOECONOMIA_FRONTEND_URL' )
			: home_url( '/' );
		$preview_token = defined( 'GQ_BIOECONOMIA_PREVIEW_TOKEN' )
			? (string) constant( 'GQ_BIOECONOMIA_PREVIEW_TOKEN' )
			: '';

		$settings = [
			'frontendBaseUrl' => (string) apply_filters( 'gq_bioeconomia_preview_base_url', $frontend_url ),
			'previewToken'    => (string) apply_filters( 'gq_bioeconomia_preview_token', $preview_token ),
		];

		return sprintf(
			"window.gqBioeconomiaSettings = %s;\nwindow.gqBioeconomiaContracts = %s;",
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
			plugins_url( $path, GQ_BIOECONOMIA_PLUGIN_FILE ),
			$dependencies,
			GQ_BIOECONOMIA_VERSION,
			true,
		);
		wp_set_script_translations( $handle, Plugin::TEXT_DOMAIN, GQ_BIOECONOMIA_PLUGIN_DIR . '/languages' );
	}
}
