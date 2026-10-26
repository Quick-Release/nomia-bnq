<?php
/**
 * What Cloudflare did with an accepted message.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Cloudflare;

/**
 * The per-recipient outcome Email Sending returns for a message it accepted.
 */
final class SendResult {

	/**
	 * Constructor.
	 *
	 * @param string             $message_id Cloudflare's Message-ID.
	 * @param array<int, string> $delivered  Delivered right away.
	 * @param array<int, string> $queued     Queued for later delivery.
	 * @param array<int, string> $bounced    Bounced permanently.
	 * @param array<int, string> $suppressed Dropped: on the account's suppression list.
	 */
	public function __construct(
		public readonly string $message_id,
		public readonly array $delivered,
		public readonly array $queued,
		public readonly array $bounced,
		public readonly array $suppressed,
	) {}

	/**
	 * Reads the `result` of a successful response.
	 *
	 * @param array<string, mixed> $result The response's `result`.
	 */
	public static function fromResponse( array $result ): self {
		$list = static fn( string $key ): array => array_values( array_filter( (array) ( $result[ $key ] ?? [] ), 'is_string' ) );

		return new self(
			is_string( $result['message_id'] ?? null ) ? $result['message_id'] : '',
			$list( 'delivered' ),
			$list( 'queued' ),
			$list( 'permanent_bounces' ),
			$list( 'suppressed_recipients' ),
		);
	}

	/**
	 * Whether any recipient will get the message.
	 */
	public function reachedAnyone(): bool {
		return [] !== $this->delivered || [] !== $this->queued;
	}

	/**
	 * Whether some recipients won't get it.
	 */
	public function lostSome(): bool {
		return [] !== $this->bounced || [] !== $this->suppressed;
	}

	/**
	 * Who won't get it, for logs and errors.
	 */
	public function losses(): string {
		$list = static fn( array $addresses ): string => [] !== $addresses ? implode( ', ', $addresses ) : 'none';

		return sprintf( 'bounced: %s; suppressed: %s', $list( $this->bounced ), $list( $this->suppressed ) );
	}
}
