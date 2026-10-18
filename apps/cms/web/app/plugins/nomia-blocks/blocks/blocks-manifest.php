<?php
/**
 * Generated from the apps/web structured block registration module; the
 * compiled form of every `blocks/<id>/block.json` beside it.
 *
 * @package GetquickNomiaBlocks
 */

// phpcs:ignoreFile -- Generated metadata manifest.
return [
	'page-hero-static'                      => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/page-hero-static',
		'title'       => 'Cabeçalho página com imagem',
		'category'    => 'getquick-design',
		'icon'        => 'cover-image',
		'description' => 'Hero no topo da página com imagem de fundo, título, subtítulo e botão opcional.',
		'keywords'    => [
			'hero',
			'cabeçalho',
			'capa',
			'banner',
			'destaque',
		],
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'        => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'              => [
				'type'    => 'string',
				'default' => 'page-hero-static',
			],
			'title'                => [
				'type'    => 'string',
				'default' => '',
			],
			'subtitle'             => [
				'type'    => 'string',
				'default' => '',
			],
			'showSubtitle'         => [
				'type'    => 'boolean',
				'default' => true,
			],
			'imageId'              => [
				'type' => 'number',
			],
			'imageSrc'             => [
				'type'    => 'string',
				'default' => '',
			],
			'imageAlt'             => [
				'type'    => 'string',
				'default' => '',
			],
			'cta'                  => [
				'type' => 'object',
			],
			'ctaLabel'             => [
				'type'    => 'string',
				'default' => '',
			],
			'showCta'              => [
				'type'    => 'boolean',
				'default' => false,
			],
			'ctaHref'              => [
				'type'    => 'string',
				'default' => '',
			],
			'titleTextFontSize'    => [
				'type' => 'number',
			],
			'subtitleTextFontSize' => [
				'type' => 'number',
			],
			'titleTextColor'       => [
				'type'    => 'string',
				'default' => '',
			],
			'subtitleTextColor'    => [
				'type'    => 'string',
				'default' => '',
			],
			'subtitleLineHeight'   => [
				'type'    => 'string',
				'default' => 'default',
				'enum'    => [
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
				],
			],
			'textAlign'            => [
				'type'    => 'string',
				'default' => 'left',
				'enum'    => [
					'left',
					'center',
					'right',
				],
			],
			'height'               => [
				'type'    => 'string',
				'default' => 'xl',
				'enum'    => [
					'xs',
					's',
					'm',
					'l',
					'xl',
				],
			],
			'paddingTop'           => [
				'type'    => 'string',
				'default' => 'default',
				'enum'    => [
					'default',
					'none',
					'small',
					'medium',
					'large',
				],
			],
			'paddingBottom'        => [
				'type'    => 'string',
				'default' => 'default',
				'enum'    => [
					'default',
					'none',
					'small',
					'medium',
					'large',
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
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
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'page-hero-media-grid'                  => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/page-hero-media-grid',
		'title'       => 'Hero de página: vídeo e destaques',
		'category'    => 'getquick-design',
		'icon'        => 'format-video',
		'description' => 'Hero com imagem de fundo, duas chamadas com ligação e uma coluna de vídeo.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'              => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'                    => [
				'type'    => 'string',
				'default' => 'page-hero-media-grid',
			],
			'backgroundImageId'          => [
				'type' => 'number',
			],
			'backgroundImageSrc'         => [
				'type'    => 'string',
				'default' => '',
			],
			'backgroundImageAlt'         => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'                    => [
				'type'    => 'string',
				'default' => 'Destaques e video',
			],
			'firstTitle'                 => [
				'type'    => 'string',
				'default' => '',
			],
			'firstText'                  => [
				'type'    => 'string',
				'default' => '',
			],
			'firstHref'                  => [
				'type'    => 'string',
				'default' => '',
			],
			'firstBackgroundColor'       => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'firstHoverBackgroundColor'  => [
				'type'    => 'string',
				'default' => '#f2a900',
			],
			'firstTitleColor'            => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'firstTextColor'             => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'firstBorderRadius'          => [
				'type'    => 'string',
				'default' => '40',
			],
			'secondTitle'                => [
				'type'    => 'string',
				'default' => '',
			],
			'secondText'                 => [
				'type'    => 'string',
				'default' => '',
			],
			'secondHref'                 => [
				'type'    => 'string',
				'default' => '',
			],
			'secondBackgroundColor'      => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'secondHoverBackgroundColor' => [
				'type'    => 'string',
				'default' => '#f2a900',
			],
			'secondTitleColor'           => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'secondTextColor'            => [
				'type'    => 'string',
				'default' => '#ffffff',
			],
			'secondBorderRadius'         => [
				'type'    => 'string',
				'default' => '40',
			],
			'textVerticalAlign'          => [
				'type'    => 'string',
				'default' => 'bottom',
				'enum'    => [
					'top',
					'bottom',
				],
			],
			'videoId'                    => [
				'type' => 'number',
			],
			'videoSrc'                   => [
				'type'    => 'string',
				'default' => '',
			],
			'videoPosterId'              => [
				'type' => 'number',
			],
			'videoPosterSrc'             => [
				'type'    => 'string',
				'default' => '',
			],
			'videoTitle'                 => [
				'type'    => 'string',
				'default' => 'Video',
			],
			'videoBorderRadius'          => [
				'type'    => 'string',
				'default' => '40',
			],
			'shareHref'                  => [
				'type'    => 'string',
				'default' => 'https://nomia.getquick.io/partilhar/',
			],
			'shareLabel'                 => [
				'type'    => 'string',
				'default' => 'Partilhar',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
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
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'page-hero-slider'                      => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/page-hero-slider',
		'title'       => 'Hero de página: slider',
		'category'    => 'getquick-design',
		'icon'        => 'images-alt2',
		'description' => 'Hero em carrossel em que cada diapositivo tem imagem de fundo, título, botão e destaque opcional.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'page-hero-slider',
			],
			'slides'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'subtitle',
						'ctaLabel',
						'ctaHref',
						'bgImage',
					],
					'properties' => [
						'id'                => [
							'type'    => 'string',
							'default' => '',
						],
						'title'             => [
							'type'    => 'string',
							'default' => '',
						],
						'subtitle'          => [
							'type'    => 'string',
							'default' => '',
						],
						'ctaLabel'          => [
							'type'    => 'string',
							'default' => '',
						],
						'ctaHref'           => [
							'type'    => 'string',
							'default' => '',
						],
						'bgImageId'         => [
							'type' => 'number',
						],
						'bgImage'           => [
							'type'    => 'string',
							'default' => '',
						],
						'spotlightImageId'  => [
							'type' => 'number',
						],
						'spotlightImageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'showSpotlight'     => [
							'type'    => 'boolean',
							'default' => true,
						],
						'spotlightTitle'    => [
							'type'    => 'string',
							'default' => '',
						],
						'spotlightBody'     => [
							'type'    => 'string',
							'default' => '',
						],
						'spotlightHref'     => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'slides' => [
					[
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
					],
					[
						'id'            => 'barometro',
						'title'         => 'Barómetro',
						'subtitle'      => 'Indicadores e estatísticas para acompanhar a transição ambiental.',
						'ctaLabel'      => 'Explorar indicadores',
						'ctaHref'       => '/indicadores/',
						'bgImage'       => '/images/hero-carousel/barometro.jpg',
						'showSpotlight' => false,
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'title-with-label'                      => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/title-with-label',
		'title'       => 'Título com etiqueta',
		'category'    => 'getquick-design',
		'icon'        => 'heading',
		'description' => 'Título de secção numa ou duas linhas, com uma etiqueta curta por cima.',
		'keywords'    => [
			'título',
			'etiqueta',
			'cabeçalho',
			'secção',
			'eyebrow',
		],
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'title-with-label',
			],
			'label'         => [
				'type'    => 'string',
				'default' => '',
			],
			'titleLine1'    => [
				'type'    => 'string',
				'default' => '',
			],
			'titleLine2'    => [
				'type'    => 'string',
				'default' => '',
			],
			'level'         => [
				'type'    => 'number',
				'default' => 2,
			],
			'typography'    => [
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => [
					'label'      => [
						'type'                 => 'object',
						'additionalProperties' => false,
						'properties'           => [
							'size'       => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'lineHeight' => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'bold'       => [
								'type' => 'boolean',
							],
							'italic'     => [
								'type' => 'boolean',
							],
						],
					],
					'titleLine1' => [
						'type'                 => 'object',
						'additionalProperties' => false,
						'properties'           => [
							'size'       => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'lineHeight' => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'bold'       => [
								'type' => 'boolean',
							],
							'italic'     => [
								'type' => 'boolean',
							],
						],
					],
					'titleLine2' => [
						'type'                 => 'object',
						'additionalProperties' => false,
						'properties'           => [
							'size'       => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'lineHeight' => [
								'type' => 'string',
								'enum' => [
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
								],
							],
							'bold'       => [
								'type' => 'boolean',
							],
							'italic'     => [
								'type' => 'boolean',
							],
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'label'      => 'Visão geral',
				'titleLine1' => 'A Economia Circular promove um modelo económico reorganizado,',
				'titleLine2' => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'typography' => [
					'titleLine1' => [
						'size'       => 'h3',
						'lineHeight' => 'f',
						'bold'       => true,
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'content-list'                          => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/content-list',
		'title'       => 'Lista de conteúdos',
		'category'    => 'getquick-design',
		'icon'        => 'playlist-audio',
		'description' => 'Lista de episódios com imagem, número, data e botões para ouvir e partilhar.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'content-list',
			],
			'items'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'dateLabel',
						'imageSrc',
						'listenHref',
					],
					'properties' => [
						'episodeNumber' => [
							'type' => 'number',
						],
						'dateLabel'     => [
							'type'    => 'string',
							'default' => '',
						],
						'title'         => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'       => [
							'type' => 'number',
						],
						'imageSrc'      => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'      => [
							'type'    => 'string',
							'default' => '',
						],
						'listenHref'    => [
							'type'    => 'string',
							'default' => '',
						],
						'shareUrl'      => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'items' => [
					[
						'episodeNumber' => 1,
						'dateLabel'     => '2 de Janeiro 2026',
						'title'         => 'Episódio de teste para Gutenberg',
						'imageSrc'      => '/images/home/bioeconomia-intro/hero.jpg',
						'imageAlt'      => 'Imagem de podcast',
						'listenHref'    => '#podcast-1',
						'shareUrl'      => '/podcasts/',
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'content-grid-filters'                  => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/content-grid-filters',
		'title'       => 'Grelha de conteúdos com filtros',
		'category'    => 'getquick-design',
		'icon'        => 'filter',
		'description' => 'Grelha de cartões com imagem, título e descrição, que os visitantes filtram por temáticas e setores.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'content-grid-filters',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'items'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'href',
					],
					'properties' => [
						'id'          => [
							'type'    => 'string',
							'default' => '',
						],
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'slug'        => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
						'date'        => [
							'type'    => 'string',
							'default' => '',
						],
						'dateLabel'   => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
						'subtitle'    => [
							'type'    => 'string',
							'default' => '',
						],
						'featured'    => [
							'type'    => 'boolean',
							'default' => false,
						],
						'imageId'     => [
							'type' => 'number',
						],
						'imageUrl'    => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'    => [
							'type'    => 'string',
							'default' => '',
						],
						'tematicas'   => [
							'type'    => 'array',
							'default' => [],
							'items'   => [
								'type'       => 'object',
								'required'   => [
									'slug',
									'name',
								],
								'properties' => [
									'slug' => [
										'type'    => 'string',
										'default' => '',
									],
									'name' => [
										'type'    => 'string',
										'default' => '',
									],
								],
							],
						],
						'setores'     => [
							'type'    => 'array',
							'default' => [],
							'items'   => [
								'type'       => 'object',
								'required'   => [
									'slug',
									'name',
								],
								'properties' => [
									'slug' => [
										'type'    => 'string',
										'default' => '',
									],
									'name' => [
										'type'    => 'string',
										'default' => '',
									],
								],
							],
						],
					],
				],
			],
			'tematicas'     => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'slug',
						'name',
					],
					'properties' => [
						'slug' => [
							'type'    => 'string',
							'default' => '',
						],
						'name' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'setores'       => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'slug',
						'name',
					],
					'properties' => [
						'slug' => [
							'type'    => 'string',
							'default' => '',
						],
						'name' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'heading'   => 'Plataformas',
				'tematicas' => [
					[
						'slug' => 'circular',
						'name' => 'Circular',
					],
				],
				'setores'   => [
					[
						'slug' => 'industria',
						'name' => 'Indústria',
					],
				],
				'items'     => [
					[
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
						'tematicas'   => [
							[
								'slug' => 'circular',
								'name' => 'Circular',
							],
						],
						'setores'     => [
							[
								'slug' => 'industria',
								'name' => 'Indústria',
							],
						],
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'map-list'                              => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/map-list',
		'title'       => 'Mapa com lista',
		'category'    => 'getquick-design',
		'icon'        => 'location',
		'description' => 'Mapa de regiões com filtros por público e lista dos conteúdos de cada região.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'map-list',
			],
			'regions'       => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'id',
						'label',
					],
					'properties' => [
						'id'    => [
							'type'    => 'string',
							'default' => '',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'audiences'     => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'id',
						'label',
					],
					'properties' => [
						'id'    => [
							'type'    => 'string',
							'default' => '',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'items'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'href',
						'imageSrc',
						'regionId',
						'audienceIds',
					],
					'properties' => [
						'id'          => [
							'type'    => 'string',
							'default' => '',
						],
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'excerpt'     => [
							'type'    => 'string',
							'default' => '',
						],
						'dateLabel'   => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'     => [
							'type' => 'number',
						],
						'imageSrc'    => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'    => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
						'regionId'    => [
							'type'    => 'string',
							'default' => '',
						],
						'audienceIds' => [
							'type'    => 'array',
							'default' => [],
							'items'   => [
								'type'    => 'string',
								'default' => '',
							],
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'regions'   => [
					[
						'id'    => 'alentejo',
						'label' => 'Alentejo',
					],
				],
				'audiences' => [
					[
						'id'    => 'empresas',
						'label' => 'Empresas',
					],
				],
				'items'     => [
					[
						'id'          => 'map-list-fixture',
						'title'       => 'Iniciativa de teste',
						'excerpt'     => 'Resumo curto vindo do WordPress.',
						'href'        => '#iniciativa',
						'dateLabel'   => '2026',
						'imageUrl'    => '/images/hero-carousel/economia-circular.jpg',
						'imageAlt'    => 'Mapa',
						'regionId'    => 'alentejo',
						'audienceIds' => [
							'empresas',
						],
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'cta-results'                           => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/cta-results',
		'title'       => 'Chamada para resultados',
		'category'    => 'getquick-design',
		'icon'        => 'analytics',
		'description' => 'Resultados do Barómetro em destaque, cada um com ano, valor, unidade, descrição e ligação.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'cta-results',
			],
			'results'       => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'year',
						'value',
						'unit',
						'description',
						'href',
					],
					'properties' => [
						'year'        => [
							'type'    => 'string',
							'default' => '',
						],
						'value'       => [
							'type'    => 'string',
							'default' => '',
						],
						'unit'        => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
						'nodeId'      => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'results' => [
					[
						'year'        => '2024',
						'value'       => '87,13',
						'unit'        => '%',
						'description' => 'Indicador de teste',
						'href'        => '/indicadores/',
					],
				],
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'two-columns-text-image'                => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/two-columns-text-image',
		'title'       => 'Duas colunas com texto e imagem',
		'category'    => 'getquick-design',
		'icon'        => 'align-pull-left',
		'description' => 'Texto com etiqueta, título e botão ao lado de uma imagem, à esquerda ou à direita.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'two-columns-text-image',
			],
			'eyebrowLabel'  => [
				'type'    => 'string',
				'default' => '',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'accent'        => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'body'          => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaHref'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaLabel'      => [
				'type'    => 'string',
				'default' => '',
			],
			'primaryId'     => [
				'type' => 'number',
			],
			'primarySrc'    => [
				'type'    => 'string',
				'default' => '',
			],
			'primaryAlt'    => [
				'type'    => 'string',
				'default' => '',
			],
			'mediaPosition' => [
				'type'    => 'string',
				'default' => '',
			],
			'hideCta'       => [
				'type'    => 'boolean',
				'default' => false,
			],
			'hideTaxonomy'  => [
				'type'    => 'boolean',
				'default' => false,
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'       => 'NOMIA',
				'heading'       => 'Two columns text image WP',
				'body'          => 'Texto do WordPress.',
				'ctaHref'       => '/biblioteca/',
				'ctaLabel'      => 'Saber mais',
				'primarySrc'    => '/images/home/bioeconomia-intro/hero.jpg',
				'primaryAlt'    => 'Muda em mãos',
				'mediaPosition' => 'left',
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'image-zoom'                            => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/image-zoom',
		'title'       => 'Imagem com zoom',
		'category'    => 'getquick-design',
		'icon'        => 'search',
		'description' => 'Imagem com legenda opcional que amplia ao passar o rato e abre em ecrã inteiro ao clicar.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'image-zoom',
			],
			'imageId'       => [
				'type' => 'number',
			],
			'imageSrc'      => [
				'type'    => 'string',
				'default' => '',
			],
			'imageAlt'      => [
				'type'    => 'string',
				'default' => '',
			],
			'caption'       => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'imageSrc' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Paisagem de economia circular',
				'caption'  => 'Clique na imagem para abrir em modo ampliado.',
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'home-intro'                            => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/home-intro',
		'title'       => 'Introdução da homepage',
		'category'    => 'getquick-design',
		'icon'        => 'admin-home',
		'description' => 'Introdução com etiqueta, título, texto, botão e imagem grande com legenda opcional.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'  => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'        => [
				'type'    => 'string',
				'default' => 'home-intro',
			],
			'eyebrowLabel'   => [
				'type'    => 'string',
				'default' => '',
			],
			'eyebrow'        => [
				'type'    => 'string',
				'default' => '',
			],
			'accent'         => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'        => [
				'type'    => 'string',
				'default' => '',
			],
			'body'           => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaHref'        => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaLabel'       => [
				'type'    => 'string',
				'default' => '',
			],
			'showCta'        => [
				'type'    => 'boolean',
				'default' => false,
			],
			'showTematica'   => [
				'type'    => 'boolean',
				'default' => false,
			],
			'showCaption'    => [
				'type'    => 'boolean',
				'default' => false,
			],
			'heroId'         => [
				'type' => 'number',
			],
			'heroSrc'        => [
				'type'    => 'string',
				'default' => '',
			],
			'heroAlt'        => [
				'type'    => 'string',
				'default' => '',
			],
			'captionHeading' => [
				'type'    => 'string',
				'default' => '',
			],
			'captionBody'    => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
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
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'sustainable-bioeconomy-dual-cards'     => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/sustainable-bioeconomy-dual-cards',
		'title'       => 'Bioeconomia sustentável: cartões duplos',
		'category'    => 'getquick-design',
		'icon'        => 'columns',
		'description' => 'Cabeçalho com dois cartões lado a lado, cada um com imagem, título e texto.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'sustainable-bioeconomy-dual-cards',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'body',
						'imageSrc',
					],
					'properties' => [
						'title'     => [
							'type'    => 'string',
							'default' => '',
						],
						'body'      => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'   => [
							'type' => 'number',
						],
						'imageSrc'  => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'  => [
							'type'    => 'string',
							'default' => '',
						],
						'headingId' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow' => 'Bioeconomia sustentável',
				'heading' => 'Uma bioeconomia que regenera recursos e territórios',
				'cards'   => [
					[
						'title'    => 'O que é',
						'body'     => 'Conheça os princípios de uma bioeconomia sustentável.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-o-que-e.jpg',
						'imageAlt' => 'Planta em crescimento',
					],
					[
						'title'    => 'Porque importa',
						'body'     => 'Descubra como a inovação pode apoiar a regeneração.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-porque-importante.jpg',
						'imageAlt' => 'Paisagem natural',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'bioeconomy-phases-band'                => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/bioeconomy-phases-band',
		'title'       => 'Bioeconomia: faixa de fases',
		'category'    => 'getquick-design',
		'icon'        => 'editor-ol',
		'description' => 'Faixa sobre fotografia com as fases da bioeconomia, cada uma com fase, título e texto.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'bioeconomy-phases-band',
			],
			'imageId'       => [
				'type' => 'number',
			],
			'imageSrc'      => [
				'type'    => 'string',
				'default' => '',
			],
			'phases'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'phase',
						'title',
						'body',
					],
					'properties' => [
						'phase' => [
							'type'    => 'string',
							'default' => '',
						],
						'title' => [
							'type'    => 'string',
							'default' => '',
						],
						'body'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'imageSrc' => '/images/bioeconomia-sustentavel/phases-band-background.jpg',
				'phases'   => [
					[
						'phase' => '01',
						'title' => 'Produção',
						'body'  => 'Matérias-primas renováveis e processos regenerativos.',
					],
					[
						'phase' => '02',
						'title' => 'Transformação',
						'body'  => 'Valorização de recursos biológicos em produtos.',
					],
					[
						'phase' => '03',
						'title' => 'Regeneração',
						'body'  => 'Ciclos produtivos que devolvem valor ao território.',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'pabs-content-slider'                   => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/pabs-content-slider',
		'title'       => 'PABS: slider de conteúdos',
		'category'    => 'getquick-design',
		'icon'        => 'list-view',
		'description' => 'Conteúdos do PABS em separadores: menu lateral e painel com imagem, título, texto e etiquetas.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'pabs-content-slider',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'intro'         => [
				'type'    => 'string',
				'default' => '',
			],
			'panes'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'navLabel',
						'title',
						'subtitle',
						'imageSrc',
					],
					'properties' => [
						'navLabel' => [
							'type'    => 'string',
							'default' => '',
						],
						'title'    => [
							'type'    => 'string',
							'default' => '',
						],
						'subtitle' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'  => [
							'type' => 'number',
						],
						'imageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'tags'     => [
							'type'    => 'array',
							'default' => [],
							'items'   => [
								'type'       => 'object',
								'required'   => [
									'label',
									'href',
								],
								'properties' => [
									'label' => [
										'type'    => 'string',
										'default' => '',
									],
									'href'  => [
										'type'    => 'string',
										'default' => '',
									],
								],
							],
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow' => 'Bioeconomia sustentável',
				'heading' => 'Planos de ação para uma bioeconomia sustentável',
				'intro'   => 'Explore conteúdos e recursos organizados por tema.',
				'panes'   => [
					[
						'navLabel' => 'O que é',
						'title'    => 'O que é a bioeconomia sustentável?',
						'subtitle' => 'Um modelo que valoriza recursos biológicos de forma responsável.',
						'imageSrc' => '/images/bioeconomia-sustentavel/pabs-slider-sustentavel.jpg',
						'imageAlt' => 'Paisagem natural',
						'tags'     => [
							[
								'label' => 'Conhecer',
								'href'  => '/bioeconomia-sustentavel/',
							],
						],
					],
					[
						'navLabel' => 'Porque importa',
						'title'    => 'Porque é importante',
						'subtitle' => 'A transição combina inovação, circularidade e regeneração.',
						'imageSrc' => '/images/bioeconomia-sustentavel/card-porque-importante.jpg',
						'imageAlt' => 'Recursos naturais',
						'tags'     => [
							[
								'label' => 'Explorar',
								'href'  => '/biblioteca/',
							],
						],
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'horizontal-scroll-with-content'        => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/horizontal-scroll-with-content',
		'title'       => 'Scroll horizontal com conteúdo',
		'category'    => 'getquick-design',
		'icon'        => 'leftright',
		'description' => 'Imagens com legenda e ligação em deslocamento horizontal, com título, etiquetas e botão «Ver todos».',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'horizontal-scroll-with-content',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine1'  => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine2'  => [
				'type'    => 'string',
				'default' => '',
			],
			'pills'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'label',
					],
					'properties' => [
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'verTodosHref'  => [
				'type'    => 'string',
				'default' => '',
			],
			'verTodosLabel' => [
				'type'    => 'string',
				'default' => '',
			],
			'slides'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'caption',
						'imageSrc',
						'href',
					],
					'properties' => [
						'id'       => [
							'type'    => 'string',
							'default' => '',
						],
						'caption'  => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'  => [
							'type' => 'number',
						],
						'imageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'     => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => [
					[
						'label' => 'Princípios',
						'href'  => '#principios',
					],
					[
						'label' => 'Produção',
						'href'  => '#producao',
					],
					[
						'label' => 'Consumo',
						'href'  => '#consumo',
					],
				],
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => [
					[
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					],
					[
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					],
					[
						'id'       => 'distribuicao',
						'caption'  => 'Distribuição',
						'imageSrc' => '/images/economia-circular/overview-slider/distribuicao.jpg',
						'imageAlt' => 'Ave em pastagem',
						'href'     => '/economia-circular/distribuicao/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'circular-economy-overview'             => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/circular-economy-overview',
		'title'       => 'Obsoleto: visão geral da economia circular',
		'category'    => 'getquick-design',
		'icon'        => 'warning',
		'description' => 'Bloco antigo mantido para conteúdos já publicados. Use Scroll horizontal com conteúdo.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'circular-economy-overview',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine1'  => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine2'  => [
				'type'    => 'string',
				'default' => '',
			],
			'pills'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'label',
					],
					'properties' => [
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'verTodosHref'  => [
				'type'    => 'string',
				'default' => '',
			],
			'verTodosLabel' => [
				'type'    => 'string',
				'default' => '',
			],
			'slides'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'caption',
						'imageSrc',
						'href',
					],
					'properties' => [
						'id'       => [
							'type'    => 'string',
							'default' => '',
						],
						'caption'  => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'  => [
							'type' => 'number',
						],
						'imageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'     => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => false,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => [
					[
						'label' => 'Princípios',
						'href'  => '#principios',
					],
				],
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => [
					[
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					],
					[
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'circular-economy-overview-slider'      => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/circular-economy-overview-slider',
		'title'       => 'Economia circular: slider geral',
		'category'    => 'getquick-design',
		'icon'        => 'slides',
		'description' => 'Carrossel de imagens com legenda e ligação, precedido de título, etiquetas e botão «Ver todos».',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'circular-economy-overview-slider',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine1'  => [
				'type'    => 'string',
				'default' => '',
			],
			'headingLine2'  => [
				'type'    => 'string',
				'default' => '',
			],
			'pills'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'label',
					],
					'properties' => [
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'verTodosHref'  => [
				'type'    => 'string',
				'default' => '',
			],
			'verTodosLabel' => [
				'type'    => 'string',
				'default' => '',
			],
			'slides'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'caption',
						'imageSrc',
						'href',
					],
					'properties' => [
						'id'       => [
							'type'    => 'string',
							'default' => '',
						],
						'caption'  => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'  => [
							'type' => 'number',
						],
						'imageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'     => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'       => 'Visão geral',
				'headingLine1'  => 'A Economia Circular promove um modelo económico reorganizado,',
				'headingLine2'  => 'através da coordenação dos sistemas de produção e consumo em circuitos fechados.',
				'pills'         => [
					[
						'label' => 'Princípios',
						'href'  => '#principios',
					],
				],
				'verTodosHref'  => '/biblioteca/',
				'verTodosLabel' => 'Ver todos',
				'slides'        => [
					[
						'id'       => 'concecao',
						'caption'  => 'Conceção/design',
						'imageSrc' => '/images/economia-circular/overview-slider/concecao.jpg',
						'imageAlt' => 'Espaço interior com vegetação',
						'href'     => '/economia-circular/concecao-design/',
					],
					[
						'id'       => 'producao',
						'caption'  => 'Produção',
						'imageSrc' => '/images/economia-circular/overview-slider/producao.jpg',
						'imageAlt' => 'Antena parabólica em campo aberto',
						'href'     => '/economia-circular/producao/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'paec-2030'                             => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/paec-2030',
		'title'       => 'PAEC 2030',
		'category'    => 'getquick-design',
		'icon'        => 'flag',
		'description' => 'Secção do PAEC 2030 com título, duas imagens, introdução, objetivos com código e ligação.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'  => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'        => [
				'type'    => 'string',
				'default' => 'paec-2030',
			],
			'eyebrow'        => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'        => [
				'type'    => 'string',
				'default' => '',
			],
			'imageLeftId'    => [
				'type' => 'number',
			],
			'imageLeftSrc'   => [
				'type'    => 'string',
				'default' => '',
			],
			'imageLeftAlt'   => [
				'type'    => 'string',
				'default' => '',
			],
			'imageRightId'   => [
				'type' => 'number',
			],
			'imageRightSrc'  => [
				'type'    => 'string',
				'default' => '',
			],
			'imageRightAlt'  => [
				'type'    => 'string',
				'default' => '',
			],
			'intro'          => [
				'type'    => 'string',
				'default' => '',
			],
			'saberMaisHref'  => [
				'type'    => 'string',
				'default' => '',
			],
			'saberMaisLabel' => [
				'type'    => 'string',
				'default' => '',
			],
			'objectives'     => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'code',
						'description',
					],
					'properties' => [
						'code'        => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'heading'        => 'PAEC 2030 em teste',
				'imageLeftSrc'   => '/images/economia-circular/paec-2030/split-left.jpg',
				'imageLeftAlt'   => 'Imagem esquerda',
				'imageRightSrc'  => '/images/economia-circular/paec-2030/split-right.jpg',
				'imageRightAlt'  => 'Imagem direita',
				'intro'          => 'Introdução do WordPress.',
				'saberMaisHref'  => '/biblioteca/',
				'saberMaisLabel' => 'Saber mais',
				'objectives'     => [
					[
						'code'        => 'OE1',
						'description' => 'Objetivo editável',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'macro-meso-micro'                      => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/macro-meso-micro',
		'title'       => 'Macro, meso e micro',
		'category'    => 'getquick-design',
		'icon'        => 'networking',
		'description' => 'Imagem ao lado de separadores macro, meso e micro, cada um com título, retrato e descrição.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'macro-meso-micro',
			],
			'leftImageId'   => [
				'type' => 'number',
			],
			'leftImageSrc'  => [
				'type'    => 'string',
				'default' => '',
			],
			'leftImageAlt'  => [
				'type'    => 'string',
				'default' => '',
			],
			'tiers'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'id',
						'pillLabel',
						'title',
						'portraitSrc',
						'description',
					],
					'properties' => [
						'id'          => [
							'type'    => 'string',
							'default' => '',
						],
						'pillLabel'   => [
							'type'    => 'string',
							'default' => '',
						],
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'portraitId'  => [
							'type' => 'number',
						],
						'portraitSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'portraitAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'leftImageSrc' => '/images/economia-circular/macro-meso-micro/column-wide.jpg',
				'leftImageAlt' => 'Paisagem para ilustrar os níveis de intervenção',
				'tiers'        => [
					[
						'id'          => 'macro',
						'pillLabel'   => 'Macro',
						'title'       => 'Sistemas e políticas',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível macro',
						'description' => 'Transformação à escala das políticas e dos sistemas económicos.',
					],
					[
						'id'          => 'meso',
						'pillLabel'   => 'Meso',
						'title'       => 'Redes e territórios',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível meso',
						'description' => 'Cooperação entre organizações e comunidades num território.',
					],
					[
						'id'          => 'micro',
						'pillLabel'   => 'Micro',
						'title'       => 'Produtos e serviços',
						'portraitSrc' => '/images/economia-circular/macro-meso-micro/panel-macro.jpg',
						'portraitAlt' => 'Nível micro',
						'description' => 'Soluções concretas para produtos, serviços e utilizadores.',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'circular-economy-indicators-spotlight' => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/circular-economy-indicators-spotlight',
		'title'       => 'Economia circular: indicadores em destaque',
		'category'    => 'getquick-design',
		'icon'        => 'star-filled',
		'description' => 'Indicadores em cartões com imagem, título e texto, em disposição escalonada, com cabeçalho e botão.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'circular-economy-indicators-spotlight',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaHref'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaLabel'      => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'description',
						'imageSrc',
					],
					'properties' => [
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'     => [
							'type' => 'number',
						],
						'imageSrc'    => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'    => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
						'layout'      => [
							'type'    => 'string',
							'default' => 'start',
							'enum'    => [
								'start',
								'stagger',
							],
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'  => 'Indicadores',
				'heading'  => 'Dados para compreender a economia circular',
				'ctaHref'  => '/indicadores/',
				'ctaLabel' => 'Ver todos',
				'cards'    => [
					[
						'title'       => 'Produtividade dos recursos',
						'description' => 'Acompanhe a eficiência na utilização dos recursos.',
						'imageSrc'    => '/images/economia-circular/indicadores-spotlight/produtividade-recursos.jpg',
						'imageAlt'    => 'Produtividade dos recursos',
						'href'        => '/indicadores/',
					],
					[
						'title'       => 'Taxa de circularidade',
						'description' => 'Observe a utilização de materiais circulares.',
						'imageSrc'    => '/images/economia-circular/indicadores-spotlight/taxa-circular.jpg',
						'imageAlt'    => 'Taxa de circularidade',
						'href'        => '/indicadores/',
						'layout'      => 'stagger',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'circular-economy-resources'            => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/circular-economy-resources',
		'title'       => 'Economia circular: recursos',
		'category'    => 'getquick-design',
		'icon'        => 'portfolio',
		'description' => 'Lista de recursos com cabeçalho e cartões de ligação, cada um com título e descrição.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'circular-economy-resources',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'description',
						'href',
					],
					'properties' => [
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow' => 'Recursos',
				'heading' => 'Encontre documentos, guias e plataformas úteis',
				'cards'   => [
					[
						'title'       => 'Documentos estratégicos',
						'description' => 'Planos, estratégias e documentos de enquadramento.',
						'href'        => '/biblioteca/',
					],
					[
						'title'       => 'Guias práticos',
						'description' => 'Ferramentas para apoiar a transição circular.',
						'href'        => '/biblioteca/',
					],
					[
						'title'       => 'Casos de estudo',
						'description' => 'Exemplos nacionais e internacionais de boas práticas.',
						'href'        => '/biblioteca/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'indicators-grid'                       => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/indicators-grid',
		'title'       => 'Grelha de indicadores',
		'category'    => 'getquick-design',
		'icon'        => 'dashboard',
		'description' => 'Cartões de indicadores com imagem, título e texto em três colunas, com cabeçalho e botão.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'indicators-grid',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaHref'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaLabel'      => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'description',
						'imageSrc',
					],
					'properties' => [
						'title'       => [
							'type'    => 'string',
							'default' => '',
						],
						'description' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'     => [
							'type' => 'number',
						],
						'imageSrc'    => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'    => [
							'type'    => 'string',
							'default' => '',
						],
						'href'        => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'  => 'Indicadores',
				'heading'  => 'Acompanhe a transição para uma economia circular',
				'ctaHref'  => '/indicadores/',
				'ctaLabel' => 'Ver todos',
				'cards'    => [
					[
						'title'       => 'Produtividade dos recursos',
						'description' => 'Veja a evolução da eficiência na utilização de recursos.',
						'imageSrc'    => '/images/home/indicators/produtividade-recursos.jpg',
						'imageAlt'    => 'Indicador de produtividade',
						'href'        => '/indicadores/',
					],
					[
						'title'       => 'Taxa de circularidade',
						'description' => 'Conheça a incorporação de materiais reciclados.',
						'imageSrc'    => '/images/home/indicators/taxa-circular.jpg',
						'imageAlt'    => 'Indicador de circularidade',
						'href'        => '/indicadores/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'opportunities-grid'                    => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/opportunities-grid',
		'title'       => 'Grelha de oportunidades',
		'category'    => 'getquick-design',
		'icon'        => 'megaphone',
		'description' => 'Cabeçalho com texto e mosaicos de ligação para oportunidades, como avisos e publicações.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'opportunities-grid',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'body'          => [
				'type'    => 'string',
				'default' => '',
			],
			'items'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'label',
						'href',
					],
					'properties' => [
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow' => 'NOMIA',
				'heading' => 'Encontre novas oportunidades',
				'body'    => 'Acompanhe avisos, publicações e iniciativas relevantes.',
				'items'   => [
					[
						'label' => 'Avisos',
						'href'  => '/oportunidades/avisos/',
					],
					[
						'label' => 'Publicações',
						'href'  => '/biblioteca/publicacoes/',
					],
					[
						'label' => 'Boas práticas',
						'href'  => '/biblioteca/boas-praticas/',
					],
					[
						'label' => 'Newsletters',
						'href'  => '/newsletters/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'multimedia-grid'                       => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/multimedia-grid',
		'title'       => 'Grelha multimédia',
		'category'    => 'getquick-design',
		'icon'        => 'admin-media',
		'description' => 'Grelha de ligações para conteúdos multimédia e ferramentas, com cabeçalho, texto e etiquetas.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'multimedia-grid',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'body'          => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'tag',
						'href',
					],
					'properties' => [
						'title' => [
							'type'    => 'string',
							'default' => '',
						],
						'tag'   => [
							'type'    => 'string',
							'default' => '',
						],
						'href'  => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow' => 'NOMIA',
				'heading' => 'Multimédia e ferramentas',
				'body'    => 'Explore conteúdos e recursos para conhecer projetos, iniciativas e dados.',
				'cards'   => [
					[
						'title' => 'Infografias',
						'tag'   => 'Multimédia',
						'href'  => '/infografias/',
					],
					[
						'title' => 'Vídeos',
						'tag'   => 'Multimédia',
						'href'  => '/videos/',
					],
					[
						'title' => 'Podcasts',
						'tag'   => 'Multimédia',
						'href'  => '/podcasts/',
					],
					[
						'title' => 'Galeria',
						'tag'   => 'Multimédia',
						'href'  => '/galeria/',
					],
					[
						'title' => 'Plataformas',
						'tag'   => 'Ferramenta',
						'href'  => '/ferramentas/plataformas/',
					],
					[
						'title' => 'Bases de dados',
						'tag'   => 'Ferramenta',
						'href'  => '/bases-de-dados/',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'library-grid'                          => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/library-grid',
		'title'       => 'Grelha da biblioteca',
		'category'    => 'getquick-design',
		'icon'        => 'book',
		'description' => 'Grelha de ligações para a biblioteca com cabeçalho, texto, botão e cartões com imagem e etiqueta.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'library-grid',
			],
			'eyebrow'       => [
				'type'    => 'string',
				'default' => '',
			],
			'heading'       => [
				'type'    => 'string',
				'default' => '',
			],
			'body'          => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaHref'       => [
				'type'    => 'string',
				'default' => '',
			],
			'ctaLabel'      => [
				'type'    => 'string',
				'default' => '',
			],
			'cards'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
						'tag',
						'imageSrc',
						'href',
					],
					'properties' => [
						'title'    => [
							'type'    => 'string',
							'default' => '',
						],
						'tag'      => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'  => [
							'type' => 'number',
						],
						'imageSrc' => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt' => [
							'type'    => 'string',
							'default' => '',
						],
						'href'     => [
							'type'    => 'string',
							'default' => '',
						],
						'tagKind'  => [
							'type'    => 'string',
							'default' => 'economia',
							'enum'    => [
								'bioeconomia',
								'economia',
							],
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'eyebrow'  => 'Biblioteca',
				'heading'  => 'Conteúdos para compreender a economia circular',
				'body'     => 'Consulte documentos, publicações e recursos de apoio.',
				'ctaHref'  => '/biblioteca/',
				'ctaLabel' => 'Ver biblioteca',
				'cards'    => [
					[
						'title'    => 'Legislação',
						'tag'      => 'Economia',
						'imageSrc' => '/images/biblioteca/legislacao.jpg',
						'imageAlt' => 'Documentos de legislação',
						'href'     => '/biblioteca/legislacao/',
						'tagKind'  => 'economia',
					],
					[
						'title'    => 'Publicações',
						'tag'      => 'Bioeconomia',
						'imageSrc' => '/images/biblioteca/publicacoes.jpg',
						'imageAlt' => 'Publicações',
						'href'     => '/biblioteca/publicacoes/',
						'tagKind'  => 'bioeconomia',
					],
					[
						'title'    => 'Boas práticas',
						'tag'      => 'Economia',
						'imageSrc' => '/images/biblioteca/boas-praticas.jpg',
						'imageAlt' => 'Boas práticas',
						'href'     => '/biblioteca/boas-praticas/',
						'tagKind'  => 'economia',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'events-grid'                           => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/events-grid',
		'title'       => 'Grelha de eventos',
		'category'    => 'getquick-design',
		'icon'        => 'calendar-alt',
		'description' => 'Grelha de eventos com um cartão em destaque e cartões compactos, ligados à página de cada evento.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'events-grid',
			],
			'events'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'title',
					],
					'properties' => [
						'title'     => [
							'type'    => 'string',
							'default' => '',
						],
						'slug'      => [
							'type'    => 'string',
							'default' => '',
						],
						'href'      => [
							'type'    => 'string',
							'default' => '',
						],
						'date'      => [
							'type'    => 'string',
							'default' => '',
						],
						'imageId'   => [
							'type' => 'number',
						],
						'imageUrl'  => [
							'type'    => 'string',
							'default' => '',
						],
						'imageAlt'  => [
							'type'    => 'string',
							'default' => '',
						],
						'startDate' => [
							'type'    => 'string',
							'default' => '',
						],
						'endDate'   => [
							'type'    => 'string',
							'default' => '',
						],
					],
				],
			],
			'eventBasePath' => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'events' => [
					[
						'title'     => 'Evento de teste',
						'slug'      => 'evento-de-teste',
						'date'      => '2026-01-01',
						'startDate' => '2026-02-01',
						'endDate'   => null,
						'imageUrl'  => '/images/hero-carousel/economia-circular.jpg',
						'imageAlt'  => 'Evento',
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'event-card-compact'                    => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/event-card-compact',
		'title'       => 'Cartão compacto de evento',
		'category'    => 'getquick-design',
		'icon'        => 'calendar',
		'description' => 'Cartão pequeno de um evento com imagem, título e datas, com ligação para a página do evento.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'event-card-compact',
			],
			'event'         => [
				'type' => 'object',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'slug'          => [
				'type'    => 'string',
				'default' => '',
			],
			'href'          => [
				'type'    => 'string',
				'default' => '',
			],
			'date'          => [
				'type'    => 'string',
				'default' => '',
			],
			'imageId'       => [
				'type' => 'number',
			],
			'imageUrl'      => [
				'type'    => 'string',
				'default' => '',
			],
			'imageAlt'      => [
				'type'    => 'string',
				'default' => '',
			],
			'startDate'     => [
				'type'    => 'string',
				'default' => '',
			],
			'endDate'       => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'    => 'Evento compacto',
				'slug'     => 'evento-compacto',
				'date'     => '2026-01-01',
				'imageUrl' => '/images/hero-carousel/economia-circular.jpg',
				'imageAlt' => 'Evento',
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'pie-chart-donut'                       => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/pie-chart-donut',
		'title'       => 'Gráfico circular donut',
		'category'    => 'getquick-design',
		'icon'        => 'chart-pie',
		'description' => 'Gráfico donut com título, descrição, resumo e legenda, por exemplo para percentagens de reciclagem.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'pie-chart-donut',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'description'   => [
				'type'    => 'string',
				'default' => '',
			],
			'summary'       => [
				'type'    => 'string',
				'default' => '',
			],
			'slices'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'type',
						'label',
						'value',
					],
					'properties' => [
						'type'  => [
							'type'    => 'string',
							'default' => '',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'value' => [
							'type' => 'number',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'       => 'Reciclagem de resíduos',
				'description' => 'Compare a percentagem de resíduos reciclados por material.',
				'summary'     => 'Os valores apresentados são dados de demonstração do gráfico.',
				'slices'      => [
					[
						'type'  => 'vidro',
						'label' => 'Vidro',
						'value' => 30,
					],
					[
						'type'  => 'metal',
						'label' => 'Metal',
						'value' => 25,
					],
					[
						'type'  => 'papel',
						'label' => 'Papel',
						'value' => 28,
					],
					[
						'type'  => 'plastico',
						'label' => 'Plástico',
						'value' => 17,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'grafico-donut'                         => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/grafico-donut',
		'title'       => 'Gráfico donut',
		'category'    => 'getquick-design',
		'icon'        => 'chart-pie',
		'description' => 'Só o gráfico donut com legenda, sem título nem texto, para usar dentro de outros blocos.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'grafico-donut',
			],
			'slices'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'type',
						'label',
						'value',
					],
					'properties' => [
						'type'  => [
							'type'    => 'string',
							'default' => '',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'value' => [
							'type' => 'number',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'slices' => [
					[
						'type'  => 'vidro',
						'label' => 'Vidro',
						'value' => 30,
					],
					[
						'type'  => 'metal',
						'label' => 'Metal',
						'value' => 25,
					],
					[
						'type'  => 'papel',
						'label' => 'Papel',
						'value' => 28,
					],
					[
						'type'  => 'plastico',
						'label' => 'Plástico',
						'value' => 17,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'energy-consumption-chart'              => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/energy-consumption-chart',
		'title'       => 'Gráfico de consumo de energia',
		'category'    => 'getquick-design',
		'icon'        => 'chart-line',
		'description' => 'Gráfico de linhas com o consumo mensal por fonte de energia, com título, descrição e resumo.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'energy-consumption-chart',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'description'   => [
				'type'    => 'string',
				'default' => '',
			],
			'summary'       => [
				'type'    => 'string',
				'default' => '',
			],
			'data'          => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'month',
						'solar',
						'eletrica',
						'gas',
					],
					'properties' => [
						'month'    => [
							'type'    => 'string',
							'default' => '',
						],
						'solar'    => [
							'type' => 'number',
						],
						'eletrica' => [
							'type' => 'number',
						],
						'gas'      => [
							'type' => 'number',
						],
					],
				],
			],
			'yMax'          => [
				'type' => 'number',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'       => 'Consumo de energia por fonte',
				'description' => 'Compare a evolução mensal das principais fontes de energia.',
				'summary'     => 'Os valores apresentados são dados de demonstração do gráfico.',
				'yMax'        => 100,
				'data'        => [
					[
						'month'    => 'Jan',
						'solar'    => 32,
						'eletrica' => 48,
						'gas'      => 20,
					],
					[
						'month'    => 'Abr',
						'solar'    => 41,
						'eletrica' => 44,
						'gas'      => 15,
					],
					[
						'month'    => 'Jul',
						'solar'    => 58,
						'eletrica' => 31,
						'gas'      => 11,
					],
					[
						'month'    => 'Out',
						'solar'    => 45,
						'eletrica' => 39,
						'gas'      => 16,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'sustainable-consumption-bars'          => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/sustainable-consumption-bars',
		'title'       => 'Barras de consumo sustentável',
		'category'    => 'getquick-design',
		'icon'        => 'chart-bar',
		'description' => 'Gráfico de barras verticais com percentagens por grupo, com título, subtítulo e resumo.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'sustainable-consumption-bars',
			],
			'bars'          => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'band',
						'label',
						'pct',
					],
					'properties' => [
						'band'  => [
							'type'    => 'string',
							'default' => '',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'pct'   => [
							'type' => 'number',
						],
					],
				],
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'subtitle'      => [
				'type'    => 'string',
				'default' => '',
			],
			'summary'       => [
				'type'    => 'string',
				'default' => '',
			],
			'headingId'     => [
				'type'    => 'string',
				'default' => '',
			],
			'sectionId'     => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'    => 'Participação em programas de reciclagem',
				'subtitle' => 'Compare a participação por faixa etária.',
				'summary'  => 'Os valores apresentados são dados de demonstração do gráfico.',
				'bars'     => [
					[
						'band'  => '18-25',
						'label' => '18–25 anos',
						'pct'   => 20,
					],
					[
						'band'  => '26-40',
						'label' => '26–40 anos',
						'pct'   => 40,
					],
					[
						'band'  => '41-60',
						'label' => '41–60 anos',
						'pct'   => 27,
					],
					[
						'band'  => '60plus',
						'label' => '+60 anos',
						'pct'   => 13,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'urban-waste-geo-chart'                 => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/urban-waste-geo-chart',
		'title'       => 'Gráfico geográfico de resíduos urbanos',
		'category'    => 'getquick-design',
		'icon'        => 'admin-site-alt3',
		'description' => 'Barras horizontais de resíduos urbanos por habitante, por região e ano, com anos filtráveis.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'   => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'         => [
				'type'    => 'string',
				'default' => 'urban-waste-geo-chart',
			],
			'title'           => [
				'type'    => 'string',
				'default' => '',
			],
			'badge'           => [
				'type'    => 'string',
				'default' => '',
			],
			'intro'           => [
				'type'    => 'string',
				'default' => '',
			],
			'summary'         => [
				'type'    => 'string',
				'default' => '',
			],
			'comparisonLabel' => [
				'type'    => 'string',
				'default' => '',
			],
			'metricLabel'     => [
				'type'    => 'string',
				'default' => '',
			],
			'periodLabel'     => [
				'type'    => 'string',
				'default' => '',
			],
			'scopeLabel'      => [
				'type'    => 'string',
				'default' => '',
			],
			'regions'         => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'id',
						'label',
						'values',
					],
					'properties' => [
						'id'     => [
							'type'    => 'string',
							'default' => '',
						],
						'label'  => [
							'type'    => 'string',
							'default' => '',
						],
						'values' => [
							'type' => 'object',
						],
					],
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'           => 'Resíduos urbanos por habitante',
				'badge'           => '2021–2024',
				'intro'           => 'Comparação ilustrativa por localização geográfica.',
				'summary'         => 'Valores de demonstração para o gráfico.',
				'comparisonLabel' => 'Localização vs resíduos urbanos',
				'metricLabel'     => 'kg/habitante',
				'periodLabel'     => 'Anual',
				'scopeLabel'      => 'Portugal',
				'regions'         => [
					[
						'id'     => 'pt',
						'label'  => 'Portugal',
						'values' => [
							'2021' => 349,
							'2022' => 735,
							'2023' => 876,
							'2024' => 787,
						],
					],
					[
						'id'     => 'cont',
						'label'  => 'Continente',
						'values' => [
							'2021' => 680,
							'2022' => 956,
							'2023' => 735,
							'2024' => 720,
						],
					],
					[
						'id'     => 'norte',
						'label'  => 'Norte',
						'values' => [
							'2021' => 735,
							'2022' => 1000,
							'2023' => 959,
							'2024' => 915,
						],
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'resource-productivity-bars'            => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/resource-productivity-bars',
		'title'       => 'Barras de produtividade dos recursos',
		'category'    => 'getquick-design',
		'icon'        => 'chart-bar',
		'description' => 'Gráfico de barras anual da produtividade dos recursos, com título, etiqueta, introdução e filtros.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'resource-productivity-bars',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'badge'         => [
				'type'    => 'string',
				'default' => '',
			],
			'intro'         => [
				'type'    => 'string',
				'default' => '',
			],
			'points'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'year',
						'value',
					],
					'properties' => [
						'year'  => [
							'type' => 'number',
						],
						'label' => [
							'type'    => 'string',
							'default' => '',
						],
						'value' => [
							'type' => 'number',
						],
					],
				],
			],
			'yMax'          => [
				'type' => 'number',
			],
			'metricLabel'   => [
				'type'    => 'string',
				'default' => '',
			],
			'periodLabel'   => [
				'type'    => 'string',
				'default' => '',
			],
			'scopeLabel'    => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'       => 'Produtividade dos recursos',
				'badge'       => '2020–2023',
				'intro'       => 'A evolução da produtividade dos recursos em Portugal.',
				'metricLabel' => '€/kg',
				'periodLabel' => 'Anual',
				'scopeLabel'  => 'Portugal',
				'yMax'        => 2,
				'points'      => [
					[
						'year'  => 2020,
						'label' => '2020',
						'value' => 1.1,
					],
					[
						'year'  => 2021,
						'label' => '2021',
						'value' => 1.25,
					],
					[
						'year'  => 2022,
						'label' => '2022',
						'value' => 1.38,
					],
					[
						'year'  => 2023,
						'label' => '2023',
						'value' => 1.41,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'resource-productivity-chart'           => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/resource-productivity-chart',
		'title'       => 'Gráfico de produtividade dos recursos',
		'category'    => 'getquick-design',
		'icon'        => 'chart-area',
		'description' => 'Gráfico de barras simples da produtividade dos recursos por ano, com título e etiquetas de filtro.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'resource-productivity-chart',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'filterLabels'  => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'    => 'string',
					'default' => '',
				],
			],
			'points'        => [
				'type'    => 'array',
				'default' => [],
				'items'   => [
					'type'       => 'object',
					'required'   => [
						'year',
						'value',
					],
					'properties' => [
						'year'  => [
							'type' => 'number',
						],
						'value' => [
							'type' => 'number',
						],
					],
				],
			],
			'yMax'          => [
				'type' => 'number',
			],
			'locale'        => [
				'type'    => 'string',
				'default' => '',
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'title'        => 'Produtividade dos recursos',
				'filterLabels' => [
					'Portugal',
					'União Europeia',
				],
				'locale'       => 'pt-PT',
				'points'       => [
					[
						'year'  => 2020,
						'value' => 1.1,
					],
					[
						'year'  => 2021,
						'value' => 1.25,
					],
					[
						'year'  => 2022,
						'value' => 1.38,
					],
					[
						'year'  => 2023,
						'value' => 1.41,
					],
				],
			],
		],
		'editorStyle' => 'getquick-nomia-blocks-editor',
	],
	'nomia-contact-map'                     => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/nomia-contact-map',
		'title'       => 'Mapa de contacto',
		'category'    => 'getquick-design',
		'icon'        => 'location-alt',
		'description' => 'Mapa Google para páginas de contacto. Cole um link do Google Maps.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'nomia-contact-map',
			],
			'mapUrl'        => [
				'type'    => 'string',
				'default' => '',
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'align'         => [
				'type'    => 'string',
				'default' => 'none',
				'enum'    => [
					'none',
					'left',
					'right',
					'full',
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'mapUrl' => 'https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal',
				'title'  => 'Mapa de contacto',
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'section'                               => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/section',
		'title'       => 'Secção',
		'category'    => 'getquick-design',
		'icon'        => 'editor-table',
		'description' => 'Faixa Nomia que agrupa outros blocos, com fundo e espaçamento próprios.',
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion'           => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'                 => [
				'type'    => 'string',
				'default' => 'section',
			],
			'backgroundColor'         => [
				'type'    => 'string',
				'default' => '',
			],
			'backgroundImageId'       => [
				'type' => 'number',
			],
			'backgroundImageSrc'      => [
				'type'    => 'string',
				'default' => '',
			],
			'backgroundImagePosition' => [
				'type'    => 'string',
				'default' => 'center',
				'enum'    => [
					'top-left',
					'top',
					'top-right',
					'left',
					'center',
					'right',
					'bottom-left',
					'bottom',
					'bottom-right',
				],
			],
			'backgroundImageSize'     => [
				'type'    => 'string',
				'default' => 'cover',
				'enum'    => [
					'cover',
					'contain',
					'none',
				],
			],
			'paddingTop'              => [
				'type'    => 'string',
				'default' => 'medium',
				'enum'    => [
					'none',
					'small',
					'medium',
					'large',
				],
			],
			'paddingBottom'           => [
				'type'    => 'string',
				'default' => 'medium',
				'enum'    => [
					'none',
					'small',
					'medium',
					'large',
				],
			],
			'paddingX'                => [
				'type'    => 'string',
				'default' => 'default',
				'enum'    => [
					'none',
					'small',
					'default',
				],
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'backgroundColor' => '#00524d',
				'paddingTop'      => 'medium',
				'paddingBottom'   => 'medium',
				'paddingX'        => 'default',
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
	'contact-details-card'                  => [
		'$schema'     => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion'  => 3,
		'name'        => 'getquick/contact-details-card',
		'title'       => 'Cartão de contacto',
		'category'    => 'getquick-design',
		'icon'        => 'id',
		'description' => 'Cartão com ícone, título, detalhes de contacto e botão opcional.',
		'keywords'    => [
			'contacto',
			'morada',
			'telefone',
			'email',
			'cartão',
		],
		'textdomain'  => 'getquick-nomia-blocks',
		'attributes'  => [
			'schemaVersion' => [
				'type'    => 'number',
				'default' => 1,
			],
			'blockId'       => [
				'type'    => 'string',
				'default' => 'contact-details-card',
			],
			'iconId'        => [
				'type' => 'number',
			],
			'iconUrl'       => [
				'type'    => 'string',
				'default' => '',
			],
			'iconAlt'       => [
				'type'    => 'string',
				'default' => '',
			],
			'hideIcon'      => [
				'type'    => 'boolean',
				'default' => false,
			],
			'title'         => [
				'type'    => 'string',
				'default' => '',
			],
			'details'       => [
				'type'    => 'string',
				'default' => '',
			],
			'buttonLabel'   => [
				'type'    => 'string',
				'default' => '',
			],
			'buttonHref'    => [
				'type'    => 'string',
				'default' => '',
			],
			'hideButton'    => [
				'type'    => 'boolean',
				'default' => false,
			],
		],
		'supports'    => [
			'html'            => false,
			'className'       => false,
			'customClassName' => false,
			'color'           => false,
			'spacing'         => false,
			'typography'      => false,
			'align'           => false,
			'inserter'        => true,
		],
		'example'     => [
			'attributes' => [
				'iconUrl'     => '/images/contact-details-card/adults.svg',
				'title'       => 'Morada',
				'details'     => 'Serviços Centrais Rua da Murgueira, 9<br>Zambujal - Alfragide<br>2610-124 Amadora',
				'buttonLabel' => 'Direções',
				'buttonHref'  => 'https://www.google.com/maps/search/?api=1&query=Rua%20da%20Murgueira%209%20Amadora',
			],
		],
		'editorStyle' => [
			'getquick-nomia-blocks-editor',
			'file:./editor.css',
		],
	],
];
