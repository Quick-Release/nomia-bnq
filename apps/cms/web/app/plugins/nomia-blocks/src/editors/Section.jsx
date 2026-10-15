// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InnerBlocks,
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	Button,
	ColorPicker,
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	isLightColor,
	NOMIA_SECTION_COLORS,
	normalizeHexColor,
} from '../lib/colors';
import { contractEnum } from '../lib/contract-enum';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import './Section.css';

const BACKGROUND_POSITION = contractEnum(
	'getquick/section',
	'backgroundImagePosition'
);
const BACKGROUND_SIZE = contractEnum(
	'getquick/section',
	'backgroundImageSize'
);

/** Mirrors `sectionBackgroundPositionCss` in apps/frontend/src/lib/section-block.ts. */
const BACKGROUND_POSITION_CSS = {
	'top-left': 'left top',
	top: 'center top',
	'top-right': 'right top',
	left: 'left center',
	center: 'center center',
	right: 'right center',
	'bottom-left': 'left bottom',
	bottom: 'center bottom',
	'bottom-right': 'right bottom',
};

/** The canvas draws the image as a CSS background; `none` is its natural size. */
const BACKGROUND_SIZE_CSS = {
	cover: 'cover',
	contain: 'contain',
	none: 'auto',
};

function backgroundPositionLabels() {
	return {
		'top-left': __( 'Em cima à esquerda', 'getquick-nomia-blocks' ),
		top: __( 'Em cima ao centro', 'getquick-nomia-blocks' ),
		'top-right': __( 'Em cima à direita', 'getquick-nomia-blocks' ),
		left: __( 'Ao centro à esquerda', 'getquick-nomia-blocks' ),
		center: __( 'Ao centro', 'getquick-nomia-blocks' ),
		right: __( 'Ao centro à direita', 'getquick-nomia-blocks' ),
		'bottom-left': __( 'Em baixo à esquerda', 'getquick-nomia-blocks' ),
		bottom: __( 'Em baixo ao centro', 'getquick-nomia-blocks' ),
		'bottom-right': __( 'Em baixo à direita', 'getquick-nomia-blocks' ),
	};
}

function backgroundSizeOptions() {
	const labels = {
		cover: __( 'Preencher (recorta a imagem)', 'getquick-nomia-blocks' ),
		contain: __( 'Ajustar (imagem inteira)', 'getquick-nomia-blocks' ),
		none: __( 'Tamanho original', 'getquick-nomia-blocks' ),
	};
	return BACKGROUND_SIZE.values.map( ( value ) => ( {
		value,
		label: labels[ value ] ?? value,
	} ) );
}

/**
 * Padding steps mirror `SECTION_PADDING_STEPS` / `SECTION_HORIZONTAL_PADDINGS`
 * in `apps/frontend/src/lib/section-block.ts`, which owns the responsive classes each
 * step resolves to. Keep the two lists in step when either changes.
 */
const VERTICAL_PADDING_OPTIONS = [
	{ value: 'none', label: __( 'Nenhum', 'getquick-nomia-blocks' ) },
	{ value: 'small', label: __( 'Pequeno', 'getquick-nomia-blocks' ) },
	{ value: 'medium', label: __( 'Médio', 'getquick-nomia-blocks' ) },
	{ value: 'large', label: __( 'Grande', 'getquick-nomia-blocks' ) },
];

const HORIZONTAL_PADDING_OPTIONS = [
	{
		value: 'none',
		label: __( 'Nenhum (largura total)', 'getquick-nomia-blocks' ),
	},
	{ value: 'small', label: __( 'Pequeno', 'getquick-nomia-blocks' ) },
	{ value: 'default', label: __( 'Predefinido', 'getquick-nomia-blocks' ) },
];

/** Editor-canvas approximations of the frontend spacing scale. */
const VERTICAL_PADDING_PREVIEW = {
	none: '0px',
	small: '32px',
	medium: '64px',
	large: '96px',
};

const HORIZONTAL_PADDING_PREVIEW = {
	none: '0px',
	small: '24px',
	default: '48px',
};

export function SectionEdit( { attributes, setAttributes } ) {
	const backgroundColor = normalizeHexColor( attributes.backgroundColor );
	const paddingTop = attributes.paddingTop || 'medium';
	const paddingBottom = attributes.paddingBottom || 'medium';
	const paddingX = attributes.paddingX || 'default';
	const light = ! backgroundColor || isLightColor( backgroundColor );
	const backgroundImage = attributes.backgroundImageSrc || '';
	const backgroundPosition = BACKGROUND_POSITION.read(
		attributes.backgroundImagePosition
	);
	const backgroundSize = BACKGROUND_SIZE.read(
		attributes.backgroundImageSize
	);
	const positionLabels = backgroundPositionLabels();

	const blockProps = useBlockProps( {
		className: 'nomia-section-editor',
		'data-nomia-section-contrast': light ? 'light' : 'dark',
		style: {
			backgroundColor: backgroundColor || undefined,
			backgroundImage: backgroundImage
				? `url(${ JSON.stringify( backgroundImage ) })`
				: undefined,
			backgroundPosition: backgroundImage
				? BACKGROUND_POSITION_CSS[ backgroundPosition ]
				: undefined,
			backgroundSize: backgroundImage
				? BACKGROUND_SIZE_CSS[ backgroundSize ]
				: undefined,
			backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
			paddingTop: VERTICAL_PADDING_PREVIEW[ paddingTop ],
			paddingBottom: VERTICAL_PADDING_PREVIEW[ paddingBottom ],
			paddingLeft: HORIZONTAL_PADDING_PREVIEW[ paddingX ],
			paddingRight: HORIZONTAL_PADDING_PREVIEW[ paddingX ],
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Fundo da secção', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<div className="nomia-section-editor__swatches">
						{ NOMIA_SECTION_COLORS.map( ( option ) => {
							const color = normalizeHexColor( option.color );
							const isSelected = backgroundColor === color;

							return (
								<button
									key={ option.color }
									type="button"
									className="nomia-section-editor__swatch"
									data-selected={
										isSelected ? 'true' : undefined
									}
									style={ {
										'--nomia-section-swatch': color,
									} }
									aria-label={ option.label }
									aria-pressed={ isSelected }
									title={ option.label }
									onClick={ () =>
										setAttributes( {
											backgroundColor: color,
										} )
									}
								>
									<span className="screen-reader-text">
										{ option.label }
									</span>
								</button>
							);
						} ) }
					</div>
					<ColorPicker
						color={ backgroundColor || '#ffffff' }
						enableAlpha={ false }
						onChange={ ( next ) =>
							setAttributes( {
								backgroundColor: normalizeHexColor( next ),
							} )
						}
					/>
					<div className="nomia-section-editor__actions">
						<Button
							variant="secondary"
							onClick={ () =>
								setAttributes( { backgroundColor: '' } )
							}
							disabled={ ! backgroundColor }
						>
							{ __( 'Repor', 'getquick-nomia-blocks' ) }
						</Button>
					</div>
					<p className="nomia-section-editor__hint">
						{ backgroundColor
							? __(
									'O texto dos blocos interiores fica automaticamente legível sobre este fundo.',
									'getquick-nomia-blocks'
							  )
							: __(
									'Sem cor definida, a secção herda o fundo da página.',
									'getquick-nomia-blocks'
							  ) }
					</p>
				</PanelBody>
				<PanelBody
					title={ __( 'Imagem de fundo', 'getquick-nomia-blocks' ) }
					initialOpen={ Boolean( backgroundImage ) }
				>
					<MediaUploadButton
						imageId={ attributes.backgroundImageId }
						onSelect={ ( media ) =>
							setAttributes( {
								backgroundImageId: media?.id,
								backgroundImageSrc: media?.url || '',
							} )
						}
						previewUrl={ backgroundImage || undefined }
						labelSelect={ __(
							'Selecionar imagem',
							'getquick-nomia-blocks'
						) }
						labelReplace={ __(
							'Substituir imagem',
							'getquick-nomia-blocks'
						) }
						hasImage={ Boolean( backgroundImage ) }
					/>
					{ backgroundImage ? (
						<>
							<div className="nomia-section-editor__actions">
								<Button
									__next40pxDefaultSize
									variant="tertiary"
									isDestructive
									onClick={ () =>
										setAttributes( {
											backgroundImageId: undefined,
											backgroundImageSrc: '',
										} )
									}
								>
									{ __(
										'Remover imagem',
										'getquick-nomia-blocks'
									) }
								</Button>
							</div>
							<fieldset className="nomia-section-editor__position">
								<legend>
									{ __(
										'Alinhamento da imagem',
										'getquick-nomia-blocks'
									) }
								</legend>
								<div className="nomia-section-editor__position-grid">
									{ BACKGROUND_POSITION.values.map(
										( value ) => (
											<button
												key={ value }
												type="button"
												className="nomia-section-editor__position-cell"
												aria-label={
													positionLabels[ value ]
												}
												title={
													positionLabels[ value ]
												}
												aria-pressed={
													backgroundPosition === value
												}
												onClick={ () =>
													setAttributes( {
														backgroundImagePosition:
															value,
													} )
												}
											/>
										)
									) }
								</div>
							</fieldset>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ __(
									'Tamanho da imagem',
									'getquick-nomia-blocks'
								) }
								value={ backgroundSize }
								options={ backgroundSizeOptions() }
								onChange={ ( next ) =>
									setAttributes( {
										backgroundImageSize: next,
									} )
								}
							/>
							<p className="nomia-section-editor__hint">
								{ __(
									'Para uma imagem quadrada encostada a um lado, escolha "Ajustar" e o alinhamento desse lado. A imagem fica por cima da cor de fundo.',
									'getquick-nomia-blocks'
								) }
							</p>
						</>
					) : null }
				</PanelBody>
				<PanelBody
					title={ __( 'Espaçamento', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Topo', 'getquick-nomia-blocks' ) }
						value={ paddingTop }
						options={ VERTICAL_PADDING_OPTIONS }
						onChange={ ( next ) =>
							setAttributes( { paddingTop: next } )
						}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Base', 'getquick-nomia-blocks' ) }
						value={ paddingBottom }
						options={ VERTICAL_PADDING_OPTIONS }
						onChange={ ( next ) =>
							setAttributes( { paddingBottom: next } )
						}
					/>
					<SelectControl
						__nextHasNoMarginBottom
						label={ __( 'Laterais', 'getquick-nomia-blocks' ) }
						value={ paddingX }
						options={ HORIZONTAL_PADDING_OPTIONS }
						onChange={ ( next ) =>
							setAttributes( { paddingX: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<InnerBlocks
					renderAppender={ InnerBlocks.ButtonBlockAppender }
				/>
			</div>
		</>
	);
}
