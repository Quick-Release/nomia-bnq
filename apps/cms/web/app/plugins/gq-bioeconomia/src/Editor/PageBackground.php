<?php
/**
 * Page background color.
 *
 * @package GetQuick\Bioeconomia\Editor
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Editor;

use GetQuick\Bioeconomia\Plugin;

/**
 * Stores a page's background color and exposes it to the Frontend.
 *
 * Editors pick it in the page background panel (`assets/document-settings.js`).
 */
final class PageBackground {

	public const META_KEY = '_gq_bioeconomia_page_background_color';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerMeta' ] );
		add_action( 'graphql_register_types', [ $this, 'registerGraphQLField' ] );
	}

	/**
	 * Registers the page metadata.
	 */
	public function registerMeta(): void {
		register_post_meta(
			'page',
			self::META_KEY,
			[
				'type'              => 'string',
				'description'       => __( 'Cor de fundo da página Nomia.', 'gq-bioeconomia' ),
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => [ self::class, 'sanitizeHexColor' ],
				'auth_callback'     => static fn(): bool => current_user_can( 'edit_posts' ),
			],
		);
	}

	/**
	 * Registers `gqBioeconomiaPageBackgroundColor` on pages.
	 */
	public function registerGraphQLField(): void {
		register_graphql_field(
			'Page',
			'gqBioeconomiaPageBackgroundColor',
			[
				'type'        => 'String',
				'description' => __( 'Cor de fundo da página Nomia.', 'gq-bioeconomia' ),
				'resolve'     => [ self::class, 'resolve' ],
			],
		);
	}

	/**
	 * Resolves a page's background color.
	 *
	 * @param mixed $page The WPGraphQL page.
	 */
	public static function resolve( $page ): ?string {
		$database_id = isset( $page->databaseId ) ? (int) $page->databaseId : 0;

		if ( $database_id <= 0 ) {
			return null;
		}

		$color = self::sanitizeHexColor( get_post_meta( $database_id, self::META_KEY, true ) );

		return '' !== $color ? $color : null;
	}

	/**
	 * Sanitizes a hexadecimal color value.
	 *
	 * @param mixed $value The value to sanitize.
	 * @return string The sanitized color, or an empty string.
	 */
	public static function sanitizeHexColor( $value ): string {
		$color = is_string( $value ) ? trim( $value ) : '';

		return '' === $color ? '' : strtolower( (string) sanitize_hex_color( $color ) );
	}
}
