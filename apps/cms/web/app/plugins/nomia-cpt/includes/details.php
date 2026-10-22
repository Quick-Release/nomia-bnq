<?php
/**
 * Typed editorial details shared by the four legacy Nomia metadata families.
 *
 * @package NomiaCpt
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Describes the legacy attributes and their new public interfaces.
 *
 * @return array
 */
function nomia_cpt_get_details_definitions() {
	return array(
		'eventos'     => array(
			'block'   => 'nomia/event-details',
			'graphql' => 'Evento',
			'prefix'  => 'event',
			'title'   => __( 'Detalhes do evento', 'nomia-cpt' ),
			'fields'  => array(
				'startDate'  => array(
					'key'     => 'nomia_cpt_event_start_date',
					'label'   => __( 'Data de início', 'nomia-cpt' ),
					'control' => 'date',
					'type'    => 'string',
					'default' => '',
				),
				'endDate'    => array(
					'key'     => 'nomia_cpt_event_end_date',
					'label'   => __( 'Data de fim', 'nomia-cpt' ),
					'control' => 'date',
					'type'    => 'string',
					'default' => '',
				),
				'venue'      => array(
					'key'     => 'nomia_cpt_event_venue',
					'label'   => __( 'Local', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'mapUrl'     => array(
					'key'     => 'nomia_cpt_event_map_url',
					'label'   => __( 'Link Google Maps', 'nomia-cpt' ),
					'control' => 'url',
					'type'    => 'string',
					'default' => '',
				),
				'websiteUrl' => array(
					'key'     => 'nomia_cpt_event_website_url',
					'label'   => __( 'Website do evento', 'nomia-cpt' ),
					'control' => 'url',
					'type'    => 'string',
					'default' => '',
				),
			),
		),
		'plataformas' => array(
			'block'   => 'nomia/platform-details',
			'graphql' => 'Plataforma',
			'prefix'  => 'platform',
			'title'   => __( 'Detalhes da plataforma', 'nomia-cpt' ),
			'fields'  => array(
				'localizacao'          => array(
					'key'     => 'nomia_cpt_platform_localizacao',
					'label'   => __( 'Localização', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'setorAtividadeTermId' => array(
					'key'     => 'nomia_cpt_platform_setor_atividade_term_id',
					'label'   => __( 'Setor de atividade', 'nomia-cpt' ),
					'control' => 'sector',
					'type'    => 'integer',
					'default' => 0,
				),
				'setorAtividade'       => array(
					'key'     => 'nomia_cpt_platform_setor_atividade',
					'label'   => __( 'Setor importado', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'tipoEstrategia'       => array(
					'key'     => 'nomia_cpt_platform_tipo_estrategia',
					'label'   => __( 'Tipo de estratégia', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'subtitle'             => array(
					'key'     => 'nomia_cpt_platform_subtitle',
					'label'   => __( 'Subtítulo', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
			),
		),
		'indicadores' => array(
			'block'   => 'nomia/graphic-metadata',
			'graphql' => 'Indicador',
			'prefix'  => 'graphic',
			'title'   => __( 'Metadados do gráfico', 'nomia-cpt' ),
			'fields'  => array(
				'internalGraphName'     => array(
					'key'     => 'nomia_cpt_graphic_internal_graph_name',
					'label'   => __( 'Nome interno', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'sourceName'            => array(
					'key'     => 'nomia_cpt_graphic_source_name',
					'label'   => __( 'Fonte', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'sourceUrl'             => array(
					'key'     => 'nomia_cpt_graphic_source_url',
					'label'   => __( 'URL da fonte', 'nomia-cpt' ),
					'control' => 'url',
					'type'    => 'string',
					'default' => '',
				),
				'geographicArea'        => array(
					'key'     => 'nomia_cpt_graphic_geographic_area',
					'label'   => __( 'Área geográfica', 'nomia-cpt' ),
					'control' => 'select',
					'type'    => 'string',
					'default' => 'NUTS 0',
				),
				'specialization'        => array(
					'key'     => 'nomia_cpt_graphic_specialization',
					'label'   => __( 'Especialização', 'nomia-cpt' ),
					'control' => 'specialization',
					'type'    => 'array',
					'default' => array(),
				),
				'graphicRepresentation' => array(
					'key'     => 'nomia_cpt_graphic_graphic_representation',
					'label'   => __( 'Representação', 'nomia-cpt' ),
					'control' => 'select',
					'type'    => 'string',
					'default' => 'Columns',
				),
				'xAxisLabel'            => array(
					'key'     => 'nomia_cpt_graphic_x_axis_label',
					'label'   => __( 'Legenda do eixo X', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'xAxisType'             => array(
					'key'     => 'nomia_cpt_graphic_x_axis_type',
					'label'   => __( 'Tipo do eixo X', 'nomia-cpt' ),
					'control' => 'select',
					'type'    => 'string',
					'default' => 'number',
				),
				'xAxisUnit'             => array(
					'key'     => 'nomia_cpt_graphic_x_axis_unit',
					'label'   => __( 'Unidade do eixo X', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'yAxisLabel'            => array(
					'key'     => 'nomia_cpt_graphic_y_axis_label',
					'label'   => __( 'Legenda do eixo Y', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'yAxisType'             => array(
					'key'     => 'nomia_cpt_graphic_y_axis_type',
					'label'   => __( 'Tipo do eixo Y', 'nomia-cpt' ),
					'control' => 'select',
					'type'    => 'string',
					'default' => 'number',
				),
				'yAxisUnit'             => array(
					'key'     => 'nomia_cpt_graphic_y_axis_unit',
					'label'   => __( 'Unidade do eixo Y', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'dataPoints'            => array(
					'key'     => 'nomia_cpt_graphic_data_points',
					'label'   => __( 'Valores do gráfico', 'nomia-cpt' ),
					'control' => 'points',
					'type'    => 'array',
					'default' => array(),
				),
			),
		),
		'podcasts'    => array(
			'block'   => 'nomia/podcast-details',
			'graphql' => 'Podcast',
			'prefix'  => 'podcast',
			'title'   => __( 'Detalhes do podcast', 'nomia-cpt' ),
			'fields'  => array(
				'podcastUrl'    => array(
					'key'     => 'nomia_cpt_podcast_podcast_url',
					'label'   => __( 'URL do podcast', 'nomia-cpt' ),
					'control' => 'url',
					'type'    => 'string',
					'default' => '',
				),
				'episodeNumber' => array(
					'key'     => 'nomia_cpt_podcast_episode_number',
					'label'   => __( 'Número do episódio', 'nomia-cpt' ),
					'control' => 'text',
					'type'    => 'string',
					'default' => '',
				),
				'abstract'      => array(
					'key'     => 'nomia_cpt_podcast_abstract',
					'label'   => __( 'Resumo', 'nomia-cpt' ),
					'control' => 'textarea',
					'type'    => 'string',
					'default' => '',
				),
			),
		),
	);
}

/**
 * Returns a REST-compatible schema, also used to validate legacy values.
 *
 * @param array $field Field definition.
 * @return array
 */
function nomia_cpt_details_field_schema( $field ) {
	$schema = array(
		'type'    => $field['type'],
		'default' => $field['default'],
	);
	if ( 'array' === $field['type'] ) {
		$schema['items'] = 'points' === $field['control']
			? array(
				'type'                 => 'object',
				'properties'           => array(
					'x' => array( 'type' => 'string' ),
					'y' => array( 'type' => 'string' ),
				),
				'required'             => array( 'x', 'y' ),
				'additionalProperties' => false,
			)
			: array( 'type' => 'string' );
	}
	return $schema;
}

/**
 * Sanitizes one typed field without filtering incomplete graph rows.
 *
 * @param mixed $value Value to sanitize.
 * @param array $field Field definition.
 * @return mixed
 */
function nomia_cpt_sanitize_detail( $value, $field ) {
	if ( 'integer' === $field['type'] ) {
		return max( 0, (int) $value );
	}
	if ( 'array' === $field['type'] ) {
		if ( ! is_array( $value ) ) {
			return array();
		}
		return array_values(
			array_map(
				static function ( $item ) use ( $field ) {
					return 'points' === $field['control']
					? array(
						'x' => sanitize_text_field( $item['x'] ?? '' ),
						'y' => sanitize_text_field( $item['y'] ?? '' ),
					)
					: sanitize_text_field( $item );
				},
				$value,
			)
		);
	}
	if ( 'url' === $field['control'] ) {
		return esc_url_raw( $value, array( 'http', 'https' ) );
	}
	return 'textarea' === $field['control'] ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
}

/**
 * Registers post-scoped editable REST metadata.
 *
 * @return void
 */
function nomia_cpt_register_details_meta() {
	foreach ( nomia_cpt_get_details_definitions() as $post_type => $definition ) {
		foreach ( $definition['fields'] as $field ) {
			register_post_meta(
				$post_type,
				$field['key'],
				array(
					'type'              => $field['type'],
					'single'            => true,
					'default'           => $field['default'],
					'description'       => $field['label'],
					'show_in_rest'      => array( 'schema' => nomia_cpt_details_field_schema( $field ) ),
					'auth_callback'     => static function ( $allowed, $key, $post_id ) {
						return current_user_can( 'edit_post', (int) $post_id );
					},
					'sanitize_callback' => static function ( $value ) use ( $field ) {
						return nomia_cpt_sanitize_detail( $value, $field );
					},
				)
			);
		}
	}
}

/**
 * Registers typed GraphQL details on the four Site content types.
 *
 * @return void
 */
function nomia_cpt_register_details_graphql_fields() {
	register_graphql_object_type(
		'NomiaGraphicDataPoint',
		array(
			'description' => __( 'Um par de coordenadas do gráfico, conservadas como texto.', 'nomia-cpt' ),
			'fields'      => array(
				'x' => array( 'type' => 'String' ),
				'y' => array( 'type' => 'String' ),
			),
		)
	);
	foreach ( nomia_cpt_get_details_definitions() as $definition ) {
		foreach ( $definition['fields'] as $name => $field ) {
			$type = 'integer' === $field['type'] ? 'Int' : 'String';
			if ( 'array' === $field['type'] ) {
				$type = array( 'list_of' => 'points' === $field['control'] ? 'NomiaGraphicDataPoint' : 'String' );
			}
			register_graphql_field(
				$definition['graphql'],
				'nomia' . ucfirst( $definition['prefix'] ) . ucfirst( $name ),
				array(
					'type'        => $type,
					'description' => $field['label'],
					'resolve'     => static function ( $post ) use ( $field ) {
						$value = nomia_cpt_sanitize_detail( get_post_meta( $post->ID, $field['key'], true ), $field );
						return '' === $value || 0 === $value ? null : $value;
					},
				)
			);
		}
	}
}

/**
 * Enqueues only the panel belonging to the current content type.
 *
 * @return void
 */
function nomia_cpt_enqueue_details_editor_assets() {
	$screen      = get_current_screen();
	$definitions = nomia_cpt_get_details_definitions();
	if ( ! $screen || ! isset( $definitions[ $screen->post_type ] ) ) {
		return;
	}
	wp_enqueue_script(
		'nomia-cpt-details',
		plugin_dir_url( NOMIA_CPT_PLUGIN_FILE ) . 'assets/js/details.js',
		array( 'wp-components', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-plugins' ),
		NOMIA_CPT_PLUGIN_VERSION,
		true,
	);
	wp_add_inline_script(
		'nomia-cpt-details',
		'window.nomiaCptDetails = ' . wp_json_encode(
			array(
				'postType'   => $screen->post_type,
				'definition' => $definitions[ $screen->post_type ],
			)
		) . ';',
		'before'
	);
}
