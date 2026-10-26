<?php
/**
 * Galleries.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

use GetQuick\Bioeconomia\Media\OrderedMedia;

/**
 * Galleries: their ordered images, editor meta box, admin column and
 * public REST endpoint.
 */
final class Galleries {

	public const POST_TYPE = 'gq_bio_gallery';

	public const META_KEY = 'gq_bioeconomia_gallery_image_ids';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerMeta' ] );
		add_action( 'graphql_register_types', [ $this, 'registerGraphQLFields' ] );
		add_action( 'add_meta_boxes_' . self::POST_TYPE, [ $this, 'registerMetaBox' ] );
		add_action( 'save_post_' . self::POST_TYPE, [ $this, 'save' ], 10, 2 );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueueAssets' ] );
		add_action( 'rest_api_init', [ $this, 'registerRestRoutes' ] );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', [ $this, 'columns' ] );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', [ $this, 'renderColumn' ], 10, 2 );
	}

	/**
	 * Exposes ordered images for the Site's publication extension.
	 *
	 * @return void
	 */
	public function registerGraphQLFields() {
		register_graphql_object_type(
			'GqBioeconomiaGalleryImage',
			[
				'fields' => [
					'id'     => [ 'type' => 'Int' ],
					'url'    => [ 'type' => 'String' ],
					'alt'    => [ 'type' => 'String' ],
					'width'  => [ 'type' => 'Int' ],
					'height' => [ 'type' => 'Int' ],
				],
			]
		);
		register_graphql_field(
			'Galeria',
			'gqBioeconomiaGalleryImages',
			[
				'type'    => [ 'list_of' => 'GqBioeconomiaGalleryImage' ],
				'resolve' => static function ( $post ) {
					$post_id = isset( $post->ID ) ? (int) $post->ID : 0;
					return OrderedMedia::forIds( self::sanitizeImageIds( get_post_meta( $post_id, self::META_KEY, true ) ) );
				},
			]
		);
	}

	/**
	 * Regista os metadados REST das galerias.
	 *
	 * @return void
	 */
	public function registerMeta() {
		register_post_meta(
			self::POST_TYPE,
			self::META_KEY,
			[
				'single'            => true,
				'type'              => 'array',
				'default'           => [],
				'sanitize_callback' => [ self::class, 'sanitizeImageIds' ],
				'auth_callback'     => static function () {
					return current_user_can( 'edit_gq_bioeconomia_galleries' );
				},
				'show_in_rest'      => [
					'schema' => [
						'type'    => 'array',
						'items'   => [
							'type' => 'integer',
						],
						'default' => [],
					],
				],
			],
		);
	}

	/**
	 * Normaliza a lista ordenada de IDs de imagens.
	 *
	 * @param mixed $value Valor bruto.
	 * @return int[]
	 */
	public static function sanitizeImageIds( $value ) {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		if ( ! is_array( $value ) ) {
			return [];
		}

		$sanitized_ids = [];

		foreach ( $value as $attachment_id ) {
			$attachment_id = absint( $attachment_id );

			if ( 0 === $attachment_id ) {
				continue;
			}

			$sanitized_ids[] = $attachment_id;
		}

		return array_values( array_unique( $sanitized_ids ) );
	}

	/**
	 * Regista a metabox de seleção de imagens.
	 *
	 * @return void
	 */
	public function registerMetaBox() {
		add_meta_box(
			'gq-bioeconomia-gallery-images',
			__( 'Imagens da galeria', 'gq-bioeconomia' ),
			[ self::class, 'renderMetaBox' ],
			self::POST_TYPE,
			'normal',
			'default',
		);
	}

	/**
	 * Renderiza a metabox de seleção de imagens da galeria.
	 *
	 * @param WP_Post|object $post Conteúdo atual.
	 * @return void
	 */
	public static function renderMetaBox( $post ) {
		$post_id     = isset( $post->ID ) ? (int) $post->ID : 0;
		$image_ids   = self::sanitizeImageIds( get_post_meta( $post_id, self::META_KEY, true ) );
		$attachments = self::attachments( $image_ids );

		wp_nonce_field( 'gq_bioeconomia_gallery_images', 'gq_bioeconomia_gallery_images_nonce' );

		echo '<p>' . esc_html__( 'Selecione imagens já existentes na biblioteca multimédia e guarde a ordem pretendida para esta galeria.', 'gq-bioeconomia' ) . '</p>';
		echo '<input type="hidden" id="gq-bioeconomia-gallery-image-ids" name="gq_bioeconomia_gallery_image_ids" value="' . esc_attr( implode( ',', $image_ids ) ) . '" />';
		echo '<div id="gq-bioeconomia-gallery-selection" class="gq-bioeconomia-gallery-selection" data-empty-label="' . esc_attr__( 'Nenhuma imagem selecionada.', 'gq-bioeconomia' ) . '">';

		if ( [] === $attachments ) {
			echo '<p class="description">' . esc_html__( 'Nenhuma imagem selecionada.', 'gq-bioeconomia' ) . '</p>';
		} else {
			echo '<ol class="gq-bioeconomia-gallery-selection__list">';

			foreach ( $attachments as $attachment ) {
				echo '<li data-attachment-id="' . esc_attr( (string) $attachment['id'] ) . '">';
				echo esc_html( $attachment['title'] );
				echo '</li>';
			}

			echo '</ol>';
		}

		echo '</div>';
		echo '<p class="gq-bioeconomia-gallery-selection__actions">';
		echo '<button type="button" class="button button-secondary" id="gq-bioeconomia-gallery-select">' . esc_html__( 'Selecionar imagens', 'gq-bioeconomia' ) . '</button>';
		echo ' ';
		echo '<button type="button" class="button button-link-delete" id="gq-bioeconomia-gallery-clear">' . esc_html__( 'Limpar seleção', 'gq-bioeconomia' ) . '</button>';
		echo '</p>';
		echo '<p class="description">' . esc_html__( 'Ao inserir o bloco no conteúdo, basta escolher a galeria criada aqui.', 'gq-bioeconomia' ) . '</p>';
	}

	/**
	 * Devolve os anexos selecionados na ordem guardada.
	 *
	 * @param int[] $image_ids IDs normalizados.
	 * @return array<int, array{id:int,title:string}>
	 */
	public static function attachments( array $image_ids ) {
		$attachments = [];

		foreach ( OrderedMedia::forIds( $image_ids ) as $image ) {
			$attachments[] = [
				'id'    => $image['id'],
				'title' => $image['title'],
			];
		}

		return $attachments;
	}

	/**
	 * Guarda os IDs selecionados na metabox da galeria.
	 *
	 * @param int            $post_id ID do conteúdo.
	 * @param WP_Post|object $post    Conteúdo guardado.
	 * @return void
	 */
	public function save( $post_id, $post ) {
		if ( ! is_object( $post ) || self::POST_TYPE !== ( $post->post_type ?? '' ) ) {
			return;
		}

		if ( ! isset( $_POST['gq_bioeconomia_gallery_images_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gq_bioeconomia_gallery_images_nonce'] ) ), 'gq_bioeconomia_gallery_images' ) ) {
			return;
		}

		if ( wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_gq_bioeconomia_galleries' ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- The custom sanitizer applies absint to every submitted ID.
		$raw_image_ids = isset( $_POST['gq_bioeconomia_gallery_image_ids'] ) ? wp_unslash( $_POST['gq_bioeconomia_gallery_image_ids'] ) : [];
		$image_ids     = self::sanitizeImageIds( $raw_image_ids );

		update_post_meta( $post_id, self::META_KEY, $image_ids );
	}

	/**
	 * Carrega os assets do seletor de imagens da galeria.
	 *
	 * @param string $hook_suffix Hook atual do admin.
	 * @return void
	 */
	public function enqueueAssets( $hook_suffix ) {
		if ( ! in_array( $hook_suffix, [ 'post.php', 'post-new.php' ], true ) ) {
			return;
		}

		// These query arguments select the current admin screen and do not trigger a state change.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$post_type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '';

		if ( '' === $post_type && isset( $_GET['post'] ) ) {
			$post_type = get_post_type( absint( $_GET['post'] ) );
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		if ( self::POST_TYPE !== $post_type ) {
			return;
		}

		wp_enqueue_media();
		MediaPicker::registerScript();
		wp_enqueue_script(
			'gq-bioeconomia-gallery-admin',
			plugin_dir_url( GQ_BIOECONOMIA_PLUGIN_FILE ) . 'assets/gallery-admin.js',
			[ MediaPicker::HANDLE ],
			GQ_BIOECONOMIA_VERSION,
			true,
		);
		wp_add_inline_script(
			'gq-bioeconomia-gallery-admin',
			'window.gqBioeconomiaGalleryAdmin = ' . wp_json_encode(
				[
					'emptyLabel' => __( 'Nenhuma imagem selecionada.', 'gq-bioeconomia' ),
				],
			) . ';',
			'before',
		);
	}

	/**
	 * Devolve as colunas da listagem das galerias.
	 *
	 * @param array<string, string> $columns Colunas atuais.
	 * @return array<string, string>
	 */
	public function columns( $columns ) {
		$new_columns = [];

		foreach ( $columns as $key => $label ) {
			$new_columns[ $key ] = $label;

			if ( 'title' === $key ) {
				$new_columns['gq_bioeconomia_gallery_images'] = __( 'Imagens', 'gq-bioeconomia' );
			}
		}

		return $new_columns;
	}

	/**
	 * Renderiza o conteúdo das colunas da listagem das galerias.
	 *
	 * @param string $column  Nome da coluna.
	 * @param int    $post_id ID do conteúdo.
	 * @return void
	 */
	public function renderColumn( $column, $post_id ) {
		if ( 'gq_bioeconomia_gallery_images' !== $column ) {
			return;
		}

		$image_ids = self::sanitizeImageIds( get_post_meta( $post_id, self::META_KEY, true ) );
		$count     = count( $image_ids );

		echo esc_html(
			sprintf(
				/* translators: %d: number of images in the gallery. */
				_n( '%d imagem', '%d imagens', $count, 'gq-bioeconomia' ),
				$count,
			),
		);
	}

	/**
	 * Regista o endpoint público das fotografias das galerias.
	 *
	 * @return void
	 */
	public function registerRestRoutes() {
		register_rest_route(
			'gq-bioeconomia/v1',
			'/gallery-photos',
			[
				'methods'             => 'GET',
				'callback'            => [ self::class, 'photosResponse' ],
				'permission_callback' => '__return_true',
			],
		);
	}

	/**
	 * Devolve as fotografias publicadas nas galerias para consumo pelo frontend.
	 *
	 * @return array<int, array{id:int,galleryId:int,galleryTitle:string,url:string,alt:string,width:int|null,height:int|null}>
	 */
	public static function photosResponse() {
		$photos    = [];
		$galleries = get_posts(
			[
				'post_type'      => self::POST_TYPE,
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'date',
				'order'          => 'DESC',
			],
		);

		if ( ! is_array( $galleries ) ) {
			return $photos;
		}

		$gallery_data     = [];
		$all_image_ids    = [];
		$all_image_id_set = [];

		foreach ( $galleries as $gallery ) {
			if ( ! is_object( $gallery ) || ! isset( $gallery->ID ) ) {
				continue;
			}

			$gallery_id = (int) $gallery->ID;
			$image_ids  = self::sanitizeImageIds( get_post_meta( $gallery_id, self::META_KEY, true ) );

			$gallery_data[] = [
				'id'        => $gallery_id,
				'title'     => wp_strip_all_tags( (string) get_the_title( $gallery_id ) ),
				'image_ids' => $image_ids,
			];

			foreach ( $image_ids as $image_id ) {
				if ( isset( $all_image_id_set[ $image_id ] ) ) {
					continue;
				}

				$all_image_id_set[ $image_id ] = true;
				$all_image_ids[]               = $image_id;
			}
		}

		$media_by_id = [];

		foreach ( OrderedMedia::forIds( $all_image_ids ) as $image ) {
			$media_by_id[ $image['id'] ] = $image;
		}

		foreach ( $gallery_data as $gallery ) {
			foreach ( $gallery['image_ids'] as $image_id ) {
				if ( ! isset( $media_by_id[ $image_id ] ) ) {
					continue;
				}

				$image = $media_by_id[ $image_id ];

				$photos[] = [
					'id'           => $image['id'],
					'galleryId'    => $gallery['id'],
					'galleryTitle' => $gallery['title'],
					'url'          => $image['url'],
					'alt'          => $image['alt'],
					'width'        => $image['width'],
					'height'       => $image['height'],
				];
			}
		}

		return $photos;
	}
}
