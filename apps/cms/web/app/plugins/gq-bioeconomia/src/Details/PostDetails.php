<?php
/**
 * Post details.
 *
 * @package GetQuick\Bioeconomia\Details
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Details;

use GetQuick\Bioeconomia\Plugin;

/**
 * Typed editorial details of eventos, plataformas, indicadores and podcasts,
 * as post meta edited in a document-settings panel (`assets/details.js`)
 * and exposed through REST and GraphQL.
 */
final class PostDetails {

	/**
	 * Registers the component with WordPress.
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'registerMeta' ] );
		add_action( 'graphql_register_types', [ $this, 'registerGraphQLFields' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueueEditorAssets' ] );
	}

	/**
	 * Describes the legacy attributes and their new public interfaces.
	 *
	 * @return array
	 */
	public static function definitions() {
		return [
			'eventos'     => [
				'graphql' => 'Evento',
				'prefix'  => 'event',
				'title'   => __( 'Detalhes do evento', 'gq-bioeconomia' ),
				'fields'  => [
					'startDate'  => [
						'key'     => 'gq_bioeconomia_event_start_date',
						'label'   => __( 'Data de início', 'gq-bioeconomia' ),
						'control' => 'date',
						'type'    => 'string',
						'default' => '',
					],
					'endDate'    => [
						'key'     => 'gq_bioeconomia_event_end_date',
						'label'   => __( 'Data de fim', 'gq-bioeconomia' ),
						'control' => 'date',
						'type'    => 'string',
						'default' => '',
					],
					'venue'      => [
						'key'     => 'gq_bioeconomia_event_venue',
						'label'   => __( 'Local', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'mapUrl'     => [
						'key'     => 'gq_bioeconomia_event_map_url',
						'label'   => __( 'Link Google Maps', 'gq-bioeconomia' ),
						'control' => 'url',
						'type'    => 'string',
						'default' => '',
					],
					'websiteUrl' => [
						'key'     => 'gq_bioeconomia_event_website_url',
						'label'   => __( 'Website do evento', 'gq-bioeconomia' ),
						'control' => 'url',
						'type'    => 'string',
						'default' => '',
					],
				],
			],
			'plataformas' => [
				'graphql' => 'Plataforma',
				'prefix'  => 'platform',
				'title'   => __( 'Detalhes da plataforma', 'gq-bioeconomia' ),
				'fields'  => [
					'localizacao'          => [
						'key'     => 'gq_bioeconomia_platform_localizacao',
						'label'   => __( 'Localização', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'setorAtividadeTermId' => [
						'key'     => 'gq_bioeconomia_platform_setor_atividade_term_id',
						'label'   => __( 'Setor de atividade', 'gq-bioeconomia' ),
						'control' => 'sector',
						'type'    => 'integer',
						'default' => 0,
					],
					'setorAtividade'       => [
						'key'     => 'gq_bioeconomia_platform_setor_atividade',
						'label'   => __( 'Setor importado', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'tipoEstrategia'       => [
						'key'     => 'gq_bioeconomia_platform_tipo_estrategia',
						'label'   => __( 'Tipo de estratégia', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'subtitle'             => [
						'key'     => 'gq_bioeconomia_platform_subtitle',
						'label'   => __( 'Subtítulo', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
				],
			],
			'indicadores' => [
				'graphql' => 'Indicador',
				'prefix'  => 'graphic',
				'title'   => __( 'Metadados do gráfico', 'gq-bioeconomia' ),
				'fields'  => [
					'internalGraphName'     => [
						'key'     => 'gq_bioeconomia_graphic_internal_graph_name',
						'label'   => __( 'Nome interno', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'sourceName'            => [
						'key'     => 'gq_bioeconomia_graphic_source_name',
						'label'   => __( 'Fonte', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'sourceUrl'             => [
						'key'     => 'gq_bioeconomia_graphic_source_url',
						'label'   => __( 'URL da fonte', 'gq-bioeconomia' ),
						'control' => 'url',
						'type'    => 'string',
						'default' => '',
					],
					'geographicArea'        => [
						'key'     => 'gq_bioeconomia_graphic_geographic_area',
						'label'   => __( 'Área geográfica', 'gq-bioeconomia' ),
						'control' => 'select',
						'type'    => 'string',
						'default' => 'NUTS 0',
					],
					'specialization'        => [
						'key'     => 'gq_bioeconomia_graphic_specialization',
						'label'   => __( 'Especialização', 'gq-bioeconomia' ),
						'control' => 'specialization',
						'type'    => 'array',
						'default' => [],
					],
					'graphicRepresentation' => [
						'key'     => 'gq_bioeconomia_graphic_graphic_representation',
						'label'   => __( 'Representação', 'gq-bioeconomia' ),
						'control' => 'select',
						'type'    => 'string',
						'default' => 'Columns',
					],
					'xAxisLabel'            => [
						'key'     => 'gq_bioeconomia_graphic_x_axis_label',
						'label'   => __( 'Legenda do eixo X', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'xAxisType'             => [
						'key'     => 'gq_bioeconomia_graphic_x_axis_type',
						'label'   => __( 'Tipo do eixo X', 'gq-bioeconomia' ),
						'control' => 'select',
						'type'    => 'string',
						'default' => 'number',
					],
					'xAxisUnit'             => [
						'key'     => 'gq_bioeconomia_graphic_x_axis_unit',
						'label'   => __( 'Unidade do eixo X', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'yAxisLabel'            => [
						'key'     => 'gq_bioeconomia_graphic_y_axis_label',
						'label'   => __( 'Legenda do eixo Y', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'yAxisType'             => [
						'key'     => 'gq_bioeconomia_graphic_y_axis_type',
						'label'   => __( 'Tipo do eixo Y', 'gq-bioeconomia' ),
						'control' => 'select',
						'type'    => 'string',
						'default' => 'number',
					],
					'yAxisUnit'             => [
						'key'     => 'gq_bioeconomia_graphic_y_axis_unit',
						'label'   => __( 'Unidade do eixo Y', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'dataPoints'            => [
						'key'     => 'gq_bioeconomia_graphic_data_points',
						'label'   => __( 'Valores do gráfico', 'gq-bioeconomia' ),
						'control' => 'points',
						'type'    => 'array',
						'default' => [],
					],
				],
			],
			'podcasts'    => [
				'graphql' => 'Podcast',
				'prefix'  => 'podcast',
				'title'   => __( 'Detalhes do podcast', 'gq-bioeconomia' ),
				'fields'  => [
					'podcastUrl'    => [
						'key'     => 'gq_bioeconomia_podcast_podcast_url',
						'label'   => __( 'URL do podcast', 'gq-bioeconomia' ),
						'control' => 'url',
						'type'    => 'string',
						'default' => '',
					],
					'episodeNumber' => [
						'key'     => 'gq_bioeconomia_podcast_episode_number',
						'label'   => __( 'Número do episódio', 'gq-bioeconomia' ),
						'control' => 'text',
						'type'    => 'string',
						'default' => '',
					],
					'abstract'      => [
						'key'     => 'gq_bioeconomia_podcast_abstract',
						'label'   => __( 'Resumo', 'gq-bioeconomia' ),
						'control' => 'textarea',
						'type'    => 'string',
						'default' => '',
					],
				],
			],
		];
	}

	/**
	 * Returns a REST-compatible schema, also used to validate legacy values.
	 *
	 * @param array $field Field definition.
	 * @return array
	 */
	public static function fieldSchema( $field ) {
		$schema = [
			'type'    => $field['type'],
			'default' => $field['default'],
		];
		if ( 'array' === $field['type'] ) {
			$schema['items'] = 'points' === $field['control']
				? [
					'type'                 => 'object',
					'properties'           => [
						'x' => [ 'type' => 'string' ],
						'y' => [ 'type' => 'string' ],
					],
					'required'             => [ 'x', 'y' ],
					'additionalProperties' => false,
				]
				: [ 'type' => 'string' ];
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
	public static function sanitize( $value, $field ) {
		if ( 'integer' === $field['type'] ) {
			return max( 0, (int) $value );
		}
		if ( 'array' === $field['type'] ) {
			if ( ! is_array( $value ) ) {
				return [];
			}
			return array_values(
				array_map(
					static function ( $item ) use ( $field ) {
						return 'points' === $field['control']
						? [
							'x' => sanitize_text_field( $item['x'] ?? '' ),
							'y' => sanitize_text_field( $item['y'] ?? '' ),
						]
						: sanitize_text_field( $item );
					},
					$value,
				)
			);
		}
		if ( 'url' === $field['control'] ) {
			return esc_url_raw( $value, [ 'http', 'https' ] );
		}
		return 'textarea' === $field['control'] ? sanitize_textarea_field( $value ) : sanitize_text_field( $value );
	}

	/**
	 * Registers post-scoped editable REST metadata.
	 *
	 * @return void
	 */
	public function registerMeta() {
		foreach ( self::definitions() as $post_type => $definition ) {
			foreach ( $definition['fields'] as $field ) {
				register_post_meta(
					$post_type,
					$field['key'],
					[
						'type'              => $field['type'],
						'single'            => true,
						'default'           => $field['default'],
						'description'       => $field['label'],
						'show_in_rest'      => [ 'schema' => self::fieldSchema( $field ) ],
						'auth_callback'     => static function ( $allowed, $key, $post_id ) {
							return current_user_can( 'edit_post', (int) $post_id );
						},
						'sanitize_callback' => static function ( $value ) use ( $field ) {
							return self::sanitize( $value, $field );
						},
					]
				);
			}
		}
	}

	/**
	 * Registers typed GraphQL details on the four Site content types.
	 *
	 * @return void
	 */
	public function registerGraphQLFields() {
		register_graphql_object_type(
			'GqBioeconomiaGraphicDataPoint',
			[
				'description' => __( 'Um par de coordenadas do gráfico, conservadas como texto.', 'gq-bioeconomia' ),
				'fields'      => [
					'x' => [ 'type' => 'String' ],
					'y' => [ 'type' => 'String' ],
				],
			]
		);
		foreach ( self::definitions() as $definition ) {
			foreach ( $definition['fields'] as $name => $field ) {
				$type = 'integer' === $field['type'] ? 'Int' : 'String';
				if ( 'array' === $field['type'] ) {
					$type = [ 'list_of' => 'points' === $field['control'] ? 'GqBioeconomiaGraphicDataPoint' : 'String' ];
				}
				register_graphql_field(
					$definition['graphql'],
					'gqBioeconomia' . ucfirst( $definition['prefix'] ) . ucfirst( $name ),
					[
						'type'        => $type,
						'description' => $field['label'],
						'resolve'     => static function ( $post ) use ( $field ) {
							$value = self::sanitize( get_post_meta( $post->ID, $field['key'], true ), $field );
							return '' === $value || 0 === $value ? null : $value;
						},
					]
				);
			}
		}
	}

	/**
	 * Enqueues only the panel belonging to the current content type.
	 *
	 * @return void
	 */
	public function enqueueEditorAssets() {
		$screen      = get_current_screen();
		$definitions = self::definitions();
		if ( ! $screen || ! isset( $definitions[ $screen->post_type ] ) ) {
			return;
		}
		wp_enqueue_script(
			'gq-bioeconomia-details',
			plugin_dir_url( GQ_BIOECONOMIA_PLUGIN_FILE ) . 'assets/details.js',
			[ 'wp-components', 'wp-core-data', 'wp-data', 'wp-editor', 'wp-element', 'wp-i18n', 'wp-plugins' ],
			GQ_BIOECONOMIA_VERSION,
			true,
		);
		wp_set_script_translations( 'gq-bioeconomia-details', Plugin::TEXT_DOMAIN, GQ_BIOECONOMIA_PLUGIN_DIR . '/languages' );
		wp_add_inline_script(
			'gq-bioeconomia-details',
			'window.gqBioeconomiaDetails = ' . wp_json_encode(
				[
					'postType'   => $screen->post_type,
					'definition' => $definitions[ $screen->post_type ],
				]
			) . ';',
			'before'
		);
	}
}
