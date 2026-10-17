<?php
/**
 * Plugin Name: GQ Hotfix: Silence low-severity PHP logging
 * Description: Stops E_WARNING/E_NOTICE/E_DEPRECATED from reaching PHP-FPM stderr so the FastCGI stderr stream ("PHP message: PHP Warning ...") cannot overflow nginx's FastCGI header buffer and turn block-heavy /wp/graphql responses into instant 502s ("upstream sent too big header"). Errors and fatals are unaffected. Temporary hotfix pending a proper fix for wpgraphql-blocks' unchecked array access.
 */
if ( PHP_SAPI !== 'cli' && PHP_SAPI !== 'cli-server' ) {
	error_reporting(
		E_ALL & ~(
			E_WARNING | E_CORE_WARNING | E_COMPILE_WARNING |
			E_NOTICE | E_USER_NOTICE |
			E_DEPRECATED | E_USER_DEPRECATED |
			E_STRICT
		)
	);
}