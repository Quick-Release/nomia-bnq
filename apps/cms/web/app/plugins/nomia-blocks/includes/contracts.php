<?php
/**
 * Generated from the apps/web structured block registration module.
 * Visual rendering remains owned by apps/web.
 *
 * Titles, descriptions, and keywords are the untranslated Portuguese source:
 * each block's generated `blocks/<id>/block.json` declares the text domain,
 * and WordPress translates that metadata when it registers the block.
 *
 * @package GetquickNomiaBlocks
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the structured block contracts.
 *
 * @return array<int, array<string, mixed>> Contract definitions.
 */
function getquick_nomia_blocks_contracts(): array {
	return array(
		array(
			'blockName'   => 'getquick/page-hero-static',
			'catalogId'   => 'page-hero-static',
			'title'       => 'Cabeçalho página com imagem',
			'description' => 'Hero no topo da página com imagem de fundo, título, subtítulo e botão opcional.',
			'icon'        => 'cover-image',
			'keywords'    => array(
				'hero',
				'cabeçalho',
				'capa',
				'banner',
				'destaque',
			),
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion'        => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'              => array(
					'type'    => 'string',
					'default' => 'page-hero-static',
				),
				'title'                => array(
					'type'    => 'string',
					'default' => '',
				),
				'subtitle'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'showSubtitle'         => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'imageId'              => array(
					'type' => 'number',
				),
				'imageSrc'             => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'imageAlt'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'cta'                  => array(
					'type' => 'object',
				),
				'ctaLabel'             => array(
					'type'    => 'string',
					'default' => '',
				),
				'showCta'              => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'ctaHref'              => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'titleTextFontSize'    => array(
					'type' => 'number',
					'ui'   => array(
						'kind' => 'number',
					),
				),
				'subtitleTextFontSize' => array(
					'type' => 'number',
					'ui'   => array(
						'kind' => 'number',
					),
				),
				'titleTextColor'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'text',
					),
				),
				'subtitleTextColor'    => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'text',
					),
				),
				'subtitleLineHeight'   => array(
					'type'    => 'string',
					'default' => 'default',
					'enum'    => array(
						'default',
						'j',
						'i',
						'h',
						'g',
						'f',
						'e',
						'd',
						'c',
						'b',
						'a',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'textAlign'            => array(
					'type'    => 'string',
					'default' => 'left',
					'enum'    => array(
						'left',
						'center',
						'right',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'height'               => array(
					'type'    => 'string',
					'default' => 'xl',
					'enum'    => array(
						'xs',
						's',
						'm',
						'l',
						'xl',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'paddingTop'           => array(
					'type'    => 'string',
					'default' => 'default',
					'enum'    => array(
						'default',
						'none',
						'small',
						'medium',
						'large',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'paddingBottom'        => array(
					'type'    => 'string',
					'default' => 'default',
					'enum'    => array(
						'default',
						'none',
						'small',
						'medium',
						'large',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
			),
			'example'     => array(
				'title'                => 'Título vindo do WordPress',
				'subtitle'             => 'Subtítulo editável no Gutenberg, renderizado pelo Astro.',
				'imageSrc'             => '/images/home/bioeconomia-intro/hero.jpg',
				'imageAlt'             => 'Muda em mãos',
				'ctaLabel'             => 'Saber Mais',
				'ctaHref'              => '/bioeconomia-sustentavel/',
				'showCta'              => true,
				'showSubtitle'         => true,
				'titleTextFontSize'    => 64,
				'subtitleTextFontSize' => 28,
				'titleTextColor'       => '#ffffff',
				'subtitleTextColor'    => '#e5faf9',
				'textAlign'            => 'left',
				'height'               => 'xl',
			),
		),
		array(
			'blockName'   => 'getquick/page-hero-media-grid',
			'catalogId'   => 'page-hero-media-grid',
			'title'       => 'Hero de página: vídeo e destaques',
			'description' => 'Hero com imagem de fundo, duas chamadas com ligação e uma coluna de vídeo.',
			'icon'        => 'format-video',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion'              => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'                    => array(
					'type'    => 'string',
					'default' => 'page-hero-media-grid',
				),
				'backgroundImageId'          => array(
					'type' => 'number',
				),
				'backgroundImageSrc'         => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'backgroundImageAlt'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'                    => array(
					'type'    => 'string',
					'default' => 'Destaques e video',
				),
				'firstTitle'                 => array(
					'type'    => 'string',
					'default' => '',
				),
				'firstText'                  => array(
					'type'    => 'string',
					'default' => '',
				),
				'firstHref'                  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'firstBackgroundColor'       => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'firstHoverBackgroundColor'  => array(
					'type'    => 'string',
					'default' => '#f2a900',
				),
				'firstTitleColor'            => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'firstTextColor'             => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'firstBorderRadius'          => array(
					'type'    => 'string',
					'default' => '40',
				),
				'secondTitle'                => array(
					'type'    => 'string',
					'default' => '',
				),
				'secondText'                 => array(
					'type'    => 'string',
					'default' => '',
				),
				'secondHref'                 => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'secondBackgroundColor'      => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'secondHoverBackgroundColor' => array(
					'type'    => 'string',
					'default' => '#f2a900',
				),
				'secondTitleColor'           => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'secondTextColor'            => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
				'secondBorderRadius'         => array(
					'type'    => 'string',
					'default' => '40',
				),
				'textVerticalAlign'          => array(
					'type'    => 'string',
					'default' => 'bottom',
					'enum'    => array(
						'top',
						'bottom',
					),
				),
				'videoId'                    => array(
					'type' => 'number',
				),
				'videoSrc'                   => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'videoPosterId'              => array(
					'type' => 'number',
				),
				'videoPosterSrc'             => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'videoTitle'                 => array(
					'type'    => 'string',
					'default' => 'Video',
				),
				'videoBorderRadius'          => array(
					'type'    => 'string',
					'default' => '40',
				),
				'shareHref'                  => array(
					'type'    => 'string',
					'default' => 'https://nomia.getquick.io/partilhar/',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'shareLabel'                 => array(
					'type'    => 'string',
					'default' => 'Partilhar',
				),
			),
			'example'     => array(
				'backgroundImageSrc'         => '/images/hero-carousel/economia-circular.jpg',
				'backgroundImageAlt'         => 'Paisagem de economia circular',
				'firstTitle'                 => 'Explorar',
				'firstText'                  => 'Conheça os principais recursos e iniciativas disponíveis.',
				'firstHref'                  => '/biblioteca/',
				'firstBackgroundColor'       => '#ffffff',
				'firstHoverBackgroundColor'  => '#f2a900',
				'firstBorderRadius'          => '40',
				'secondTitle'                => 'Participar',
				'secondText'                 => 'Acompanhe oportunidades, eventos e avisos relevantes.',
				'secondHref'                 => '/oportunidades/',
				'secondBackgroundColor'      => '#ffffff',
				'secondHoverBackgroundColor' => '#00a9ce',
				'secondBorderRadius'         => '24',
				'textVerticalAlign'          => 'bottom',
				'videoSrc'                   => 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
				'videoPosterSrc'             => '/images/home/bioeconomia-intro/hero.jpg',
				'videoTitle'                 => 'Video de exemplo',
				'videoBorderRadius'          => '40',
			),
		),
		array(
			'blockName'   => 'getquick/page-hero-slider',
			'catalogId'   => 'page-hero-slider',
			'title'       => 'Hero de página: slider',
			'description' => 'Hero em carrossel em que cada diapositivo tem imagem de fundo, título, botão e destaque opcional.',
			'icon'        => 'images-alt2',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'page-hero-slider',
				),
				'slides'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'                => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'             => array(
								'type'    => 'string',
								'default' => '',
							),
							'subtitle'          => array(
								'type'    => 'string',
								'default' => '',
							),
							'ctaLabel'          => array(
								'type'    => 'string',
								'default' => '',
							),
							'ctaHref'           => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'ctaUrl',
								),
								'ui'          => array(
									'kind' => 'url',
								),
							),
							'bgImageId'         => array(
								'type' => 'number',
							),
							'bgImage'           => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageSrc',
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'spotlightImageId'  => array(
								'type' => 'number',
							),
							'spotlightImageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'spotlightImageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'showSpotlight'     => array(
								'type'    => 'boolean',
								'default' => true,
							),
							'spotlightTitle'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'spotlightBody'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'spotlightHref'     => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'spotlightUrl',
								),
								'ui'          => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'title',
							'subtitle',
							'ctaLabel',
							'ctaHref',
							'bgImage',
						),
					),
				),
			),
			'example'     => array(
				'slides' => array(
					array(
						'id'                => 'economia-circular',
						'title'             => 'Economia Circular',
						'subtitle'          => 'Um modelo económico reorganizado focado na coordenação dos sistemas de produção e consumo.',
						'ctaLabel'          => 'Explorar',
						'ctaHref'           => '/economia-circular/',
						'bgImage'           => '/images/hero-carousel/economia-circular.jpg',
						'showSpotlight'     => true,
						'spotlightImageSrc' => '/images/hero-carousel/spotlight-bike.jpg',
						'spotlightTitle'    => 'Design circular',
						'spotlightBody'     => 'Conheça soluções para produtos e processos menos intensivos em recursos.',
						'spotlightHref'     => '/biblioteca/',
					),
					array(
						'id'            => 'barometro',
						'title'         => 'Barómetro',
						'subtitle'      => 'Indicadores e estatísticas para acompanhar a transição ambiental.',
						'ctaLabel'      => 'Explorar indicadores',
						'ctaHref'       => '/indicadores/',
						'bgImage'       => '/images/hero-carousel/barometro.jpg',
						'showSpotlight' => false,
					),
				),
			),
		),
		array(
			'blockName'        => 'getquick/title-with-label',
			'catalogId'        => 'title-with-label',
			'title'            => 'Título com etiqueta',
			'description'      => 'Título de secção numa ou duas linhas, com uma etiqueta curta por cima.',
			'icon'             => 'heading',
			'keywords'         => array(
				'título',
				'etiqueta',
				'cabeçalho',
				'secção',
				'eyebrow',
			),
			'status'           => 'active',
			'inserter'         => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'title-with-label',
				),
				'label'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'titleLine1'    => array(
					'type'    => 'string',
					'default' => '',
				),
				'titleLine2'    => array(
					'type'    => 'string',
					'default' => '',
				),
				'level'         => array(
					'type'    => 'number',
					'default' => 2,
				),
				'typography'    => array(
					'type'                 => 'object',
					'properties'           => array(
						'label'      => array(
							'type'                 => 'object',
							'properties'           => array(
								'size'       => array(
									'type' => 'string',
									'enum' => array(
										'extra',
										'notes',
										'body',
										'body-large',
										'subtitle',
										'h4',
										'h3',
										'h2',
										'h1',
										'large',
										'super',
									),
								),
								'lineHeight' => array(
									'type' => 'string',
									'enum' => array(
										'j',
										'i',
										'h',
										'g',
										'f',
										'e',
										'd',
										'c',
										'b',
										'a',
									),
								),
								'bold'       => array(
									'type' => 'boolean',
								),
								'italic'     => array(
									'type' => 'boolean',
								),
							),
							'additionalProperties' => false,
						),
						'titleLine1' => array(
							'type'                 => 'object',
							'properties'           => array(
								'size'       => array(
									'type' => 'string',
									'enum' => array(
										'extra',
										'notes',
										'body',
										'body-large',
										'subtitle',
										'h4',
										'h3',
										'h2',
										'h1',
										'large',
										'super',
									),
								),
								'lineHeight' => array(
									'type' => 'string',
									'enum' => array(
										'j',
										'i',
										'h',
										'g',
										'f',
										'e',
										'd',
										'c',
										'b',
										'a',
									),
								),
								'bold'       => array(
									'type' => 'boolean',
								),
								'italic'     => array(
									'type' => 'boolean',
								),
							),
							'additionalProperties' => false,
						),
						'titleLine2' => array(
							'type'                 => 'object',
							'properties'           => array(
								'size'       => array(
									'type' => 'string',
									'enum' => array(
										'extra',
										'notes',
										'body',
										'body-large',
										'subtitle',
										'h4',
										'h3',
										'h2',
										'h1',
										'large',
										'super',
									),
								),
								'lineHeight' => array(
									'type' => 'string',
									'enum' => array(
										'j',
										'i',
										'h',
										'g',
										'f',
										'e',
										'd',
										'c',
										'b',
										'a',
									),
								),
								'bold'       => array(
									'type' => 'boolean',
								),
								'italic'     => array(
									'type' => 'boolean',
								),
							),
							'additionalProperties' => false,
						),
					),
					'additionalProperties' => false,
				),
			),
			'example'          => array(
				'label'      => 'Visão geral',
				'titleLine1' => 'A Economia Circular promove um modelo económico reorganizado,',
				'titleLine2' => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'typography' => array(
					'titleLine1' => array(
						'size'       => 'h3',
						'lineHeight' => 'f',
						'bold'       => true,
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/content-list',
			'catalogId'   => 'content-list',
			'title'       => 'Lista de conteúdos',
			'description' => 'Lista de episódios com imagem, número, data e botões para ouvir e partilhar.',
			'icon'        => 'playlist-audio',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'content-list',
				),
				'items'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'episodeNumber' => array(
								'type' => 'number',
							),
							'dateLabel'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'         => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'       => array(
								'type' => 'number',
							),
							'imageSrc'      => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt'      => array(
								'type'    => 'string',
								'default' => '',
							),
							'listenHref'    => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'listenUrl',
								),
								'ui'          => array(
									'kind' => 'url',
								),
							),
							'shareUrl'      => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'title',
							'dateLabel',
							'imageSrc',
							'listenHref',
						),
					),
				),
			),
			'example'     => array(
				'items' => array(
					array(
						'episodeNumber' => 1,
						'dateLabel'     => '2 de Janeiro 2026',
						'title'         => 'Episódio de teste para Gutenberg',
						'imageSrc'      => '/images/home/bioeconomia-intro/hero.jpg',
						'imageAlt'      => 'Imagem de podcast',
						'listenHref'    => '#podcast-1',
						'shareUrl'      => '/podcasts/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/content-grid-filters',
			'catalogId'   => 'content-grid-filters',
			'title'       => 'Grelha de conteúdos com filtros',
			'description' => 'Grelha de cartões com imagem, título e descrição, que os visitantes filtram por temáticas e setores.',
			'icon'        => 'filter',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'content-grid-filters',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'items'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'          => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'slug'        => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
							'date'        => array(
								'type'    => 'string',
								'default' => '',
							),
							'dateLabel'   => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
							'subtitle'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'featured'    => array(
								'type'    => 'boolean',
								'default' => false,
							),
							'imageId'     => array(
								'type' => 'number',
							),
							'imageUrl'    => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'media',
								),
							),
							'imageAlt'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'tematicas'   => array(
								'type'    => 'array',
								'default' => array(),
								'items'   => array(
									'type'       => 'object',
									'properties' => array(
										'slug' => array(
											'type'    => 'string',
											'default' => '',
										),
										'name' => array(
											'type'    => 'string',
											'default' => '',
										),
									),
									'required'   => array(
										'slug',
										'name',
									),
								),
							),
							'setores'     => array(
								'type'    => 'array',
								'default' => array(),
								'items'   => array(
									'type'       => 'object',
									'properties' => array(
										'slug' => array(
											'type'    => 'string',
											'default' => '',
										),
										'name' => array(
											'type'    => 'string',
											'default' => '',
										),
									),
									'required'   => array(
										'slug',
										'name',
									),
								),
							),
						),
						'required'   => array(
							'title',
							'href',
						),
					),
				),
				'tematicas'     => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'slug' => array(
								'type'    => 'string',
								'default' => '',
							),
							'name' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'slug',
							'name',
						),
					),
				),
				'setores'       => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'slug' => array(
								'type'    => 'string',
								'default' => '',
							),
							'name' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'slug',
							'name',
						),
					),
				),
			),
			'example'     => array(
				'heading'   => 'Plataformas',
				'tematicas' => array(
					array(
						'slug' => 'circular',
						'name' => 'Circular',
					),
				),
				'setores'   => array(
					array(
						'slug' => 'industria',
						'name' => 'Indústria',
					),
				),
				'items'     => array(
					array(
						'id'          => 'fixture-platform',
						'title'       => 'Plataforma de teste',
						'slug'        => 'plataforma-de-teste',
						'href'        => '#plataforma',
						'dateLabel'   => '2026',
						'description' => 'Descrição curta da plataforma.',
						'subtitle'    => 'Subtítulo',
						'featured'    => true,
						'imageUrl'    => '/images/hero-carousel/economia-circular.jpg',
						'imageAlt'    => 'Imagem de plataforma',
						'tematicas'   => array(
							array(
								'slug' => 'circular',
								'name' => 'Circular',
							),
						),
						'setores'     => array(
							array(
								'slug' => 'industria',
								'name' => 'Indústria',
							),
						),
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/map-list',
			'catalogId'   => 'map-list',
			'title'       => 'Mapa com lista',
			'description' => 'Mapa de regiões com filtros por público e lista dos conteúdos de cada região.',
			'icon'        => 'location',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'map-list',
				),
				'regions'       => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'id',
							'label',
						),
					),
				),
				'audiences'     => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'id',
							'label',
						),
					),
				),
				'items'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'          => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'excerpt'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'dateLabel'   => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'     => array(
								'type' => 'number',
							),
							'imageSrc'    => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'url',
								),
								'ui'          => array(
									'kind' => 'url',
								),
							),
							'regionId'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'audienceIds' => array(
								'type'    => 'array',
								'default' => array(),
								'items'   => array(
									'type'    => 'string',
									'default' => '',
								),
							),
						),
						'required'   => array(
							'title',
							'href',
							'imageSrc',
							'regionId',
							'audienceIds',
						),
					),
				),
			),
			'example'     => array(
				'regions'   => array(
					array(
						'id'    => 'alentejo',
						'label' => 'Alentejo',
					),
				),
				'audiences' => array(
					array(
						'id'    => 'empresas',
						'label' => 'Empresas',
					),
				),
				'items'     => array(
					array(
						'id'          => 'map-list-fixture',
						'title'       => 'Iniciativa de teste',
						'excerpt'     => 'Resumo curto vindo do WordPress.',
						'href'        => '#iniciativa',
						'dateLabel'   => '2026',
						'imageUrl'    => '/images/hero-carousel/economia-circular.jpg',
						'imageAlt'    => 'Mapa',
						'regionId'    => 'alentejo',
						'audienceIds' => array(
							'empresas',
						),
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/cta-results',
			'catalogId'   => 'cta-results',
			'title'       => 'Chamada para resultados',
			'description' => 'Resultados do Barómetro em destaque, cada um com ano, valor, unidade, descrição e ligação.',
			'icon'        => 'analytics',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'cta-results',
				),
				'results'       => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'year'        => array(
								'type'    => 'string',
								'default' => '',
							),
							'value'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'unit'        => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
							'nodeId'      => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'year',
							'value',
							'unit',
							'description',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'results' => array(
					array(
						'year'        => '2024',
						'value'       => '87,13',
						'unit'        => '%',
						'description' => 'Indicador de teste',
						'href'        => '/indicadores/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/two-columns-text-image',
			'catalogId'   => 'two-columns-text-image',
			'title'       => 'Duas colunas com texto e imagem',
			'description' => 'Texto com etiqueta, título e botão ao lado de uma imagem, à esquerda ou à direita.',
			'icon'        => 'align-pull-left',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'two-columns-text-image',
				),
				'eyebrowLabel'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'accent'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'body'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'ctaHref'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'ctaLabel'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'primaryId'     => array(
					'type' => 'number',
				),
				'primarySrc'    => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'primaryAlt'    => array(
					'type'    => 'string',
					'default' => '',
				),
				'mediaPosition' => array(
					'type'    => 'string',
					'default' => '',
				),
				'hideCta'       => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'hideTaxonomy'  => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
			'example'     => array(
				'eyebrow'       => 'NOMIA',
				'heading'       => 'Two columns text image WP',
				'body'          => 'Texto do WordPress.',
				'ctaHref'       => '/biblioteca/',
				'ctaLabel'      => 'Saber mais',
				'primarySrc'    => '/images/home/bioeconomia-intro/hero.jpg',
				'primaryAlt'    => 'Muda em mãos',
				'mediaPosition' => 'left',
			),
		),
		array(
			'blockName'   => 'getquick/image-zoom',
			'catalogId'   => 'image-zoom',
			'title'       => 'Imagem com zoom',
			'description' => 'Imagem com legenda opcional que amplia ao passar o rato e abre em ecrã inteiro ao clicar.',
			'icon'        => 'search',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'image-zoom',
				),
				'imageId'       => array(
					'type' => 'number',
				),
				'imageSrc'      => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'imageAlt'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'caption'       => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'imageSrc' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Paisagem de economia circular',
				'caption'  => 'Clique na imagem para abrir em modo ampliado.',
			),
		),
		array(
			'blockName'   => 'getquick/home-intro',
			'catalogId'   => 'home-intro',
			'title'       => 'Introdução da homepage',
			'description' => 'Introdução com etiqueta, título, texto, botão e imagem grande com legenda opcional.',
			'icon'        => 'admin-home',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion'  => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'        => array(
					'type'    => 'string',
					'default' => 'home-intro',
				),
				'eyebrowLabel'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'eyebrow'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'accent'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'body'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'ctaHref'        => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'ctaLabel'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'showCta'        => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'showTematica'   => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'showCaption'    => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'heroId'         => array(
					'type' => 'number',
				),
				'heroSrc'        => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'heroAlt'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'captionHeading' => array(
					'type'    => 'string',
					'default' => '',
				),
				'captionBody'    => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'eyebrow'      => 'NOMIA',
				'accent'       => 'ciano',
				'heading'      => 'Bioeconomia para um futuro sustentável',
				'body'         => 'Conheça projetos, iniciativas e recursos para uma economia mais sustentável.',
				'ctaHref'      => '/bioeconomia-sustentavel/',
				'ctaLabel'     => 'Explorar',
				'showCta'      => true,
				'showTematica' => true,
				'showCaption'  => false,
				'heroSrc'      => '/images/home/bioeconomia-intro/hero.jpg',
				'heroAlt'      => 'Muda em mãos',
			),
		),
		array(
			'blockName'   => 'getquick/sustainable-bioeconomy-dual-cards',
			'catalogId'   => 'sustainable-bioeconomy-dual-cards',
			'title'       => 'Bioeconomia sustentável: cartões duplos',
			'description' => 'Cabeçalho com dois cartões lado a lado, cada um com imagem, título e texto.',
			'icon'        => 'columns',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'sustainable-bioeconomy-dual-cards',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'body'      => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'   => array(
								'type' => 'number',
							),
							'imageSrc'  => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'headingId' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'title',
							'body',
							'imageSrc',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow' => 'Bioeconomia sustentável',
				'heading' => 'Uma bioeconomia que regenera recursos e territórios',
				'cards'   => array(
					array(
						'title'    => 'O que é',
						'body'     => 'Conheça os princípios de uma bioeconomia sustentável.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-o-que-e.jpg',
						'imageAlt' => 'Planta em crescimento',
					),
					array(
						'title'    => 'Porque importa',
						'body'     => 'Descubra como a inovação pode apoiar a regeneração.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-porque-importante.jpg',
						'imageAlt' => 'Paisagem natural',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/bioeconomy-phases-band',
			'catalogId'   => 'bioeconomy-phases-band',
			'title'       => 'Bioeconomia: faixa de fases',
			'description' => 'Faixa sobre fotografia com as fases da bioeconomia, cada uma com fase, título e texto.',
			'icon'        => 'editor-ol',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'bioeconomy-phases-band',
				),
				'imageId'       => array(
					'type' => 'number',
				),
				'imageSrc'      => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'phases'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'phase' => array(
								'type'    => 'string',
								'default' => '',
							),
							'title' => array(
								'type'    => 'string',
								'default' => '',
							),
							'body'  => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'phase',
							'title',
							'body',
						),
					),
				),
			),
			'example'     => array(
				'imageSrc' => '/images/bioeconomia-sustentavel/phases-band-background.jpg',
				'phases'   => array(
					array(
						'phase' => '01',
						'title' => 'Produção',
						'body'  => 'Matérias-primas renováveis e processos regenerativos.',
					),
					array(
						'phase' => '02',
						'title' => 'Transformação',
						'body'  => 'Valorização de recursos biológicos em produtos.',
					),
					array(
						'phase' => '03',
						'title' => 'Regeneração',
						'body'  => 'Ciclos produtivos que devolvem valor ao território.',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/pabs-content-slider',
			'catalogId'   => 'pabs-content-slider',
			'title'       => 'PABS: slider de conteúdos',
			'description' => 'Conteúdos do PABS em separadores: menu lateral e painel com imagem, título, texto e etiquetas.',
			'icon'        => 'list-view',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'pabs-content-slider',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'intro'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'panes'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'navLabel' => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'subtitle' => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'  => array(
								'type' => 'number',
							),
							'imageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'tags'     => array(
								'type'    => 'array',
								'default' => array(),
								'items'   => array(
									'type'       => 'object',
									'properties' => array(
										'label' => array(
											'type'    => 'string',
											'default' => '',
										),
										'href'  => array(
											'type'    => 'string',
											'default' => '',
											'ui'      => array(
												'kind' => 'url',
											),
										),
									),
									'required'   => array(
										'label',
										'href',
									),
								),
							),
						),
						'required'   => array(
							'navLabel',
							'title',
							'subtitle',
							'imageSrc',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow' => 'Bioeconomia sustentável',
				'heading' => 'Planos de ação para uma bioeconomia sustentável',
				'intro'   => 'Explore conteúdos e recursos organizados por tema.',
				'panes'   => array(
					array(
						'navLabel' => 'O que é',
						'title'    => 'O que é a bioeconomia sustentável?',
						'subtitle' => 'Um modelo que valoriza recursos biológicos de forma responsável.',
						'imageSrc' => '/images/bioeconomia-sustentavel/pabs-slider-sustentavel.jpg',
						'imageAlt' => 'Paisagem natural',
						'tags'     => array(
							array(
								'label' => 'Conhecer',
								'href'  => '/bioeconomia-sustentavel/',
							),
						),
					),
					array(
						'navLabel' => 'Porque importa',
						'title'    => 'Porque é importante',
						'subtitle' => 'A transição combina inovação, circularidade e regeneração.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-porque-importante.jpg',
						'imageAlt' => 'Recursos naturais',
						'tags'     => array(
							array(
								'label' => 'Explorar',
								'href'  => '/biblioteca/',
							),
						),
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/horizontal-scroll-with-content',
			'catalogId'   => 'horizontal-scroll-with-content',
			'title'       => 'Scroll horizontal com conteúdo',
			'description' => 'Imagens com legenda e ligação em deslocamento horizontal, com título, etiquetas e botão «Ver todos».',
			'icon'        => 'leftright',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'horizontal-scroll-with-content',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine1'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine2'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'pills'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'label',
						),
					),
				),
				'verTodosHref'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'verTodosLabel' => array(
					'type'    => 'string',
					'default' => '',
				),
				'slides'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'caption'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'  => array(
								'type' => 'number',
							),
							'imageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'     => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'caption',
							'imageSrc',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => array(
					array(
						'label' => 'Princípios',
						'href'  => '#principios',
					),
					array(
						'label' => 'Produção',
						'href'  => '#producao',
					),
					array(
						'label' => 'Consumo',
						'href'  => '#consumo',
					),
				),
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => array(
					array(
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					),
					array(
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					),
					array(
						'id'       => 'distribuicao',
						'caption'  => 'Distribuição',
						'imageSrc' => '/images/economia-circular/overview-slider/distribuicao.jpg',
						'imageAlt' => 'Ave em pastagem',
						'href'     => '/economia-circular/distribuicao/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/circular-economy-overview',
			'catalogId'   => 'circular-economy-overview',
			'title'       => 'Obsoleto: visão geral da economia circular',
			'description' => 'Bloco antigo mantido para conteúdos já publicados. Use Scroll horizontal com conteúdo.',
			'icon'        => 'warning',
			'status'      => 'legacy',
			'inserter'    => false,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'circular-economy-overview',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine1'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine2'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'pills'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'label',
						),
					),
				),
				'verTodosHref'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'verTodosLabel' => array(
					'type'    => 'string',
					'default' => '',
				),
				'slides'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'caption'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'  => array(
								'type' => 'number',
							),
							'imageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'     => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'caption',
							'imageSrc',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => array(
					array(
						'label' => 'Princípios',
						'href'  => '#principios',
					),
				),
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => array(
					array(
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					),
					array(
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/circular-economy-overview-slider',
			'catalogId'   => 'circular-economy-overview-slider',
			'title'       => 'Economia circular: slider geral',
			'description' => 'Carrossel de imagens com legenda e ligação, precedido de título, etiquetas e botão «Ver todos».',
			'icon'        => 'slides',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'circular-economy-overview-slider',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine1'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingLine2'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'pills'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'label',
						),
					),
				),
				'verTodosHref'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'verTodosLabel' => array(
					'type'    => 'string',
					'default' => '',
				),
				'slides'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'caption'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'  => array(
								'type' => 'number',
							),
							'imageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'     => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'caption',
							'imageSrc',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => array(
					array(
						'label' => 'Princípios',
						'href'  => '#principios',
					),
				),
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => array(
					array(
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					),
					array(
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/paec-2030',
			'catalogId'   => 'paec-2030',
			'title'       => 'PAEC 2030',
			'description' => 'Secção do PAEC 2030 com título, duas imagens, introdução, objetivos com código e ligação.',
			'icon'        => 'flag',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion'  => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'        => array(
					'type'    => 'string',
					'default' => 'paec-2030',
				),
				'eyebrow'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'imageLeftId'    => array(
					'type' => 'number',
				),
				'imageLeftSrc'   => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'imageLeftAlt'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'imageRightId'   => array(
					'type' => 'number',
				),
				'imageRightSrc'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'imageRightAlt'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'intro'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'saberMaisHref'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'saberMaisLabel' => array(
					'type'    => 'string',
					'default' => '',
				),
				'objectives'     => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'code'        => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'code',
							'description',
						),
					),
				),
			),
			'example'     => array(
				'heading'        => 'PAEC 2030 em teste',
				'imageLeftSrc'   => '/images/economia-circular/paec-2030/split-left.jpg',
				'imageLeftAlt'   => 'Imagem esquerda',
				'imageRightSrc'  => '/images/economia-circular/paec-2030/split-right.jpg',
				'imageRightAlt'  => 'Imagem direita',
				'intro'          => 'Introdução do WordPress.',
				'saberMaisHref'  => '/biblioteca/',
				'saberMaisLabel' => 'Saber mais',
				'objectives'     => array(
					array(
						'code'        => 'OE1',
						'description' => 'Objetivo editável',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/macro-meso-micro',
			'catalogId'   => 'macro-meso-micro',
			'title'       => 'Macro, meso e micro',
			'description' => 'Imagem ao lado de separadores macro, meso e micro, cada um com título, retrato e descrição.',
			'icon'        => 'networking',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'macro-meso-micro',
				),
				'leftImageId'   => array(
					'type' => 'number',
				),
				'leftImageSrc'  => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'leftImageAlt'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'tiers'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'          => array(
								'type'    => 'string',
								'default' => '',
							),
							'pillLabel'   => array(
								'type'    => 'string',
								'default' => '',
							),
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'portraitId'  => array(
								'type' => 'number',
							),
							'portraitSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'portraitUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'portraitAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'id',
							'pillLabel',
							'title',
							'portraitSrc',
							'description',
						),
					),
				),
			),
			'example'     => array(
				'leftImageSrc' => '/images/economia-circular/macro-meso-micro/column-wide.jpg',
				'leftImageAlt' => 'Paisagem para ilustrar os níveis de intervenção',
				'tiers'        => array(
					array(
						'id'          => 'macro',
						'pillLabel'   => 'Macro',
						'title'       => 'Sistemas e políticas',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível macro',
						'description' => 'Transformação à escala das políticas e dos sistemas económicos.',
					),
					array(
						'id'          => 'meso',
						'pillLabel'   => 'Meso',
						'title'       => 'Redes e territórios',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível meso',
						'description' => 'Cooperação entre organizações e comunidades num território.',
					),
					array(
						'id'          => 'micro',
						'pillLabel'   => 'Micro',
						'title'       => 'Produtos e serviços',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível micro',
						'description' => 'Soluções concretas para produtos, serviços e utilizadores.',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/circular-economy-indicators-spotlight',
			'catalogId'   => 'circular-economy-indicators-spotlight',
			'title'       => 'Economia circular: indicadores em destaque',
			'description' => 'Indicadores em cartões com imagem, título e texto, em disposição escalonada, com cabeçalho e botão.',
			'icon'        => 'star-filled',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'circular-economy-indicators-spotlight',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'ctaHref'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'ctaLabel'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'     => array(
								'type' => 'number',
							),
							'imageSrc'    => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
							'layout'      => array(
								'type'    => 'string',
								'default' => 'start',
								'enum'    => array(
									'start',
									'stagger',
								),
							),
						),
						'required'   => array(
							'title',
							'description',
							'imageSrc',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow'  => 'Indicadores',
				'heading'  => 'Dados para compreender a economia circular',
				'ctaHref'  => '/indicadores/',
				'ctaLabel' => 'Ver todos',
				'cards'    => array(
					array(
						'title'       => 'Produtividade dos recursos',
						'description' => 'Acompanhe a eficiência na utilização dos recursos.',
						'imageSrc'    => '/images/economia-circular/indicadores-spotlight/produtividade-recursos.jpg',
						'imageAlt'    => 'Produtividade dos recursos',
						'href'        => '/indicadores/',
					),
					array(
						'title'       => 'Taxa de circularidade',
						'description' => 'Observe a utilização de materiais circulares.',
						'imageSrc'    => '/images/economia-circular/indicadores-spotlight/taxa-circular.jpg',
						'imageAlt'    => 'Taxa de circularidade',
						'href'        => '/indicadores/',
						'layout'      => 'stagger',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/circular-economy-resources',
			'catalogId'   => 'circular-economy-resources',
			'title'       => 'Economia circular: recursos',
			'description' => 'Lista de recursos com cabeçalho e cartões de ligação, cada um com título e descrição.',
			'icon'        => 'portfolio',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'circular-economy-resources',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'title',
							'description',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow' => 'Recursos',
				'heading' => 'Encontre documentos, guias e plataformas úteis',
				'cards'   => array(
					array(
						'title'       => 'Documentos estratégicos',
						'description' => 'Planos, estratégias e documentos de enquadramento.',
						'href'        => '/biblioteca/',
					),
					array(
						'title'       => 'Guias práticos',
						'description' => 'Ferramentas para apoiar a transição circular.',
						'href'        => '/biblioteca/',
					),
					array(
						'title'       => 'Casos de estudo',
						'description' => 'Exemplos nacionais e internacionais de boas práticas.',
						'href'        => '/biblioteca/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/indicators-grid',
			'catalogId'   => 'indicators-grid',
			'title'       => 'Grelha de indicadores',
			'description' => 'Cartões de indicadores com imagem, título e texto em três colunas, com cabeçalho e botão.',
			'icon'        => 'dashboard',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'indicators-grid',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'ctaHref'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'ctaLabel'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'       => array(
								'type'    => 'string',
								'default' => '',
							),
							'description' => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'     => array(
								'type' => 'number',
							),
							'imageSrc'    => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'        => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'title',
							'description',
							'imageSrc',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow'  => 'Indicadores',
				'heading'  => 'Acompanhe a transição para uma economia circular',
				'ctaHref'  => '/indicadores/',
				'ctaLabel' => 'Ver todos',
				'cards'    => array(
					array(
						'title'       => 'Produtividade dos recursos',
						'description' => 'Veja a evolução da eficiência na utilização de recursos.',
						'imageSrc'    => '/images/home/indicators/produtividade-recursos.jpg',
						'imageAlt'    => 'Indicador de produtividade',
						'href'        => '/indicadores/',
					),
					array(
						'title'       => 'Taxa de circularidade',
						'description' => 'Conheça a incorporação de materiais reciclados.',
						'imageSrc'    => '/images/home/indicators/taxa-circular.jpg',
						'imageAlt'    => 'Indicador de circularidade',
						'href'        => '/indicadores/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/opportunities-grid',
			'catalogId'   => 'opportunities-grid',
			'title'       => 'Grelha de oportunidades',
			'description' => 'Cabeçalho com texto e mosaicos de ligação para oportunidades, como avisos e publicações.',
			'icon'        => 'megaphone',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'opportunities-grid',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'body'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'items'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'label',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow' => 'NOMIA',
				'heading' => 'Encontre novas oportunidades',
				'body'    => 'Acompanhe avisos, publicações e iniciativas relevantes.',
				'items'   => array(
					array(
						'label' => 'Avisos',
						'href'  => '/oportunidades/avisos/',
					),
					array(
						'label' => 'Publicações',
						'href'  => '/biblioteca/publicacoes/',
					),
					array(
						'label' => 'Boas práticas',
						'href'  => '/biblioteca/boas-praticas/',
					),
					array(
						'label' => 'Newsletters',
						'href'  => '/newsletters/',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/multimedia-grid',
			'catalogId'   => 'multimedia-grid',
			'title'       => 'Grelha multimédia',
			'description' => 'Grelha de ligações para conteúdos multimédia e ferramentas, com cabeçalho, texto e etiquetas.',
			'icon'        => 'admin-media',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'multimedia-grid',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'body'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title' => array(
								'type'    => 'string',
								'default' => '',
							),
							'tag'   => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
						),
						'required'   => array(
							'title',
							'tag',
							'href',
						),
					),
				),
			),
			'example'     => array(
				'eyebrow' => 'NOMIA',
				'heading' => 'Multimédia e ferramentas',
				'body'    => 'Explore conteúdos e recursos para conhecer projetos, iniciativas e dados.',
				'cards'   => array(
					array(
						'title' => 'Infografias',
						'tag'   => 'Multimédia',
						'href'  => '/infografias/',
					),
					array(
						'title' => 'Vídeos',
						'tag'   => 'Multimédia',
						'href'  => '/videos/',
					),
					array(
						'title' => 'Podcasts',
						'tag'   => 'Multimédia',
						'href'  => '/podcasts/',
					),
					array(
						'title' => 'Galeria',
						'tag'   => 'Multimédia',
						'href'  => '/galeria/',
					),
					array(
						'title' => 'Plataformas',
						'tag'   => 'Ferramenta',
						'href'  => '/ferramentas/plataformas/',
					),
					array(
						'title' => 'Bases de dados',
						'tag'   => 'Ferramenta',
						'href'  => '/bases-de-dados/',
					),
				),
			),
		),
		array(
			'blockName'        => 'getquick/library-grid',
			'catalogId'        => 'library-grid',
			'title'            => 'Grelha da biblioteca',
			'description'      => 'Grelha de ligações para a biblioteca com cabeçalho, texto, botão e cartões com imagem e etiqueta.',
			'icon'             => 'book',
			'status'           => 'active',
			'inserter'         => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'library-grid',
				),
				'eyebrow'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'heading'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'body'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'ctaHref'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'ctaLabel'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'cards'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'tag'      => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'  => array(
								'type' => 'number',
							),
							'imageSrc' => array(
								'type'        => 'string',
								'default'     => '',
								'legacyReads' => array(
									'imageUrl',
								),
								'ui'          => array(
									'kind' => 'media',
								),
							),
							'imageAlt' => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'     => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
							'tagKind'  => array(
								'type'    => 'string',
								'default' => 'economia',
								'enum'    => array(
									'bioeconomia',
									'economia',
								),
							),
						),
						'required'   => array(
							'title',
							'tag',
							'imageSrc',
							'href',
						),
					),
				),
			),
			'example'          => array(
				'eyebrow'  => 'Biblioteca',
				'heading'  => 'Conteúdos para compreender a economia circular',
				'body'     => 'Consulte documentos, publicações e recursos de apoio.',
				'ctaHref'  => '/biblioteca/',
				'ctaLabel' => 'Ver biblioteca',
				'cards'    => array(
					array(
						'title'    => 'Legislação',
						'tag'      => 'Economia',
						'imageSrc' => '/images/biblioteca/legislacao.jpg',
						'imageAlt' => 'Documentos de legislação',
						'href'     => '/biblioteca/legislacao/',
						'tagKind'  => 'economia',
					),
					array(
						'title'    => 'Publicações',
						'tag'      => 'Bioeconomia',
						'imageSrc' => '/images/biblioteca/publicacoes.jpg',
						'imageAlt' => 'Publicações',
						'href'     => '/biblioteca/publicacoes/',
						'tagKind'  => 'bioeconomia',
					),
					array(
						'title'    => 'Boas práticas',
						'tag'      => 'Economia',
						'imageSrc' => '/images/biblioteca/boas-praticas.jpg',
						'imageAlt' => 'Boas práticas',
						'href'     => '/biblioteca/boas-praticas/',
						'tagKind'  => 'economia',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/events-grid',
			'catalogId'   => 'events-grid',
			'title'       => 'Grelha de eventos',
			'description' => 'Grelha de eventos com um cartão em destaque e cartões compactos, ligados à página de cada evento.',
			'icon'        => 'calendar-alt',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'events-grid',
				),
				'events'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'title'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'slug'      => array(
								'type'    => 'string',
								'default' => '',
							),
							'href'      => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'url',
								),
							),
							'date'      => array(
								'type'    => 'string',
								'default' => '',
							),
							'imageId'   => array(
								'type' => 'number',
							),
							'imageUrl'  => array(
								'type'    => 'string',
								'default' => '',
								'ui'      => array(
									'kind' => 'media',
								),
							),
							'imageAlt'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'startDate' => array(
								'type'    => 'string',
								'default' => '',
							),
							'endDate'   => array(
								'type'    => 'string',
								'default' => '',
							),
						),
						'required'   => array(
							'title',
						),
					),
				),
				'eventBasePath' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'events' => array(
					array(
						'title'     => 'Evento de teste',
						'slug'      => 'evento-de-teste',
						'date'      => '2026-01-01',
						'startDate' => '2026-02-01',
						'endDate'   => null,
						'imageUrl'  => '/images/hero-carousel/economia-circular.jpg',
						'imageAlt'  => 'Evento',
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/event-card-compact',
			'catalogId'   => 'event-card-compact',
			'title'       => 'Cartão compacto de evento',
			'description' => 'Cartão pequeno de um evento com imagem, título e datas, com ligação para a página do evento.',
			'icon'        => 'calendar',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'event-card-compact',
				),
				'event'         => array(
					'type' => 'object',
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'slug'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'href'          => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'date'          => array(
					'type'    => 'string',
					'default' => '',
				),
				'imageId'       => array(
					'type' => 'number',
				),
				'imageUrl'      => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'imageAlt'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'startDate'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'endDate'       => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'title'    => 'Evento compacto',
				'slug'     => 'evento-compacto',
				'date'     => '2026-01-01',
				'imageUrl' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Evento',
			),
		),
		array(
			'blockName'   => 'getquick/pie-chart-donut',
			'catalogId'   => 'pie-chart-donut',
			'title'       => 'Gráfico circular donut',
			'description' => 'Gráfico donut com título, descrição, resumo e legenda, por exemplo para percentagens de reciclagem.',
			'icon'        => 'chart-pie',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'pie-chart-donut',
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'description'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'summary'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'slices'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'type'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'value' => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'type',
							'label',
							'value',
						),
					),
				),
			),
			'example'     => array(
				'title'       => 'Reciclagem de resíduos',
				'description' => 'Compare a percentagem de resíduos reciclados por material.',
				'summary'     => 'Os valores apresentados são dados de demonstração do gráfico.',
				'slices'      => array(
					array(
						'type'  => 'vidro',
						'label' => 'Vidro',
						'value' => 30,
					),
					array(
						'type'  => 'metal',
						'label' => 'Metal',
						'value' => 25,
					),
					array(
						'type'  => 'papel',
						'label' => 'Papel',
						'value' => 28,
					),
					array(
						'type'  => 'plastico',
						'label' => 'Plástico',
						'value' => 17,
					),
				),
			),
		),
		array(
			'blockName'        => 'getquick/grafico-donut',
			'catalogId'        => 'grafico-donut',
			'title'            => 'Gráfico donut',
			'description'      => 'Só o gráfico donut com legenda, sem título nem texto, para usar dentro de outros blocos.',
			'icon'             => 'chart-pie',
			'status'           => 'active',
			'inserter'         => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'grafico-donut',
				),
				'slices'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'type'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'value' => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'type',
							'label',
							'value',
						),
					),
				),
			),
			'example'          => array(
				'slices' => array(
					array(
						'type'  => 'vidro',
						'label' => 'Vidro',
						'value' => 30,
					),
					array(
						'type'  => 'metal',
						'label' => 'Metal',
						'value' => 25,
					),
					array(
						'type'  => 'papel',
						'label' => 'Papel',
						'value' => 28,
					),
					array(
						'type'  => 'plastico',
						'label' => 'Plástico',
						'value' => 17,
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/energy-consumption-chart',
			'catalogId'   => 'energy-consumption-chart',
			'title'       => 'Gráfico de consumo de energia',
			'description' => 'Gráfico de linhas com o consumo mensal por fonte de energia, com título, descrição e resumo.',
			'icon'        => 'chart-line',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'energy-consumption-chart',
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'description'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'summary'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'data'          => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'month'    => array(
								'type'    => 'string',
								'default' => '',
							),
							'solar'    => array(
								'type' => 'number',
							),
							'eletrica' => array(
								'type' => 'number',
							),
							'gas'      => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'month',
							'solar',
							'eletrica',
							'gas',
						),
					),
				),
				'yMax'          => array(
					'type' => 'number',
				),
			),
			'example'     => array(
				'title'       => 'Consumo de energia por fonte',
				'description' => 'Compare a evolução mensal das principais fontes de energia.',
				'summary'     => 'Os valores apresentados são dados de demonstração do gráfico.',
				'yMax'        => 100,
				'data'        => array(
					array(
						'month'    => 'Jan',
						'solar'    => 32,
						'eletrica' => 48,
						'gas'      => 20,
					),
					array(
						'month'    => 'Abr',
						'solar'    => 41,
						'eletrica' => 44,
						'gas'      => 15,
					),
					array(
						'month'    => 'Jul',
						'solar'    => 58,
						'eletrica' => 31,
						'gas'      => 11,
					),
					array(
						'month'    => 'Out',
						'solar'    => 45,
						'eletrica' => 39,
						'gas'      => 16,
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/sustainable-consumption-bars',
			'catalogId'   => 'sustainable-consumption-bars',
			'title'       => 'Barras de consumo sustentável',
			'description' => 'Gráfico de barras verticais com percentagens por grupo, com título, subtítulo e resumo.',
			'icon'        => 'chart-bar',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'sustainable-consumption-bars',
				),
				'bars'          => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'band'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'pct'   => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'band',
							'label',
							'pct',
						),
					),
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'subtitle'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'summary'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'headingId'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'sectionId'     => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'title'    => 'Participação em programas de reciclagem',
				'subtitle' => 'Compare a participação por faixa etária.',
				'summary'  => 'Os valores apresentados são dados de demonstração do gráfico.',
				'bars'     => array(
					array(
						'band'  => '18-25',
						'label' => '18–25 anos',
						'pct'   => 20,
					),
					array(
						'band'  => '26-40',
						'label' => '26–40 anos',
						'pct'   => 40,
					),
					array(
						'band'  => '41-60',
						'label' => '41–60 anos',
						'pct'   => 27,
					),
					array(
						'band'  => '60plus',
						'label' => '+60 anos',
						'pct'   => 13,
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/urban-waste-geo-chart',
			'catalogId'   => 'urban-waste-geo-chart',
			'title'       => 'Gráfico geográfico de resíduos urbanos',
			'description' => 'Barras horizontais de resíduos urbanos por habitante, por região e ano, com anos filtráveis.',
			'icon'        => 'admin-site-alt3',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion'   => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'         => array(
					'type'    => 'string',
					'default' => 'urban-waste-geo-chart',
				),
				'title'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'badge'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'intro'           => array(
					'type'    => 'string',
					'default' => '',
				),
				'summary'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'comparisonLabel' => array(
					'type'    => 'string',
					'default' => '',
				),
				'metricLabel'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'periodLabel'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'scopeLabel'      => array(
					'type'    => 'string',
					'default' => '',
				),
				'regions'         => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'id'     => array(
								'type'    => 'string',
								'default' => '',
							),
							'label'  => array(
								'type'    => 'string',
								'default' => '',
							),
							'values' => array(
								'type' => 'object',
							),
						),
						'required'   => array(
							'id',
							'label',
							'values',
						),
					),
				),
			),
			'example'     => array(
				'title'           => 'Resíduos urbanos por habitante',
				'badge'           => '2021–2024',
				'intro'           => 'Comparação ilustrativa por localização geográfica.',
				'summary'         => 'Valores de demonstração para o gráfico.',
				'comparisonLabel' => 'Localização vs resíduos urbanos',
				'metricLabel'     => 'kg/habitante',
				'periodLabel'     => 'Anual',
				'scopeLabel'      => 'Portugal',
				'regions'         => array(
					array(
						'id'     => 'pt',
						'label'  => 'Portugal',
						'values' => array(
							'2021' => 349,
							'2022' => 735,
							'2023' => 876,
							'2024' => 787,
						),
					),
					array(
						'id'     => 'cont',
						'label'  => 'Continente',
						'values' => array(
							'2021' => 680,
							'2022' => 956,
							'2023' => 735,
							'2024' => 720,
						),
					),
					array(
						'id'     => 'norte',
						'label'  => 'Norte',
						'values' => array(
							'2021' => 735,
							'2022' => 1000,
							'2023' => 959,
							'2024' => 915,
						),
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/resource-productivity-bars',
			'catalogId'   => 'resource-productivity-bars',
			'title'       => 'Barras de produtividade dos recursos',
			'description' => 'Gráfico de barras anual da produtividade dos recursos, com título, etiqueta, introdução e filtros.',
			'icon'        => 'chart-bar',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'resource-productivity-bars',
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'badge'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'intro'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'points'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'year'  => array(
								'type' => 'number',
							),
							'label' => array(
								'type'    => 'string',
								'default' => '',
							),
							'value' => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'year',
							'value',
						),
					),
				),
				'yMax'          => array(
					'type' => 'number',
				),
				'metricLabel'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'periodLabel'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'scopeLabel'    => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'title'       => 'Produtividade dos recursos',
				'badge'       => '2020–2023',
				'intro'       => 'A evolução da produtividade dos recursos em Portugal.',
				'metricLabel' => '€/kg',
				'periodLabel' => 'Anual',
				'scopeLabel'  => 'Portugal',
				'yMax'        => 2,
				'points'      => array(
					array(
						'year'  => 2020,
						'label' => '2020',
						'value' => 1.1,
					),
					array(
						'year'  => 2021,
						'label' => '2021',
						'value' => 1.25,
					),
					array(
						'year'  => 2022,
						'label' => '2022',
						'value' => 1.38,
					),
					array(
						'year'  => 2023,
						'label' => '2023',
						'value' => 1.41,
					),
				),
			),
		),
		array(
			'blockName'   => 'getquick/resource-productivity-chart',
			'catalogId'   => 'resource-productivity-chart',
			'title'       => 'Gráfico de produtividade dos recursos',
			'description' => 'Gráfico de barras simples da produtividade dos recursos por ano, com título e etiquetas de filtro.',
			'icon'        => 'chart-area',
			'status'      => 'active',
			'inserter'    => true,
			'attributes'  => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'resource-productivity-chart',
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'filterLabels'  => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'    => 'string',
						'default' => '',
					),
				),
				'points'        => array(
					'type'    => 'array',
					'default' => array(),
					'items'   => array(
						'type'       => 'object',
						'properties' => array(
							'year'  => array(
								'type' => 'number',
							),
							'value' => array(
								'type' => 'number',
							),
						),
						'required'   => array(
							'year',
							'value',
						),
					),
				),
				'yMax'          => array(
					'type' => 'number',
				),
				'locale'        => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'example'     => array(
				'title'        => 'Produtividade dos recursos',
				'filterLabels' => array(
					'Portugal',
					'União Europeia',
				),
				'locale'       => 'pt-PT',
				'points'       => array(
					array(
						'year'  => 2020,
						'value' => 1.1,
					),
					array(
						'year'  => 2021,
						'value' => 1.25,
					),
					array(
						'year'  => 2022,
						'value' => 1.38,
					),
					array(
						'year'  => 2023,
						'value' => 1.41,
					),
				),
			),
		),
		array(
			'blockName'        => 'getquick/nomia-contact-map',
			'catalogId'        => 'nomia-contact-map',
			'title'            => 'Mapa de contacto',
			'description'      => 'Mapa Google para páginas de contacto. Cole um link do Google Maps.',
			'icon'             => 'location-alt',
			'status'           => 'active',
			'inserter'         => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'nomia-contact-map',
				),
				'mapUrl'        => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'align'         => array(
					'type'    => 'string',
					'default' => 'none',
					'enum'    => array(
						'none',
						'left',
						'right',
						'full',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
			),
			'example'          => array(
				'mapUrl' => 'https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal',
				'title'  => 'Mapa de contacto',
			),
		),
		array(
			'blockName'        => 'getquick/section',
			'catalogId'        => 'section',
			'title'            => 'Secção',
			'description'      => 'Faixa Nomia que agrupa outros blocos, com fundo e espaçamento próprios.',
			'icon'             => 'editor-table',
			'status'           => 'active',
			'inserter'         => true,
			'container'        => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion'           => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'                 => array(
					'type'    => 'string',
					'default' => 'section',
				),
				'backgroundColor'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'backgroundImageId'       => array(
					'type' => 'number',
				),
				'backgroundImageSrc'      => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'backgroundImagePosition' => array(
					'type'    => 'string',
					'default' => 'center',
					'enum'    => array(
						'top-left',
						'top',
						'top-right',
						'left',
						'center',
						'right',
						'bottom-left',
						'bottom',
						'bottom-right',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'backgroundImageSize'     => array(
					'type'    => 'string',
					'default' => 'cover',
					'enum'    => array(
						'cover',
						'contain',
						'none',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'paddingTop'              => array(
					'type'    => 'string',
					'default' => 'medium',
					'enum'    => array(
						'none',
						'small',
						'medium',
						'large',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'paddingBottom'           => array(
					'type'    => 'string',
					'default' => 'medium',
					'enum'    => array(
						'none',
						'small',
						'medium',
						'large',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
				'paddingX'                => array(
					'type'    => 'string',
					'default' => 'default',
					'enum'    => array(
						'none',
						'small',
						'default',
					),
					'ui'      => array(
						'kind' => 'select',
					),
				),
			),
			'example'          => array(
				'backgroundColor' => '#00524d',
				'paddingTop'      => 'medium',
				'paddingBottom'   => 'medium',
				'paddingX'        => 'default',
			),
		),
		array(
			'blockName'        => 'getquick/contact-details-card',
			'catalogId'        => 'contact-details-card',
			'title'            => 'Cartão de contacto',
			'description'      => 'Cartão com ícone, título, detalhes de contacto e botão opcional.',
			'icon'             => 'id',
			'keywords'         => array(
				'contacto',
				'morada',
				'telefone',
				'email',
				'cartão',
			),
			'status'           => 'active',
			'inserter'         => true,
			'editorExperience' => 'inline-fields',
			'attributes'       => array(
				'schemaVersion' => array(
					'type'    => 'number',
					'default' => 1,
				),
				'blockId'       => array(
					'type'    => 'string',
					'default' => 'contact-details-card',
				),
				'iconId'        => array(
					'type' => 'number',
				),
				'iconUrl'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'media',
					),
				),
				'iconAlt'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'hideIcon'      => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'title'         => array(
					'type'    => 'string',
					'default' => '',
				),
				'details'       => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'textarea',
					),
				),
				'buttonLabel'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'buttonHref'    => array(
					'type'    => 'string',
					'default' => '',
					'ui'      => array(
						'kind' => 'url',
					),
				),
				'hideButton'    => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
			'example'          => array(
				'iconUrl'     => '/images/contact-details-card/adults.svg',
				'title'       => 'Morada',
				'details'     => 'Serviços Centrais Rua da Murgueira, 9<br>Zambujal - Alfragide<br>2610-124 Amadora',
				'buttonLabel' => 'Direções',
				'buttonHref'  => 'https://www.google.com/maps/search/?api=1&query=Rua%20da%20Murgueira%209%20Amadora',
			),
		),
	);
}
