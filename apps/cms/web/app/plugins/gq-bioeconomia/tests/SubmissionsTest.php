<?php
/**
 * Visitor submissions from the Partilhe form.
 *
 * @package GetQuick\Bioeconomia
 */

use GetQuick\Bioeconomia\Content\PostTypes;
use GetQuick\Bioeconomia\Submissions\PartilheForm;
use GetQuick\Bioeconomia\Submissions\Submission;
use GetQuick\Bioeconomia\Submissions\Submissions;

/*
|--------------------------------------------------------------------------
| The Partilhe form
|--------------------------------------------------------------------------
|
| The form is recognised by its CSS class and its fields by their admin
| labels, so the handler works whatever ids the form gets on each CMS.
*/

function gq_bioeconomia_partilhe_form(): array {
	return PartilheForm::definition() + [ 'id' => 7 ];
}

function gq_bioeconomia_partilhe_entry( array $values = [] ): array {
	$ids   = [];
	$entry = [
		'id'      => 31,
		'form_id' => 7,
		'status'  => 'active',
	];

	foreach ( PartilheForm::definition()['fields'] as $field ) {
		$ids[ $field['adminLabel'] ?? $field['type'] ] = (string) $field['id'];
	}

	$defaults = [
		'name'         => [ "{$ids['name']}.3" => 'Ana', "{$ids['name']}.6" => 'Silva' ],
		'email'        => [ $ids['email'] => 'ana@example.org' ],
		'content_type' => [ $ids['content_type'] => 'recursos_educativos' ],
		'title'        => [ $ids['title'] => 'Guia da bioeconomia' ],
		'content'      => [ $ids['content'] => "Primeiro parágrafo.\n\nSegundo & último." ],
		'media'        => [ $ids['media'] => '' ],
	];

	foreach ( array_replace( $defaults, $values ) as $label => $value ) {
		$entry = is_array( $value ) ? array_replace( $entry, $value ) : array_replace( $entry, [ $ids[ $label ] => $value ] );
	}

	return $entry;
}

beforeEach( function () {
	gq_bioeconomia_reset_submissions();
} );

test( 'the form is the one whose CSS classes include the Partilhe class', function () {
	expect( PartilheForm::isPartilheForm( [ 'cssClass' => 'gq-bioeconomia-partilhe' ] ) )->toBeTrue()
		->and( PartilheForm::isPartilheForm( [ 'cssClass' => 'wide gq-bioeconomia-partilhe  other' ] ) )->toBeTrue()
		->and( PartilheForm::isPartilheForm( [ 'cssClass' => 'gq-bioeconomia-partilhe-old' ] ) )->toBeFalse()
		->and( PartilheForm::isPartilheForm( [ 'id' => 1 ] ) )->toBeFalse();
} );

test( 'the form offers one content type per post type, valued by slug and labelled by singular name', function () {
	$fields = array_column( PartilheForm::definition()['fields'], null, 'adminLabel' );
	$types  = PostTypes::definitions();

	expect( array_column( $fields['content_type']['choices'], 'value' ) )->toBe( array_keys( $types ) )
		->and( $fields['content_type']['choices'][1] )->toBe(
			[
				'text'       => $types['biblioteca']['labels']['singular_name'],
				'value'      => 'biblioteca',
				'isSelected' => false,
			]
		)
		->and( count( $fields['content_type']['choices'] ) )->toBe( 13 );
} );

test( 'the form uses plain field types, a multi-file upload of images and PDFs, consent and a honeypot', function () {
	$form  = PartilheForm::definition();
	$types = array_column( $form['fields'], 'type' );
	$media = array_column( $form['fields'], null, 'adminLabel' )['media'];

	expect( $types )->toBe( [ 'name', 'email', 'select', 'text', 'textarea', 'fileupload', 'consent' ] )
		->and( $media['multipleFiles'] )->toBeTrue()
		->and( $media['allowedExtensions'] )->toBe( 'jpg,jpeg,png,webp,gif,pdf' )
		->and( $media )->toHaveKeys( [ 'maxFiles', 'maxFileSize' ] )
		->and( $media['maxFiles'] )->toBe( PartilheForm::MAX_FILES )
		->and( $media['maxFileSize'] )->toBe( PartilheForm::MAX_FILE_SIZE )
		->and( PartilheForm::MAX_FILES * PartilheForm::MAX_FILE_SIZE * 1048576 )->toBeLessThan( 10 * 1048576 )
		->and( $form['enableHoneypot'] )->toBeTrue()
		->and( $form['cssClass'] )->toBe( PartilheForm::CSS_CLASS )
		->and( array_unique( array_column( $form['fields'], 'id' ) ) )->toHaveCount( 7 );
} );

/*
|--------------------------------------------------------------------------
| Reading an entry
|--------------------------------------------------------------------------
*/

test( 'an entry is read by admin label and sanitised', function () {
	$submission = Submission::fromEntry(
		gq_bioeconomia_partilhe_entry(
			[
				'title'   => ' <b>Guia</b>   da bioeconomia ',
				'content' => "Linha <script>alert(1)</script>um\nlinha dois\n\n<em>Fim</em>",
				'email'   => 'not an email',
			]
		),
		gq_bioeconomia_partilhe_form()
	);

	expect( $submission->post_type )->toBe( 'recursos_educativos' )
		->and( $submission->title )->toBe( 'Guia da bioeconomia' )
		->and( $submission->name )->toBe( 'Ana Silva' )
		->and( $submission->email )->toBe( '' )
		->and( $submission->content )->toBe(
			"<!-- wp:paragraph -->\n<p>Linha um<br>\nlinha dois</p>\n<!-- /wp:paragraph -->\n\n" .
			"<!-- wp:paragraph -->\n<p>Fim</p>\n<!-- /wp:paragraph -->"
		);
} );

test( 'an entry is read from field objects as Gravity Forms passes them', function () {
	$form           = gq_bioeconomia_partilhe_form();
	$form['fields'] = array_map( static fn( array $field ) => (object) $field, $form['fields'] );
	$submission     = Submission::fromEntry( gq_bioeconomia_partilhe_entry(), $form );

	expect( $submission->post_type )->toBe( 'recursos_educativos' )
		->and( $submission->name )->toBe( 'Ana Silva' )
		->and( $submission->title )->toBe( 'Guia da bioeconomia' );
} );

test( 'text that looks like markup stays text', function () {
	$submission = Submission::fromEntry( gq_bioeconomia_partilhe_entry( [ 'content' => 'a < b & c > d' ] ), gq_bioeconomia_partilhe_form() );

	expect( $submission->content )->toContain( '<p>a &lt; b &amp; c &gt; d</p>' );
} );

test( 'an entry naming anything but one of the plugin post types gives no submission', function ( string $type ) {
	expect( Submission::fromEntry( gq_bioeconomia_partilhe_entry( [ 'content_type' => $type ] ), gq_bioeconomia_partilhe_form() ) )->toBeNull();
} )->with( [ 'post', 'page', 'attachment', 'wp_block', '', 'eventos ', 'Eventos' ] );

test( 'an entry without a title gives no submission', function () {
	expect( Submission::fromEntry( gq_bioeconomia_partilhe_entry( [ 'title' => ' <b></b> ' ] ), gq_bioeconomia_partilhe_form() ) )->toBeNull();
} );

test( 'uploaded files are read from single and multi-file values', function () {
	$form = gq_bioeconomia_partilhe_form();

	expect( Submission::fromEntry( gq_bioeconomia_partilhe_entry( [ 'media' => '["https://a/1.png","https://a/2.pdf"]' ] ), $form )->file_urls )
		->toBe( [ 'https://a/1.png', 'https://a/2.pdf' ] )
		->and( Submission::fromEntry( gq_bioeconomia_partilhe_entry( [ 'media' => 'https://a/1.png' ] ), $form )->file_urls )->toBe( [ 'https://a/1.png' ] )
		->and( Submission::fromEntry( gq_bioeconomia_partilhe_entry(), $form )->file_urls )->toBe( [] );
} );

/*
|--------------------------------------------------------------------------
| Creating the pending post
|--------------------------------------------------------------------------
*/

test( 'the handler is hooked to every form submission', function () {
	$hooks = array_filter( $GLOBALS['gq_bioeconomia_test_state']['actions'], static fn( $action ) => 'gform_after_submission' === $action['hook'] );

	expect( array_values( $hooks )[0]['callback'][1] ?? null )->toBe( 'handle' )
		->and( array_values( $hooks )[0]['accepted_args'] )->toBe( 2 );
} );

test( 'a submission becomes a pending post with no author, its submitter in private meta', function () {
	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry(), gq_bioeconomia_partilhe_form() );

	$posts = $GLOBALS['gq_bioeconomia_submissions']['posts'];
	$post  = reset( $posts );

	expect( $posts )->toHaveCount( 1 )
		->and( $post['post_type'] )->toBe( 'recursos_educativos' )
		->and( $post['post_status'] )->toBe( 'pending' )
		->and( $post['post_author'] )->toBe( 0 )
		->and( $post['post_title'] )->toBe( 'Guia da bioeconomia' )
		->and( $post['post_content'] )->toContain( '<p>Segundo &amp; último.</p>' )
		->and( $post['meta_input'] )->toBe(
			[
				Submissions::META_ENTRY_ID        => 31,
				Submissions::META_FORM_ID         => 7,
				Submissions::META_SUBMITTER_NAME  => 'Ana Silva',
				Submissions::META_SUBMITTER_EMAIL => 'ana@example.org',
			]
		)
		->and( array_filter( array_keys( $post['meta_input'] ), static fn( $key ) => ! str_starts_with( $key, '_' ) ) )->toBe( [] )
		->and( $GLOBALS['gq_bioeconomia_submissions']['entry_meta'][31][ Submissions::ENTRY_META_POST_ID ] )->toBe( key( $posts ) )
		->and( $GLOBALS['gq_bioeconomia_submissions']['notes'][0]['note'] )->toContain( '<a href="https://cms.example/wp/wp-admin/post.php?post=' . key( $posts ) . '&action=edit">Guia da bioeconomia</a>' );
} );

test( 'other forms, spam and already handled entries create nothing', function () {
	$handler = new Submissions();
	$handler->handle( gq_bioeconomia_partilhe_entry(), [ 'id' => 1, 'cssClass' => 'contact', 'fields' => [] ] );
	$handler->handle( array_replace( gq_bioeconomia_partilhe_entry(), [ 'status' => 'spam' ] ), gq_bioeconomia_partilhe_form() );
	$GLOBALS['gq_bioeconomia_submissions']['entry_meta'][31][ Submissions::ENTRY_META_POST_ID ] = 12;
	$handler->handle( gq_bioeconomia_partilhe_entry(), gq_bioeconomia_partilhe_form() );

	expect( $GLOBALS['gq_bioeconomia_submissions']['posts'] )->toBe( [] );
} );

test( 'an invalid content type creates nothing and notes why on the entry', function () {
	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry( [ 'content_type' => 'page' ] ), gq_bioeconomia_partilhe_form() );

	expect( $GLOBALS['gq_bioeconomia_submissions']['posts'] )->toBe( [] )
		->and( $GLOBALS['gq_bioeconomia_submissions']['errors'] )->toHaveCount( 1 )
		->and( $GLOBALS['gq_bioeconomia_submissions']['notes'][0]['entry_id'] )->toBe( 31 );
} );

test( 'a failed insert is logged and noted, and the submission goes on', function () {
	$GLOBALS['gq_bioeconomia_submissions']['insert_result'] = new WP_Error( 'db', 'Database down' );

	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry(), gq_bioeconomia_partilhe_form() );

	expect( $GLOBALS['gq_bioeconomia_submissions']['errors'][0] )->toContain( 'Database down' )
		->and( $GLOBALS['gq_bioeconomia_submissions']['notes'][0]['note_type'] )->toBe( 'gq-bioeconomia' )
		->and( $GLOBALS['gq_bioeconomia_submissions']['entry_meta'] )->toBe( [] );
} );

/*
|--------------------------------------------------------------------------
| Media
|--------------------------------------------------------------------------
*/

test( 'uploaded images and PDFs are attached, the first image as featured image', function () {
	$urls = [ gq_bioeconomia_upload( 'guia.pdf', 'pdf' ), gq_bioeconomia_upload( 'capa.png', 'png' ), gq_bioeconomia_upload( 'b.jpg', 'jpg' ) ];

	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry( [ 'media' => json_encode( $urls ) ] ), gq_bioeconomia_partilhe_form() );

	$state   = $GLOBALS['gq_bioeconomia_submissions'];
	$post_id = array_key_first( $state['posts'] );

	expect( array_column( $state['attachments'], 'name' ) )->toBe( [ 'guia.pdf', 'capa.png', 'b.jpg' ] )
		->and( array_column( $state['attachments'], 'contents' ) )->toBe( [ 'pdf', 'png', 'jpg' ] )
		->and( array_unique( array_column( $state['attachments'], 'parent' ) ) )->toBe( [ $post_id ] )
		->and( $state['attachments'][900]['post_data'] )->toBe( [ 'post_author' => 0 ] )
		->and( $state['thumbnails'] )->toBe( [ $post_id => 901 ] );
} );

test( 'no featured image is set on a type without thumbnails', function () {
	$url = gq_bioeconomia_upload( 'capa.png' );

	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry( [ 'content_type' => 'glossario', 'media' => $url ] ), gq_bioeconomia_partilhe_form() );

	expect( $GLOBALS['gq_bioeconomia_submissions']['attachments'] )->toHaveCount( 1 )
		->and( $GLOBALS['gq_bioeconomia_submissions']['thumbnails'] )->toBe( [] );
} );

test( 'files outside the form uploads, or not really images or PDFs, are skipped and logged', function () {
	$GLOBALS['gq_bioeconomia_submissions']['filetypes']['fake.png'] = 'image/svg+xml';
	$urls = [
		'https://elsewhere.example/app/uploads/gravity_forms/x.png',
		$GLOBALS['gq_bioeconomia_submissions']['upload_url_root'] . '../../wp-config.php',
		gq_bioeconomia_upload( 'fake.png' ),
		gq_bioeconomia_upload( 'missing.png' ),
		gq_bioeconomia_upload( 'ok.webp' ),
	];
	unlink( $GLOBALS['gq_bioeconomia_submissions']['upload_root'] . 'missing.png' );

	( new Submissions() )->handle( gq_bioeconomia_partilhe_entry( [ 'media' => json_encode( $urls ) ] ), gq_bioeconomia_partilhe_form() );

	expect( array_column( $GLOBALS['gq_bioeconomia_submissions']['attachments'], 'name' ) )->toBe( [ 'ok.webp' ] )
		->and( $GLOBALS['gq_bioeconomia_submissions']['errors'] )->toHaveCount( 4 )
		->and( $GLOBALS['gq_bioeconomia_submissions']['posts'] )->toHaveCount( 1 );
} );

/*
|--------------------------------------------------------------------------
| Reviewing
|--------------------------------------------------------------------------
*/

test( 'submitted content is marked in the lists and shows its submitter and entry when edited', function () {
	$GLOBALS['gq_bioeconomia_test_state']['post_meta'][77] = [
		Submissions::META_ENTRY_ID        => 31,
		Submissions::META_FORM_ID         => 7,
		Submissions::META_SUBMITTER_NAME  => 'Ana <Silva>',
		Submissions::META_SUBMITTER_EMAIL => 'ana@example.org',
	];
	$submitted = new WP_Post( [ 'ID' => 77 ] );
	$other     = new WP_Post( [ 'ID' => 78 ] );
	$handler   = new Submissions();

	$handler->registerMetaBox( 'eventos', $other );
	$handler->registerMetaBox( 'page', $submitted );
	$handler->registerMetaBox( 'eventos', $submitted );
	ob_start();
	$handler->renderMetaBox( $submitted );
	$html = ob_get_clean();

	expect( array_keys( $GLOBALS['gq_bioeconomia_submissions']['meta_boxes'] ?? [] ) )->toBe( [ 'gq-bioeconomia-submission' ] )
		->and( $html )->toContain( 'Ana &lt;Silva&gt;' )
		->and( $html )->toContain( 'mailto:ana@example.org' )
		->and( $html )->toContain( 'admin.php?page=gf_entries&view=entry&id=7&lid=31' )
		->and( $handler->postStates( [], $submitted ) )->toHaveKey( 'gq-bioeconomia-submission' )
		->and( $handler->postStates( [], $other ) )->toBe( [] );
	unset( $GLOBALS['gq_bioeconomia_test_state']['post_meta'][77] );
} );
