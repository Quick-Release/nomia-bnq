<?php

declare(strict_types=1);

use GetQuick\Email\Cloudflare\EmailSendingApi;
use GetQuick\Email\Cloudflare\SendFailed;
use GetQuick\Email\CloudflareMailer;
use GetQuick\Email\CloudflareTransport;
use GetQuick\Email\Settings;
use PHPMailer\PHPMailer\Exception as MailerException;

/*
|--------------------------------------------------------------------------
| GETQUICK → Options → Email, and the Cloudflare transport
|--------------------------------------------------------------------------
|
| The bootstrap booted the plugin. Each test sets the Email area's saved
| values, the token and Cloudflare's response, then sends a message the way
| wp_mail() does: `pre_wp_mail`, its global mailer filled and reset to mail(),
| `phpmailer_init`, send().
*/

const GQ_EMAIL_ACCOUNT = '0123456789abcdef0123456789abcdef';

const GQ_EMAIL_READY = [
	'enabled'      => true,
	'account_id'   => GQ_EMAIL_ACCOUNT,
	'from_address' => 'no-reply@example.com',
];

function gq_email_setup( array $options, string $token = 'cf-token' ): void {
	$GLOBALS['gq_email_test_state']['options'] = $options;
	putenv( Settings::TOKEN_NAME . ( '' === $token ? '' : '=' . $token ) );
}

function gq_email_cloudflare_responds( int $status, array $body ): void {
	$GLOBALS['gq_email_test_state']['response'] = [
		'response' => [ 'code' => $status ],
		'body'     => json_encode( $body ),
	];
}

function gq_email_accepted( array $result = [] ): void {
	gq_email_cloudflare_responds(
		200,
		[
			'success' => true,
			'errors'  => [],
			'result'  => $result + [
				'message_id' => '<abc@example.com>',
				'delivered'  => [ 'someone@example.org' ],
			],
		]
	);
}

/**
 * Prepares a message as wp_mail() would, returning the mailer it uses.
 *
 * @param callable|null $fill Adds to the message before `phpmailer_init`.
 */
function gq_email_wp_mail( ?callable $fill = null, string $from = 'wordpress@cms.example.com', string $name = 'WordPress' ): PHPMailer\PHPMailer\PHPMailer {
	global $phpmailer;

	gq_email_run_hook( 'filters', 'pre_wp_mail', null, [] );

	if ( ! $phpmailer instanceof PHPMailer\PHPMailer\PHPMailer ) {
		$phpmailer = new WP_PHPMailer( true );
	}

	$phpmailer->clearAllRecipients();
	$phpmailer->clearReplyTos();
	$phpmailer->clearAttachments();
	$phpmailer->clearCustomHeaders();
	$phpmailer->Sender = '';
	$phpmailer->setFrom( $from, $name, false );
	$phpmailer->addAddress( 'someone@example.org' );
	$phpmailer->Subject = 'Hello';
	$phpmailer->Body    = 'Hi there.';
	$phpmailer->isMail();

	if ( null !== $fill ) {
		$fill( $phpmailer );
	}

	gq_email_run_hook( 'actions', 'phpmailer_init', $phpmailer );

	return $phpmailer;
}

function gq_email_request(): array {
	$request = end( $GLOBALS['gq_email_test_state']['requests'] );

	return $request + [ 'payload' => json_decode( $request['args']['body'], true ) ];
}

beforeEach( function () {
	$GLOBALS['phpmailer']                       = null;
	$GLOBALS['gq_email_test_state']['requests'] = [];
	gq_email_accepted();
} );

afterEach( function () {
	putenv( Settings::TOKEN_NAME );
	$GLOBALS['gq_email_test_state']['options'] = [];
} );

/*
| The Email tab.
*/

test( 'the plugin adds an Email tab to the GETQUICK options page', function () {
	$areas = gq_email_run_hook( 'filters', 'getquick_config_settings_areas', [ 'wp' => [ 'label' => 'WordPress' ] ] );

	expect( $areas )->toHaveKeys( [ 'wp', 'email' ] )
		->and( $areas['email']['label'] )->toBe( 'Email' )
		->and( array_keys( $areas['email']['fields'] ) )->toBe( [ 'enabled', 'account_id', 'from_address', 'from_name', 'reply_to' ] )
		->and( $areas['email']['fields']['enabled']['default'] )->toBeFalse()
		->and( $areas['email']['fields']['account_id']['override'] )->toBe( Settings::ACCOUNT_ID_NAME )
		->and( $areas['email']['fields']['from_address']['visible_when'] )->toBe( [ 'key' => 'enabled', 'value' => true ] );
} );

test( 'the API token is never a saved field', function () {
	$fields = gq_email_run_hook( 'filters', 'getquick_config_settings_areas', [] )['email']['fields'];

	expect( array_filter( array_keys( $fields ), static fn( string $key ): bool => str_contains( $key, 'token' ) ) )->toBe( [] );
} );

test( 'the toggle help says whether the environment has the token', function () {
	putenv( Settings::TOKEN_NAME );
	$missing = gq_email_run_hook( 'filters', 'getquick_config_settings_areas', [] )['email']['fields']['enabled']['help'];
	putenv( Settings::TOKEN_NAME . '=cf-token' );
	$set = gq_email_run_hook( 'filters', 'getquick_config_settings_areas', [] )['email']['fields']['enabled']['help'];

	expect( $missing )->toContain( 'The API token is missing' )->toContain( Settings::TOKEN_NAME )
		->and( $set )->toContain( 'The API token is set by ' . Settings::TOKEN_NAME )->not->toContain( 'cf-token' );
} );

test( 'address fields accept an empty value or an email address', function () {
	expect( Settings::validateEmail( '' ) )->toBeTrue()
		->and( Settings::validateEmail( ' no-reply@example.com ' ) )->toBeTrue()
		->and( Settings::validateEmail( 'not an address' ) )->toBeInstanceOf( WP_Error::class );
} );

test( 'the account ID field accepts an empty value or 32 hex characters', function () {
	expect( Settings::validateAccountId( '' ) )->toBeTrue()
		->and( Settings::validateAccountId( strtoupper( GQ_EMAIL_ACCOUNT ) ) )->toBeTrue()
		->and( Settings::validateAccountId( 'nomia' ) )->toBeInstanceOf( WP_Error::class );
} );

test( 'the token comes from the environment, trimmed', function () {
	expect( ( new Settings() )->apiToken() )->toBe( '' );

	putenv( Settings::TOKEN_NAME . '= cf-token ' );

	expect( ( new Settings() )->apiToken() )->toBe( 'cf-token' );
} );

/*
| Sending.
*/

test( 'a complete Email tab sends through Email Sending\'s send_raw endpoint', function () {
	gq_email_setup( GQ_EMAIL_READY );
	$mailer = gq_email_wp_mail();

	expect( $mailer )->toBeInstanceOf( CloudflareMailer::class )
		->and( $mailer->Mailer )->toBe( 'cloudflare' )
		->and( $mailer->send() )->toBeTrue();

	$request = gq_email_request();

	expect( $request['url'] )->toBe( 'https://api.cloudflare.com/client/v4/accounts/' . GQ_EMAIL_ACCOUNT . '/email/sending/send_raw' )
		->and( $request['args']['headers'] )->toBe( [ 'Authorization' => 'Bearer cf-token', 'Content-Type' => 'application/json' ] )
		->and( $request['args']['timeout'] )->toBe( 30 )
		->and( $request['payload']['from'] )->toBe( 'no-reply@example.com' )
		->and( $request['payload']['recipients'] )->toBe( [ 'someone@example.org' ] )
		->and( $request['payload']['mime_message'] )->toContain( 'From: Nomia <no-reply@example.com>' )
		->toContain( 'To: someone@example.org' )
		->toContain( 'Subject: Hello' )
		->toContain( 'Hi there.' )
		->and( $mailer->lastResult()?->message_id )->toBe( '<abc@example.com>' );
} );

test( 'Cc and Bcc recipients are in the envelope, and Bcc stays out of the headers', function () {
	gq_email_setup( GQ_EMAIL_READY );
	$mailer = gq_email_wp_mail(
		static function ( $mailer ): void {
			$mailer->addCC( 'copy@example.org' );
			$mailer->addBCC( 'hidden@example.org' );
		}
	);
	$mailer->send();
	$request = gq_email_request();

	expect( $request['payload']['recipients'] )->toBe( [ 'someone@example.org', 'copy@example.org', 'hidden@example.org' ] )
		->and( $request['payload']['mime_message'] )->toContain( 'Cc: copy@example.org' )
		->not->toContain( 'hidden@example.org' );
} );

test( 'attachments are sent in the MIME message', function () {
	gq_email_setup( GQ_EMAIL_READY );
	$mailer = gq_email_wp_mail(
		static function ( $mailer ): void {
			$mailer->addStringAttachment( 'invoice body', 'invoice.txt' );
		}
	);
	$mailer->send();

	expect( gq_email_request()['payload']['mime_message'] )->toContain( 'multipart/mixed' )
		->toContain( 'invoice.txt' )
		->toContain( base64_encode( 'invoice body' ) );
} );

test( 'WordPress keeps its own transport until the tab is complete', function ( array $options, string $token ) {
	gq_email_setup( $options, $token );
	$mailer = gq_email_wp_mail();

	expect( $mailer )->not->toBeInstanceOf( CloudflareMailer::class )
		->and( $mailer->Mailer )->toBe( 'mail' )
		->and( $mailer->From )->toBe( 'wordpress@cms.example.com' );
} )->with( [
	'turned off'         => [ [ 'enabled' => false ] + GQ_EMAIL_READY, 'cf-token' ],
	'no token'           => [ GQ_EMAIL_READY, '' ],
	'no account ID'      => [ [ 'account_id' => '' ] + GQ_EMAIL_READY, 'cf-token' ],
	'invalid account ID' => [ [ 'account_id' => 'nomia' ] + GQ_EMAIL_READY, 'cf-token' ],
	'no From address'    => [ [ 'from_address' => '' ] + GQ_EMAIL_READY, 'cf-token' ],
	'invalid From'       => [ [ 'from_address' => 'nope' ] + GQ_EMAIL_READY, 'cf-token' ],
] );

test( 'a Cloudflare mailer left from an earlier message uses mail() once the tab is incomplete', function () {
	gq_email_setup( GQ_EMAIL_READY );
	gq_email_wp_mail();
	gq_email_setup( [ 'enabled' => false ] + GQ_EMAIL_READY );
	$mailer = gq_email_wp_mail();

	expect( $mailer )->toBeInstanceOf( CloudflareMailer::class )
		->and( $mailer->Mailer )->toBe( 'mail' );
} );

test( 'another pre_wp_mail short-circuit is passed through untouched', function () {
	gq_email_setup( GQ_EMAIL_READY );

	expect( gq_email_run_hook( 'filters', 'pre_wp_mail', false, [] ) )->toBeFalse()
		->and( $GLOBALS['phpmailer'] )->toBeNull();
} );

/*
| Failures. wp_mail() turns a PHPMailer exception into `wp_mail_failed`.
*/

test( 'Cloudflare\'s errors fail the message with their codes', function () {
	gq_email_setup( GQ_EMAIL_READY );
	gq_email_cloudflare_responds(
		403,
		[
			'success' => false,
			'errors'  => [ [ 'code' => 10102, 'message' => 'email.sending.error.authentication.forbidden' ] ],
			'result'  => null,
		]
	);

	expect( fn () => gq_email_wp_mail()->send() )->toThrow(
		MailerException::class,
		'Cloudflare Email Sending refused the message (HTTP 403): 10102 email.sending.error.authentication.forbidden'
	);
} );

test( 'an unreachable API fails the message', function () {
	gq_email_setup( GQ_EMAIL_READY );
	$GLOBALS['gq_email_test_state']['response'] = new WP_Error( 'http_request_failed', 'cURL error 28: timed out' );

	expect( fn () => gq_email_wp_mail()->send() )->toThrow( MailerException::class, 'Cloudflare Email Sending could not be reached: cURL error 28: timed out' );
} );

test( 'a message no recipient will get fails', function () {
	gq_email_setup( GQ_EMAIL_READY );
	gq_email_accepted( [ 'delivered' => [], 'suppressed_recipients' => [ 'someone@example.org' ] ] );

	expect( fn () => gq_email_wp_mail()->send() )->toThrow(
		MailerException::class,
		'Cloudflare Email Sending delivered the message to no one (bounced: none; suppressed: someone@example.org).'
	);
} );

test( 'a message some recipients will get is sent, with what Cloudflare did', function () {
	gq_email_setup( GQ_EMAIL_READY );
	gq_email_accepted( [ 'queued' => [ 'copy@example.org' ], 'permanent_bounces' => [ 'gone@example.org' ] ] );
	$mailer = gq_email_wp_mail();
	$log    = ini_set( 'error_log', '/dev/null' );

	expect( $mailer->send() )->toBeTrue()
		->and( $mailer->lastResult()->queued )->toBe( [ 'copy@example.org' ] )
		->and( $mailer->lastResult()->bounced )->toBe( [ 'gone@example.org' ] )
		->and( $mailer->lastResult()->lostSome() )->toBeTrue();

	ini_set( 'error_log', (string) $log );
} );

test( 'the API never puts the token in its errors', function () {
	$GLOBALS['gq_email_test_state']['response'] = new WP_Error( 'http_request_failed', 'down' );

	expect( fn () => ( new EmailSendingApi( GQ_EMAIL_ACCOUNT, 'cf-secret-token' ) )->sendRaw( 'a@example.com', [ 'b@example.com' ], 'x' ) )
		->toThrow( fn ( SendFailed $failure ) => expect( $failure->getMessage() )->not->toContain( 'cf-secret-token' ) );
} );

/*
| The sender.
*/

test( 'the From name defaults to the site title over WordPress\'s', function () {
	gq_email_setup( GQ_EMAIL_READY );
	$mailer = gq_email_wp_mail();

	expect( $mailer->FromName )->toBe( 'Nomia' )
		->and( $mailer->Sender )->toBe( 'no-reply@example.com' )
		->and( $mailer->getReplyToAddresses() )->toBe( [] );
} );

test( 'a configured From name wins over the message\'s', function () {
	gq_email_setup( GQ_EMAIL_READY + [ 'from_name' => 'Nomia BNQ' ] );

	expect( gq_email_wp_mail( null, 'wordpress@cms.example.com', 'Forms' )->FromName )->toBe( 'Nomia BNQ' );
} );

test( 'a message from another address keeps it as its Reply-To', function () {
	gq_email_setup( GQ_EMAIL_READY + [ 'reply_to' => 'team@example.com' ] );
	$mailer = gq_email_wp_mail( null, 'visitor@example.org', 'Visitor' );

	expect( $mailer->From )->toBe( 'no-reply@example.com' )
		->and( $mailer->FromName )->toBe( 'Visitor' )
		->and( array_column( $mailer->getReplyToAddresses(), 0 ) )->toBe( [ 'visitor@example.org' ] );
} );

test( 'the site\'s own messages reply to the configured address', function () {
	gq_email_setup( GQ_EMAIL_READY + [ 'reply_to' => 'team@example.com' ] );

	expect( array_column( gq_email_wp_mail()->getReplyToAddresses(), 0 ) )->toBe( [ 'team@example.com' ] );
} );

test( 'a message\'s own Reply-To is kept', function () {
	gq_email_setup( GQ_EMAIL_READY + [ 'reply_to' => 'team@example.com' ] );
	$mailer = gq_email_wp_mail( static fn ( $mailer ) => $mailer->addReplyTo( 'thread@example.org' ), 'visitor@example.org' );

	expect( array_column( $mailer->getReplyToAddresses(), 0 ) )->toBe( [ 'thread@example.org' ] );
} );

test( 'the transport runs after other plugins set the sender', function () {
	$hook = array_values( array_filter(
		$GLOBALS['gq_email_test_state']['actions'],
		static fn( array $entry ): bool => 'phpmailer_init' === $entry['hook'],
	) )[0];

	expect( $hook['callback'][0] )->toBeInstanceOf( CloudflareTransport::class )
		->and( $hook['priority'] )->toBe( 100 );
} );
