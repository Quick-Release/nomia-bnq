<?php
/**
 * Gallery publication fields.
 *
 * @package GetQuick\Bioeconomia
 */

test( 'gallery GraphQL fields expose an ordered media list and empty albums safely', function () {
	$GLOBALS['gq_bioeconomia_test_state']['post_meta'][987654] = [ 'gq_bioeconomia_gallery_image_ids' => [] ];
	$fields = $GLOBALS['gq_bioeconomia_test_state']['registered_graphql_fields']['Galeria'];
	$field  = $fields['gqBioeconomiaGalleryImages'];
	expect( $field['type'] )->toBe( [ 'list_of' => 'GqBioeconomiaGalleryImage' ] )
		->and( $field['resolve']( (object) [ 'ID' => 987654 ] ) )->toBe( [] );
	unset( $GLOBALS['gq_bioeconomia_test_state']['post_meta'][987654] );
} );
