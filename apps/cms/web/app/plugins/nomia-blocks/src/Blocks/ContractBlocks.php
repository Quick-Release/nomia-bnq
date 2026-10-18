<?php
/**
 * Nomia's structured blocks.
 *
 * @package GetQuick\NomiaBlocks\Blocks
 */

declare(strict_types=1);

namespace GetQuick\NomiaBlocks\Blocks;

use GetQuick\NomiaBlocks\Contracts;

/**
 * Registers every block in `Contracts`, each from its `blocks/<id>/` folder.
 *
 * Every block is described by a generated `blocks/<catalogId>/block.json`:
 * apiVersion, title, category, icon, keywords, attributes, supports, example
 * and editor style. WordPress translates the metadata through its
 * `textdomain`. As in GQ Design, each block's editor script is its own
 * `index.js`, registered here with its translations.
 */
final class ContractBlocks {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerBlocks' ], 20 );
	}

	/**
	 * Registers the blocks.
	 */
	public function registerBlocks(): void {
		$blocks_root = GETQUICK_NOMIA_BLOCKS_PLUGIN_DIR . '/blocks';

		// The collection manifest lets core register all of them without
		// decoding each JSON file per request.
		wp_register_block_metadata_collection( $blocks_root, $blocks_root . '/blocks-manifest.php' );

		foreach ( Contracts::all() as $contract ) {
			$catalog_id = (string) $contract['catalogId'];
			$handle     = self::editorHandle( $catalog_id );

			EditorAssets::registerScript(
				$handle,
				'blocks/' . $catalog_id . '/index.js',
				[
					EditorAssets::HANDLE,
					'wp-block-editor',
					'wp-blocks',
					'wp-components',
					'wp-data',
					'wp-element',
					'wp-i18n',
				],
			);

			register_block_type(
				$blocks_root . '/' . $catalog_id,
				[
					'editor_script'   => $handle,
					'render_callback' => static fn( array $attributes, string $content = '' ): string => self::render( $catalog_id, $attributes, $content ),
				],
			);
		}
	}

	/**
	 * Returns a block's editor script handle.
	 *
	 * @param string $catalog_id The block's catalog ID.
	 */
	public static function editorHandle( string $catalog_id ): string {
		return 'getquick-nomia-' . $catalog_id . '-editor';
	}

	/**
	 * Renders a block's placeholder.
	 *
	 * Frontend rendering is owned by the Astro web app via content(format: RAW).
	 * This placeholder keeps REST `content(format: RENDERED)` and non-headless
	 * views debuggable without affecting the Astro output. Container blocks
	 * append their rendered children so nested content is not silently dropped
	 * from the RENDERED projection.
	 *
	 * @param string               $catalog_id The block's catalog ID.
	 * @param array<string, mixed> $attributes The block attributes.
	 * @param string               $content    The rendered inner blocks.
	 */
	public static function render( string $catalog_id, array $attributes, string $content = '' ): string {
		return sprintf(
			'<!-- getquick/%s rendered by Astro (Bioeconomia.pt). attributes: %s -->',
			sanitize_key( $catalog_id ),
			self::encodeCommentAttributes( $attributes ),
		) . $content;
	}

	/**
	 * Encodes block attributes for embedding inside an HTML comment.
	 *
	 * An HTML comment ends at the first `-->`, so attribute text an editor typed
	 * must not be able to produce one: a hero title containing `-->` would close
	 * the debug comment early and let whatever followed it render as markup, in
	 * every consumer of `content( format: RENDERED )`.
	 *
	 * `JSON_HEX_TAG` escapes `<` and `>` to their \uXXXX form, and the remaining
	 * `--` pairs are escaped the same way. Both are ordinary JSON string escapes,
	 * so the Astro-side parser still reads back the exact original value.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 */
	public static function encodeCommentAttributes( array $attributes ): string {
		$json = (string) wp_json_encode( $attributes, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS );

		return str_replace( '--', '--', $json );
	}
}
