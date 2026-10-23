<?php
/**
 * Thematic colors.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

use GetQuick\Bioeconomia\Blocks\EditorAssets;

/**
 * Editorial colors for the Temáticas taxonomy, shared with the Frontend
 * (GraphQL) and the block editor's previews.
 */
final class ThematicColors {

	public const META_KEY = '_gq_bioeconomia_tematica_color';

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerMeta' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'exposeToEditor' ] );
		add_action( 'tematicas_add_form_fields', [ $this, 'renderAddField' ] );
		add_action( 'tematicas_edit_form_fields', [ $this, 'renderEditField' ] );
		add_action( 'created_tematicas', [ $this, 'save' ] );
		add_action( 'edited_tematicas', [ $this, 'save' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueueAssets' ] );
		add_action( 'graphql_register_types', [ $this, 'registerGraphQL' ] );
	}

	/**
	 * Normalize a term color to six-digit hexadecimal, or an empty string.
	 *
	 * @param mixed $value Submitted color.
	 * @return string
	 */
	public static function sanitizeColor( $value ) {
		$color = is_string( $value ) ? sanitize_hex_color( trim( $value ) ) : '';
		if ( ! $color ) {
			return '';
		}
		if ( 4 === strlen( $color ) ) {
			$color = '#' . $color[1] . $color[1] . $color[2] . $color[2] . $color[3] . $color[3];
		}
		return strtolower( $color );
	}

	/**
	 * Register public term metadata; only term editors may write it.
	 *
	 * @return void
	 */
	public function registerMeta() {
		register_term_meta(
			'tematicas',
			self::META_KEY,
			[
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => [ self::class, 'sanitizeColor' ],
				'auth_callback'     => static function ( $allowed, $meta_key, $term_id ) {
					return current_user_can( 'edit_term', (int) $term_id );
				},
			],
		);
	}

	/**
	 * Read the configured color, retaining the agreed identity until first edited.
	 * An explicitly cleared color stays cleared.
	 *
	 * @param WP_Term $term The thematic term.
	 * @return string
	 */
	public static function colorFor( $term ) {
		if ( metadata_exists( 'term', $term->term_id, self::META_KEY ) ) {
			return self::sanitizeColor( get_term_meta( $term->term_id, self::META_KEY, true ) );
		}
		$defaults = [
			'economia-circular'       => '#a4d663',
			'bioeconomia-sustentavel' => '#2ad2c9',
		];
		return $defaults[ $term->slug ] ?? '';
	}

	/**
	 * Render the shared color input on add/edit term screens.
	 *
	 * @param string $color Current color.
	 * @return void
	 */
	public static function renderInput( $color ) {
		wp_nonce_field( 'gq_bioeconomia_tematica_color', 'gq_bioeconomia_tematica_color_nonce' );
		?>
		<input type="text" id="gq-bioeconomia-tematica-color" name="gq_bioeconomia_tematica_color" value="<?php echo esc_attr( $color ); ?>" class="gq-bioeconomia-tematica-color" />
		<p class="description"><?php esc_html_e( 'Cor dos cartões e das ligações desta temática. Sem cor, usa cinza. O contraste e a cor de hover são automáticos.', 'gq-bioeconomia' ); ?></p>
		<?php
	}

	/**
	 * Render the color field when creating a term.
	 *
	 * @return void
	 */
	public function renderAddField() {
		?>
		<div class="form-field">
			<label for="gq-bioeconomia-tematica-color"><?php esc_html_e( 'Cor', 'gq-bioeconomia' ); ?></label>
			<?php self::renderInput( '' ); ?>
		</div>
		<?php
	}

	/**
	 * Render the color field when editing a term.
	 *
	 * @param WP_Term $term The term being edited.
	 * @return void
	 */
	public function renderEditField( $term ) {
		?>
		<tr class="form-field">
			<th scope="row"><label for="gq-bioeconomia-tematica-color"><?php esc_html_e( 'Cor', 'gq-bioeconomia' ); ?></label></th>
			<td><?php self::renderInput( self::colorFor( $term ) ); ?></td>
		</tr>
		<?php
	}

	/**
	 * Save only authorized submissions from the taxonomy form.
	 *
	 * @param int $term_id The edited term ID.
	 * @return void
	 */
	public function save( $term_id ) {
		$taxonomy = get_taxonomy( 'tematicas' );
		if (
			! $taxonomy || ! current_user_can( $taxonomy->cap->edit_terms )
			|| ! isset( $_POST['gq_bioeconomia_tematica_color_nonce'], $_POST['gq_bioeconomia_tematica_color'] )
			|| ! is_string( $_POST['gq_bioeconomia_tematica_color_nonce'] ) || ! is_string( $_POST['gq_bioeconomia_tematica_color'] )
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['gq_bioeconomia_tematica_color_nonce'] ) ), 'gq_bioeconomia_tematica_color' )
		) {
			return;
		}
		$value = trim( sanitize_text_field( wp_unslash( $_POST['gq_bioeconomia_tematica_color'] ) ) );
		$color = self::sanitizeColor( $value );
		if ( '' !== $value && '' === $color ) {
			return;
		}
		update_term_meta( $term_id, self::META_KEY, $color );
		// GQ Design caches the header with the palette its navigation carries.
		do_action( 'getquick_design_flush_layout_cache' );
	}

	/**
	 * Load WordPress's native picker only on this taxonomy's screens.
	 *
	 * @return void
	 */
	public function enqueueAssets() {
		$screen = get_current_screen();
		if ( ! $screen || 'tematicas' !== $screen->taxonomy ) {
			return;
		}
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );
		wp_add_inline_script( 'wp-color-picker', 'jQuery(function($){ $(".gq-bioeconomia-tematica-color").wpColorPicker(); });' );
	}

	/**
	 * Public palette included with each publication's Site extension.
	 *
	 * @return array<int, array{slug: string, color: string}>
	 */
	public static function colors() {
		$terms = get_terms(
			[
				'taxonomy'   => 'tematicas',
				'hide_empty' => false,
			]
		);
		if ( is_wp_error( $terms ) ) {
			return [];
		}
		return array_map(
			static function ( $term ) {
				return [
					'slug'  => $term->slug,
					'color' => self::colorFor( $term ),
				];
			},
			$terms,
		);
	}

	/**
	 * Expose the term palette through the existing page/post extension seam.
	 *
	 * @return void
	 */
	public function registerGraphQL() {
		register_graphql_object_type(
			'GqBioeconomiaThematicColor',
			[
				'fields' => [
					'slug'  => [ 'type' => 'String' ],
					'color' => [ 'type' => 'String' ],
				],
			],
		);
		foreach ( [ 'Page', 'Post' ] as $type ) {
			register_graphql_field(
				$type,
				'gqBioeconomiaThematicColors',
				[
					'type'    => [ 'list_of' => 'GqBioeconomiaThematicColor' ],
					'resolve' => [ self::class, 'colors' ],
				],
			);
		}
	}

	/**
	 * Include the same palette in the Gutenberg preview request, without saving it
	 * as a block attribute.
	 *
	 * @return void
	 */
	public function exposeToEditor() {
		wp_add_inline_script(
			EditorAssets::HANDLE,
			'window.gqBioeconomiaThematicColors = ' . wp_json_encode( self::colors() ) . ';',
			'before',
		);
	}
}
