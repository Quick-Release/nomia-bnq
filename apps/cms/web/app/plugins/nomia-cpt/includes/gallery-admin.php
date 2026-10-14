<?php
/**
 * Gallery admin behavior for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve a meta key usada para guardar os IDs das imagens de uma galeria.
 *
 * @return string
 */
function nomia_cpt_get_gallery_image_ids_meta_key() {
	return 'nomia_cpt_gallery_image_ids';
}

/**
 * Regista os metadados REST das galerias.
 *
 * @return void
 */
function nomia_cpt_register_gallery_meta() {
	register_post_meta(
		'nomia_gallery',
		nomia_cpt_get_gallery_image_ids_meta_key(),
		array(
			'single'            => true,
			'type'              => 'array',
			'default'           => array(),
			'sanitize_callback' => 'nomia_cpt_sanitize_gallery_image_ids',
			'auth_callback'     => static function () {
				return current_user_can( 'edit_nomia_cpt_galleries' );
			},
			'show_in_rest'      => array(
				'schema' => array(
					'type'    => 'array',
					'items'   => array(
						'type' => 'integer',
					),
					'default' => array(),
				),
			),
		),
	);
}

/**
 * Normaliza a lista ordenada de IDs de imagens.
 *
 * @param mixed $value Valor bruto.
 * @return int[]
 */
function nomia_cpt_sanitize_gallery_image_ids( $value ) {
	if ( is_string( $value ) ) {
		$value = explode( ',', $value );
	}

	if ( ! is_array( $value ) ) {
		return array();
	}

	$sanitized_ids = array();

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
function nomia_cpt_register_gallery_meta_box() {
	add_meta_box(
		'nomia-cpt-gallery-images',
		__( 'Imagens da galeria', 'nomia-cpt' ),
		'nomia_cpt_render_gallery_meta_box',
		'nomia_gallery',
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
function nomia_cpt_render_gallery_meta_box( $post ) {
	$post_id     = isset( $post->ID ) ? (int) $post->ID : 0;
	$image_ids   = nomia_cpt_sanitize_gallery_image_ids( get_post_meta( $post_id, nomia_cpt_get_gallery_image_ids_meta_key(), true ) );
	$attachments = nomia_cpt_get_gallery_attachments( $image_ids );

	wp_nonce_field( 'nomia_cpt_gallery_images', 'nomia_cpt_gallery_images_nonce' );

	echo '<p>' . esc_html__( 'Selecione imagens já existentes na biblioteca multimédia e guarde a ordem pretendida para esta galeria.', 'nomia-cpt' ) . '</p>';
	echo '<input type="hidden" id="nomia-cpt-gallery-image-ids" name="nomia_cpt_gallery_image_ids" value="' . esc_attr( implode( ',', $image_ids ) ) . '" />';
	echo '<div id="nomia-cpt-gallery-selection" class="nomia-cpt-gallery-selection" data-empty-label="' . esc_attr__( 'Nenhuma imagem selecionada.', 'nomia-cpt' ) . '">';

	if ( array() === $attachments ) {
		echo '<p class="description">' . esc_html__( 'Nenhuma imagem selecionada.', 'nomia-cpt' ) . '</p>';
	} else {
		echo '<ol class="nomia-cpt-gallery-selection__list">';

		foreach ( $attachments as $attachment ) {
			echo '<li data-attachment-id="' . esc_attr( (string) $attachment['id'] ) . '">';
			echo esc_html( $attachment['title'] );
			echo '</li>';
		}

		echo '</ol>';
	}

	echo '</div>';
	echo '<p class="nomia-cpt-gallery-selection__actions">';
	echo '<button type="button" class="button button-secondary" id="nomia-cpt-gallery-select">' . esc_html__( 'Selecionar imagens', 'nomia-cpt' ) . '</button>';
	echo ' ';
	echo '<button type="button" class="button button-link-delete" id="nomia-cpt-gallery-clear">' . esc_html__( 'Limpar seleção', 'nomia-cpt' ) . '</button>';
	echo '</p>';
	echo '<p class="description">' . esc_html__( 'Ao inserir o bloco no conteúdo, basta escolher a galeria criada aqui.', 'nomia-cpt' ) . '</p>';
}

/**
 * Devolve os anexos selecionados na ordem guardada.
 *
 * @param int[] $image_ids IDs normalizados.
 * @return array<int, array{id:int,title:string}>
 */
function nomia_cpt_get_gallery_attachments( array $image_ids ) {
	$attachments = array();

	foreach ( nomia_cpt_get_ordered_media( $image_ids ) as $image ) {
		$attachments[] = array(
			'id'    => $image['id'],
			'title' => $image['title'],
		);
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
function nomia_cpt_save_gallery_meta_box( $post_id, $post ) {
	if ( ! is_object( $post ) || 'nomia_gallery' !== ( $post->post_type ?? '' ) ) {
		return;
	}

	if ( ! isset( $_POST['nomia_cpt_gallery_images_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nomia_cpt_gallery_images_nonce'] ) ), 'nomia_cpt_gallery_images' ) ) {
		return;
	}

	if ( wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_nomia_cpt_galleries' ) ) {
		return;
	}

	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- The custom sanitizer applies absint to every submitted ID.
	$raw_image_ids = isset( $_POST['nomia_cpt_gallery_image_ids'] ) ? wp_unslash( $_POST['nomia_cpt_gallery_image_ids'] ) : array();
	$image_ids     = nomia_cpt_sanitize_gallery_image_ids( $raw_image_ids );

	update_post_meta( $post_id, nomia_cpt_get_gallery_image_ids_meta_key(), $image_ids );
}

/**
 * Carrega os assets do seletor de imagens da galeria.
 *
 * @param string $hook_suffix Hook atual do admin.
 * @return void
 */
function nomia_cpt_enqueue_gallery_admin_assets( $hook_suffix ) {
	if ( ! in_array( $hook_suffix, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}

	// These query arguments select the current admin screen and do not trigger a state change.
	// phpcs:disable WordPress.Security.NonceVerification.Recommended
	$post_type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '';

	if ( '' === $post_type && isset( $_GET['post'] ) ) {
		$post_type = get_post_type( absint( $_GET['post'] ) );
	}
	// phpcs:enable WordPress.Security.NonceVerification.Recommended

	if ( 'nomia_gallery' !== $post_type ) {
		return;
	}

	wp_enqueue_media();
	nomia_cpt_register_media_picker_script();
	wp_enqueue_script(
		'nomia-cpt-gallery-admin',
		plugin_dir_url( NOMIA_CPT_PLUGIN_FILE ) . 'assets/js/gallery-admin.js',
		array( 'nomia-cpt-media-picker' ),
		NOMIA_CPT_PLUGIN_VERSION,
		true,
	);
	wp_add_inline_script(
		'nomia-cpt-gallery-admin',
		'window.nomiaCptGalleryAdmin = ' . wp_json_encode(
			array(
				'emptyLabel' => __( 'Nenhuma imagem selecionada.', 'nomia-cpt' ),
			),
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
function nomia_cpt_get_gallery_admin_columns( $columns ) {
	$new_columns = array();

	foreach ( $columns as $key => $label ) {
		$new_columns[ $key ] = $label;

		if ( 'title' === $key ) {
			$new_columns['nomia_cpt_gallery_images'] = __( 'Imagens', 'nomia-cpt' );
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
function nomia_cpt_render_gallery_admin_column( $column, $post_id ) {
	if ( 'nomia_cpt_gallery_images' !== $column ) {
		return;
	}

	$image_ids = nomia_cpt_sanitize_gallery_image_ids( get_post_meta( $post_id, nomia_cpt_get_gallery_image_ids_meta_key(), true ) );
	$count     = count( $image_ids );

	echo esc_html(
		sprintf(
			/* translators: %d: number of images in the gallery. */
			_n( '%d imagem', '%d imagens', $count, 'nomia-cpt' ),
			$count,
		),
	);
}

/**
 * Regista o endpoint público das fotografias das galerias.
 *
 * @return void
 */
function nomia_cpt_register_gallery_rest_routes() {
	register_rest_route(
		'nomia/v1',
		'/gallery-photos',
		array(
			'methods'             => 'GET',
			'callback'            => 'nomia_cpt_get_gallery_photos_rest_response',
			'permission_callback' => '__return_true',
		),
	);
}

/**
 * Devolve as fotografias publicadas nas galerias para consumo pelo frontend.
 *
 * @return array<int, array{id:int,galleryId:int,galleryTitle:string,url:string,alt:string,width:int|null,height:int|null}>
 */
function nomia_cpt_get_gallery_photos_rest_response() {
	$photos    = array();
	$galleries = get_posts(
		array(
			'post_type'      => 'nomia_gallery',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'DESC',
		),
	);

	if ( ! is_array( $galleries ) ) {
		return $photos;
	}

	$gallery_data     = array();
	$all_image_ids    = array();
	$all_image_id_set = array();

	foreach ( $galleries as $gallery ) {
		if ( ! is_object( $gallery ) || ! isset( $gallery->ID ) ) {
			continue;
		}

		$gallery_id = (int) $gallery->ID;
		$image_ids  = nomia_cpt_sanitize_gallery_image_ids( get_post_meta( $gallery_id, nomia_cpt_get_gallery_image_ids_meta_key(), true ) );

		$gallery_data[] = array(
			'id'        => $gallery_id,
			'title'     => wp_strip_all_tags( (string) get_the_title( $gallery_id ) ),
			'image_ids' => $image_ids,
		);

		foreach ( $image_ids as $image_id ) {
			if ( isset( $all_image_id_set[ $image_id ] ) ) {
				continue;
			}

			$all_image_id_set[ $image_id ] = true;
			$all_image_ids[]               = $image_id;
		}
	}

	$media_by_id = array();

	foreach ( nomia_cpt_get_ordered_media( $all_image_ids ) as $image ) {
		$media_by_id[ $image['id'] ] = $image;
	}

	foreach ( $gallery_data as $gallery ) {
		foreach ( $gallery['image_ids'] as $image_id ) {
			if ( ! isset( $media_by_id[ $image_id ] ) ) {
				continue;
			}

			$image = $media_by_id[ $image_id ];

			$photos[] = array(
				'id'           => $image['id'],
				'galleryId'    => $gallery['id'],
				'galleryTitle' => $gallery['title'],
				'url'          => $image['url'],
				'alt'          => $image['alt'],
				'width'        => $image['width'],
				'height'       => $image['height'],
			);
		}
	}

	return $photos;
}
