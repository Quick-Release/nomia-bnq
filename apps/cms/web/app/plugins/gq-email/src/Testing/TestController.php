<?php
/**
 * `POST gq-email/v1/test`.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Testing;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Sends a test message from the Email tab's Test column.
 *
 * Request: `{ "to": "<address>" }`. Response: `{ "message": string, "details": string[] }`,
 * or a WP_Error whose message says why nothing was sent.
 */
final class TestController {

	public const NAMESPACE = 'gq-email/v1';

	public const ROUTE = '/test';

	/**
	 * Who may send a test: the people who manage GETQUICK → Options.
	 */
	public const CAPABILITY = 'manage_options';

	/**
	 * Constructor.
	 *
	 * @param TestEmail $test The test message.
	 */
	public function __construct( private readonly TestEmail $test ) {}

	/**
	 * Hooks the route.
	 */
	public function register(): void {
		add_action( 'rest_api_init', [ $this, 'registerRoute' ] );
	}

	/**
	 * Registers the route.
	 */
	public function registerRoute(): void {
		register_rest_route(
			self::NAMESPACE,
			self::ROUTE,
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'send' ],
				'permission_callback' => static fn(): bool => current_user_can( self::CAPABILITY ),
				'args'                => [
					'to' => [
						'type'     => 'string',
						'format'   => 'email',
						'required' => true,
					],
				],
			]
		);
	}

	/**
	 * Sends the test message.
	 *
	 * @param WP_REST_Request $request The request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function send( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$to = (string) $request->get_param( 'to' );

		try {
			$result = $this->test->send( $to );
		} catch ( TestFailed $failure ) {
			return new WP_Error( 'gq_email_test_failed', $failure->getMessage(), [ 'status' => 400 ] );
		}

		return new WP_REST_Response(
			[
				'message' => TestEmail::verdict( $result, trim( $to ) ),
				'details' => TestEmail::describe( $result ),
			]
		);
	}
}
