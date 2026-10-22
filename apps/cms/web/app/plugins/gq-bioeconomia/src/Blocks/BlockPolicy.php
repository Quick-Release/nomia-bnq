<?php
/**
 * Block policy.
 *
 * @package GetQuick\Bioeconomia\Blocks
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Blocks;

use GetQuick\Bioeconomia\Contracts;
use WP_Block_Editor_Context;
use WP_Block_Type_Registry;
use WP_Post;

/**
 * Narrows the post editor's inserter to the blocks Astro can render.
 */
final class BlockPolicy {

	/**
	 * The core blocks the post editor offers.
	 *
	 * Blocks that only ever exist inside another block still have to be listed:
	 * `allowed_block_types_all` is checked for nested insertions too, so leaving
	 * `core/list-item` out of an allowlist that contains `core/list` produces a
	 * list nobody can add items to. `core/missing` and `core/block` are core's
	 * own recovery and reusable-block surfaces, and removing them takes the
	 * "attempt block recovery" UI away from editors.
	 *
	 * The static core blocks after `core/button` each save their complete HTML,
	 * which Astro renders with `wp-core-blocks.css`. Blocks that only render on
	 * the server (query, navigation, latest posts, embeds, social icons) or need
	 * WordPress's interactivity scripts (accordion, tabs) stay out, as do the
	 * raw-HTML blocks (custom HTML, classic).
	 */
	private const CORE_BLOCKS = [
		'core/paragraph',
		'core/heading',
		'core/file',
		'core/image',
		'core/list',
		'core/list-item',
		'core/quote',
		'core/columns',
		'core/column',
		'core/buttons',
		'core/button',
		'core/group',
		'core/cover',
		'core/media-text',
		'core/gallery',
		'core/audio',
		'core/video',
		'core/table',
		'core/separator',
		'core/spacer',
		'core/code',
		'core/preformatted',
		'core/pullquote',
		'core/verse',
		'core/details',
		'core/math',
		'core/block',
		'core/missing',
	];

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_filter( 'allowed_block_types_all', [ $this, 'allowedBlockTypes' ], 10, 2 );
	}

	/**
	 * Returns the allowed block types for an editor.
	 *
	 * The filter runs for every block editor WordPress boots, so the allowlist
	 * is applied only where this plugin owns the content: an editor editing a
	 * post. Widgets, the site editor, and any other context keep whatever they
	 * were given.
	 *
	 * An allowlist another plugin already narrowed is intersected rather than
	 * replaced, so this filter can only ever remove block types.
	 *
	 * @param bool|array<int, string>       $allowed The incoming allowlist, or true for "everything".
	 * @param WP_Block_Editor_Context|mixed $context The editor being configured.
	 * @return bool|array<int, string> Allowed block names.
	 */
	public function allowedBlockTypes( $allowed, $context ) {
		if ( ! isset( $context->post ) || ! ( $context->post instanceof WP_Post ) ) {
			return $allowed;
		}

		$supported = self::supportedBlockTypes();

		return is_array( $allowed )
			? array_values( array_intersect( $allowed, $supported ) )
			: $supported;
	}

	/**
	 * Returns the block types available to the post editor: the static core
	 * blocks, GQ Design's (`getquick-design/*`, read from the registry so the
	 * list follows the installed release) and Nomia's inserter blocks.
	 *
	 * @return array<int, string> Allowed block names.
	 */
	public static function supportedBlockTypes(): array {
		$design_blocks = array_values(
			array_filter(
				array_keys( WP_Block_Type_Registry::get_instance()->get_all_registered() ),
				static fn( string $name ): bool => str_starts_with( $name, 'getquick-design/' ),
			)
		);

		$site_blocks = array_values(
			array_map(
				static fn( array $contract ): string => (string) $contract['blockName'],
				array_filter(
					Contracts::all(),
					static fn( array $contract ): bool => (bool) ( $contract['inserter'] ?? true ),
				)
			)
		);

		return array_values( array_unique( array_merge( self::CORE_BLOCKS, $design_blocks, $site_blocks ) ) );
	}
}
