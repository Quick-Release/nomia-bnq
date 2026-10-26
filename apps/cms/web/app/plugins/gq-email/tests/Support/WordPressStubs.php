<?php

declare(strict_types=1);

/**
 * Minimal WordPress function shims for the Pest unit suite.
 *
 * The tests run without a WordPress load. This file defines just the WordPress
 * functions gq-email calls, records hooks into $GLOBALS['gq_email_test_state'],
 * serves GQ Config's options for the `email` area from that state, and answers
 * wp_remote_post() with the response a test sets, recording the request.
 * PHPMailer and WP_PHPMailer are WordPress's own.
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/../../../../' );
}

if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', 'wp-includes' );
}

$GLOBALS['gq_email_test_state'] = array(
	'actions'  => array(),
	'filters'  => array(),
	'options'  => array(),
	'requests' => array(),
	'response' => null,
	'blogname' => 'Nomia',
	'home_url' => 'https://www.cms.example.com',
);

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		public function __construct( public string $code = '', public string $message = '', public mixed $data = '' ) {}

		public function get_error_message(): string {
			return $this->message;
		}
	}
}

function __( $text ) {
	return $text;
}

function add_action( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
	$GLOBALS['gq_email_test_state']['actions'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

	return true;
}

function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) {
	$GLOBALS['gq_email_test_state']['filters'][] = compact( 'hook', 'callback', 'priority', 'accepted_args' );

	return true;
}

/**
 * Runs the callbacks recorded for an action or filter, in registration order.
 */
function gq_email_run_hook( string $kind, string $hook, mixed ...$args ): mixed {
	foreach ( $GLOBALS['gq_email_test_state'][ $kind ] as $entry ) {
		if ( $entry['hook'] === $hook ) {
			$result = call_user_func_array( $entry['callback'], $args );

			if ( 'filters' === $kind ) {
				$args[0] = $result;
			}
		}
	}

	return $args[0] ?? null;
}

function load_plugin_textdomain() {
	return true;
}

function plugin_basename( $file ) {
	return basename( dirname( (string) $file ) ) . '/' . basename( (string) $file );
}

function sanitize_text_field( $value ) {
	return trim( strip_tags( (string) $value ) );
}

function sanitize_email( $value ) {
	return filter_var( (string) $value, FILTER_SANITIZE_EMAIL );
}

function is_email( $value ) {
	return false !== filter_var( (string) $value, FILTER_VALIDATE_EMAIL ) ? $value : false;
}

function get_bloginfo( $show = '' ) {
	return 'name' === $show ? $GLOBALS['gq_email_test_state']['blogname'] : '';
}

function network_home_url() {
	return $GLOBALS['gq_email_test_state']['home_url'];
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( (string) $url, $component );
}

function getquick_config_get_options( string $area ): array {
	return 'email' === $area
		? $GLOBALS['gq_email_test_state']['options'] + array(
			'enabled'      => false,
			'account_id'   => '',
			'from_address' => '',
			'from_name'    => '',
			'reply_to'     => '',
		)
		: array();
}

function is_wp_error( $value ) {
	return $value instanceof WP_Error;
}

function wp_json_encode( $data, $options = 0 ) {
	return json_encode( $data, (int) $options );
}

function wp_remote_post( $url, $args = array() ) {
	$GLOBALS['gq_email_test_state']['requests'][] = compact( 'url', 'args' );

	return $GLOBALS['gq_email_test_state']['response'];
}

function wp_remote_retrieve_response_code( $response ) {
	return $response['response']['code'] ?? '';
}

function wp_remote_retrieve_body( $response ) {
	return $response['body'] ?? '';
}

require_once __DIR__ . '/../../../../../wp/wp-includes/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../../../../../wp/wp-includes/PHPMailer/Exception.php';
require_once __DIR__ . '/../../../../../wp/wp-includes/class-wp-phpmailer.php';
