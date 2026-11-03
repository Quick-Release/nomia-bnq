<?php
/**
 * Visitor submissions.
 *
 * @package GetQuick\Bioeconomia\Submissions
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Submissions;

use GetQuick\Bioeconomia\Content\PostTypes;
use Throwable;
use WP_Post;

/**
 * Turns each Partilhe entry into a pending post of the type the visitor
 * chose, for the editors to review in the type's Pending view.
 *
 * The post has no author. Who sent it and the entry it came from are kept in
 * protected post meta, which is neither registered for REST nor exposed in
 * GraphQL, and shown in a box on the edit screen. Anything that goes wrong is
 * logged and noted on the entry, which stays the record of the submission.
 */
final class Submissions {

	public const META_ENTRY_ID        = '_gq_bioeconomia_submission_entry_id';
	public const META_FORM_ID         = '_gq_bioeconomia_submission_form_id';
	public const META_SUBMITTER_NAME  = '_gq_bioeconomia_submitter_name';
	public const META_SUBMITTER_EMAIL = '_gq_bioeconomia_submitter_email';

	/** The entry meta naming the post an entry became. */
	public const ENTRY_META_POST_ID = 'gq_bioeconomia_post_id';

	private const NOTE_TYPE = 'gq-bioeconomia';

	/**
	 * Builds the component.
	 *
	 * @param SubmissionMedia $media Imports the uploaded files.
	 */
	public function __construct( private readonly SubmissionMedia $media = new SubmissionMedia() ) {}

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'gform_after_submission', [ $this, 'handle' ], 10, 2 );
		add_action( 'add_meta_boxes', [ $this, 'registerMetaBox' ], 10, 2 );
		add_filter( 'display_post_states', [ $this, 'postStates' ], 10, 2 );
	}

	/**
	 * Creates the pending post for a Partilhe entry (`gform_after_submission`).
	 *
	 * @param mixed $entry The Gravity Forms entry.
	 * @param mixed $form  The Gravity Forms form.
	 */
	public function handle( $entry, $form ): void {
		if ( ! is_array( $entry ) || ( ! is_array( $form ) && ! $form instanceof \ArrayAccess ) || ! PartilheForm::isPartilheForm( $form ) ) {
			return;
		}

		$entry_id = (int) ( $entry['id'] ?? 0 );

		if ( $entry_id <= 0 || 'spam' === ( $entry['status'] ?? '' ) || gform_get_meta( $entry_id, self::ENTRY_META_POST_ID ) ) {
			return;
		}

		try {
			$this->createPost( $entry, $form, $entry_id );
		} catch ( Throwable $error ) {
			$this->fail( $entry_id, $error->getMessage() );
		}
	}

	/**
	 * Creates the post and imports its files.
	 *
	 * @param array              $entry    The Gravity Forms entry.
	 * @param array|\ArrayAccess $form     The Gravity Forms form.
	 * @param int                $entry_id The entry id.
	 */
	private function createPost( array $entry, $form, int $entry_id ): void {
		$submission = Submission::fromEntry( $entry, $form );

		if ( null === $submission ) {
			$this->fail( $entry_id, 'the content type is not one of the site\'s content types, or the title is empty; no content was created' );
			return;
		}

		$post_id = wp_insert_post(
			[
				'post_type'      => $submission->post_type,
				'post_status'    => 'pending',
				'post_author'    => 0,
				'post_title'     => $submission->title,
				'post_content'   => $submission->content,
				'comment_status' => 'closed',
				'ping_status'    => 'closed',
				'meta_input'     => [
					self::META_ENTRY_ID        => $entry_id,
					self::META_FORM_ID         => (int) ( $form['id'] ?? 0 ),
					self::META_SUBMITTER_NAME  => $submission->name,
					self::META_SUBMITTER_EMAIL => $submission->email,
				],
			],
			true
		);

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			$this->fail( $entry_id, 'the content could not be created: ' . ( is_wp_error( $post_id ) ? $post_id->get_error_message() : 'unknown error' ) );
			return;
		}

		$post_id = (int) $post_id;
		gform_update_meta( $entry_id, self::ENTRY_META_POST_ID, $post_id, (int) ( $form['id'] ?? 0 ) );
		// Not get_edit_post_link(): it is empty for the visitor, who can't edit the post.
		// Gravity Forms shows notes through wp_kses_post(), so the link stays a link.
		$this->note(
			$entry_id,
			sprintf(
				/* translators: %s: a link to edit the created content. */
				__( 'Conteúdo pendente criado: %s', 'gq-bioeconomia' ),
				sprintf(
					'<a href="%s">%s</a>',
					esc_url( admin_url( 'post.php?post=' . $post_id . '&action=edit' ) ),
					esc_html( $submission->title )
				)
			),
			'success'
		);

		$media = $this->media->import( $submission->file_urls, $entry_id, $post_id, $submission->post_type );

		foreach ( $media['errors'] as $message ) {
			$this->fail( $entry_id, 'a file was not attached: ' . $message );
		}
	}

	/**
	 * Adds the submission box to the edit screen of submitted content.
	 *
	 * @param string $post_type The post type.
	 * @param mixed  $post      The post being edited.
	 */
	public function registerMetaBox( $post_type, $post = null ): void {
		if ( ! $post instanceof WP_Post || ! array_key_exists( (string) $post_type, PostTypes::definitions() ) || ! self::entryId( $post->ID ) ) {
			return;
		}

		add_meta_box(
			'gq-bioeconomia-submission',
			__( 'Submissão de visitante', 'gq-bioeconomia' ),
			[ $this, 'renderMetaBox' ],
			$post_type,
			'side',
			'high'
		);
	}

	/**
	 * Shows who sent the content and links to the entry.
	 *
	 * @param WP_Post $post The post being edited.
	 */
	public function renderMetaBox( $post ): void {
		$entry_id = self::entryId( $post->ID );
		$form_id  = (int) get_post_meta( $post->ID, self::META_FORM_ID, true );
		$name     = (string) get_post_meta( $post->ID, self::META_SUBMITTER_NAME, true );
		$email    = (string) get_post_meta( $post->ID, self::META_SUBMITTER_EMAIL, true );

		echo '<p><strong>' . esc_html__( 'Nome', 'gq-bioeconomia' ) . ':</strong> ' . esc_html( $name ) . '</p>';
		echo '<p><strong>' . esc_html__( 'Email', 'gq-bioeconomia' ) . ':</strong> ';
		echo '' === $email ? '' : '<a href="' . esc_url( 'mailto:' . $email ) . '">' . esc_html( $email ) . '</a>';
		echo '</p>';

		if ( current_user_can( 'gravityforms_view_entries' ) ) {
			$url = admin_url( 'admin.php?page=gf_entries&view=entry&id=' . $form_id . '&lid=' . $entry_id );
			echo '<p><a href="' . esc_url( $url ) . '">' . esc_html__( 'Ver a entrada do formulário', 'gq-bioeconomia' ) . '</a></p>';
			return;
		}

		/* translators: %d: the Gravity Forms entry id. */
		echo '<p>' . esc_html( sprintf( __( 'Entrada do formulário n.º %d', 'gq-bioeconomia' ), $entry_id ) ) . '</p>';
	}

	/**
	 * Marks submitted content in the post lists (`display_post_states`).
	 *
	 * @param array<string, string> $states The post's states.
	 * @param mixed                 $post   The post.
	 * @return array<string, string>
	 */
	public function postStates( $states, $post ) {
		if ( is_array( $states ) && $post instanceof WP_Post && self::entryId( $post->ID ) ) {
			$states['gq-bioeconomia-submission'] = __( 'Submissão de visitante', 'gq-bioeconomia' );
		}

		return $states;
	}

	/**
	 * The entry a post came from, or 0.
	 *
	 * @param int $post_id The post.
	 */
	private static function entryId( int $post_id ): int {
		return (int) get_post_meta( $post_id, self::META_ENTRY_ID, true );
	}

	/**
	 * Logs a problem and notes it on the entry.
	 *
	 * @param int    $entry_id The entry.
	 * @param string $message  What went wrong.
	 */
	private function fail( int $entry_id, string $message ): void {
		$message = sprintf( 'gq-bioeconomia: Partilhe entry %d: %s', $entry_id, $message );

		if ( class_exists( 'GFCommon' ) ) {
			\GFCommon::log_error( $message );
		}

		// The entry note is for editors; the PHP log is for whoever runs the CMS.
		error_log( $message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		$this->note( $entry_id, $message, 'error' );
	}

	/**
	 * Adds a note to the entry.
	 *
	 * @param int    $entry_id The entry.
	 * @param string $note     The note.
	 * @param string $sub_type `success` or `error`.
	 */
	private function note( int $entry_id, string $note, string $sub_type ): void {
		if ( class_exists( 'GFAPI' ) ) {
			\GFAPI::add_note( $entry_id, 0, 'Bio.Eco.Nomia', $note, self::NOTE_TYPE, $sub_type );
		}
	}
}
