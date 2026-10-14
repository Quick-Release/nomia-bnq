<?php
/**
 * Shared WordPress media projection for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve imagens válidas na ordem dos IDs pedidos.
 *
 * Resoluções, incluindo resultados inválidos, são mantidas apenas durante o
 * pedido atual para que vários consumidores não repitam a mesma leitura.
 *
 * @param int[] $attachment_ids IDs de anexos já normalizados.
 * @return array<int, array{id:int,title:string,url:string,alt:string,width:int|null,height:int|null}>
 */
function nomia_cpt_get_ordered_media( array $attachment_ids ) {
	$requested_ids    = array();
	$requested_id_set = array();

	foreach ( $attachment_ids as $attachment_id ) {
		$attachment_id = absint( $attachment_id );

		if ( 0 === $attachment_id || isset( $requested_id_set[ $attachment_id ] ) ) {
			continue;
		}

		$requested_ids[]                    = $attachment_id;
		$requested_id_set[ $attachment_id ] = true;
	}

	if ( array() === $requested_ids ) {
		return array();
	}

	if ( ! isset( $GLOBALS['nomia_cpt_media_cache'] ) || ! is_array( $GLOBALS['nomia_cpt_media_cache'] ) ) {
		$GLOBALS['nomia_cpt_media_cache'] = array();
	}

	$media_cache  = & $GLOBALS['nomia_cpt_media_cache'];
	$uncached_ids = array();

	foreach ( $requested_ids as $attachment_id ) {
		if ( ! array_key_exists( $attachment_id, $media_cache ) ) {
			$uncached_ids[] = $attachment_id;
		}
	}

	if ( array() !== $uncached_ids ) {
		$uncached_id_set = array_fill_keys( $uncached_ids, true );
		$attachments     = get_posts(
			array(
				'post_type'      => 'attachment',
				'post__in'       => $uncached_ids,
				'orderby'        => 'post__in',
				'posts_per_page' => count( $uncached_ids ),
			),
		);

		if ( is_array( $attachments ) ) {
			foreach ( $attachments as $attachment ) {
				if ( ! is_object( $attachment ) || ! isset( $attachment->ID ) ) {
					continue;
				}

				$attachment_id = (int) $attachment->ID;

				if ( ! isset( $uncached_id_set[ $attachment_id ] ) ) {
					continue;
				}

				if ( ! wp_attachment_is_image( $attachment ) ) {
					$media_cache[ $attachment_id ] = null;
					continue;
				}

				$image = wp_get_attachment_image_src( $attachment_id, 'full' );

				if ( ! is_array( $image ) || empty( $image[0] ) ) {
					$media_cache[ $attachment_id ] = null;
					continue;
				}

				$url = esc_url_raw( (string) $image[0] );

				if ( '' === $url ) {
					$media_cache[ $attachment_id ] = null;
					continue;
				}

				$title = wp_strip_all_tags( (string) get_the_title( $attachment_id ) );
				$alt   = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

				if ( ! is_string( $alt ) || '' === trim( $alt ) ) {
					$alt = $title;
				}

				$media_cache[ $attachment_id ] = array(
					'id'     => $attachment_id,
					'title'  => $title,
					'url'    => $url,
					'alt'    => wp_strip_all_tags( (string) $alt ),
					'width'  => isset( $image[1] ) ? absint( $image[1] ) : null,
					'height' => isset( $image[2] ) ? absint( $image[2] ) : null,
				);
			}
		}

		foreach ( $uncached_ids as $attachment_id ) {
			if ( ! array_key_exists( $attachment_id, $media_cache ) ) {
				$media_cache[ $attachment_id ] = null;
			}
		}
	}

	$media = array();

	foreach ( $requested_ids as $attachment_id ) {
		if ( isset( $media_cache[ $attachment_id ] ) && is_array( $media_cache[ $attachment_id ] ) ) {
			$media[] = $media_cache[ $attachment_id ];
		}
	}

	return $media;
}
