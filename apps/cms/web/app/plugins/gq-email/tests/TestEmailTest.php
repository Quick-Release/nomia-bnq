<?php

declare(strict_types=1);

use GetQuick\Email\Testing\TestController;
use GetQuick\Email\Testing\TestEmail;
use GetQuick\Email\Testing\TestFailed;
use GetQuick\Email\Settings;

/*
|--------------------------------------------------------------------------
| The test message: `wp gq-email test` and `POST gq-email/v1/test`
|--------------------------------------------------------------------------
|
| wp_mail() is stubbed the way WordPress runs it, so a test message goes
| through the real transport and the stubbed wp_remote_post().
*/

function gq_email_ready_for_test(): void {
	$GLOBALS['gq_email_test_state']['options'] = [
		'enabled'      => true,
		'account_id'   => '0123456789abcdef0123456789abcdef',
		'from_address' => 'notifications@example.com',
	];
	putenv( Settings::TOKEN_NAME . '=cf-token' );
	$GLOBALS['gq_email_test_state']['response'] = [
		'response' => [ 'code' => 200 ],
		'body'     => json_encode(
			[
				'success' => true,
				'result'  => [ 'message_id' => '<id@example.com>', 'queued' => [ 'someone@example.org' ] ],
			]
		),
	];
}

function gq_email_post_test( array $params ): WP_REST_Response|WP_Error {
	$route = $GLOBALS['gq_email_test_state']['routes']['gq-email/v1/test'];

	return call_user_func( $route['callback'], new WP_REST_Request( $params ) );
}

beforeEach( function () {
	$GLOBALS['phpmailer']                       = null;
	$GLOBALS['gq_email_test_state']['requests'] = [];
	$GLOBALS['gq_email_test_state']['can']      = true;
	gq_email_ready_for_test();
} );

afterEach( function () {
	putenv( Settings::TOKEN_NAME );
	$GLOBALS['gq_email_test_state']['options'] = [];
} );

test( 'a test message goes through Cloudflare and reports what it did', function () {
	$result = ( new TestEmail( new Settings() ) )->send( ' someone@example.org ' );
	$mime   = json_decode( end( $GLOBALS['gq_email_test_state']['requests'] )['args']['body'], true )['mime_message'];

	expect( $result->queued )->toBe( [ 'someone@example.org' ] )
		->and( $mime )->toContain( 'Subject: [Nomia] Cloudflare Email Service test' )
		->and( TestEmail::describe( $result ) )->toBe( [ 'Message-ID: <id@example.com>', 'Queued: someone@example.org' ] )
		->and( TestEmail::verdict( $result, 'someone@example.org' ) )->toBe( 'Cloudflare accepted the message for someone@example.org.' );
} );

test( 'a test message fails with a reason', function ( Closure $arrange, string $reason ) {
	$arrange();
	// Pest points error_log at its own capture per test; the transport logs the refusal.
	$log = ini_set( 'error_log', '/dev/null' );

	expect( fn () => ( new TestEmail( new Settings() ) )->send( 'someone@example.org' ) )->toThrow( TestFailed::class, $reason );

	ini_set( 'error_log', (string) $log );
} )->with( [
	'setup incomplete' => [ fn () => putenv( Settings::TOKEN_NAME ), 'Cloudflare is not sending yet: The CMS environment has no GQ_EMAIL_CLOUDFLARE_API_TOKEN.' ],
	'refused'          => [
		fn () => $GLOBALS['gq_email_test_state']['response'] = [
			'response' => [ 'code' => 403 ],
			'body'     => json_encode( [ 'success' => false, 'errors' => [ [ 'code' => 10102, 'message' => 'forbidden' ] ] ] ),
		],
		'Cloudflare did not accept the message: Cloudflare Email Sending refused the message (HTTP 403): 10102 forbidden',
	],
] );

test( 'an invalid recipient sends nothing', function () {
	expect( fn () => ( new TestEmail( new Settings() ) )->send( 'nope' ) )->toThrow( TestFailed::class, 'Enter a valid recipient address.' )
		->and( $GLOBALS['gq_email_test_state']['requests'] )->toBe( [] );
} );

test( 'the REST route is POST gq-email/v1/test, for people who manage options', function () {
	$route = $GLOBALS['gq_email_test_state']['routes']['gq-email/v1/test'] ?? null;

	expect( $route['methods'] )->toBe( 'POST' )
		->and( $route['args']['to'] )->toMatchArray( [ 'type' => 'string', 'format' => 'email', 'required' => true ] )
		->and( TestController::CAPABILITY )->toBe( 'manage_options' )
		->and( $route['permission_callback']() )->toBeTrue();

	$GLOBALS['gq_email_test_state']['can'] = false;

	expect( $route['permission_callback']() )->toBeFalse();
} );

test( 'the REST route answers with a message and details', function () {
	$response = gq_email_post_test( [ 'to' => 'someone@example.org' ] );

	expect( $response )->toBeInstanceOf( WP_REST_Response::class )
		->and( $response->get_data() )->toBe(
			[
				'message' => 'Cloudflare accepted the message for someone@example.org.',
				'details' => [ 'Message-ID: <id@example.com>', 'Queued: someone@example.org' ],
			]
		);
} );

test( 'the REST route answers a failure with a 400 error', function () {
	putenv( Settings::TOKEN_NAME );
	$response = gq_email_post_test( [ 'to' => 'someone@example.org' ] );

	expect( $response )->toBeInstanceOf( WP_Error::class )
		->and( $response->code )->toBe( 'gq_email_test_failed' )
		->and( $response->data )->toBe( [ 'status' => 400 ] )
		->and( $response->get_error_message() )->toStartWith( 'Cloudflare is not sending yet:' );
} );

test( 'the Test column is an action calling the route, with the current user as recipient', function () {
	$field = gq_email_run_hook( 'filters', 'getquick_config_settings_areas', [] )['email']['fields']['send_test'];

	expect( $field['control'] )->toBe( 'action' )
		->and( $field['column'] )->toBe( 'test' )
		->and( $field )->not->toHaveKeys( [ 'type', 'default' ] )
		->and( $field['action']['path'] )->toBe( 'gq-email/v1/test' )
		->and( $field['action']['method'] )->toBe( 'POST' )
		->and( $field['action']['input'] )->toMatchArray( [ 'name' => 'to', 'type' => 'email' ] )
		->and( $field['action']['input']['default']() )->toBe( 'admin@example.com' );
} );

test( 'the Test column needs GQ Config 0.5.0', function () {
	expect( Settings::supportsActionControl( '0.4.3' ) )->toBeFalse()
		->and( Settings::supportsActionControl( '0.5.0' ) )->toBeTrue()
		->and( Settings::supportsActionControl( '0.6.1' ) )->toBeTrue();
} );
