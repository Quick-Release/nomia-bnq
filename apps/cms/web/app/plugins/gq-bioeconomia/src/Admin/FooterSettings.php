<?php
/**
 * Footer settings.
 *
 * @package GetQuick\Bioeconomia\Admin
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Admin;

use GetQuick\Bioeconomia\Media\OrderedMedia;

/**
 * Appearance → Footer: the footer logos and their public REST endpoint.
 */
final class FooterSettings {

	public const OPTION = 'gq_bioeconomia_footer_logo_ids';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'registerPage' ] );
		add_action( 'admin_init', [ $this, 'registerSetting' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueueAssets' ] );
		add_action( 'rest_api_init', [ $this, 'registerRestRoutes' ] );
	}

	/**
	 * Normaliza a lista ordenada de IDs de logótipos.
	 *
	 * @param mixed $value Valor bruto.
	 * @return int[]
	 */
	public static function sanitizeLogoIds( $value ) {
		if ( is_string( $value ) ) {
			$value = explode( ',', $value );
		}

		if ( ! is_array( $value ) ) {
			return [];
		}

		$sanitized_ids = [];

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
	public static function logoIds() {
		return self::sanitizeLogoIds(
			get_option( self::OPTION, [] ),
		);
	}

	/**
	 * Regista a página Aparência > Footer.
	 *
	 * @return void
	 */
	public function registerPage() {
		add_submenu_page(
			'themes.php',
			__( 'Footer', 'gq-bioeconomia' ),
			__( 'Footer', 'gq-bioeconomia' ),
			'edit_theme_options',
			'gq-bioeconomia-footer',
			[ self::class, 'renderPage' ],
		);
	}

	/**
	 * Regista a opção de configuração dos logótipos do rodapé.
	 *
	 * @return void
	 */
	public function registerSetting() {
		register_setting(
			'gq_bioeconomia_footer_settings',
			self::OPTION,
			[
				'type'              => 'array',
				'default'           => [],
				'sanitize_callback' => [ self::class, 'sanitizeLogoIds' ],
				'show_in_rest'      => false,
			],
		);
	}

	/**
	 * Renderiza a página Aparência > Footer.
	 *
	 * @return void
	 */
	public static function renderPage() {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return;
		}

		$logo_ids = self::logoIds();
		$logos    = self::adminItems( $logo_ids );

		echo '<div class="wrap">';
		echo '<h1>' . esc_html__( 'Footer', 'gq-bioeconomia' ) . '</h1>';
		echo '<p>' . esc_html__( 'Selecione os logótipos que devem aparecer no fim do rodapé do site e ajuste a ordem antes de guardar.', 'gq-bioeconomia' ) . '</p>';
		echo '<form method="post" action="options.php">';
		settings_fields( 'gq_bioeconomia_footer_settings' );
		echo '<input type="hidden" id="gq-bioeconomia-footer-logo-ids" name="' . esc_attr( self::OPTION ) . '" value="' . esc_attr( implode( ',', $logo_ids ) ) . '" />';
		echo '<div id="gq-bioeconomia-footer-logos" class="gq-bioeconomia-footer-logos" data-empty-label="' . esc_attr__( 'Nenhum logótipo selecionado.', 'gq-bioeconomia' ) . '">';
		self::renderLogoList( $logos );
		echo '</div>';
		echo '<p class="gq-bioeconomia-footer-logos__actions">';
		echo '<button type="button" class="button button-secondary" id="gq-bioeconomia-footer-logos-select">' . esc_html__( 'Adicionar logótipos', 'gq-bioeconomia' ) . '</button>';
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
	public static function renderLogoList( array $logos ) {
		if ( [] === $logos ) {
			echo '<p class="description">' . esc_html__( 'Nenhum logótipo selecionado.', 'gq-bioeconomia' ) . '</p>';
			return;
		}

		echo '<ol class="gq-bioeconomia-footer-logos__list">';

		foreach ( $logos as $logo ) {
			echo '<li data-attachment-id="' . esc_attr( (string) $logo['id'] ) . '">';
			echo '<span class="gq-bioeconomia-footer-logos__thumb">' . wp_kses_post( $logo['thumbnail'] ) . '</span>';
			echo '<span class="gq-bioeconomia-footer-logos__title">' . esc_html( $logo['title'] ) . '</span>';
			echo '<button type="button" class="button-link gq-bioeconomia-footer-logos__move-up">' . esc_html__( 'Subir', 'gq-bioeconomia' ) . '</button>';
			echo '<button type="button" class="button-link gq-bioeconomia-footer-logos__move-down">' . esc_html__( 'Descer', 'gq-bioeconomia' ) . '</button>';
			echo '<button type="button" class="button-link-delete gq-bioeconomia-footer-logos__remove">' . esc_html__( 'Remover', 'gq-bioeconomia' ) . '</button>';
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
	public static function adminItems( array $logo_ids ) {
		$logos = [];

		foreach ( OrderedMedia::forIds( $logo_ids ) as $logo ) {
			$logos[] = [
				'id'        => $logo['id'],
				'title'     => $logo['title'],
				'thumbnail' => wp_get_attachment_image(
					$logo['id'],
					'full',
					false,
					[
						'class' => 'gq-bioeconomia-footer-logos__image',
						'style' => 'max-height: 200px; width: auto; max-width: 100%; object-fit: contain;',
					],
				),
			];
		}

		return $logos;
	}

	/**
	 * Carrega os assets da página Aparência > Footer.
	 *
	 * @param string $hook_suffix Hook atual do admin.
	 * @return void
	 */
	public function enqueueAssets( $hook_suffix ) {
		if ( 'appearance_page_gq-bioeconomia-footer' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_media();
		MediaPicker::registerScript();
		wp_enqueue_script(
			'gq-bioeconomia-footer-admin',
			plugin_dir_url( GQ_BIOECONOMIA_PLUGIN_FILE ) . 'assets/footer-admin.js',
			[ MediaPicker::HANDLE ],
			GQ_BIOECONOMIA_VERSION,
			true,
		);
		wp_add_inline_script(
			'gq-bioeconomia-footer-admin',
			'window.gqBioeconomiaFooterAdmin = ' . wp_json_encode(
				[
					'emptyLabel'    => __( 'Nenhum logótipo selecionado.', 'gq-bioeconomia' ),
					'imageLabel'    => __( 'Logótipo', 'gq-bioeconomia' ),
					'moveUpLabel'   => __( 'Subir', 'gq-bioeconomia' ),
					'moveDownLabel' => __( 'Descer', 'gq-bioeconomia' ),
					'removeLabel'   => __( 'Remover', 'gq-bioeconomia' ),
				],
			) . ';',
			'before',
		);
	}

	/**
	 * Regista o endpoint público dos logótipos do rodapé.
	 *
	 * @return void
	 */
	public function registerRestRoutes() {
		register_rest_route(
			'gq-bioeconomia/v1',
			'/footer-logos',
			[
				'methods'             => 'GET',
				'callback'            => [ self::class, 'logosResponse' ],
				'permission_callback' => '__return_true',
			],
		);
	}

	/**
	 * Devolve os logótipos do rodapé para consumo pelo frontend.
	 *
	 * @return array<int, array{id:int,url:string,alt:string,width:int|null,height:int|null}>
	 */
	public static function logosResponse() {
		$logos = [];

		foreach ( OrderedMedia::forIds( self::logoIds() ) as $logo ) {
			$logos[] = [
				'id'     => $logo['id'],
				'url'    => $logo['url'],
				'alt'    => $logo['alt'],
				'width'  => $logo['width'],
				'height' => $logo['height'],
			];
		}

		return $logos;
	}
}
