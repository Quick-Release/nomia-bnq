<?php
/**
 * Parsed blocks for the Frontend.
 *
 * @package GetQuick\Bioeconomia\GraphQL
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\GraphQL;

use GetQuick\Bioeconomia\Blocks\HeaderNavigation;
use WP_Post;

/**
 * Registers `wpBlocksJson`: a page's or post's parsed blocks for the Astro
 * Frontend, which stores them and renders Nomia's blocks from them. Each
 * navigation block carries its menu's items (`HeaderNavigation::withMenus()`).
 */
final class BlocksJson {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'graphql_register_types', [ $this, 'registerFields' ] );
	}

	/**
	 * Registers `wpBlocksJson` on pages and posts.
	 */
	public function registerFields(): void {
		foreach ( [ 'Page', 'Post' ] as $type_name ) {
			register_graphql_field(
				$type_name,
				'wpBlocksJson',
				[
					'type'        => 'String',
					'description' => __( 'Blocos Gutenberg analisados a partir de post_content, em JSON, para o renderizador Astro.', 'gq-bioeconomia' ),
					'resolve'     => [ self::class, 'resolve' ],
				],
			);
		}
	}

	/**
	 * Serializes the parsed Gutenberg blocks of a WPGraphQL source.
	 *
	 * @param mixed $source The WPGraphQL source.
	 * @return string|null JSON-encoded blocks, or null for restricted content.
	 */
	public static function resolve( $source ): ?string {
		// This field must not bypass WPGraphQL's visibility restrictions.
		if (
			is_object( $source )
			&& method_exists( $source, '__get' )
			&& true === $source->__get( 'isRestricted' )
		) {
			return null;
		}

		$post_id = self::postId( $source );
		$post    = $post_id > 0 ? get_post( $post_id ) : null;

		if ( ! $post instanceof WP_Post ) {
			return '[]';
		}

		$json = wp_json_encode( HeaderNavigation::withMenus( parse_blocks( $post->post_content ) ) );

		return is_string( $json ) ? $json : '[]';
	}

	/**
	 * Extracts a post ID from a WPGraphQL source.
	 *
	 * @param mixed $source The WPGraphQL source.
	 * @return int The post ID, or zero when unavailable.
	 */
	private static function postId( $source ): int {
		if ( isset( $source->databaseId ) && is_numeric( $source->databaseId ) ) {
			return (int) $source->databaseId;
		}

		if ( isset( $source->ID ) && is_numeric( $source->ID ) ) {
			return (int) $source->ID;
		}

		return 0;
	}
}
