<?php
/**
 * Contact settings.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

/**
 * Appearance → Contacto: the footer contacts and their public REST endpoint.
 */
final class ContactSettings {

	public const OPTION = 'gq_bioeconomia_contact';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'registerPage' ] );
		add_action( 'admin_init', [ $this, 'registerSetting' ] );
		add_action( 'rest_api_init', [ $this, 'registerRestRoutes' ] );
	}

	/**
	 * Devolve os campos disponíveis na página Aparência > Contacto.
	 *
	 * @return array<string, string>
	 */
	public static function fields() {
		return [
			'address'         => __( 'Morada', 'gq-bioeconomia' ),
			'phone'           => __( 'Telefone', 'gq-bioeconomia' ),
			'email'           => __( 'Email', 'gq-bioeconomia' ),
			'gps_coordinates' => __( 'Coordenadas GPS', 'gq-bioeconomia' ),
		];
	}

	/**
	 * Normaliza os dados de contacto.
	 *
	 * @param mixed $value Valor bruto.
	 * @return array{address:string,phone:string,email:string,gps_coordinates:string}
	 */
	public static function sanitize( $value ) {
		if ( ! is_array( $value ) ) {
			$value = [];
		}

		$contact = [];

		foreach ( self::fields() as $field => $label ) {
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
	public static function contact() {
		return self::sanitize(
			get_option( self::OPTION, [] ),
		);
	}

	/**
	 * Regista a página Aparência > Contacto.
	 *
	 * @return void
	 */
	public function registerPage() {
		add_submenu_page(
			'themes.php',
			__( 'Contacto', 'gq-bioeconomia' ),
			__( 'Contacto', 'gq-bioeconomia' ),
			'edit_theme_options',
			'gq-bioeconomia-contact',
			[ self::class, 'renderPage' ],
		);
	}

	/**
	 * Regista a opção de configuração dos contactos.
	 *
	 * @return void
	 */
	public function registerSetting() {
		register_setting(
			'gq_bioeconomia_contact_settings',
			self::OPTION,
			[
				'type'              => 'array',
				'default'           => self::sanitize( [] ),
				'sanitize_callback' => [ self::class, 'sanitize' ],
				'show_in_rest'      => false,
			],
		);
	}

	/**
	 * Renderiza a página Aparência > Contacto.
	 *
	 * @return void
	 */
	public static function renderPage() {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$contact = self::contact();

		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'Contacto', 'gq-bioeconomia' ) . '</h1>';
		echo '<p>' . esc_html__( 'Preencha os dados que devem aparecer na coluna de contactos do rodapé do site.', 'gq-bioeconomia' ) . '</p>';
		echo '<form method="post" action="options.php">';
		settings_fields( 'gq_bioeconomia_contact_settings' );
		echo '<table class="form-table" role="presentation"><tbody>';

		foreach ( self::fields() as $field => $label ) {
			$input_type = 'email' === $field ? 'email' : 'text';
			$field_id   = 'gq-bioeconomia-contact-' . str_replace( '_', '-', $field );
			$field_name = self::OPTION . '[' . $field . ']';

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
	public function registerRestRoutes() {
		register_rest_route(
			'gq-bioeconomia/v1',
			'/contact',
			[
				'methods'             => 'GET',
				'callback'            => [ self::class, 'contactResponse' ],
				'permission_callback' => '__return_true',
			],
		);
	}

	/**
	 * Devolve os contactos para consumo pelo frontend.
	 *
	 * @return array{address:string,phone:string,email:string,gpsCoordinates:string}
	 */
	public static function contactResponse() {
		$contact = self::contact();

		return [
			'address'        => $contact['address'],
			'phone'          => $contact['phone'],
			'email'          => $contact['email'],
			'gpsCoordinates' => $contact['gps_coordinates'],
		];
	}
}
