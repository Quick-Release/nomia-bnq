<?php
/**
 * Loss-aware upgrade of legacy metadata blocks. Surrounding content stays raw.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts matching block ranges without reserializing unrelated markup.
 *
 * @param string $content Original raw content.
 * @param array  $definition Metadata family.
 * @return array|WP_Error Null details means no matching block.
 */
function nomia_cpt_extract_details( $content, $definition ) {
	$pattern = '/<!--\s*(\/?)wp:' . preg_quote( $definition['block'], '/' ) . '(?=\s|\/|-->)(.*?)-->/s';
	preg_match_all( $pattern, $content, $tokens, PREG_SET_ORDER | PREG_OFFSET_CAPTURE );
	$marker_count = preg_match_all( '/<!--\s*\/?wp:' . preg_quote( $definition['block'], '/' ) . '(?=\s|\/|-->)/', $content );
	if ( count( $tokens ) !== $marker_count ) {
		return new WP_Error( 'details_block', 'Incomplete metadata delimiter; source retained.' );
	}
	$stack   = array();
	$ranges  = array();
	$details = null;
	foreach ( $tokens as $token ) {
		$closing = '/' === $token[1][0];
		$tail    = trim( $token[2][0] );
		if ( $closing ) {
			if ( empty( $stack ) || '' !== $tail ) {
				return new WP_Error( 'details_block', 'Unmatched metadata closing delimiter.' );
			}
			$start = array_pop( $stack );
			if ( empty( $stack ) ) {
				$ranges[] = array( $start, $token[0][1] + strlen( $token[0][0] ) - $start );
			}
			continue;
		}
		$self_closing = str_ends_with( $tail, '/' );
		$json         = $self_closing ? rtrim( substr( $tail, 0, -1 ) ) : $tail;
		$attrs        = '' === $json ? new stdClass() : json_decode( $json );
		if ( ! is_object( $attrs ) ) {
			return new WP_Error( 'details_json', 'Malformed metadata attributes; source retained.' );
		}
		$attrs  = json_decode( wp_json_encode( $attrs ), true );
		$values = array();
		foreach ( $definition['fields'] as $name => $field ) {
			$value = array_key_exists( $name, $attrs ) ? $attrs[ $name ] : $field['default'];
			$valid = rest_validate_value_from_schema( $value, nomia_cpt_details_field_schema( $field ), $name );
			if ( is_wp_error( $valid ) ) {
				return $valid;
			}
			$values[ $name ] = nomia_cpt_sanitize_detail( $value, $field );
			if ( '' !== $value && '' === $values[ $name ] ) {
				return new WP_Error( 'details_value', 'A nonempty legacy value cannot be migrated safely: ' . $name );
			}
		}
		if ( null !== $details && $details !== $values ) {
			return new WP_Error( 'details_duplicate', 'Conflicting metadata blocks; source retained.' );
		}
		$details = $values;
		if ( $self_closing ) {
			if ( empty( $stack ) ) {
				$ranges[] = array( $token[0][1], strlen( $token[0][0] ) );
			}
		} else {
			$stack[] = $token[0][1];
		}
	}
	if ( ! empty( $stack ) || ( null === $details && str_contains( $content, 'wp:' . $definition['block'] ) ) ) {
		return new WP_Error( 'details_block', 'Incomplete metadata block; source retained.' );
	}
	foreach ( array_reverse( $ranges ) as list( $start, $length ) ) {
		$content = substr_replace( $content, '', $start, $length );
	}
	return array(
		'details' => $details,
		'content' => $content,
	);
}

/**
 * Migrates a post only after its metadata and recovery copy are verified.
 *
 * @param int   $post_id Post ID.
 * @param array $definition Metadata family.
 * @return bool|WP_Error True when content changed.
 */
function nomia_cpt_migrate_post_details( $post_id, $definition ) {
	$content   = (string) get_post_field( 'post_content', $post_id, 'raw' );
	$extracted = nomia_cpt_extract_details( $content, $definition );
	if ( ! is_wp_error( $extracted ) && null === $extracted['details'] && metadata_exists( 'post', $post_id, '_nomia_cpt_details_pending' ) ) {
		return new WP_Error( 'details_pending', 'An earlier content write failed verification. Restore the recovery copy before retrying.' );
	}
	if ( is_wp_error( $extracted ) || null === $extracted['details'] ) {
		return is_wp_error( $extracted ) ? $extracted : false;
	}
	// Keep an exact recovery copy even when WordPress revisions are disabled.
	$backup_key = '_nomia_cpt_details_source';
	if ( ! in_array( $content, get_post_meta( $post_id, $backup_key, false ), true ) ) {
		add_post_meta( $post_id, $backup_key, wp_slash( $content ) );
	}
	if ( ! in_array( $content, get_post_meta( $post_id, $backup_key, false ), true ) ) {
		return new WP_Error( 'details_backup', 'Could not preserve the original content.' );
	}
	wp_save_post_revision( $post_id );
	foreach ( $extracted['details'] as $name => $value ) {
		$field = $definition['fields'][ $name ];
		if ( metadata_exists( 'post', $post_id, $field['key'] ) ) {
			continue;
		}
		update_post_meta( $post_id, $field['key'], wp_slash( $value ) );
		if ( ! metadata_exists( 'post', $post_id, $field['key'] ) || nomia_cpt_sanitize_detail( get_post_meta( $post_id, $field['key'], true ), $field ) !== $value ) {
			return new WP_Error( 'details_meta', 'Could not preserve metadata: ' . $name );
		}
	}
	update_post_meta( $post_id, '_nomia_cpt_details_pending', wp_slash( $content ) );
	if ( get_post_meta( $post_id, '_nomia_cpt_details_pending', true ) !== $content ) {
		return new WP_Error( 'details_pending', 'Could not track the pending content write.' );
	}
	// WordPress's no-user KSES path would otherwise alter unrelated imported HTML.
	$filtered = false !== has_filter( 'content_save_pre', 'wp_filter_post_kses' );
	if ( $filtered ) {
		kses_remove_filters();
	}
	try {
		$result = wp_update_post(
			wp_slash(
				array(
					'ID'           => $post_id,
					'post_content' => $extracted['content'],
				)
			),
			true
		);
	} finally {
		if ( $filtered ) {
			kses_init_filters();
		}
	}
	if ( is_wp_error( $result ) ) {
		return $result;
	}
	if ( get_post_field( 'post_content', $post_id, 'raw' ) !== $extracted['content'] ) {
		// Restore raw bytes without re-running the save filter that caused the mismatch.
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Restore exact bytes after a save filter corrupts a migration; cache is explicitly cleared.
		$wpdb->update( $wpdb->posts, array( 'post_content' => $content ), array( 'ID' => $post_id ), array( '%s' ), array( '%d' ) );
		clean_post_cache( $post_id );
		return new WP_Error( 'details_content', 'Content save did not match the expected result; recovery copy retained.' );
	}
	delete_post_meta( $post_id, '_nomia_cpt_details_pending' );
	return true;
}

/**
 * Runs the four family migrations; errors leave the version gate open for retry.
 *
 * @return array{migrated: int, errors: array}
 */
function nomia_cpt_migrate_details_blocks() {
	$result = array(
		'migrated' => 0,
		'errors'   => array(),
	);
	foreach ( nomia_cpt_get_details_definitions() as $post_type => $definition ) {
		$post_ids    = get_posts(
			array(
				'post_type'              => $post_type,
				'post_status'            => array_keys( get_post_stati() ),
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				's'                      => 'wp:' . $definition['block'],
				'search_columns'         => array( 'post_content' ),
				'no_found_rows'          => true,
				'update_post_term_cache' => false,
			)
		);
		$pending_ids = get_posts(
			array(
				'post_type'      => $post_type,
				'post_status'    => array_keys( get_post_stati() ),
				'posts_per_page' => -1,
				'fields'         => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Recovery queue for a one-time content migration.
				'meta_key'       => '_nomia_cpt_details_pending',
			)
		);
		foreach ( array_unique( array_merge( $post_ids, $pending_ids ) ) as $post_id ) {
			$migrated = nomia_cpt_migrate_post_details( (int) $post_id, $definition );
			if ( is_wp_error( $migrated ) ) {
				$result['errors'][ $post_id ] = $migrated->get_error_message();
			} elseif ( $migrated ) {
				++$result['migrated'];
			}
		}
	}
	return $result;
}

/**
 * Shows migration failures to administrators while keeping their source intact.
 *
 * @return void
 */
function nomia_cpt_details_migration_notice() {
	$errors = get_option( 'nomia_cpt_details_migration_errors', array() );
	if ( empty( $errors ) || ! current_user_can( 'manage_options' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p>' . esc_html__( 'Não foi possível migrar alguns detalhes Nomia. O conteúdo original foi conservado; a atualização será repetida.', 'nomia-cpt' ) . '</p><ul>';
	foreach ( $errors as $post_id => $message ) {
		echo '<li><a href="' . esc_url( get_edit_post_link( $post_id ) ) . '">' . esc_html( '#' . $post_id ) . '</a>: ' . esc_html( $message ) . '</li>';
	}
	echo '</ul></div>';
}
