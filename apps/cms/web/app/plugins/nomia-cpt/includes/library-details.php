<?php
/**
 * Detalhes dos documentos da biblioteca: ano, autor e ficheiro.
 *
 * The old Nomia admin kept these in a locked `nomia/library-details` block at
 * the top of each document. Here they are post meta, edited in the
 * "Detalhes do documento" panel (`assets/js/library-details.js`) and exposed
 * through REST and GraphQL. The upgrade routine moves the imported block's
 * values into the meta.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve as chaves de metadados dos detalhes do documento, por campo.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_library_details_meta_keys() {
	return array(
		'year'    => 'nomia_cpt_library_year',
		'author'  => 'nomia_cpt_library_author',
		'fileUrl' => 'nomia_cpt_library_file_url',
	);
}

/**
 * Regista os metadados dos detalhes do documento.
 *
 * @return void
 */
function nomia_cpt_register_library_details_meta() {
	$meta_keys     = nomia_cpt_get_library_details_meta_keys();
	$auth_callback = static function ( $allowed, $meta_key, $post_id ) {
		return current_user_can( 'edit_post', (int) $post_id );
	};

	register_post_meta(
		'biblioteca',
		$meta_keys['year'],
		array(
			'type'              => 'integer',
			'description'       => __( 'Ano do documento.', 'nomia-cpt' ),
			'single'            => true,
			'default'           => 0,
			'sanitize_callback' => 'nomia_cpt_sanitize_library_year',
			'auth_callback'     => $auth_callback,
			'show_in_rest'      => true,
		),
	);

	register_post_meta(
		'biblioteca',
		$meta_keys['author'],
		array(
			'type'              => 'string',
			'description'       => __( 'Autor do documento.', 'nomia-cpt' ),
			'single'            => true,
			'default'           => '',
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => $auth_callback,
			'show_in_rest'      => true,
		),
	);

	register_post_meta(
		'biblioteca',
		$meta_keys['fileUrl'],
		array(
			'type'              => 'string',
			'description'       => __( 'Ficheiro do documento.', 'nomia-cpt' ),
			'single'            => true,
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => $auth_callback,
			'show_in_rest'      => true,
		),
	);
}

/**
 * Normaliza o ano do documento: um inteiro positivo, ou 0 quando não há ano.
 *
 * @param mixed $value Valor bruto.
 * @return int
 */
function nomia_cpt_sanitize_library_year( $value ) {
	$year = is_numeric( $value ) ? (int) $value : 0;

	return $year > 0 ? $year : 0;
}

/**
 * Regista os campos GraphQL dos detalhes do documento em `Biblioteca`.
 *
 * @return void
 */
function nomia_cpt_register_library_details_graphql_fields() {
	$fields = array(
		'nomiaLibraryYear'    => array(
			'type'        => 'Int',
			'description' => __( 'Ano do documento.', 'nomia-cpt' ),
			'field'       => 'year',
		),
		'nomiaLibraryAuthor'  => array(
			'type'        => 'String',
			'description' => __( 'Autor do documento.', 'nomia-cpt' ),
			'field'       => 'author',
		),
		'nomiaLibraryFileUrl' => array(
			'type'        => 'String',
			'description' => __( 'Ficheiro do documento.', 'nomia-cpt' ),
			'field'       => 'fileUrl',
		),
	);

	foreach ( $fields as $field_name => $field ) {
		register_graphql_field(
			'Biblioteca',
			$field_name,
			array(
				'type'        => $field['type'],
				'description' => $field['description'],
				'resolve'     => static function ( $post ) use ( $field ) {
					$post_id = isset( $post->ID ) ? (int) $post->ID : 0;

					return $post_id > 0 ? nomia_cpt_get_library_details( $post_id )[ $field['field'] ] : null;
				},
			),
		);
	}
}

/**
 * Devolve os detalhes de um documento, com `null` nos campos vazios.
 *
 * @param int $post_id ID do documento.
 * @return array{year: int|null, author: string|null, fileUrl: string|null}
 */
function nomia_cpt_get_library_details( $post_id ) {
	$meta_keys = nomia_cpt_get_library_details_meta_keys();
	$year      = nomia_cpt_sanitize_library_year( get_post_meta( $post_id, $meta_keys['year'], true ) );
	$author    = trim( (string) get_post_meta( $post_id, $meta_keys['author'], true ) );
	$file_url  = trim( (string) get_post_meta( $post_id, $meta_keys['fileUrl'], true ) );

	return array(
		'year'    => $year > 0 ? $year : null,
		'author'  => '' !== $author ? $author : null,
		'fileUrl' => '' !== $file_url ? $file_url : null,
	);
}

/**
 * Carrega o painel "Detalhes do documento" no editor da biblioteca.
 *
 * @return void
 */
function nomia_cpt_enqueue_library_details_editor_assets() {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

	if ( ! $screen || 'biblioteca' !== $screen->post_type ) {
		return;
	}

	wp_enqueue_script(
		'nomia-cpt-library-details',
		plugin_dir_url( NOMIA_CPT_PLUGIN_FILE ) . 'assets/js/library-details.js',
		array( 'wp-block-editor', 'wp-components', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-plugins' ),
		NOMIA_CPT_PLUGIN_VERSION,
		true,
	);
	wp_add_inline_script(
		'nomia-cpt-library-details',
		'window.nomiaCptLibraryDetails = ' . wp_json_encode( array( 'metaKeys' => nomia_cpt_get_library_details_meta_keys() ) ) . ';',
		'before',
	);
}

/**
 * Separa o bloco `nomia/library-details` do conteúdo de um documento.
 *
 * @param string $content Conteúdo do documento.
 * @return array{details: array<string, mixed>, content: string}|null Os atributos do bloco e o conteúdo sem ele, ou null quando o conteúdo não o tem.
 */
function nomia_cpt_extract_library_details_block( $content ) {
	$pattern = '/<!--\s+wp:nomia\/library-details\s+(\{.*?\}\s+)?\/-->\s*/s';

	if ( ! is_string( $content ) || ! preg_match( $pattern, $content, $matches ) ) {
		return null;
	}

	$attributes = isset( $matches[1] ) ? json_decode( trim( $matches[1] ), true ) : array();
	$attributes = is_array( $attributes ) ? $attributes : array();
	$details    = array();

	foreach ( array_keys( nomia_cpt_get_library_details_meta_keys() ) as $field ) {
		if ( array_key_exists( $field, $attributes ) ) {
			$details[ $field ] = $attributes[ $field ];
		}
	}

	return array(
		'details' => $details,
		'content' => ltrim( preg_replace( $pattern, '', $content ) ),
	);
}

/**
 * Move os detalhes do bloco `nomia/library-details` importado para os metadados.
 *
 * Meta already set wins over the block's value, so running it again changes
 * nothing.
 *
 * @return int Número de documentos migrados.
 */
function nomia_cpt_migrate_library_details_blocks() {
	$post_ids  = get_posts(
		array(
			'post_type'              => 'biblioteca',
			'post_status'            => 'any',
			'posts_per_page'         => -1,
			'fields'                 => 'ids',
			's'                      => 'wp:nomia/library-details',
			'search_columns'         => array( 'post_content' ),
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
		),
	);
	$meta_keys = nomia_cpt_get_library_details_meta_keys();
	$sanitizer = array(
		'year'    => 'nomia_cpt_sanitize_library_year',
		'author'  => 'sanitize_text_field',
		'fileUrl' => 'esc_url_raw',
	);
	$migrated  = 0;

	foreach ( $post_ids as $post_id ) {
		$post_id   = (int) $post_id;
		$extracted = nomia_cpt_extract_library_details_block( (string) get_post_field( 'post_content', $post_id, 'raw' ) );

		if ( null === $extracted ) {
			continue;
		}

		foreach ( $extracted['details'] as $field => $value ) {
			$value = call_user_func( $sanitizer[ $field ], $value );

			if ( ! empty( $value ) && empty( get_post_meta( $post_id, $meta_keys[ $field ], true ) ) ) {
				update_post_meta( $post_id, $meta_keys[ $field ], $value );
			}
		}

		// The routine can run without a user, and kses would then filter the rest of the content.
		$filters_content = false !== has_filter( 'content_save_pre', 'wp_filter_post_kses' );
		if ( $filters_content ) {
			kses_remove_filters();
		}

		wp_update_post(
			array(
				'ID'           => $post_id,
				'post_content' => wp_slash( $extracted['content'] ),
			),
		);

		if ( $filters_content ) {
			kses_init_filters();
		}

		++$migrated;
	}

	return $migrated;
}
