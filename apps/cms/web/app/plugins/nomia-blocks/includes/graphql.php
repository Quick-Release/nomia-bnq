<?php
/**
 * The `wpBlocksJson` field: a page's or post's parsed blocks for the Astro
 * Frontend, which stores them and renders Nomia's blocks from them.
 *
 * Migrated from bioeconomia.pt's `nomia-config` must-use plugin, and exposed
 * on posts as well as pages.
 *
 * @package GetquickNomiaBlocks
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Extracts a post ID from a WPGraphQL source object.
 *
 * @param mixed $source WPGraphQL source value.
 * @return int Post ID, or zero when unavailable.
 */
function getquick_nomia_blocks_graphql_source_post_id( $source ): int {
	// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- WPGraphQL exposes databaseId.
	if ( isset( $source->databaseId ) && is_numeric( $source->databaseId ) ) {
		return (int) $source->databaseId;
	}
	// phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

	if ( isset( $source->ID ) && is_numeric( $source->ID ) ) {
		return (int) $source->ID;
	}

	return 0;
}

/**
 * Serializes the parsed Gutenberg blocks of a WPGraphQL source.
 *
 * @param mixed $source WPGraphQL source value.
 * @return string|null JSON-encoded blocks, or null for restricted content.
 */
function getquick_nomia_blocks_graphql_blocks_json( $source ): ?string {
	// This field must not bypass WPGraphQL's visibility restrictions.
	if (
		is_object( $source )
		&& method_exists( $source, '__get' )
		&& true === $source->__get( 'isRestricted' )
	) {
		return null;
	}

	$post_id = getquick_nomia_blocks_graphql_source_post_id( $source );
	$post    = $post_id > 0 ? get_post( $post_id ) : null;

	if ( ! $post instanceof WP_Post ) {
		return '[]';
	}

	$json = wp_json_encode( parse_blocks( $post->post_content ) );

	return is_string( $json ) ? $json : '[]';
}

/**
 * Registers `wpBlocksJson` on pages and posts.
 *
 * @return void
 */
function getquick_nomia_blocks_register_graphql_fields(): void {
	if ( ! function_exists( 'register_graphql_field' ) ) {
		return;
	}

	foreach ( array( 'Page', 'Post' ) as $type_name ) {
		register_graphql_field(
			$type_name,
			'wpBlocksJson',
			array(
				'type'        => 'String',
				'description' => __( 'Blocos Gutenberg analisados a partir de post_content, em JSON, para o renderizador Astro.', 'getquick-nomia-blocks' ),
				'resolve'     => 'getquick_nomia_blocks_graphql_blocks_json',
			)
		);
	}
}
