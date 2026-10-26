<?php
/**
 * The Email tab of GETQUICK → Options, and what it configures.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email;

use WP_Error;

/**
 * Adds the `email` area to GQ Config's options page (its "Email" tab) and
 * reads it back.
 *
 * The sender settings are saved there; the Cloudflare API token is not. It is
 * a credential, and GQ Config sends saved values back to the admin, so it is
 * read only from the GQ_EMAIL_CLOUDFLARE_API_TOKEN constant or environment
 * variable (the CMS's .env on Ploi). An environment without the token, such as
 * a local copy of the production database, keeps WordPress's own transport.
 */
final class Settings {

	/**
	 * The GQ Config area id, and so the tab's route (`#/email`).
	 */
	public const AREA = 'email';

	/**
	 * Where the Cloudflare API token comes from.
	 */
	public const TOKEN_NAME = 'GQ_EMAIL_CLOUDFLARE_API_TOKEN';

	/**
	 * The constant or environment variable that sets the account ID instead
	 * of the tab.
	 */
	public const ACCOUNT_ID_NAME = 'GQ_EMAIL_CLOUDFLARE_ACCOUNT_ID';

	/**
	 * A Cloudflare account ID: 32 hexadecimal characters.
	 */
	private const ACCOUNT_ID_PATTERN = '/^[0-9a-f]{32}$/';

	/**
	 * Hooks the area into GQ Config.
	 */
	public function register(): void {
		add_filter( 'getquick_config_settings_areas', [ $this, 'addArea' ] );
	}

	/**
	 * Adds the Email area.
	 *
	 * @param array<string, array<string, mixed>> $areas Areas keyed by id.
	 * @return array<string, array<string, mixed>>
	 */
	public function addArea( array $areas ): array {
		$areas[ self::AREA ] = [
			'label'   => __( 'Email', 'gq-email' ),
			'columns' => [
				'delivery' => [ 'label' => __( 'Cloudflare', 'gq-email' ) ],
				'sender'   => [
					'label' => __( 'Sender', 'gq-email' ),
					'empty' => __( 'Turn on Cloudflare Email Service to set the sender.', 'gq-email' ),
				],
			],
			'fields'  => [
				'enabled'      => [
					'type'    => 'boolean',
					'default' => false,
					'control' => 'toggle',
					'column'  => 'delivery',
					'label'   => __( 'Send email through Cloudflare Email Service', 'gq-email' ),
					'help'    => $this->deliveryHelp(),
				],
				'account_id'   => [
					'type'              => 'string',
					'default'           => '',
					'control'           => 'text',
					'column'            => 'delivery',
					'visible_when'      => [
						'key'   => 'enabled',
						'value' => true,
					],
					'label'             => __( 'Cloudflare account ID', 'gq-email' ),
					'help'              => __( 'The account that owns the sending domain and the API token: the 32-character ID in the Cloudflare dashboard\'s account overview.', 'gq-email' ),
					'placeholder'       => '0123456789abcdef0123456789abcdef',
					'max_length'        => 32,
					'override'          => self::ACCOUNT_ID_NAME,
					'validate_callback' => [ self::class, 'validateAccountId' ],
					'sanitize_callback' => static fn( string $value ): string => strtolower( trim( $value ) ),
				],
				'from_address' => $this->emailField(
					__( 'From address', 'gq-email' ),
					__( 'Every message is sent from this address. Its domain must be onboarded to Email Sending on the Cloudflare account that owns the API token.', 'gq-email' ),
					'no-reply@example.com',
				),
				'from_name'    => [
					'type'              => 'string',
					'default'           => '',
					'control'           => 'text',
					'column'            => 'sender',
					'visible_when'      => [
						'key'   => 'enabled',
						'value' => true,
					],
					'label'             => __( 'From name', 'gq-email' ),
					'help'              => __( 'Leave empty to use the name the message sets, or else the site title.', 'gq-email' ),
					'max_length'        => 100,
					'sanitize_callback' => static fn( string $value ): string => sanitize_text_field( $value ),
				],
				'reply_to'     => $this->emailField(
					__( 'Reply-to address', 'gq-email' ),
					__( 'Optional. Used when a message sets no Reply-To of its own and comes from no other address (contact forms, for example, reply to the visitor).', 'gq-email' ),
					'',
				),
			],
		];

		return $areas;
	}

	/**
	 * Whether the Email tab turns Cloudflare on.
	 */
	public function enabled(): bool {
		return true === ( $this->values()['enabled'] ?? false );
	}

	/**
	 * The Cloudflare account ID, or '' when unset or invalid.
	 */
	public function accountId(): string {
		$value = strtolower( trim( (string) ( $this->values()['account_id'] ?? '' ) ) );

		return 1 === preg_match( self::ACCOUNT_ID_PATTERN, $value ) ? $value : '';
	}

	/**
	 * The configured From address, or '' when unset or invalid.
	 */
	public function fromAddress(): string {
		return $this->email( $this->values()['from_address'] ?? '' );
	}

	/**
	 * The configured From name, or ''.
	 */
	public function fromName(): string {
		return trim( (string) ( $this->values()['from_name'] ?? '' ) );
	}

	/**
	 * The configured Reply-To address, or '' when unset or invalid.
	 */
	public function replyTo(): string {
		return $this->email( $this->values()['reply_to'] ?? '' );
	}

	/**
	 * The Cloudflare API token, or '' when the environment has none.
	 */
	public function apiToken(): string {
		if ( defined( self::TOKEN_NAME ) ) {
			return trim( (string) constant( self::TOKEN_NAME ) );
		}

		$value = getenv( self::TOKEN_NAME );

		return is_string( $value ) ? trim( $value ) : '';
	}

	/**
	 * What still keeps Cloudflare from sending; empty when it sends.
	 *
	 * @return list<string>
	 */
	public function problems(): array {
		$problems = [];

		if ( ! $this->enabled() ) {
			$problems[] = __( 'Cloudflare Email Service is turned off in GETQUICK → Options → Email.', 'gq-email' );
		}

		if ( '' === $this->apiToken() ) {
			/* translators: %s: constant or environment variable name. */
			$problems[] = sprintf( __( 'The CMS environment has no %s.', 'gq-email' ), self::TOKEN_NAME );
		}

		if ( '' === $this->accountId() ) {
			$problems[] = __( 'No Cloudflare account ID is set.', 'gq-email' );
		}

		if ( '' === $this->fromAddress() ) {
			$problems[] = __( 'No From address is set.', 'gq-email' );
		}

		return $problems;
	}

	/**
	 * Whether WordPress's email goes through Cloudflare.
	 */
	public function ready(): bool {
		return [] === $this->problems();
	}

	/**
	 * Accepts an empty value or a valid email address.
	 *
	 * @param mixed $value Submitted value.
	 * @return true|WP_Error
	 */
	public static function validateEmail( mixed $value ): bool|WP_Error {
		$value = trim( (string) $value );

		if ( '' === $value || false !== is_email( $value ) ) {
			return true;
		}

		return new WP_Error(
			'gq_email_invalid_address',
			__( 'Enter a valid email address, or leave it empty.', 'gq-email' ),
		);
	}

	/**
	 * Accepts an empty value or a Cloudflare account ID.
	 *
	 * @param mixed $value Submitted value.
	 * @return true|WP_Error
	 */
	public static function validateAccountId( mixed $value ): bool|WP_Error {
		$value = strtolower( trim( (string) $value ) );

		if ( '' === $value || 1 === preg_match( self::ACCOUNT_ID_PATTERN, $value ) ) {
			return true;
		}

		return new WP_Error(
			'gq_email_invalid_account_id',
			__( 'Enter the 32-character Cloudflare account ID, or leave it empty.', 'gq-email' ),
		);
	}

	/**
	 * The toggle's help: what it does, and whether the token is there.
	 */
	private function deliveryHelp(): string {
		$help = __( 'Sends all of WordPress\'s email through Cloudflare Email Sending\'s API. While it is off, or the setup is incomplete, WordPress sends email as before.', 'gq-email' );

		if ( '' !== $this->apiToken() ) {
			/* translators: %s: constant or environment variable name. */
			return $help . ' ' . sprintf( __( 'The API token is set by %s.', 'gq-email' ), self::TOKEN_NAME );
		}

		/* translators: %s: constant or environment variable name. */
		return $help . ' ' . sprintf( __( 'The API token is missing: set %s in the CMS environment to a Cloudflare API token with the Email Sending: Edit permission.', 'gq-email' ), self::TOKEN_NAME );
	}

	/**
	 * An optional email address field of the Sender column.
	 *
	 * @param string $label       Field label.
	 * @param string $help        Field help.
	 * @param string $placeholder Placeholder.
	 * @return array<string, mixed>
	 */
	private function emailField( string $label, string $help, string $placeholder ): array {
		return [
			'type'              => 'string',
			'default'           => '',
			'control'           => 'text',
			'column'            => 'sender',
			'visible_when'      => [
				'key'   => 'enabled',
				'value' => true,
			],
			'label'             => $label,
			'help'              => $help,
			'placeholder'       => $placeholder,
			'max_length'        => 254,
			'validate_callback' => [ self::class, 'validateEmail' ],
			'sanitize_callback' => static fn( string $value ): string => sanitize_email( trim( $value ) ),
		];
	}

	/**
	 * The area's values, with GQ Config's defaults; empty without GQ Config.
	 *
	 * @return array<string, bool|string|int>
	 */
	private function values(): array {
		return function_exists( 'getquick_config_get_options' ) ? getquick_config_get_options( self::AREA ) : [];
	}

	/**
	 * A stored address, if it is valid.
	 *
	 * @param mixed $value Stored value.
	 */
	private function email( mixed $value ): string {
		$value = trim( (string) $value );

		return '' !== $value && false !== is_email( $value ) ? $value : '';
	}
}
