<?php
/**
 * A visitor submission.
 *
 * @package GetQuick\Bioeconomia\Submissions
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Submissions;

use GetQuick\Bioeconomia\Content\PostTypes;

/**
 * What a Partilhe entry proposes, read and sanitised. Nothing in it is
 * trusted until `fromEntry()` has checked it.
 */
final class Submission {

	/**
	 * Builds a submission.
	 *
	 * @param string $post_type One of the plugin's post types.
	 * @param string $title    Plain text.
	 * @param string $content  Paragraph blocks, already through wp_kses_post().
	 * @param string $name     The submitter's name, plain text.
	 * @param string $email    The submitter's email, or ''.
	 * @param array  $file_urls The uploaded files' URLs, as the entry has them.
	 */
	public function __construct(
		public readonly string $post_type,
		public readonly string $title,
		public readonly string $content,
		public readonly string $name,
		public readonly string $email,
		public readonly array $file_urls,
	) {}

	/**
	 * Reads a Partilhe entry. Null when its content type isn't one of the
	 * plugin's post types or it has no title.
	 *
	 * @param array        $entry The Gravity Forms entry.
	 * @param array|object $form  The Gravity Forms form.
	 */
	public static function fromEntry( array $entry, $form ): ?self {
		$values = self::valuesByAdminLabel( $entry, $form );

		$post_type = $values[ PartilheForm::LABEL_CONTENT_TYPE ] ?? '';
		$title     = sanitize_text_field( $values[ PartilheForm::LABEL_TITLE ] ?? '' );

		if ( ! self::isPluginPostType( $post_type ) || '' === $title ) {
			return null;
		}

		return new self(
			$post_type,
			$title,
			self::paragraphBlocks( $values[ PartilheForm::LABEL_CONTENT ] ?? '' ),
			sanitize_text_field( $values[ PartilheForm::LABEL_NAME ] ?? '' ),
			(string) sanitize_email( $values[ PartilheForm::LABEL_EMAIL ] ?? '' ),
			self::fileUrls( $values[ PartilheForm::LABEL_MEDIA ] ?? '' ),
		);
	}

	/**
	 * Whether a value is exactly the slug of one of the plugin's post types.
	 *
	 * @param mixed $post_type The value to check.
	 */
	public static function isPluginPostType( $post_type ): bool {
		return is_string( $post_type )
			&& array_key_exists( $post_type, PostTypes::definitions() )
			&& post_type_exists( $post_type );
	}

	/**
	 * Plain text as paragraph blocks: blank lines separate paragraphs, single
	 * line breaks stay line breaks, and no markup survives.
	 *
	 * @param string $text The visitor's text.
	 */
	public static function paragraphBlocks( string $text ): string {
		$text       = str_replace( [ "\r\n", "\r" ], "\n", sanitize_textarea_field( $text ) );
		$paragraphs = array_filter( array_map( 'trim', preg_split( '/\n\s*\n/', $text ) ), 'strlen' );
		$blocks     = [];

		foreach ( $paragraphs as $paragraph ) {
			$html     = implode( "<br>\n", array_map( 'esc_html', explode( "\n", $paragraph ) ) );
			$blocks[] = "<!-- wp:paragraph -->\n<p>{$html}</p>\n<!-- /wp:paragraph -->";
		}

		return wp_kses_post( implode( "\n\n", $blocks ) );
	}

	/**
	 * The entry's values keyed by their fields' admin labels. A field with
	 * inputs (a name) is its non-empty inputs joined by spaces.
	 *
	 * @param array        $entry The Gravity Forms entry.
	 * @param array|object $form  The Gravity Forms form.
	 * @return array<string, string>
	 */
	private static function valuesByAdminLabel( array $entry, $form ): array {
		$values = [];

		foreach ( $form['fields'] ?? [] as $field ) {
			$label = (string) ( $field['adminLabel'] ?? '' );

			if ( '' === $label || isset( $values[ $label ] ) ) {
				continue;
			}

			$inputs = is_array( $field['inputs'] ?? null ) ? $field['inputs'] : [];

			if ( 'name' === ( $field['type'] ?? '' ) && [] !== $inputs ) {
				$parts = [];

				foreach ( $inputs as $input ) {
					$parts[] = trim( (string) ( $entry[ (string) $input['id'] ] ?? '' ) );
				}

				$values[ $label ] = implode( ' ', array_filter( $parts, 'strlen' ) );
				continue;
			}

			$value            = $entry[ (string) ( $field['id'] ?? '' ) ] ?? '';
			$values[ $label ] = is_scalar( $value ) ? (string) $value : '';
		}

		return $values;
	}

	/**
	 * A file upload value as URLs: a multi-file upload stores a JSON list, a
	 * single one the URL itself.
	 *
	 * @param string $value The entry value.
	 * @return list<string>
	 */
	private static function fileUrls( string $value ): array {
		$value = trim( $value );

		if ( '' === $value ) {
			return [];
		}

		$urls = str_starts_with( $value, '[' ) ? json_decode( $value, true ) : [ $value ];

		if ( ! is_array( $urls ) ) {
			return [];
		}

		return array_values( array_filter( $urls, static fn( $url ) => is_string( $url ) && '' !== $url ) );
	}
}
