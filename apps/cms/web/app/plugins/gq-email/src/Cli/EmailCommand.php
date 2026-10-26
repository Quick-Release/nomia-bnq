<?php
/**
 * `wp gq-email`.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Cli;

use GetQuick\Email\Cloudflare\EmailSendingApi;
use GetQuick\Email\Settings;
use GetQuick\Email\Testing\TestEmail;
use GetQuick\Email\Testing\TestFailed;
use WP_CLI;

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

		$to = (string) ( $args[0] ?? '' );

		try {
			$result = ( new TestEmail( $this->settings ) )->send( $to );
		} catch ( TestFailed $failure ) {
			WP_CLI::error( $failure->getMessage() );
		}

		foreach ( TestEmail::describe( $result ) as $line ) {
			WP_CLI::log( $line );
		}

		if ( $result->lostSome() ) {
			WP_CLI::warning( TestEmail::verdict( $result, trim( $to ) ) );

			return;
		}

		WP_CLI::success( TestEmail::verdict( $result, trim( $to ) ) );
	}
}
