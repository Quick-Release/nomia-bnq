<?php
/**
 * Generated from the apps/web structured block registration module; the
 * compiled form of every `blocks/<id>/block.json` beside it.
 *
 * @package GetquickNomiaBlocks
 */

// phpcs:ignoreFile -- Generated metadata manifest.
return array(
	'page-hero-static'                      => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/page-hero-static',
		'title'        => 'Cabeçalho página com imagem',
		'category'     => 'getquick-nomia',
		'icon'         => 'cover-image',
		'description'  => 'Hero no topo da página com imagem de fundo, título, subtítulo e botão opcional.',
		'keywords'     => array(
			'hero',
			'cabeçalho',
			'capa',
			'banner',
			'destaque',
		),
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
			'titleTextFontSize'    => array(
				'type' => 'number',
			),
			'subtitleTextFontSize' => array(
				'type' => 'number',
			),
			'titleTextColor'       => array(
				'type'    => 'string',
				'default' => '',
			),
			'subtitleTextColor'    => array(
				'type'    => 'string',
				'default' => '',
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
			),
			'textAlign'            => array(
				'type'    => 'string',
				'default' => 'left',
				'enum'    => array(
					'left',
					'center',
					'right',
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
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'page-hero-media-grid'                  => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/page-hero-media-grid',
		'title'        => 'Hero de página: vídeo e destaques',
		'category'     => 'getquick-nomia',
		'icon'         => 'format-video',
		'description'  => 'Hero com imagem de fundo, duas chamadas com ligação e uma coluna de vídeo.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
			'videoPosterId'              => array(
				'type' => 'number',
			),
			'videoPosterSrc'             => array(
				'type'    => 'string',
				'default' => '',
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
			),
			'shareLabel'                 => array(
				'type'    => 'string',
				'default' => 'Partilhar',
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'page-hero-slider'                      => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/page-hero-slider',
		'title'        => 'Hero de página: slider',
		'category'     => 'getquick-nomia',
		'icon'         => 'images-alt2',
		'description'  => 'Hero em carrossel em que cada diapositivo tem imagem de fundo, título, botão e destaque opcional.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'subtitle',
						'ctaLabel',
						'ctaHref',
						'bgImage',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'bgImageId'         => array(
							'type' => 'number',
						),
						'bgImage'           => array(
							'type'    => 'string',
							'default' => '',
						),
						'spotlightImageId'  => array(
							'type' => 'number',
						),
						'spotlightImageSrc' => array(
							'type'    => 'string',
							'default' => '',
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
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'title-with-label'                      => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/title-with-label',
		'title'        => 'Título com etiqueta',
		'category'     => 'getquick-nomia',
		'icon'         => 'heading',
		'description'  => 'Título de secção numa ou duas linhas, com uma etiqueta curta por cima.',
		'keywords'     => array(
			'título',
			'etiqueta',
			'cabeçalho',
			'secção',
			'eyebrow',
		),
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
				'additionalProperties' => false,
				'properties'           => array(
					'label'      => array(
						'type'                 => 'object',
						'additionalProperties' => false,
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
					),
					'titleLine1' => array(
						'type'                 => 'object',
						'additionalProperties' => false,
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
					),
					'titleLine2' => array(
						'type'                 => 'object',
						'additionalProperties' => false,
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
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'content-list'                          => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/content-list',
		'title'        => 'Lista de conteúdos',
		'category'     => 'getquick-nomia',
		'icon'         => 'playlist-audio',
		'description'  => 'Lista de episódios com imagem, número, data e botões para ouvir e partilhar.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'dateLabel',
						'imageSrc',
						'listenHref',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt'      => array(
							'type'    => 'string',
							'default' => '',
						),
						'listenHref'    => array(
							'type'    => 'string',
							'default' => '',
						),
						'shareUrl'      => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'content-grid-filters'                  => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/content-grid-filters',
		'title'        => 'Grelha de conteúdos com filtros',
		'category'     => 'getquick-nomia',
		'icon'         => 'filter',
		'description'  => 'Grelha de cartões com imagem, título e descrição, que os visitantes filtram por temáticas e setores.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'href',
					),
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
								'required'   => array(
									'slug',
									'name',
								),
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
							),
						),
						'setores'     => array(
							'type'    => 'array',
							'default' => array(),
							'items'   => array(
								'type'       => 'object',
								'required'   => array(
									'slug',
									'name',
								),
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
							),
						),
					),
				),
			),
			'tematicas'     => array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type'       => 'object',
					'required'   => array(
						'slug',
						'name',
					),
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
				),
			),
			'setores'       => array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type'       => 'object',
					'required'   => array(
						'slug',
						'name',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'map-list'                              => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/map-list',
		'title'        => 'Mapa com lista',
		'category'     => 'getquick-nomia',
		'icon'         => 'location',
		'description'  => 'Mapa de regiões com filtros por público e lista dos conteúdos de cada região.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'id',
						'label',
					),
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
				),
			),
			'audiences'     => array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type'       => 'object',
					'required'   => array(
						'id',
						'label',
					),
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
				),
			),
			'items'         => array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type'       => 'object',
					'required'   => array(
						'title',
						'href',
						'imageSrc',
						'regionId',
						'audienceIds',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt'    => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'        => array(
							'type'    => 'string',
							'default' => '',
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'cta-results'                           => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/cta-results',
		'title'        => 'Chamada para resultados',
		'category'     => 'getquick-nomia',
		'icon'         => 'analytics',
		'description'  => 'Resultados do Barómetro em destaque, cada um com ano, valor, unidade, descrição e ligação.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'year',
						'value',
						'unit',
						'description',
						'href',
					),
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
						),
						'nodeId'      => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'two-columns-text-image'                => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/two-columns-text-image',
		'title'        => 'Duas colunas com texto e imagem',
		'category'     => 'getquick-nomia',
		'icon'         => 'align-pull-left',
		'description'  => 'Texto com etiqueta, título e botão ao lado de uma imagem, à esquerda ou à direita.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'image-zoom'                            => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/image-zoom',
		'title'        => 'Imagem com zoom',
		'category'     => 'getquick-nomia',
		'icon'         => 'search',
		'description'  => 'Imagem com legenda opcional que amplia ao passar o rato e abre em ecrã inteiro ao clicar.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
				'imageSrc' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Paisagem de economia circular',
				'caption'  => 'Clique na imagem para abrir em modo ampliado.',
			),
		),
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'home-intro'                            => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/home-intro',
		'title'        => 'Introdução da homepage',
		'category'     => 'getquick-nomia',
		'icon'         => 'admin-home',
		'description'  => 'Introdução com etiqueta, título, texto, botão e imagem grande com legenda opcional.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'sustainable-bioeconomy-dual-cards'     => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/sustainable-bioeconomy-dual-cards',
		'title'        => 'Bioeconomia sustentável: cartões duplos',
		'category'     => 'getquick-nomia',
		'icon'         => 'columns',
		'description'  => 'Cabeçalho com dois cartões lado a lado, cada um com imagem, título e texto.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'body',
						'imageSrc',
					),
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
							'type'    => 'string',
							'default' => '',
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'bioeconomy-phases-band'                => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/bioeconomy-phases-band',
		'title'        => 'Bioeconomia: faixa de fases',
		'category'     => 'getquick-nomia',
		'icon'         => 'editor-ol',
		'description'  => 'Faixa sobre fotografia com as fases da bioeconomia, cada uma com fase, título e texto.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
			'phases'        => array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type'       => 'object',
					'required'   => array(
						'phase',
						'title',
						'body',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'pabs-content-slider'                   => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/pabs-content-slider',
		'title'        => 'PABS: slider de conteúdos',
		'category'     => 'getquick-nomia',
		'icon'         => 'list-view',
		'description'  => 'Conteúdos do PABS em separadores: menu lateral e painel com imagem, título, texto e etiquetas.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'navLabel',
						'title',
						'subtitle',
						'imageSrc',
					),
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
							'type'    => 'string',
							'default' => '',
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
								'required'   => array(
									'label',
									'href',
								),
								'properties' => array(
									'label' => array(
										'type'    => 'string',
										'default' => '',
									),
									'href'  => array(
										'type'    => 'string',
										'default' => '',
									),
								),
							),
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'horizontal-scroll-with-content'        => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/horizontal-scroll-with-content',
		'title'        => 'Scroll horizontal com conteúdo',
		'category'     => 'getquick-nomia',
		'icon'         => 'leftright',
		'description'  => 'Imagens com legenda e ligação em deslocamento horizontal, com título, etiquetas e botão «Ver todos».',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'label',
					),
					'properties' => array(
						'label' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'  => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
			'verTodosHref'  => array(
				'type'    => 'string',
				'default' => '',
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
					'required'   => array(
						'caption',
						'imageSrc',
						'href',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'     => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'circular-economy-overview'             => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/circular-economy-overview',
		'title'        => 'Obsoleto: visão geral da economia circular',
		'category'     => 'getquick-nomia',
		'icon'         => 'warning',
		'description'  => 'Bloco antigo mantido para conteúdos já publicados. Use Scroll horizontal com conteúdo.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'label',
					),
					'properties' => array(
						'label' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'  => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
			'verTodosHref'  => array(
				'type'    => 'string',
				'default' => '',
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
					'required'   => array(
						'caption',
						'imageSrc',
						'href',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'     => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => false,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'circular-economy-overview-slider'      => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/circular-economy-overview-slider',
		'title'        => 'Economia circular: slider geral',
		'category'     => 'getquick-nomia',
		'icon'         => 'slides',
		'description'  => 'Carrossel de imagens com legenda e ligação, precedido de título, etiquetas e botão «Ver todos».',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'label',
					),
					'properties' => array(
						'label' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'  => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
			'verTodosHref'  => array(
				'type'    => 'string',
				'default' => '',
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
					'required'   => array(
						'caption',
						'imageSrc',
						'href',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'     => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'paec-2030'                             => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/paec-2030',
		'title'        => 'PAEC 2030',
		'category'     => 'getquick-nomia',
		'icon'         => 'flag',
		'description'  => 'Secção do PAEC 2030 com título, duas imagens, introdução, objetivos com código e ligação.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'code',
						'description',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'macro-meso-micro'                      => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/macro-meso-micro',
		'title'        => 'Macro, meso e micro',
		'category'     => 'getquick-nomia',
		'icon'         => 'networking',
		'description'  => 'Imagem ao lado de separadores macro, meso e micro, cada um com título, retrato e descrição.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'id',
						'pillLabel',
						'title',
						'portraitSrc',
						'description',
					),
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
							'type'    => 'string',
							'default' => '',
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'circular-economy-indicators-spotlight' => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/circular-economy-indicators-spotlight',
		'title'        => 'Economia circular: indicadores em destaque',
		'category'     => 'getquick-nomia',
		'icon'         => 'star-filled',
		'description'  => 'Indicadores em cartões com imagem, título e texto, em disposição escalonada, com cabeçalho e botão.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'description',
						'imageSrc',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt'    => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'        => array(
							'type'    => 'string',
							'default' => '',
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'circular-economy-resources'            => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/circular-economy-resources',
		'title'        => 'Economia circular: recursos',
		'category'     => 'getquick-nomia',
		'icon'         => 'portfolio',
		'description'  => 'Lista de recursos com cabeçalho e cartões de ligação, cada um com título e descrição.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'description',
						'href',
					),
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
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'indicators-grid'                       => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/indicators-grid',
		'title'        => 'Grelha de indicadores',
		'category'     => 'getquick-nomia',
		'icon'         => 'dashboard',
		'description'  => 'Cartões de indicadores com imagem, título e texto em três colunas, com cabeçalho e botão.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'description',
						'imageSrc',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt'    => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'        => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'opportunities-grid'                    => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/opportunities-grid',
		'title'        => 'Grelha de oportunidades',
		'category'     => 'getquick-nomia',
		'icon'         => 'megaphone',
		'description'  => 'Cabeçalho com texto e mosaicos de ligação para oportunidades, como avisos e publicações.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'label',
						'href',
					),
					'properties' => array(
						'label' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'  => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'multimedia-grid'                       => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/multimedia-grid',
		'title'        => 'Grelha multimédia',
		'category'     => 'getquick-nomia',
		'icon'         => 'admin-media',
		'description'  => 'Grelha de ligações para conteúdos multimédia e ferramentas, com cabeçalho, texto e etiquetas.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'tag',
						'href',
					),
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
						),
					),
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'library-grid'                          => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/library-grid',
		'title'        => 'Grelha da biblioteca',
		'category'     => 'getquick-nomia',
		'icon'         => 'book',
		'description'  => 'Grelha de ligações para a biblioteca com cabeçalho, texto, botão e cartões com imagem e etiqueta.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
						'tag',
						'imageSrc',
						'href',
					),
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
							'type'    => 'string',
							'default' => '',
						),
						'imageAlt' => array(
							'type'    => 'string',
							'default' => '',
						),
						'href'     => array(
							'type'    => 'string',
							'default' => '',
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'events-grid'                           => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/events-grid',
		'title'        => 'Grelha de eventos',
		'category'     => 'getquick-nomia',
		'icon'         => 'calendar-alt',
		'description'  => 'Grelha de eventos com um cartão em destaque e cartões compactos, ligados à página de cada evento.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'title',
					),
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
				),
			),
			'eventBasePath' => array(
				'type'    => 'string',
				'default' => '',
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'event-card-compact'                    => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/event-card-compact',
		'title'        => 'Cartão compacto de evento',
		'category'     => 'getquick-nomia',
		'icon'         => 'calendar',
		'description'  => 'Cartão pequeno de um evento com imagem, título e datas, com ligação para a página do evento.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
				'title'    => 'Evento compacto',
				'slug'     => 'evento-compacto',
				'date'     => '2026-01-01',
				'imageUrl' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Evento',
			),
		),
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'pie-chart-donut'                       => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/pie-chart-donut',
		'title'        => 'Gráfico circular donut',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-pie',
		'description'  => 'Gráfico donut com título, descrição, resumo e legenda, por exemplo para percentagens de reciclagem.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'type',
						'label',
						'value',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'grafico-donut'                         => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/grafico-donut',
		'title'        => 'Gráfico donut',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-pie',
		'description'  => 'Só o gráfico donut com legenda, sem título nem texto, para usar dentro de outros blocos.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'type',
						'label',
						'value',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'energy-consumption-chart'              => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/energy-consumption-chart',
		'title'        => 'Gráfico de consumo de energia',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-line',
		'description'  => 'Gráfico de linhas com o consumo mensal por fonte de energia, com título, descrição e resumo.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'month',
						'solar',
						'eletrica',
						'gas',
					),
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
				),
			),
			'yMax'          => array(
				'type' => 'number',
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'sustainable-consumption-bars'          => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/sustainable-consumption-bars',
		'title'        => 'Barras de consumo sustentável',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-bar',
		'description'  => 'Gráfico de barras verticais com percentagens por grupo, com título, subtítulo e resumo.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'band',
						'label',
						'pct',
					),
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'urban-waste-geo-chart'                 => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/urban-waste-geo-chart',
		'title'        => 'Gráfico geográfico de resíduos urbanos',
		'category'     => 'getquick-nomia',
		'icon'         => 'admin-site-alt3',
		'description'  => 'Barras horizontais de resíduos urbanos por habitante, por região e ano, com anos filtráveis.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'id',
						'label',
						'values',
					),
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
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'resource-productivity-bars'            => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/resource-productivity-bars',
		'title'        => 'Barras de produtividade dos recursos',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-bar',
		'description'  => 'Gráfico de barras anual da produtividade dos recursos, com título, etiqueta, introdução e filtros.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'year',
						'value',
					),
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'resource-productivity-chart'           => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/resource-productivity-chart',
		'title'        => 'Gráfico de produtividade dos recursos',
		'category'     => 'getquick-nomia',
		'icon'         => 'chart-area',
		'description'  => 'Gráfico de barras simples da produtividade dos recursos por ano, com título e etiquetas de filtro.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
					'required'   => array(
						'year',
						'value',
					),
					'properties' => array(
						'year'  => array(
							'type' => 'number',
						),
						'value' => array(
							'type' => 'number',
						),
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
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
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
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'nomia-contact-map'                     => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/nomia-contact-map',
		'title'        => 'Mapa de contacto',
		'category'     => 'getquick-nomia',
		'icon'         => 'location-alt',
		'description'  => 'Mapa Google para páginas de contacto. Cole um link do Google Maps.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
				'mapUrl' => 'https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal',
				'title'  => 'Mapa de contacto',
			),
		),
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'section'                               => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/section',
		'title'        => 'Secção',
		'category'     => 'getquick-nomia',
		'icon'         => 'editor-table',
		'description'  => 'Faixa Nomia que agrupa outros blocos, com fundo e espaçamento próprios.',
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
			'backgroundImageSize'     => array(
				'type'    => 'string',
				'default' => 'cover',
				'enum'    => array(
					'cover',
					'contain',
					'none',
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
			),
			'paddingX'                => array(
				'type'    => 'string',
				'default' => 'default',
				'enum'    => array(
					'none',
					'small',
					'default',
				),
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
				'backgroundColor' => '#00524d',
				'paddingTop'      => 'medium',
				'paddingBottom'   => 'medium',
				'paddingX'        => 'default',
			),
		),
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
	'contact-details-card'                  => array(
		'$schema'      => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'   => 3,
		'name'         => 'getquick/contact-details-card',
		'title'        => 'Cartão de contacto',
		'category'     => 'getquick-nomia',
		'icon'         => 'id',
		'description'  => 'Cartão com ícone, título, detalhes de contacto e botão opcional.',
		'keywords'     => array(
			'contacto',
			'morada',
			'telefone',
			'email',
			'cartão',
		),
		'textdomain'   => 'getquick-nomia-blocks',
		'attributes'   => array(
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
			),
			'buttonLabel'   => array(
				'type'    => 'string',
				'default' => '',
			),
			'buttonHref'    => array(
				'type'    => 'string',
				'default' => '',
			),
			'hideButton'    => array(
				'type'    => 'boolean',
				'default' => false,
			),
		),
		'supports'     => array(
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		),
		'example'      => array(
			'attributes' => array(
				'iconUrl'     => '/images/contact-details-card/adults.svg',
				'title'       => 'Morada',
				'details'     => 'Serviços Centrais Rua da Murgueira, 9<br>Zambujal - Alfragide<br>2610-124 Amadora',
				'buttonLabel' => 'Direções',
				'buttonHref'  => 'https://www.google.com/maps/search/?api=1&query=Rua%20da%20Murgueira%209%20Amadora',
			),
		),
		'editorScript' => 'getquick-nomia-blocks-editor',
		'editorStyle'  => 'getquick-nomia-blocks-editor-style',
	),
);
