<?php
/**
 * Footer logo administration for the nomia-cpt plugin.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Devolve o nome da opção usada para guardar os IDs dos logótipos do rodapé.
 *
 * @return string
 */
function nomia_cpt_get_footer_logo_ids_option_name() {
	return 'nomia_cpt_footer_logo_ids';
}

/**
 * Normaliza a lista ordenada de IDs de logótipos.
 *
 * @param mixed $value Valor bruto.
 * @return int[]
 */
function nomia_cpt_sanitize_footer_logo_ids( $value ) {
	if ( is_string( $value ) ) {
		$value = explode( ',', $value );
	}

	if ( ! is_array( $value ) ) {
		return array();
	}

	$sanitized_ids = array();

	foreach ( $value as $attachment_id ) {
		$attachment_id = absint( $attachment_id );

		if ( 0 === $attachment_id ) {
			continue;
		}

		$sanitized_ids[] = $attachment_id;
	}

	return array_values( array_unique( $sanitized_ids ) );
}

/**
 * Devolve os IDs de logótipos guardados.
 *
 * @return int[]
 */
function nomia_cpt_get_footer_logo_ids() {
	return nomia_cpt_sanitize_footer_logo_ids(
		get_option( nomia_cpt_get_footer_logo_ids_option_name(), array() ),
	);
}

/**
 * Regista a página Aparência > Footer.
 *
 * @return void
 */
function nomia_cpt_register_footer_admin_page() {
	add_submenu_page(
		'themes.php',
		__( 'Footer', 'nomia-cpt' ),
		__( 'Footer', 'nomia-cpt' ),
		'edit_theme_options',
		'nomia-footer',
		'nomia_cpt_render_footer_admin_page',
	);
}

/**
 * Regista a opção de configuração dos logótipos do rodapé.
 *
 * @return void
 */
function nomia_cpt_register_footer_settings() {
	register_setting(
		'nomia_cpt_footer_settings',
		nomia_cpt_get_footer_logo_ids_option_name(),
		array(
			'type'              => 'array',
			'default'           => array(),
			'sanitize_callback' => 'nomia_cpt_sanitize_footer_logo_ids',
			'show_in_rest'      => false,
		),
	);
}

/**
 * Renderiza a página Aparência > Footer.
 *
 * @return void
 */
function nomia_cpt_render_footer_admin_page() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$logo_ids = nomia_cpt_get_footer_logo_ids();
	$logos    = nomia_cpt_get_footer_logo_admin_items( $logo_ids );

	echo '<div class="wrap">';
	echo '<h1>' . esc_html__( 'Footer', 'nomia-cpt' ) . '</h1>';
	echo '<p>' . esc_html__( 'Selecione os logótipos que devem aparecer no fim do rodapé do site e ajuste a ordem antes de guardar.', 'nomia-cpt' ) . '</p>';
	echo '<form method="post" action="options.php">';
	settings_fields( 'nomia_cpt_footer_settings' );
	echo '<input type="hidden" id="nomia-cpt-footer-logo-ids" name="' . esc_attr( nomia_cpt_get_footer_logo_ids_option_name() ) . '" value="' . esc_attr( implode( ',', $logo_ids ) ) . '" />';
	echo '<div id="nomia-cpt-footer-logos" class="nomia-cpt-footer-logos" data-empty-label="' . esc_attr__( 'Nenhum logótipo selecionado.', 'nomia-cpt' ) . '">';
	nomia_cpt_render_footer_logo_admin_list( $logos );
	echo '</div>';
	echo '<p class="nomia-cpt-footer-logos__actions">';
	echo '<button type="button" class="button button-secondary" id="nomia-cpt-footer-logos-select">' . esc_html__( 'Adicionar logótipos', 'nomia-cpt' ) . '</button>';
	echo '</p>';
	submit_button();
	echo '</form>';
	echo '</div>';
}

/**
 * Renderiza a lista inicial de logótipos da página de administração.
 *
 * @param array<int, array{id:int,title:string,thumbnail:string}> $logos Logótipos.
 * @return void
 */
function nomia_cpt_render_footer_logo_admin_list( array $logos ) {
	if ( array() === $logos ) {
		echo '<p class="description">' . esc_html__( 'Nenhum logótipo selecionado.', 'nomia-cpt' ) . '</p>';
		return;
	}

	echo '<ol class="nomia-cpt-footer-logos__list">';

	foreach ( $logos as $logo ) {
		echo '<li data-attachment-id="' . esc_attr( (string) $logo['id'] ) . '">';
		echo '<span class="nomia-cpt-footer-logos__thumb">' . wp_kses_post( $logo['thumbnail'] ) . '</span>';
		echo '<span class="nomia-cpt-footer-logos__title">' . esc_html( $logo['title'] ) . '</span>';
		echo '<button type="button" class="button-link nomia-cpt-footer-logos__move-up">' . esc_html__( 'Subir', 'nomia-cpt' ) . '</button>';
		echo '<button type="button" class="button-link nomia-cpt-footer-logos__move-down">' . esc_html__( 'Descer', 'nomia-cpt' ) . '</button>';
		echo '<button type="button" class="button-link-delete nomia-cpt-footer-logos__remove">' . esc_html__( 'Remover', 'nomia-cpt' ) . '</button>';
		echo '</li>';
	}

	echo '</ol>';
}

/**
 * Devolve itens para a UI de administração.
 *
 * @param int[] $logo_ids IDs normalizados.
 * @return array<int, array{id:int,title:string,thumbnail:string}>
 */
function nomia_cpt_get_footer_logo_admin_items( array $logo_ids ) {
	$logos = array();

	foreach ( nomia_cpt_get_ordered_media( $logo_ids ) as $logo ) {
		$logos[] = array(
			'id'        => $logo['id'],
			'title'     => $logo['title'],
			'thumbnail' => wp_get_attachment_image(
				$logo['id'],
				'full',
				false,
				array(
					'class' => 'nomia-cpt-footer-logos__image',
					'style' => 'max-height: 200px; width: auto; max-width: 100%; object-fit: contain;',
				),
			),
		);
	}

	return $logos;
}

/**
 * Carrega os assets da página Aparência > Footer.
 *
 * @param string $hook_suffix Hook atual do admin.
 * @return void
 */
function nomia_cpt_enqueue_footer_admin_assets( $hook_suffix ) {
	if ( 'appearance_page_nomia-footer' !== $hook_suffix ) {
		return;
	}

	wp_enqueue_media();
	nomia_cpt_register_media_picker_script();
	wp_enqueue_script(
		'nomia-cpt-footer-admin',
		plugin_dir_url( NOMIA_CPT_PLUGIN_FILE ) . 'assets/js/footer-admin.js',
		array( 'nomia-cpt-media-picker' ),
		NOMIA_CPT_PLUGIN_VERSION,
		true,
	);
	wp_add_inline_script(
		'nomia-cpt-footer-admin',
		'window.nomiaCptFooterAdmin = ' . wp_json_encode(
			array(
				'emptyLabel'    => __( 'Nenhum logótipo selecionado.', 'nomia-cpt' ),
				'imageLabel'    => __( 'Logótipo', 'nomia-cpt' ),
				'moveUpLabel'   => __( 'Subir', 'nomia-cpt' ),
				'moveDownLabel' => __( 'Descer', 'nomia-cpt' ),
				'removeLabel'   => __( 'Remover', 'nomia-cpt' ),
			),
		) . ';',
		'before',
	);
}

/**
 * Regista o endpoint público dos logótipos do rodapé.
 *
 * @return void
 */
function nomia_cpt_register_footer_rest_routes() {
	register_rest_route(
		'nomia/v1',
		'/footer-logos',
		array(
			'methods'             => 'GET',
			'callback'            => 'nomia_cpt_get_footer_logos_rest_response',
			'permission_callback' => '__return_true',
		),
	);
}

/**
 * Devolve os logótipos do rodapé para consumo pelo frontend.
 *
 * @return array<int, array{id:int,url:string,alt:string,width:int|null,height:int|null}>
 */
function nomia_cpt_get_footer_logos_rest_response() {
	$logos = array();

	foreach ( nomia_cpt_get_ordered_media( nomia_cpt_get_footer_logo_ids() ) as $logo ) {
		$logos[] = array(
			'id'     => $logo['id'],
			'url'    => $logo['url'],
			'alt'    => $logo['alt'],
			'width'  => $logo['width'],
			'height' => $logo['height'],
		);
	}

	return $logos;
}
