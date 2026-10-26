<?php
/**
 * Library details.
 *
 * @package GetQuick\Bioeconomia\Details
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Details;

use GetQuick\Bioeconomia\Plugin;

/**
 * Biblioteca document details (year, publisher and links) as post meta, edited
 * in the "Detalhes do documento" panel (`assets/library-details.js`) and
 * exposed through REST and GraphQL.
 */
final class LibraryDetails {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerMeta' ] );
		add_action( 'graphql_register_types', [ $this, 'registerGraphQLFields' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueueEditorAssets' ] );
	}

	/**
	 * Devolve as chaves de metadados dos detalhes do documento, por campo.
	 *
	 * @return array<string, string>
	 */
	public static function metaKeys() {
		return [
			'year'    => 'gq_bioeconomia_library_year',
			'author'  => 'gq_bioeconomia_library_author',
			'fileUrl' => 'gq_bioeconomia_library_file_url',
			'pageUrl' => 'gq_bioeconomia_library_page_url',
		];
	}

	/**
	 * Regista os metadados dos detalhes do documento.
	 *
	 * @return void
	 */
	public function registerMeta() {
		$meta_keys     = self::metaKeys();
		$auth_callback = static function ( $allowed, $meta_key, $post_id ) {
			return current_user_can( 'edit_post', (int) $post_id );
		};

		register_post_meta(
			'biblioteca',
			$meta_keys['year'],
			[
				'type'              => 'integer',
				'description'       => __( 'Ano do documento.', 'gq-bioeconomia' ),
				'single'            => true,
				'default'           => 0,
				'sanitize_callback' => [ self::class, 'sanitizeYear' ],
				'auth_callback'     => $auth_callback,
				'show_in_rest'      => true,
			],
		);

		register_post_meta(
			'biblioteca',
			$meta_keys['author'],
			[
				'type'              => 'string',
				'description'       => __( 'Publicado por.', 'gq-bioeconomia' ),
				'single'            => true,
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
				'auth_callback'     => $auth_callback,
				'show_in_rest'      => true,
			],
		);

		foreach ( [
			'fileUrl' => __( 'Ficheiro PDF.', 'gq-bioeconomia' ),
			'pageUrl' => __( 'Ligação para a página.', 'gq-bioeconomia' ),
		] as $field => $description ) {
			register_post_meta(
				'biblioteca',
				$meta_keys[ $field ],
				[
					'type'              => 'string',
					'description'       => $description,
					'single'            => true,
					'default'           => '',
					'sanitize_callback' => 'esc_url_raw',
					'auth_callback'     => $auth_callback,
					'show_in_rest'      => true,
				],
			);
		}
	}

	/**
	 * Normaliza o ano do documento: um ano de quatro algarismos, ou 0 quando não há ano.
	 *
	 * @param mixed $value Valor bruto.
	 * @return int
	 */
	public static function sanitizeYear( $value ) {
		if ( ! is_scalar( $value ) || ! preg_match( '/^[0-9]{4}$/D', (string) $value ) ) {
			return 0;
		}

		$year = (int) $value;

		return $year >= 1000 && $year <= (int) gmdate( 'Y' ) + 1 ? $year : 0;
	}

	/**
	 * Regista os campos GraphQL dos detalhes do documento em `Biblioteca`.
	 *
	 * @return void
	 */
	public function registerGraphQLFields() {
		$fields = [
			// Keep the original Author field and storage key for existing documents/clients.
			'gqBioeconomiaLibraryPublisher' => [
				'type'        => 'String',
				'description' => __( 'Publicado por.', 'gq-bioeconomia' ),
				'field'       => 'author',
			],
			'gqBioeconomiaLibraryPageUrl'   => [
				'type'        => 'String',
				'description' => __( 'Ligação para a página.', 'gq-bioeconomia' ),
				'field'       => 'pageUrl',
			],
			'gqBioeconomiaLibraryYear'      => [
				'type'        => 'Int',
				'description' => __( 'Ano do documento.', 'gq-bioeconomia' ),
				'field'       => 'year',
			],
			'gqBioeconomiaLibraryAuthor'    => [
				'type'        => 'String',
				'description' => __( 'Publicado por.', 'gq-bioeconomia' ),
				'field'       => 'author',
			],
			'gqBioeconomiaLibraryFileUrl'   => [
				'type'        => 'String',
				'description' => __( 'Ficheiro do documento.', 'gq-bioeconomia' ),
				'field'       => 'fileUrl',
			],
		];

		foreach ( $fields as $field_name => $field ) {
			register_graphql_field(
				'Biblioteca',
				$field_name,
				[
					'type'        => $field['type'],
					'description' => $field['description'],
					'resolve'     => static function ( $post ) use ( $field ) {
						$post_id = isset( $post->ID ) ? (int) $post->ID : 0;

						return $post_id > 0 ? self::forPost( $post_id )[ $field['field'] ] : null;
					},
				],
			);
		}
	}

	/**
	 * Devolve os detalhes de um documento, com `null` nos campos vazios.
	 *
	 * @param int $post_id ID do documento.
	 * @return array{year: int|null, author: string|null, fileUrl: string|null, pageUrl: string|null}
	 */
	public static function forPost( $post_id ) {
		$meta_keys = self::metaKeys();
		$year      = self::sanitizeYear( get_post_meta( $post_id, $meta_keys['year'], true ) );
		$author    = trim( (string) get_post_meta( $post_id, $meta_keys['author'], true ) );
		$page_url  = trim( (string) get_post_meta( $post_id, $meta_keys['pageUrl'], true ) );
		$file_url  = trim( (string) get_post_meta( $post_id, $meta_keys['fileUrl'], true ) );

		return [
			'year'    => $year > 0 ? $year : null,
			'author'  => '' !== $author ? $author : null,
			'fileUrl' => '' !== $file_url ? $file_url : null,
			'pageUrl' => '' !== $page_url ? $page_url : null,
		];
	}

	/**
	 * Carrega o painel "Detalhes do documento" no editor da biblioteca.
	 *
	 * @return void
	 */
	public function enqueueEditorAssets() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;

		if ( ! $screen || 'biblioteca' !== $screen->post_type ) {
			return;
		}

		wp_enqueue_script(
			'gq-bioeconomia-library-details',
			plugin_dir_url( GQ_BIOECONOMIA_PLUGIN_FILE ) . 'assets/library-details.js',
			[ 'wp-block-editor', 'wp-components', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-plugins' ],
			GQ_BIOECONOMIA_VERSION,
			true,
		);
		wp_set_script_translations( 'gq-bioeconomia-library-details', Plugin::TEXT_DOMAIN, GQ_BIOECONOMIA_PLUGIN_DIR . '/languages' );
		wp_add_inline_script(
			'gq-bioeconomia-library-details',
			'window.gqBioeconomiaLibraryDetails = ' . wp_json_encode(
				[
					'metaKeys' => self::metaKeys(),
					'yearMin'  => 1000,
					'yearMax'  => (int) gmdate( 'Y' ) + 1,
				]
			) . ';',
			'before',
		);
	}
}
