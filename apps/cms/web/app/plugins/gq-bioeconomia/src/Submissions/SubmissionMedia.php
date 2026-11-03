<?php
/**
 * A submission's uploaded files.
 *
 * @package GetQuick\Bioeconomia\Submissions
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Submissions;

use WP_Error;

/**
 * Copies a Partilhe entry's uploads into the media library, attached to the
 * submitted post. Only files inside the entry's Gravity Forms upload folder are
 * read, and only those whose content really is an image or a PDF are kept.
 */
final class SubmissionMedia {

	/**
	 * The file types a submission may attach, by extension pattern.
	 *
	 * @var array<string, string>
	 */
	public const ALLOWED_MIMES = [
		'jpg|jpeg|jpe' => 'image/jpeg',
		'png'          => 'image/png',
		'webp'         => 'image/webp',
		'gif'          => 'image/gif',
		'pdf'          => 'application/pdf',
	];

	/**
	 * Imports the files, in order. The first image becomes the featured image
	 * when the post type supports one.
	 *
	 * @param string[] $urls      The uploaded files' URLs.
	 * @param int      $entry_id  The Gravity Forms entry.
	 * @param int      $post_id   The submitted post.
	 * @param string   $post_type Its post type.
	 * @return array{attachments: list<int>, errors: list<string>}
	 */
	public function import( array $urls, int $entry_id, int $post_id, string $post_type ): array {
		$attachments = [];
		$errors      = [];
		$thumbnail   = 0;

		foreach ( $urls as $url ) {
			$result = $this->importOne( $url, $entry_id, $post_id );

			if ( is_wp_error( $result ) ) {
				$errors[] = sprintf( '%s: %s', $url, $result->get_error_message() );
				continue;
			}

			$attachments[] = $result['id'];

			if ( 0 === $thumbnail && str_starts_with( $result['type'], 'image/' ) ) {
				$thumbnail = $result['id'];
			}
		}

		if ( 0 !== $thumbnail && post_type_supports( $post_type, 'thumbnail' ) ) {
			set_post_thumbnail( $post_id, $thumbnail );
		}

		return [
			'attachments' => $attachments,
			'errors'      => $errors,
		];
	}

	/**
	 * Imports one file.
	 *
	 * @param string $url      The uploaded file's URL.
	 * @param int    $entry_id The Gravity Forms entry.
	 * @param int    $post_id  The post to attach it to.
	 * @return array{id: int, type: string}|WP_Error
	 */
	private function importOne( string $url, int $entry_id, int $post_id ) {
		$path = $this->uploadPath( $url, $entry_id );

		if ( is_wp_error( $path ) ) {
			return $path;
		}

		$this->loadMediaFunctions();

		$name = basename( $path );
		$tmp  = wp_tempnam( $name );

		// Check a local copy: the uploads may live behind a stream wrapper (S3),
		// where content sniffing can't read them.
		if ( '' === $tmp || ! copy( $path, $tmp ) ) {
			return new WP_Error( 'gq_bioeconomia_submission_copy', 'the file could not be copied' );
		}

		$check = wp_check_filetype_and_ext( $tmp, $name, self::ALLOWED_MIMES );

		if ( empty( $check['ext'] ) || ! in_array( $check['type'], self::ALLOWED_MIMES, true ) ) {
			wp_delete_file( $tmp );

			return new WP_Error( 'gq_bioeconomia_submission_type', 'not an image or a PDF' );
		}

		$id = media_handle_sideload(
			[
				'name'     => $check['proper_filename'] ? $check['proper_filename'] : $name,
				'tmp_name' => $tmp,
			],
			$post_id,
			null,
			[ 'post_author' => 0 ]
		);

		if ( file_exists( $tmp ) ) {
			wp_delete_file( $tmp );
		}

		if ( is_wp_error( $id ) ) {
			return $id;
		}

		return [
			'id'   => (int) $id,
			'type' => (string) $check['type'],
		];
	}

	/**
	 * The path of an uploaded file, if the URL is inside the entry's Gravity
	 * Forms upload folder and the file is there.
	 *
	 * @param string $url      The uploaded file's URL.
	 * @param int    $entry_id The Gravity Forms entry.
	 * @return string|WP_Error
	 */
	private function uploadPath( string $url, int $entry_id ) {
		if ( ! class_exists( 'GF_Field_FileUpload' ) ) {
			return new WP_Error( 'gq_bioeconomia_submission_gravity_forms', 'Gravity Forms is not active' );
		}

		$info     = \GF_Field_FileUpload::get_file_upload_path_info( $url, $entry_id );
		$root_url = trailingslashit( (string) ( $info['url'] ?? '' ) );

		if ( '/' === $root_url || ! str_starts_with( $url, $root_url ) ) {
			return new WP_Error( 'gq_bioeconomia_submission_outside', 'not a Gravity Forms upload' );
		}

		$relative = rawurldecode( substr( $url, strlen( $root_url ) ) );

		if ( '' === $relative || str_contains( $relative, '..' ) || str_contains( $relative, "\0" ) || str_contains( $relative, '?' ) ) {
			return new WP_Error( 'gq_bioeconomia_submission_outside', 'not a Gravity Forms upload' );
		}

		$path = trailingslashit( (string) $info['path'] ) . $relative;

		if ( ! is_file( $path ) ) {
			return new WP_Error( 'gq_bioeconomia_submission_missing', 'the file is missing' );
		}

		return $path;
	}

	/**
	 * Loads the admin media functions, which a REST request doesn't.
	 */
	private function loadMediaFunctions(): void {
		if ( function_exists( 'media_handle_sideload' ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
	}
}
