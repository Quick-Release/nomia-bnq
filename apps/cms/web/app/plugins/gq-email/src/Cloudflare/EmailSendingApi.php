<?php
/**
 * Cloudflare's Email Sending REST API.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Cloudflare;

/**
 * Sends a built MIME message through Email Sending's `send_raw` endpoint
 * (https://developers.cloudflare.com/api/resources/email_sending/methods/send_raw/),
 * over WordPress's HTTP API.
 */
final class EmailSendingApi {

	public const BASE_URL = 'https://api.cloudflare.com/client/v4';

	/**
	 * Seconds to wait for Cloudflare, so a page that sends email can't hang on it.
	 */
	public const TIMEOUT = 30;

	/**
	 * Constructor.
	 *
	 * @param string $account_id The Cloudflare account that sends.
	 * @param string $api_token  A token with the Email Sending: Edit permission.
	 */
	public function __construct(
		private readonly string $account_id,
		#[\SensitiveParameter] private readonly string $api_token,
	) {}

	/**
	 * The endpoint for the account.
	 */
	public function url(): string {
		return self::BASE_URL . '/accounts/' . rawurlencode( $this->account_id ) . '/email/sending/send_raw';
	}

	/**
	 * Sends a message.
	 *
	 * @param string             $from         The envelope sender, on an onboarded domain.
	 * @param array<int, string> $recipients   The envelope recipients: To, Cc and Bcc.
	 * @param string             $mime_message The RFC 5322 message, headers and body.
	 * @throws SendFailed When Cloudflare can't be reached, refuses the message, or no recipient will get it.
	 */
	public function sendRaw( string $from, array $recipients, string $mime_message ): SendResult {
		$response = wp_remote_post(
			$this->url(),
			[
				'timeout' => self::TIMEOUT,
				'headers' => [
					'Authorization' => 'Bearer ' . $this->api_token,
					'Content-Type'  => 'application/json',
				],
				'body'    => (string) wp_json_encode(
					[
						'from'         => $from,
						'recipients'   => array_values( $recipients ),
						'mime_message' => $mime_message,
					]
				),
			]
		);

		if ( is_wp_error( $response ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- logged and reported as text, never printed as HTML.
			throw new SendFailed( 'Cloudflare Email Sending could not be reached: ' . $response->get_error_message() );
		}

		$status = (int) wp_remote_retrieve_response_code( $response );
		$body   = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		$body   = is_array( $body ) ? $body : [];

		if ( $status < 200 || $status >= 300 || true !== ( $body['success'] ?? false ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- logged and reported as text, never printed as HTML.
			throw new SendFailed( sprintf( 'Cloudflare Email Sending refused the message (HTTP %d): %s', $status, self::errors( $body ) ) );
		}

		$result = SendResult::fromResponse( is_array( $body['result'] ?? null ) ? $body['result'] : [] );

		if ( ! $result->reachedAnyone() ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- logged and reported as text, never printed as HTML.
			throw new SendFailed( sprintf( 'Cloudflare Email Sending delivered the message to no one (%s).', $result->losses() ) );
		}

		return $result;
	}

	/**
	 * The response's errors, as "code message" pairs.
	 *
	 * @param array<string, mixed> $body The decoded response.
	 */
	private static function errors( array $body ): string {
		$errors = [];

		foreach ( (array) ( $body['errors'] ?? [] ) as $error ) {
			if ( is_array( $error ) ) {
				$errors[] = trim( ( $error['code'] ?? '' ) . ' ' . ( $error['message'] ?? '' ) );
			}
		}

		return [] !== $errors ? implode( '; ', $errors ) : 'no error details';
	}
}
