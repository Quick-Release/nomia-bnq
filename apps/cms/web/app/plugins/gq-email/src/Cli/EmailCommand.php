<?php
/**
 * `wp gq-email`.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Cli;

use GetQuick\Email\Cloudflare\EmailSendingApi;
use GetQuick\Email\CloudflareMailer;
use GetQuick\Email\Settings;
use WP_CLI;
use WP_Error;

/**
 * Checks and tests the Cloudflare email transport.
 */
final class EmailCommand {

	/**
	 * Constructor.
	 *
	 * @param Settings $settings The Email tab.
	 */
	public function __construct( private readonly Settings $settings ) {}

	/**
	 * Shows whether WordPress's email goes through Cloudflare, and what is missing.
	 *
	 * Never shows the API token.
	 *
	 * ## EXAMPLES
	 *
	 *     wp gq-email status
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, string> $assoc_args Flags.
	 */
	public function status( array $args, array $assoc_args ): void {
		unset( $args, $assoc_args );

		$rows = [
			[
				'setting' => 'enabled',
				'value'   => $this->settings->enabled() ? 'yes' : 'no',
			],
			[
				'setting' => 'account_id',
				'value'   => $this->settings->accountId(),
			],
			[
				'setting' => 'api_token',
				'value'   => '' !== $this->settings->apiToken() ? 'set (' . Settings::TOKEN_NAME . ')' : 'missing',
			],
			[
				'setting' => 'from_address',
				'value'   => $this->settings->fromAddress(),
			],
			[
				'setting' => 'from_name',
				'value'   => $this->settings->fromName(),
			],
			[
				'setting' => 'reply_to',
				'value'   => $this->settings->replyTo(),
			],
			[
				'setting' => 'transport',
				'value'   => $this->settings->ready() ? ( new EmailSendingApi( $this->settings->accountId(), '' ) )->url() : 'WordPress default',
			],
		];

		WP_CLI\Utils\format_items( 'table', $rows, [ 'setting', 'value' ] );

		foreach ( $this->settings->problems() as $problem ) {
			WP_CLI::warning( $problem );
		}
	}

	/**
	 * Sends a test email through Cloudflare.
	 *
	 * ## OPTIONS
	 *
	 * <to>
	 * : The recipient. Use an address you control: bounces hurt the sender's reputation.
	 *
	 * ## EXAMPLES
	 *
	 *     wp gq-email test someone@example.com
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, string> $assoc_args Flags.
	 */
	public function test( array $args, array $assoc_args ): void {
		unset( $assoc_args );

		$to = trim( $args[0] ?? '' );

		if ( false === is_email( $to ) ) {
			WP_CLI::error( 'Give a valid recipient address.' );
		}

		if ( ! $this->settings->ready() ) {
			WP_CLI::error( 'Cloudflare is not the transport yet: ' . implode( ' ', $this->settings->problems() ) );
		}

		$failure = null;
		$capture = static function ( WP_Error $error ) use ( &$failure ): void {
			$failure = $error;
		};

		add_action( 'wp_mail_failed', $capture );
		$site = (string) get_bloginfo( 'name' );
		$sent = wp_mail(
			$to,
			sprintf( '[%s] Cloudflare Email Service test', $site ),
			sprintf( "This test email from %s (%s) was sent through Cloudflare Email Service.\n", $site, home_url() ),
		);
		remove_action( 'wp_mail_failed', $capture );

		if ( ! $sent ) {
			WP_CLI::error( 'Cloudflare did not accept the message: ' . ( $failure instanceof WP_Error ? $failure->get_error_message() : 'unknown error' ) );
		}

		global $phpmailer;
		$result = $phpmailer instanceof CloudflareMailer ? $phpmailer->lastResult() : null;

		if ( null === $result ) {
			WP_CLI::error( 'WordPress sent the message, but not through Cloudflare: another plugin replaced the mailer.' );
		}

		WP_CLI::log( sprintf( 'Message-ID: %s', '' !== $result->message_id ? $result->message_id : '(none)' ) );

		foreach ( [
			'delivered'  => $result->delivered,
			'queued'     => $result->queued,
			'bounced'    => $result->bounced,
			'suppressed' => $result->suppressed,
		] as $outcome => $addresses ) {
			if ( [] !== $addresses ) {
				WP_CLI::log( sprintf( '%s: %s', ucfirst( $outcome ), implode( ', ', $addresses ) ) );
			}
		}

		if ( $result->lostSome() ) {
			WP_CLI::warning( 'Cloudflare accepted the message, but did not deliver it to every recipient.' );

			return;
		}

		WP_CLI::success( sprintf( 'Cloudflare accepted the message for %s.', $to ) );
	}
}
