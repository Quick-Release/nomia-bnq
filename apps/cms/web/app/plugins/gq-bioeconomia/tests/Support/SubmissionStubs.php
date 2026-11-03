<?php

declare(strict_types=1);

/**
 * WordPress and Gravity Forms shims for the visitor submissions tests.
 *
 * Every call is recorded in $GLOBALS['gq_bioeconomia_submissions'], which
 * gq_bioeconomia_reset_submissions() empties. The Gravity Forms upload root is
 * a temporary directory, so the media import reads real files.
 */

function gq_bioeconomia_reset_submissions(): void {
	$root = sys_get_temp_dir() . '/gq-bioeconomia-submissions-' . getmypid();

	if ( ! is_dir( $root ) ) {
		mkdir( $root, 0777, true );
	}

	$GLOBALS['gq_bioeconomia_submissions'] = [
		'upload_root'     => $root . '/',
		'upload_url_root' => 'https://cms.example/app/uploads/gravity_forms/',
		'posts'           => [],
		'insert_result'   => null,
		'attachments'     => [],
		'thumbnails'      => [],
		'entry_meta'      => [],
		'notes'           => [],
		'errors'          => [],
		'filetypes'       => [],
	];
}

/**
 * Writes a file into the stubbed Gravity Forms upload root and returns its URL.
 */
function gq_bioeconomia_upload( string $name, string $contents = 'file' ): string {
	file_put_contents( $GLOBALS['gq_bioeconomia_submissions']['upload_root'] . $name, $contents );

	return $GLOBALS['gq_bioeconomia_submissions']['upload_url_root'] . $name;
}

gq_bioeconomia_reset_submissions();

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		public function __construct( public string $code = '', public string $message = '' ) {}

		public function get_error_message() {
			return $this->message;
		}
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $value ) {
		return trim( preg_replace( '/\s+/', ' ', strip_tags( (string) $value ) ) );
	}
}

if ( ! function_exists( 'sanitize_textarea_field' ) ) {
	function sanitize_textarea_field( $value ) {
		return trim( strip_tags( preg_replace( '#<(script|style)\b[^>]*>.*?</\1>#is', '', (string) $value ) ) );
	}
}

if ( ! function_exists( 'sanitize_email' ) ) {
	function sanitize_email( $value ) {
		$value = trim( (string) $value );

		return false === filter_var( $value, FILTER_VALIDATE_EMAIL ) ? '' : $value;
	}
}

if ( ! function_exists( 'wp_kses_post' ) ) {
	function wp_kses_post( $value ) {
		return preg_replace( '#<script\b[^>]*>.*?</script>#is', '', (string) $value );
	}
}

if ( ! function_exists( 'esc_url' ) ) {
	function esc_url( $value ) {
		return (string) $value;
	}
}

if ( ! function_exists( 'esc_attr' ) ) {
	function esc_attr( $value ) {
		return htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'admin_url' ) ) {
	function admin_url( $path = '' ) {
		return 'https://cms.example/wp/wp-admin/' . ltrim( (string) $path, '/' );
	}
}

if ( ! function_exists( 'post_type_exists' ) ) {
	function post_type_exists( $post_type ) {
		return array_key_exists( $post_type, \GetQuick\Bioeconomia\Content\PostTypes::definitions() );
	}
}

if ( ! function_exists( 'post_type_supports' ) ) {
	function post_type_supports( $post_type, $feature ) {
		$definitions = \GetQuick\Bioeconomia\Content\PostTypes::definitions();

		return in_array( $feature, $definitions[ $post_type ]['args']['supports'] ?? [], true );
	}
}

if ( ! function_exists( 'wp_insert_post' ) ) {
	function wp_insert_post( $postarr, $wp_error = false, $fire_after_hooks = true ) {
		$state = &$GLOBALS['gq_bioeconomia_submissions'];

		if ( null !== $state['insert_result'] ) {
			return $state['insert_result'];
		}

		$id                    = 500 + count( $state['posts'] );
		$state['posts'][ $id ] = $postarr;

		return $id;
	}
}

if ( ! function_exists( 'wp_check_filetype_and_ext' ) ) {
	function wp_check_filetype_and_ext( $file, $filename, $mimes = null ) {
		$types = [
			'jpg'  => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'png'  => 'image/png',
			'webp' => 'image/webp',
			'gif'  => 'image/gif',
			'pdf'  => 'application/pdf',
			'svg'  => 'image/svg+xml',
		];
		$ext   = strtolower( pathinfo( (string) $filename, PATHINFO_EXTENSION ) );

		// A test can declare what a file really is, whatever its name says.
		$real = $GLOBALS['gq_bioeconomia_submissions']['filetypes'][ basename( (string) $filename ) ] ?? ( $types[ $ext ] ?? false );

		if ( false === $real ) {
			return [ 'ext' => false, 'type' => false, 'proper_filename' => false ];
		}

		return [ 'ext' => array_search( $real, $types, true ), 'type' => $real, 'proper_filename' => false ];
	}
}

if ( ! function_exists( 'wp_tempnam' ) ) {
	function wp_tempnam( $filename = '' ) {
		return (string) tempnam( sys_get_temp_dir(), 'gqb' );
	}
}

if ( ! function_exists( 'media_handle_sideload' ) ) {
	function media_handle_sideload( $file_array, $post_id = 0, $desc = null, $post_data = [] ) {
		$state = &$GLOBALS['gq_bioeconomia_submissions'];
		$id    = 900 + count( $state['attachments'] );

		$state['attachments'][ $id ] = [
			'name'      => $file_array['name'],
			'contents'  => file_get_contents( $file_array['tmp_name'] ),
			'parent'    => $post_id,
			'post_data' => $post_data,
		];
		unlink( $file_array['tmp_name'] );

		return $id;
	}
}

if ( ! function_exists( 'set_post_thumbnail' ) ) {
	function set_post_thumbnail( $post, $thumbnail_id ) {
		$GLOBALS['gq_bioeconomia_submissions']['thumbnails'][ $post ] = $thumbnail_id;

		return true;
	}
}

if ( ! function_exists( 'gform_get_meta' ) ) {
	function gform_get_meta( $entry_id, $meta_key ) {
		return $GLOBALS['gq_bioeconomia_submissions']['entry_meta'][ $entry_id ][ $meta_key ] ?? false;
	}
}

if ( ! function_exists( 'gform_update_meta' ) ) {
	function gform_update_meta( $entry_id, $meta_key, $meta_value, $form_id = null ) {
		$GLOBALS['gq_bioeconomia_submissions']['entry_meta'][ $entry_id ][ $meta_key ] = $meta_value;
	}
}

if ( ! class_exists( 'GFAPI' ) ) {
	class GFAPI {
		public static function add_note( $entry_id, $user_id, $user_name, $note, $note_type = 'user', $sub_type = null ) {
			$GLOBALS['gq_bioeconomia_submissions']['notes'][] = compact( 'entry_id', 'user_name', 'note', 'note_type', 'sub_type' );

			return 1;
		}
	}
}

if ( ! class_exists( 'GFCommon' ) ) {
	class GFCommon {
		public static function log_error( $message ) {
			$GLOBALS['gq_bioeconomia_submissions']['errors'][] = $message;
		}
	}
}

if ( ! class_exists( 'GF_Field_FileUpload' ) ) {
	class GF_Field_FileUpload {
		public static function get_file_upload_path_info( $file_url, $entry_id = null ) {
			return [
				'path' => $GLOBALS['gq_bioeconomia_submissions']['upload_root'],
				'url'  => $GLOBALS['gq_bioeconomia_submissions']['upload_url_root'],
			];
		}
	}
}

if ( ! function_exists( 'wp_delete_file' ) ) {
	function wp_delete_file( $file ) {
		@unlink( $file );
	}
}

if ( ! function_exists( 'esc_html__' ) ) {
	function esc_html__( $text, $domain = 'default' ) {
		return esc_html( $text );
	}
}

if ( ! function_exists( 'add_meta_box' ) ) {
	function add_meta_box( $id, $title, $callback, $screen = null, $context = 'advanced', $priority = 'default' ) {
		$GLOBALS['gq_bioeconomia_submissions']['meta_boxes'][ $id ] = compact( 'title', 'callback', 'screen', 'context' );
	}
}
