<?php
/**
 * Cloudflare Email Service as WordPress's mail transport.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email;

use GetQuick\Email\Cloudflare\EmailSendingApi;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;
use WP_Error;

/**
 * Sends wp_mail() through Cloudflare Email Sending's REST API once the Email
 * tab is complete, so every plugin's email goes through it with nothing else
 * to change.
 *
 * WordPress's wp_mail() reuses the global `$phpmailer`; before each message the transport
 * makes it a CloudflareMailer, then, on `phpmailer_init`, selects Cloudflare
 * and sets the sender.
 *
 * Cloudflare only accepts a From address on a domain onboarded to Email
 * Sending, so every message is sent from the configured address. A message
 * that came from another address (a contact form's visitor, say) keeps it as
 * its Reply-To.
 */
final class CloudflareTransport {

	/**
	 * The From name wp_mail() falls back to.
	 */
	private const WORDPRESS_FROM_NAME = 'WordPress';

	/**
	 * Constructor.
	 *
	 * @param Settings $settings The Email tab.
	 */
	public function __construct( private readonly Settings $settings ) {}

	/**
	 * Hooks the transport into wp_mail().
	 */
	public function register(): void {
		add_filter( 'pre_wp_mail', [ $this, 'installMailer' ], 100 );
		// Late, so the From and Reply-To other plugins set are already there.
		add_action( 'phpmailer_init', [ $this, 'configure' ], 100 );
		add_action( 'wp_mail_failed', [ $this, 'logFailure' ] );
	}

	/**
	 * Makes wp_mail()'s mailer a CloudflareMailer, when Cloudflare sends.
	 *
	 * Runs on `pre_wp_mail`, before wp_mail() picks its mailer up, and never
	 * short-circuits it.
	 *
	 * @param mixed $short_circuit What another `pre_wp_mail` callback returned; passed through.
	 * @return mixed
	 */
	public function installMailer( mixed $short_circuit ): mixed {
		global $phpmailer;

		if ( null !== $short_circuit || ! $this->settings->ready() || $phpmailer instanceof CloudflareMailer ) {
			return $short_circuit;
		}

		if ( ! class_exists( \WP_PHPMailer::class, false ) ) {
			require_once ABSPATH . WPINC . '/PHPMailer/PHPMailer.php';
			require_once ABSPATH . WPINC . '/PHPMailer/SMTP.php';
			require_once ABSPATH . WPINC . '/PHPMailer/Exception.php';
			require_once ABSPATH . WPINC . '/class-wp-phpmailer.php';
		}

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- wp_mail() reads its mailer from this global.
		$phpmailer = new CloudflareMailer( true );
		// As wp_mail() sets on the mailer it creates.
		$phpmailer::$validator = static fn( string $email ): bool => (bool) is_email( $email );

		return $short_circuit;
	}

	/**
	 * Sends the message through Cloudflare, when the Email tab is complete.
	 *
	 * @param PHPMailer $mailer wp_mail()'s mailer, holding the message.
	 */
	public function configure( PHPMailer $mailer ): void {
		if ( ! $mailer instanceof CloudflareMailer || ! $this->settings->ready() ) {
			return;
		}

		$mailer->useCloudflare( new EmailSendingApi( $this->settings->accountId(), $this->settings->apiToken() ) );
		$this->setSender( $mailer );
	}

	/**
	 * Logs why a message wasn't sent while Cloudflare is the transport.
	 *
	 * The error never contains the API token.
	 *
	 * @param WP_Error $error wp_mail()'s failure.
	 */
	public function logFailure( WP_Error $error ): void {
		if ( ! $this->settings->ready() ) {
			return;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- the failure is otherwise silent.
		error_log( 'gq-email: ' . $error->get_error_message() );
	}

	/**
	 * Sends from the configured address, keeping where replies should go.
	 *
	 * @param PHPMailer $mailer The message.
	 */
	private function setSender( PHPMailer $mailer ): void {
		$address       = $this->settings->fromAddress();
		$original_from = $mailer->From;
		$original_name = $mailer->FromName;
		$name          = $this->settings->fromName();

		if ( '' === $name ) {
			$name = '' !== $original_name && self::WORDPRESS_FROM_NAME !== $original_name
				? $original_name
				: (string) get_bloginfo( 'name' );
		}

		$mailer->setFrom( $address, $name, false );
		// The envelope sender must be on the onboarded domain too.
		$mailer->Sender = $address;

		if ( [] !== $mailer->getReplyToAddresses() ) {
			return;
		}

		if ( $this->isOwnAddress( $original_from, $address ) ) {
			$reply_to = $this->settings->replyTo();

			if ( '' !== $reply_to ) {
				$mailer->addReplyTo( $reply_to );
			}

			return;
		}

		try {
			$mailer->addReplyTo( $original_from, self::WORDPRESS_FROM_NAME !== $original_name ? $original_name : '' );
		} catch ( Exception ) {
			// wp_mail()'s mailer throws on an invalid address; the message just has no Reply-To.
			return;
		}
	}

	/**
	 * Whether the message's own From is the site's: the configured address,
	 * wp_mail()'s default (wordpress@<site host>), or none.
	 *
	 * @param string $from    The message's From.
	 * @param string $address The configured From address.
	 */
	private function isOwnAddress( string $from, string $address ): bool {
		$from = strtolower( trim( $from ) );

		return '' === $from
			|| strtolower( $address ) === $from
			|| $this->defaultFrom() === $from;
	}

	/**
	 * The From wp_mail() uses when nothing sets one.
	 */
	private function defaultFrom(): string {
		$host = strtolower( (string) wp_parse_url( network_home_url(), PHP_URL_HOST ) );

		if ( str_starts_with( $host, 'www.' ) ) {
			$host = substr( $host, 4 );
		}

		return 'wordpress@' . $host;
	}
}
