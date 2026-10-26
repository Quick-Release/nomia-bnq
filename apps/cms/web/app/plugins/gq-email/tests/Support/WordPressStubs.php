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

// The GQ Config the Site runs: the one with the options page's `action` control.
define( 'GETQUICK_CONFIG_VERSION', '0.5.0' );

if ( ! defined( 'WPINC' ) ) {
	define( 'WPINC', 'wp-includes' );
}

$GLOBALS['gq_email_test_state'] = array(
	'actions'  => array(),
	'filters'  => array(),
	'options'  => array(),
	'requests' => array(),
	'routes'   => array(),
	'can'      => true,
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

function remove_action( $hook, $callback ) {
	$GLOBALS['gq_email_test_state']['actions'] = array_values(
		array_filter(
			$GLOBALS['gq_email_test_state']['actions'],
			static fn( $entry ) => ! ( $entry['hook'] === $hook && $entry['callback'] === $callback )
		)
	);

	return true;
}

function current_user_can( $capability ) {
	return $GLOBALS['gq_email_test_state']['can'];
}

function wp_get_current_user() {
	return (object) array( 'user_email' => 'admin@example.com' );
}

function home_url( $path = '' ) {
	return 'https://cms.example.com' . $path;
}

function esc_html__( $text ) {
	return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
}

function register_rest_route( $namespace, $route, $args ) {
	$GLOBALS['gq_email_test_state']['routes'][ $namespace . $route ] = $args;

	return true;
}

class WP_REST_Request {
	public function __construct( private array $params = array() ) {}

	public function get_param( $key ) {
		return $this->params[ $key ] ?? null;
	}
}

class WP_REST_Response {
	public function __construct( public mixed $data = null ) {}

	public function get_data() {
		return $this->data;
	}
}

/**
 * wp_mail() as WordPress runs it: `pre_wp_mail`, the global mailer reset to
 * mail() and filled, `phpmailer_init`, send(), `wp_mail_failed` on a PHPMailer
 * exception.
 */
function wp_mail( $to, $subject, $message ) {
	global $phpmailer;

	gq_email_run_hook( 'filters', 'pre_wp_mail', null, compact( 'to', 'subject', 'message' ) );

	if ( ! $phpmailer instanceof PHPMailer\PHPMailer\PHPMailer ) {
		$phpmailer = new WP_PHPMailer( true );
	}

	$phpmailer->clearAllRecipients();
	$phpmailer->clearReplyTos();
	$phpmailer->Sender = '';
	$phpmailer->setFrom( 'wordpress@cms.example.com', 'WordPress', false );
	$phpmailer->addAddress( $to );
	$phpmailer->Subject = $subject;
	$phpmailer->Body    = $message;
	$phpmailer->isMail();
	gq_email_run_hook( 'actions', 'phpmailer_init', $phpmailer );

	try {
		return $phpmailer->send();
	} catch ( PHPMailer\PHPMailer\Exception $e ) {
		gq_email_run_hook( 'actions', 'wp_mail_failed', new WP_Error( 'wp_mail_failed', $e->getMessage() ) );

		return false;
	}
}

require_once __DIR__ . '/../../../../../wp/wp-includes/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../../../../../wp/wp-includes/PHPMailer/Exception.php';
require_once __DIR__ . '/../../../../../wp/wp-includes/class-wp-phpmailer.php';
