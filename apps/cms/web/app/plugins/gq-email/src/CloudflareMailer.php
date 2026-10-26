<?php
/**
 * The mailer wp_mail() uses, with Cloudflare as a transport.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email;

use GetQuick\Email\Cloudflare\EmailSendingApi;
use GetQuick\Email\Cloudflare\SendFailed;
use GetQuick\Email\Cloudflare\SendResult;
use PHPMailer\PHPMailer\Exception;

/**
 * WordPress's PHPMailer, plus a `cloudflare` mailer.
 *
 * PHPMailer still builds the whole message (headers, HTML and text parts,
 * attachments, embeds), so everything plugins do to it keeps working. Only the
 * last step changes: instead of handing the message to mail() or an SMTP
 * server, PHPMailer calls cloudflareSend() (its `<Mailer>Send` convention),
 * which posts it to Email Sending's `send_raw` endpoint.
 *
 * WordPress's mailer resets itself to mail() on every wp_mail() call, so the
 * transport switches to this mailer per message, and only once the Email tab
 * is complete.
 */
class CloudflareMailer extends \WP_PHPMailer {

	public const MAILER = 'cloudflare';

	/**
	 * The API to send through, while this mailer is the transport.
	 *
	 * @var EmailSendingApi|null
	 */
	private ?EmailSendingApi $api = null;

	/**
	 * What Cloudflare did with the last message it accepted.
	 *
	 * @var SendResult|null
	 */
	private ?SendResult $last_result = null;

	/**
	 * Sends the next messages through Cloudflare.
	 *
	 * @param EmailSendingApi $api The account's API.
	 */
	public function useCloudflare( EmailSendingApi $api ): void {
		$this->api         = $api;
		$this->Mailer      = self::MAILER;
		$this->last_result = null;
	}

	/**
	 * What Cloudflare did with the last message it accepted, if any.
	 */
	public function lastResult(): ?SendResult {
		return $this->last_result;
	}

	/**
	 * Posts the built message to Cloudflare.
	 *
	 * Called by PHPMailer::postSend(). The headers hold To, Cc and Subject
	 * (PHPMailer leaves those out only for mail()) and never Bcc; the envelope
	 * names every recipient.
	 *
	 * @param string $header The message headers.
	 * @param string $body   The message body.
	 * @throws Exception When Cloudflare doesn't accept the message; wp_mail() reports it through `wp_mail_failed`.
	 */
	protected function cloudflareSend( string $header, string $body ): bool {
		if ( null === $this->api ) {
			throw new Exception( 'gq-email: the Cloudflare mailer was selected without an API.' );
		}

		$recipients = array_values(
			array_unique(
				array_merge(
					array_column( $this->getToAddresses(), 0 ),
					array_column( $this->getCcAddresses(), 0 ),
					array_column( $this->getBccAddresses(), 0 ),
				)
			)
		);
		$message    = rtrim( $header, "\r\n " ) . static::$LE . static::$LE . $body;

		try {
			$this->last_result = $this->api->sendRaw( '' !== $this->Sender ? $this->Sender : $this->From, $recipients, $message );
		} catch ( SendFailed $failure ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- logged and reported as text, never printed as HTML.
			throw new Exception( $failure->getMessage(), 0, $failure );
		}

		if ( $this->last_result->lostSome() ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- partial delivery is otherwise silent.
			error_log( sprintf( 'gq-email: Cloudflare message %s did not reach every recipient (%s).', $this->last_result->message_id, $this->last_result->losses() ) );
		}

		return true;
	}
}
