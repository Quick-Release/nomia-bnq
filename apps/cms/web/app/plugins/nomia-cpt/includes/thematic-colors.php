<?php
/**
 * Editorial colors for the Temáticas taxonomy.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Normalize a term color to six-digit hexadecimal, or an empty string.
 *
 * @param mixed $value Submitted color.
 * @return string
 */
function nomia_cpt_sanitize_thematic_color( $value ) {
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
function nomia_cpt_register_thematic_color_meta() {
	register_term_meta(
		'tematicas',
		'_nomia_tematica_color',
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'nomia_cpt_sanitize_thematic_color',
			'auth_callback'     => static function ( $allowed, $meta_key, $term_id ) {
				return current_user_can( 'edit_term', (int) $term_id );
			},
		),
	);
}

/**
 * Read the configured color, retaining the agreed identity until first edited.
 * An explicitly cleared color stays cleared.
 *
 * @param WP_Term $term The thematic term.
 * @return string
 */
function nomia_cpt_get_thematic_color( $term ) {
	if ( metadata_exists( 'term', $term->term_id, '_nomia_tematica_color' ) ) {
		return nomia_cpt_sanitize_thematic_color( get_term_meta( $term->term_id, '_nomia_tematica_color', true ) );
	}
	$defaults = array(
		'economia-circular'       => '#a4d663',
		'bioeconomia-sustentavel' => '#2ad2c9',
	);
	return $defaults[ $term->slug ] ?? '';
}

/**
 * Render the shared color input on add/edit term screens.
 *
 * @param string $color Current color.
 * @return void
 */
function nomia_cpt_render_thematic_color_input( $color ) {
	wp_nonce_field( 'nomia_tematica_color', 'nomia_tematica_color_nonce' );
	?>
	<input type="text" id="nomia-tematica-color" name="nomia_tematica_color" value="<?php echo esc_attr( $color ); ?>" class="nomia-tematica-color" />
	<p class="description"><?php esc_html_e( 'Cor dos cartões e das ligações desta temática. Sem cor, usa cinza. O contraste e a cor de hover são automáticos.', 'nomia-cpt' ); ?></p>
	<?php
}

/**
 * Render the color field when creating a term.
 *
 * @return void
 */
function nomia_cpt_add_thematic_color_field() {
	?>
	<div class="form-field">
		<label for="nomia-tematica-color"><?php esc_html_e( 'Cor', 'nomia-cpt' ); ?></label>
		<?php nomia_cpt_render_thematic_color_input( '' ); ?>
	</div>
	<?php
}

/**
 * Render the color field when editing a term.
 *
 * @param WP_Term $term The term being edited.
 * @return void
 */
function nomia_cpt_edit_thematic_color_field( $term ) {
	?>
	<tr class="form-field">
		<th scope="row"><label for="nomia-tematica-color"><?php esc_html_e( 'Cor', 'nomia-cpt' ); ?></label></th>
		<td><?php nomia_cpt_render_thematic_color_input( nomia_cpt_get_thematic_color( $term ) ); ?></td>
	</tr>
	<?php
}

/**
 * Save only authorized submissions from the taxonomy form.
 *
 * @param int $term_id The edited term ID.
 * @return void
 */
function nomia_cpt_save_thematic_color( $term_id ) {
	$taxonomy = get_taxonomy( 'tematicas' );
	if (
		! $taxonomy || ! current_user_can( $taxonomy->cap->edit_terms )
		|| ! isset( $_POST['nomia_tematica_color_nonce'], $_POST['nomia_tematica_color'] )
		|| ! is_string( $_POST['nomia_tematica_color_nonce'] ) || ! is_string( $_POST['nomia_tematica_color'] )
		|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nomia_tematica_color_nonce'] ) ), 'nomia_tematica_color' )
	) {
		return;
	}
	$value = trim( sanitize_text_field( wp_unslash( $_POST['nomia_tematica_color'] ) ) );
	$color = nomia_cpt_sanitize_thematic_color( $value );
	if ( '' !== $value && '' === $color ) {
		return;
	}
	update_term_meta( $term_id, '_nomia_tematica_color', $color );
}

/**
 * Load WordPress's native picker only on this taxonomy's screens.
 *
 * @return void
 */
function nomia_cpt_enqueue_thematic_color_assets() {
	$screen = get_current_screen();
	if ( ! $screen || 'tematicas' !== $screen->taxonomy ) {
		return;
	}
	wp_enqueue_style( 'wp-color-picker' );
	wp_enqueue_script( 'wp-color-picker' );
	wp_add_inline_script( 'wp-color-picker', 'jQuery(function($){ $(".nomia-tematica-color").wpColorPicker(); });' );
}

/**
 * Public palette included with each publication's Site extension.
 *
 * @return array<int, array{slug: string, color: string}>
 */
function nomia_cpt_get_thematic_colors() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'tematicas',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $terms ) ) {
		return array();
	}
	return array_map(
		static function ( $term ) {
			return array(
				'slug'  => $term->slug,
				'color' => nomia_cpt_get_thematic_color( $term ),
			);
		},
		$terms,
	);
}

/**
 * Expose the term palette through the existing page/post extension seam.
 *
 * @return void
 */
function nomia_cpt_register_thematic_colors_graphql() {
	register_graphql_object_type(
		'NomiaThematicColor',
		array(
			'fields' => array(
				'slug'  => array( 'type' => 'String' ),
				'color' => array( 'type' => 'String' ),
			),
		),
	);
	foreach ( array( 'Page', 'Post' ) as $type ) {
		register_graphql_field(
			$type,
			'nomiaThematicColors',
			array(
				'type'    => array( 'list_of' => 'NomiaThematicColor' ),
				'resolve' => 'nomia_cpt_get_thematic_colors',
			),
		);
	}
}

/**
 * Include the same palette in the Gutenberg preview request, without saving it
 * as a block attribute.
 *
 * @return void
 */
function nomia_cpt_expose_thematic_colors_to_editor() {
	wp_add_inline_script(
		'getquick-nomia-blocks-editor',
		'window.getquickNomiaThematicColors = ' . wp_json_encode( nomia_cpt_get_thematic_colors() ) . ';',
		'before',
	);
}
