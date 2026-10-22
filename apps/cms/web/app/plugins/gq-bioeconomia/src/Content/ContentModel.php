<?php
/**
 * Content model.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

/**
 * Validates the declarative post type and taxonomy registry.
 */
final class ContentModel {

	/**
	 * Devolve os problemas encontrados no registo declarativo de conteúdos.
	 *
	 * @param array<string, mixed>|null $post_type_definitions Definições de tipos de conteúdo a validar.
	 * @param array<string, mixed>|null $taxonomy_definitions Definições de taxonomias a validar.
	 * @return string[]
	 */
	public static function validationErrors( $post_type_definitions = null, $taxonomy_definitions = null ) {
		$post_type_definitions = $post_type_definitions ?? PostTypes::definitions();
		$taxonomy_definitions  = $taxonomy_definitions ?? Taxonomies::definitions();
		$errors                = [];

		if ( ! is_array( $post_type_definitions ) ) {
			return [ 'Post type definitions must be an array.' ];
		}

		if ( ! is_array( $taxonomy_definitions ) ) {
			return [ 'Taxonomy definitions must be an array.' ];
		}

		$post_type_names         = [];
		$post_type_rewrite_slugs = [];

		foreach ( $post_type_definitions as $post_type => $definition ) {
			if ( ! is_string( $post_type ) || '' === $post_type ) {
				$errors[] = 'Every post type definition must have a non-empty string key.';
				continue;
			}

			$post_type_names[] = $post_type;

			if ( ! preg_match( '/^[a-z0-9_]+$/', $post_type ) || strlen( $post_type ) > 20 ) {
				$errors[] = sprintf(
					'Post type "%s" must use a lowercase WordPress identifier of at most 20 characters.',
					$post_type,
				);
			}

			if ( ! is_array( $definition ) ) {
				$errors[] = sprintf( 'Post type "%s" must have an array definition.', $post_type );
				continue;
			}

			if ( ! is_array( $definition['labels'] ?? null ) || empty( $definition['labels'] ) ) {
				$errors[] = sprintf( 'Post type "%s" must declare labels.', $post_type );
			}

			$args = $definition['args'] ?? null;
			if ( ! is_array( $args ) ) {
				$errors[] = sprintf( 'Post type "%s" must declare args.', $post_type );
				continue;
			}

			foreach ( [ 'public', 'show_in_rest', 'show_in_graphql', 'supports' ] as $required_arg ) {
				if ( ! array_key_exists( $required_arg, $args ) ) {
					$errors[] = sprintf(
						'Post type "%s" must declare the "%s" argument.',
						$post_type,
						$required_arg,
					);
				}
			}

			foreach ( [ 'public', 'show_in_rest', 'show_in_graphql' ] as $boolean_arg ) {
				if ( array_key_exists( $boolean_arg, $args ) && ! is_bool( $args[ $boolean_arg ] ) ) {
					$errors[] = sprintf(
						'Post type "%s" must declare "%s" as a boolean.',
						$post_type,
						$boolean_arg,
					);
				}
			}

			if ( array_key_exists( 'supports', $args ) && ! is_array( $args['supports'] ) ) {
				$errors[] = sprintf( 'Post type "%s" must declare supports as an array.', $post_type );
			}

			if ( true === ( $args['show_in_graphql'] ?? false ) ) {
				foreach ( [ 'graphql_single_name', 'graphql_plural_name' ] as $graphql_name ) {
					if ( ! is_string( $args[ $graphql_name ] ?? null ) || '' === trim( $args[ $graphql_name ] ) ) {
						$errors[] = sprintf(
							'Post type "%s" must declare "%s" when GraphQL is enabled.',
							$post_type,
							$graphql_name,
						);
					}
				}
			}

			$policies = $definition['policies'] ?? [];
			if ( ! is_array( $policies ) ) {
				$errors[] = sprintf( 'Post type "%s" policies must be an array.', $post_type );
			} elseif ( array_key_exists( 'global_taxonomies', $policies ) ) {
				if ( ! is_bool( $policies['global_taxonomies'] ) ) {
					$errors[] = sprintf(
						'Post type "%s" must declare the global_taxonomies policy as a boolean.',
						$post_type,
					);
				} elseif ( true === $policies['global_taxonomies'] && true !== ( $args['public'] ?? false ) ) {
					$errors[] = sprintf(
						'Post type "%s" cannot opt into global taxonomies unless it is public.',
						$post_type,
					);
				}
			}

			$rewrite = $args['rewrite'] ?? null;
			if ( is_array( $rewrite ) ) {
				$rewrite_slug = $rewrite['slug'] ?? null;
				if ( ! is_string( $rewrite_slug ) || '' === trim( $rewrite_slug ) ) {
					$errors[] = sprintf( 'Post type "%s" must declare a non-empty rewrite slug.', $post_type );
				} elseif ( isset( $post_type_rewrite_slugs[ $rewrite_slug ] ) ) {
					$errors[] = sprintf(
						'Post types "%s" and "%s" cannot share rewrite slug "%s".',
						$post_type_rewrite_slugs[ $rewrite_slug ],
						$post_type,
						$rewrite_slug,
					);
				} else {
					$post_type_rewrite_slugs[ $rewrite_slug ] = $post_type;
				}
			}
		}

		$post_type_names        = array_values( array_unique( $post_type_names ) );
		$taxonomy_rewrite_slugs = [];

		foreach ( $taxonomy_definitions as $taxonomy => $definition ) {
			if ( ! is_string( $taxonomy ) || '' === $taxonomy ) {
				$errors[] = 'Every taxonomy definition must have a non-empty string key.';
				continue;
			}

			if ( ! preg_match( '/^[a-z0-9_]+$/', $taxonomy ) || strlen( $taxonomy ) > 32 ) {
				$errors[] = sprintf(
					'Taxonomy "%s" must use a lowercase WordPress identifier of at most 32 characters.',
					$taxonomy,
				);
			}

			if ( ! is_array( $definition ) ) {
				$errors[] = sprintf( 'Taxonomy "%s" must have an array definition.', $taxonomy );
				continue;
			}

			$object_types = $definition['object_type'] ?? null;
			if ( ! is_array( $object_types ) || empty( $object_types ) ) {
				$errors[] = sprintf( 'Taxonomy "%s" must declare object types.', $taxonomy );
			} else {
				$seen_object_types = [];

				foreach ( $object_types as $object_type ) {
					if ( ! is_string( $object_type ) || '' === $object_type ) {
						$errors[] = sprintf(
							'Taxonomy "%s" object types must be non-empty strings.',
							$taxonomy,
						);
						continue;
					}

					if ( isset( $seen_object_types[ $object_type ] ) ) {
						$errors[] = sprintf(
							'Taxonomy "%s" cannot declare object type "%s" more than once.',
							$taxonomy,
							$object_type,
						);
					}

					$seen_object_types[ $object_type ] = true;

					if ( 'post' !== $object_type && ! in_array( $object_type, $post_type_names, true ) ) {
						$errors[] = sprintf(
							'Taxonomy "%s" references unknown object type "%s".',
							$taxonomy,
							$object_type,
						);
					}
				}
			}

			$args = $definition['args'] ?? null;
			if ( ! is_array( $args ) ) {
				$errors[] = sprintf( 'Taxonomy "%s" must declare args.', $taxonomy );
				continue;
			}

			if ( ! is_array( $args['labels'] ?? null ) || empty( $args['labels'] ) ) {
				$errors[] = sprintf( 'Taxonomy "%s" must declare labels.', $taxonomy );
			}

			foreach ( [ 'hierarchical', 'show_ui', 'show_admin_column', 'query_var', 'show_in_rest' ] as $required_arg ) {
				if ( ! array_key_exists( $required_arg, $args ) ) {
					$errors[] = sprintf(
						'Taxonomy "%s" must declare the "%s" argument.',
						$taxonomy,
						$required_arg,
					);
				} elseif ( ! is_bool( $args[ $required_arg ] ) ) {
					$errors[] = sprintf(
						'Taxonomy "%s" must declare "%s" as a boolean.',
						$taxonomy,
						$required_arg,
					);
				}
			}

			if ( true === ( $args['show_in_graphql'] ?? false ) ) {
				foreach ( [ 'graphql_single_name', 'graphql_plural_name' ] as $graphql_name ) {
					if ( ! is_string( $args[ $graphql_name ] ?? null ) || '' === trim( $args[ $graphql_name ] ) ) {
						$errors[] = sprintf(
							'Taxonomy "%s" must declare "%s" when GraphQL is enabled.',
							$taxonomy,
							$graphql_name,
						);
					}
				}
			}

			$rewrite = $args['rewrite'] ?? null;
			if ( is_array( $rewrite ) ) {
				$rewrite_slug = $rewrite['slug'] ?? null;
				if ( ! is_string( $rewrite_slug ) || '' === trim( $rewrite_slug ) ) {
					$errors[] = sprintf( 'Taxonomy "%s" must declare a non-empty rewrite slug.', $taxonomy );
				} elseif ( isset( $taxonomy_rewrite_slugs[ $rewrite_slug ] ) ) {
					$errors[] = sprintf(
						'Taxonomies "%s" and "%s" cannot share rewrite slug "%s".',
						$taxonomy_rewrite_slugs[ $rewrite_slug ],
						$taxonomy,
						$rewrite_slug,
					);
				} else {
					$taxonomy_rewrite_slugs[ $rewrite_slug ] = $taxonomy;
				}
			}
		}

		$expected_global_object_types = [ 'post' ];
		foreach ( $post_type_definitions as $post_type => $definition ) {
			if ( is_string( $post_type ) && is_array( $definition ) && true === ( $definition['policies']['global_taxonomies'] ?? false ) ) {
				$expected_global_object_types[] = $post_type;
			}
		}

		$expected_global_object_types = array_values( array_unique( $expected_global_object_types ) );
		$global_taxonomy_names        = Taxonomies::globalNames();

		if ( count( $global_taxonomy_names ) !== count( array_unique( $global_taxonomy_names ) ) ) {
			$errors[] = 'Global taxonomy names must be unique.';
		}

		foreach ( $global_taxonomy_names as $taxonomy ) {
			if ( ! array_key_exists( $taxonomy, $taxonomy_definitions ) ) {
				$errors[] = sprintf( 'Global taxonomy "%s" must have a taxonomy definition.', $taxonomy );
				continue;
			}

			$object_types = $taxonomy_definitions[ $taxonomy ]['object_type'] ?? null;
			if ( $object_types !== $expected_global_object_types ) {
				$errors[] = sprintf(
					'Global taxonomy "%s" must target the post types opted into global taxonomies.',
					$taxonomy,
				);
			}
		}

		return $errors;
	}
}
