<?php
/**
 * Biblioteca's public fields and legacy publisher storage.
 *
 * @package GetQuick\Bioeconomia
 */

use GetQuick\Bioeconomia\Details\LibraryDetails;

test( 'GraphQL exposes publisher and both document destinations independently', function () {
		$GLOBALS['gq_bioeconomia_test_state']['post_meta'][42] = [
		'gq_bioeconomia_library_year'     => '2018',
		'gq_bioeconomia_library_author'   => 'Comissão Europeia',
		'gq_bioeconomia_library_file_url' => 'https://example.org/plastics.pdf',
		'gq_bioeconomia_library_page_url' => 'https://example.org/plastics/',
	];
	$fields = $GLOBALS['gq_bioeconomia_test_state']['registered_graphql_fields']['Biblioteca'];
	$post   = (object) [ 'ID' => 42 ];

	expect( $fields['gqBioeconomiaLibraryPublisher']['resolve']( $post ) )->toBe( 'Comissão Europeia' )
		->and( $fields['gqBioeconomiaLibraryAuthor']['resolve']( $post ) )->toBe( 'Comissão Europeia' )
		->and( $fields['gqBioeconomiaLibraryYear']['resolve']( $post ) )->toBe( 2018 )
		->and( $fields['gqBioeconomiaLibraryFileUrl']['resolve']( $post ) )->toBe( 'https://example.org/plastics.pdf' )
		->and( $fields['gqBioeconomiaLibraryPageUrl']['resolve']( $post ) )->toBe( 'https://example.org/plastics/' )
		->and( $fields['gqBioeconomiaLibraryPageUrl']['resolve']( (object) [ 'ID' => 43 ] ) )->toBeNull();
	unset( $GLOBALS['gq_bioeconomia_test_state']['post_meta'][42] );
} );

test( 'a document year must be a whole four-digit year within the picker range', function () {
	expect( LibraryDetails::sanitizeYear( '2018' ) )->toBe( 2018 )
		->and( LibraryDetails::sanitizeYear( 2018 ) )->toBe( 2018 )
		->and( LibraryDetails::sanitizeYear( '' ) )->toBe( 0 )
		->and( LibraryDetails::sanitizeYear( '2018.5' ) )->toBe( 0 )
		->and( LibraryDetails::sanitizeYear( '2018e0' ) )->toBe( 0 )
		->and( LibraryDetails::sanitizeYear( [] ) )->toBe( 0 )
		->and( LibraryDetails::sanitizeYear( (int) gmdate( 'Y' ) + 2 ) )->toBe( 0 );
} );
