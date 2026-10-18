<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Translation catalogs
|--------------------------------------------------------------------------
|
| Source strings are Portuguese; `languages/` carries the catalogs that
| translate them. `pnpm wp-plugin:i18n` regenerates those files through WP-CLI,
| which needs DDEV — these tests need neither. They read the catalogs as files
| and check the two things that silently rot: a block whose Portuguese name
| never reached the English catalog, and a PO file edited without recompiling.
|
| The block titles come from the generated `includes/contracts.php`, so the
| suite runs after `structured-blocks:materialize-plugin` like every other
| contract test.
*/

/**
 * Absolute path to a file in the plugin's languages directory.
 */
function nomia_blocks_language_path( string $file ): string {
	return __DIR__ . '/../languages/' . $file;
}

/**
 * Parse a PO/POT catalog into a key => msgstr map.
 *
 * Keys follow gettext, and the compiled `.l10n.php` catalog: a plain msgid, or
 * `msgctxt` + "\x04" + msgid for a contextual entry — which is how WordPress
 * extracts `block.json` titles ("block title"), descriptions, and keywords.
 *
 * Deliberately small: the catalogs this plugin ships are single-line entries
 * without plurals, and a full parser would be more code to trust than the
 * thing it checks.
 *
 * @return array<string, string> Translations, keyed by (context-qualified) source string.
 */
function nomia_blocks_parse_po( string $path ): array {
	$entries = array();
	$context = null;
	$msgid   = null;

	foreach ( file( $path, FILE_IGNORE_NEW_LINES ) as $line ) {
		if ( 1 === preg_match( '/^msgctxt "(.*)"$/', $line, $matches ) ) {
			$context = stripcslashes( $matches[1] );
			continue;
		}

		if ( 1 === preg_match( '/^msgid "(.*)"$/', $line, $matches ) ) {
			$msgid = stripcslashes( $matches[1] );
			continue;
		}

		if ( null !== $msgid && 1 === preg_match( '/^msgstr "(.*)"$/', $line, $matches ) ) {
			if ( '' !== $msgid ) {
				$entries[ nomia_blocks_catalog_key( $msgid, $context ) ] = stripcslashes( $matches[1] );
			}
			$context = null;
			$msgid   = null;
		}
	}

	return $entries;
}

/**
 * The catalog key for a source string, qualified by its gettext context.
 */
function nomia_blocks_catalog_key( string $msgid, ?string $context = null ): string {
	return null === $context ? $msgid : $context . "\x04" . $msgid;
}

/**
 * Every Portuguese source string the blocks register.
 *
 * @return array<string, string> Source strings, keyed by the block they describe.
 */
function nomia_blocks_registered_strings(): array {
	$strings = array();

	foreach ( getquick_nomia_blocks_contracts() as $contract ) {
		$block = (string) $contract['blockName'];

		$strings[ $block . ' title' ] = (string) $contract['title'];

		if ( '' !== (string) ( $contract['description'] ?? '' ) ) {
			$strings[ $block . ' description' ] = (string) $contract['description'];
		}
	}

	return $strings;
}

/**
 * Source strings that stay as they are in English: proper nouns, mostly.
 *
 * @return array<int, string> Strings an English catalog is not expected to carry.
 */
function nomia_blocks_untranslated_by_design(): array {
	return array( 'PAEC 2030' );
}

test( 'bootstrap loads the plugin textdomain from its own languages directory', function () {
	expect( $GLOBALS['nomia_blocks_test_state']['loaded_textdomains'] )
		->toHaveKey( 'getquick-nomia-blocks' )
		->and( $GLOBALS['nomia_blocks_test_state']['loaded_textdomains']['getquick-nomia-blocks'] )
		->toEndWith( '/languages' );
} );

test( 'the editor bundle is wired to the JSON catalogs', function () {
	$translations = $GLOBALS['nomia_blocks_test_state']['script_translations'];

	expect( $translations )->toHaveKey( GETQUICK_NOMIA_BLOCKS_HANDLE );
	expect( $translations[ GETQUICK_NOMIA_BLOCKS_HANDLE ]['domain'] )->toBe( 'getquick-nomia-blocks' );
	expect( $translations[ GETQUICK_NOMIA_BLOCKS_HANDLE ]['path'] )->toEndWith( 'languages' );
} );

test( 'the English catalog translates every block title and description', function () {
	$catalog = nomia_blocks_parse_po( nomia_blocks_language_path( 'getquick-nomia-blocks-en_US.po' ) );
	$exempt  = nomia_blocks_untranslated_by_design();
	$missing = array();

	foreach ( nomia_blocks_registered_strings() as $label => $source ) {
		if ( in_array( $source, $exempt, true ) ) {
			continue;
		}

		// `block.json` metadata is extracted under WordPress's fixed contexts.
		$context = str_ends_with( $label, ' title' ) ? 'block title' : 'block description';
		if ( '' === ( $catalog[ nomia_blocks_catalog_key( $source, $context ) ] ?? '' ) ) {
			$missing[ $label ] = $source;
		}
	}

	// Anything listed here is a block whose Portuguese name never reached the
	// English catalog: run `pnpm wp-plugin:i18n` and translate the new entries.
	expect( $missing )->toBe( array() );
} );

test( 'the compiled catalogs carry the same translations as the PO file', function () {
	$catalog  = nomia_blocks_parse_po( nomia_blocks_language_path( 'getquick-nomia-blocks-en_US.po' ) );
	$compiled = require nomia_blocks_language_path( 'getquick-nomia-blocks-en_US.l10n.php' );

	$translated = array_filter( $catalog, static fn( string $value ): bool => '' !== $value );

	expect( $compiled['messages'] )->toBe( $translated );
} );

test( 'the English catalog renames the static page hero', function () {
	$catalog = nomia_blocks_parse_po( nomia_blocks_language_path( 'getquick-nomia-blocks-en_US.po' ) );

	$title = nomia_blocks_catalog_key( 'Cabeçalho página com imagem', 'block title' );

	expect( $catalog )->toHaveKey( $title );
	expect( $catalog[ $title ] )->toBe( 'Page hero with image' );
} );
