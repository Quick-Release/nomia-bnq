<?php
/**
 * A test message through Cloudflare.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Testing;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- the messages are shown as text (WP-CLI, the REST response), never printed as HTML.

use GetQuick\Email\Cloudflare\SendResult;
use GetQuick\Email\CloudflareMailer;
use GetQuick\Email\Settings;
use WP_Error;

/**
 * Sends a test message with wp_mail(), the way any plugin's email goes, and
 * returns what Cloudflare did with it. Used by `wp gq-email test` and the
 * Email tab's Test column.
 */
final class TestEmail {

	/**
	 * Constructor.
	 *
	 * @param Settings $settings The Email tab.
	 */
	public function __construct( private readonly Settings $settings ) {}

	/**
	 * Sends the test message.
	 *
	 * @param string $to The recipient.
	 * @throws TestFailed When the address is invalid, the setup is incomplete, or Cloudflare didn't accept it.
	 */
	public function send( string $to ): SendResult {
		$to = trim( $to );

		if ( false === is_email( $to ) ) {
			throw new TestFailed( __( 'Enter a valid recipient address.', 'gq-email' ) );
		}

		if ( ! $this->settings->ready() ) {
			throw new TestFailed(
				/* translators: %s: what is missing from the setup. */
				sprintf( __( 'Cloudflare is not sending yet: %s', 'gq-email' ), implode( ' ', $this->settings->problems() ) )
			);
		}

		$failure = null;
		$capture = static function ( WP_Error $error ) use ( &$failure ): void {
			$failure = $error;
		};

		add_action( 'wp_mail_failed', $capture );
		$site = (string) get_bloginfo( 'name' );
		$sent = wp_mail(
			$to,
			/* translators: %s: site title. */
			sprintf( __( '[%s] Cloudflare Email Service test', 'gq-email' ), $site ),
			/* translators: 1: site title, 2: site URL. */
			sprintf( __( "This test email from %1\$s (%2\$s) was sent through Cloudflare Email Service.\n", 'gq-email' ), $site, home_url() ),
		);
		remove_action( 'wp_mail_failed', $capture );

		if ( ! $sent ) {
			throw new TestFailed(
				/* translators: %s: Cloudflare's or WordPress's error. */
				sprintf( __( 'Cloudflare did not accept the message: %s', 'gq-email' ), $failure instanceof WP_Error ? $failure->get_error_message() : __( 'unknown error', 'gq-email' ) )
			);
		}

		global $phpmailer;
		$result = $phpmailer instanceof CloudflareMailer ? $phpmailer->lastResult() : null;

		if ( null === $result ) {
			throw new TestFailed( __( 'WordPress sent the message, but not through Cloudflare: another plugin replaced the mailer.', 'gq-email' ) );
		}

		return $result;
	}

	/**
	 * What Cloudflare did, one line per outcome, for people.
	 *
	 * @param SendResult $result The accepted message.
	 * @return array<int, string>
	 */
	public static function describe( SendResult $result ): array {
		/* translators: %s: Cloudflare's Message-ID. */
		$lines = [ sprintf( __( 'Message-ID: %s', 'gq-email' ), '' !== $result->message_id ? $result->message_id : __( '(none)', 'gq-email' ) ) ];

		foreach ( [
			/* translators: %s: email addresses. */
			[ $result->delivered, __( 'Delivered: %s', 'gq-email' ) ],
			/* translators: %s: email addresses. */
			[ $result->queued, __( 'Queued: %s', 'gq-email' ) ],
			/* translators: %s: email addresses. */
			[ $result->bounced, __( 'Bounced: %s', 'gq-email' ) ],
			/* translators: %s: email addresses. */
			[ $result->suppressed, __( 'Suppressed: %s', 'gq-email' ) ],
		] as [ $addresses, $format ] ) {
			if ( [] !== $addresses ) {
				$lines[] = sprintf( $format, implode( ', ', $addresses ) );
			}
		}

		return $lines;
	}

	/**
	 * The one-line verdict.
	 *
	 * @param SendResult $result The accepted message.
	 * @param string     $to     The recipient.
	 */
	public static function verdict( SendResult $result, string $to ): string {
		return $result->lostSome()
			? __( 'Cloudflare accepted the message, but did not deliver it to every recipient.', 'gq-email' )
			/* translators: %s: recipient. */
			: sprintf( __( 'Cloudflare accepted the message for %s.', 'gq-email' ), $to );
	}
}
