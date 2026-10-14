<?php
/**
 * Contact information administration for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve o nome da opção usada para guardar os contactos.
 *
 * @return string
 */
function nomia_cpt_get_contact_option_name() {
	return 'nomia_cpt_contact';
}

/**
 * Devolve os campos disponíveis na página Aparência > Contacto.
 *
 * @return array<string, string>
 */
function nomia_cpt_get_contact_fields() {
	return array(
		'address'         => __( 'Morada', 'nomia-cpt' ),
		'phone'           => __( 'Telefone', 'nomia-cpt' ),
		'email'           => __( 'Email', 'nomia-cpt' ),
		'gps_coordinates' => __( 'Coordenadas GPS', 'nomia-cpt' ),
	);
}

/**
 * Normaliza os dados de contacto.
 *
 * @param mixed $value Valor bruto.
 * @return array{address:string,phone:string,email:string,gps_coordinates:string}
 */
function nomia_cpt_sanitize_contact( $value ) {
	if ( ! is_array( $value ) ) {
		$value = array();
	}

	$contact = array();

	foreach ( nomia_cpt_get_contact_fields() as $field => $label ) {
		$raw_value = $value[ $field ] ?? '';
		$raw_value = is_scalar( $raw_value ) ? (string) $raw_value : '';

		if ( 'email' === $field ) {
			$email             = sanitize_email( $raw_value );
			$contact[ $field ] = is_email( $email ) ? $email : '';
			continue;
		}

		$contact[ $field ] = sanitize_text_field( $raw_value );
	}

	return $contact;
}

/**
 * Devolve os dados de contacto guardados.
 *
 * @return array{address:string,phone:string,email:string,gps_coordinates:string}
 */
function nomia_cpt_get_contact() {
	return nomia_cpt_sanitize_contact(
		get_option( nomia_cpt_get_contact_option_name(), array() ),
	);
}

/**
 * Regista a página Aparência > Contacto.
 *
 * @return void
 */
function nomia_cpt_register_contact_admin_page() {
	add_submenu_page(
		'themes.php',
		__( 'Contacto', 'nomia-cpt' ),
		__( 'Contacto', 'nomia-cpt' ),
		'edit_theme_options',
		'nomia-contact',
		'nomia_cpt_render_contact_admin_page',
	);
}

/**
 * Regista a opção de configuração dos contactos.
 *
 * @return void
 */
function nomia_cpt_register_contact_settings() {
	register_setting(
		'nomia_cpt_contact_settings',
		nomia_cpt_get_contact_option_name(),
		array(
			'type'              => 'array',
			'default'           => nomia_cpt_sanitize_contact( array() ),
			'sanitize_callback' => 'nomia_cpt_sanitize_contact',
			'show_in_rest'      => false,
		),
	);
}

/**
 * Renderiza a página Aparência > Contacto.
 *
 * @return void
 */
function nomia_cpt_render_contact_admin_page() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$contact = nomia_cpt_get_contact();

	echo '<div class="wrap">';
	echo '<h1>' . esc_html__( 'Contacto', 'nomia-cpt' ) . '</h1>';
	echo '<p>' . esc_html__( 'Preencha os dados que devem aparecer na coluna de contactos do rodapé do site.', 'nomia-cpt' ) . '</p>';
	echo '<form method="post" action="options.php">';
	settings_fields( 'nomia_cpt_contact_settings' );
	echo '<table class="form-table" role="presentation"><tbody>';

	foreach ( nomia_cpt_get_contact_fields() as $field => $label ) {
		$input_type = 'email' === $field ? 'email' : 'text';
		$field_id   = 'nomia-cpt-contact-' . str_replace( '_', '-', $field );
		$field_name = nomia_cpt_get_contact_option_name() . '[' . $field . ']';

		echo '<tr>';
		echo '<th scope="row"><label for="' . esc_attr( $field_id ) . '">' . esc_html( $label ) . '</label></th>';
		echo '<td><input type="' . esc_attr( $input_type ) . '" class="regular-text" id="' . esc_attr( $field_id ) . '" name="' . esc_attr( $field_name ) . '" value="' . esc_attr( $contact[ $field ] ) . '" /></td>';
		echo '</tr>';
	}

	echo '</tbody></table>';
	submit_button();
	echo '</form>';
	echo '</div>';
}

/**
 * Regista o endpoint público dos contactos.
 *
 * @return void
 */
function nomia_cpt_register_contact_rest_routes() {
	register_rest_route(
		'nomia/v1',
		'/contact',
		array(
			'methods'             => 'GET',
			'callback'            => 'nomia_cpt_get_contact_rest_response',
			'permission_callback' => '__return_true',
		),
	);
}

/**
 * Devolve os contactos para consumo pelo frontend.
 *
 * @return array{address:string,phone:string,email:string,gpsCoordinates:string}
 */
function nomia_cpt_get_contact_rest_response() {
	$contact = nomia_cpt_get_contact();

	return array(
		'address'        => $contact['address'],
		'phone'          => $contact['phone'],
		'email'          => $contact['email'],
		'gpsCoordinates' => $contact['gps_coordinates'],
	);
}
