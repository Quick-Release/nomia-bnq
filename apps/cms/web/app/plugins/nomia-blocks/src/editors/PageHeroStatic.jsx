// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BlockControls,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BaseControl,
	Button,
	ButtonGroup,
	ColorIndicator,
	ColorPalette,
	Dropdown,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { contractEnum } from '../lib/contract-enum';
import { NOMIA_SECTION_COLORS } from '../lib/colors';
import {
	pageHeroCanvasPadding,
	pageHeroCanvasStyle,
	pageHeroHeightLabels,
} from '../lib/page-hero-canvas-scale.mjs';
import { pageHeroLegacyAttributePatch } from '../lib/page-hero-legacy-attributes.mjs';
import {
	PAGE_HERO_FONT_SIZE_BOUNDS,
	PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN,
	PAGE_HERO_TEXT_ALIGN_ATTRIBUTE,
	PAGE_HERO_TYPOGRAPHY_DEFAULTS,
	normalizePageHeroColor,
	normalizePageHeroFontSize,
	pageHeroTextColorAttribute,
	pageHeroTextFontSizeAttribute,
	pageHeroTextLineHeightAttribute,
	pageHeroTextStyleProperties,
	readPageHeroTextAlign,
	readPageHeroTextTypography,
	readPageHeroTextTypographies,
} from '@nomia/web-src/lib/page-hero-typography';
import { lineHeightTokenPx } from '@nomia/web-src/lib/typography-tokens';
import { UrlField } from '../fields/UrlField';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import './PageHeroStatic.css';

/**
 * The steps and the default come from the generated contract, so the sidebar
 * offers exactly the values the Astro renderer accepts.
 */
const HEIGHT = contractEnum( 'getquick/page-hero-static', 'height' );
const PADDING_TOP = contractEnum( 'getquick/page-hero-static', 'paddingTop' );
const PADDING_BOTTOM = contractEnum(
	'getquick/page-hero-static',
	'paddingBottom'
);
const SUBTITLE_LINE_HEIGHT = contractEnum(
	'getquick/page-hero-static',
	'subtitleLineHeight'
);

function paddingStepLabels() {
	return {
		default: __( 'Predefinido (da altura)', 'getquick-nomia-blocks' ),
		none: __( 'Nenhum', 'getquick-nomia-blocks' ),
		small: __( 'Pequeno', 'getquick-nomia-blocks' ),
		medium: __( 'Médio', 'getquick-nomia-blocks' ),
		large: __( 'Grande', 'getquick-nomia-blocks' ),
	};
}

/**
 * Line-height options name the pixel value of each design token, and the
 * "default" option names the token the subtitle's class already uses.
 *
 * @return {Object[]} SelectControl options.
 */
function subtitleLineHeightOptions() {
	return SUBTITLE_LINE_HEIGHT.values.map( ( value ) => ( {
		value,
		label:
			value === 'default'
				? sprintf(
						/* translators: %s: pixels. */
						__( 'Predefinido (%spx)', 'getquick-nomia-blocks' ),
						lineHeightTokenPx(
							PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN
						)
				  )
				: sprintf(
						/* translators: %s: pixels. */
						__( '%spx', 'getquick-nomia-blocks' ),
						lineHeightTokenPx( value )
				  ),
	} ) );
}

/**
 * One vertical padding step, top or bottom.
 *
 * @param {Object}   props
 * @param {string}   props.label    Control label.
 * @param {Object}   props.steps    Contract enum for the attribute.
 * @param {unknown}  props.value    Stored step.
 * @param {Function} props.onChange Receives the next step.
 */
function PaddingStepControl( { label, steps, value, onChange } ) {
	const labels = paddingStepLabels();
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ label }
			value={ steps.read( value ) }
			options={ steps.values.map( ( step ) => ( {
				value: step,
				label: labels[ step ] ?? step,
			} ) ) }
			onChange={ onChange }
		/>
	);
}

/**
 * Join the shorter height steps into a list for the sidebar help.
 *
 * The conjunction is a translatable string, so it lives here next to the
 * sentence it joins rather than inside `pageHeroHeightLabels`.
 *
 * @param {string[]} steps Uppercased steps, shortest first.
 * @return {string} The steps as a list, e.g. "XS, S, M e L".
 */
function shorterStepsLabel( steps ) {
	if ( steps.length < 2 ) {
		return steps.join( '' );
	}

	return sprintf(
		/* translators: 1: comma-separated steps, e.g. "XS, S, M". 2: the last step, e.g. "L". */
		__( '%1$s e %2$s', 'getquick-nomia-blocks' ),
		steps.slice( 0, -1 ).join( ', ' ),
		steps[ steps.length - 1 ]
	);
}

function textFieldLabel( field ) {
	return field === 'title'
		? __( 'Título', 'getquick-nomia-blocks' )
		: __( 'Subtítulo', 'getquick-nomia-blocks' );
}

/**
 * The stored colour is a swatch name where the palette has one, so the closed
 * control reads as a theme choice rather than a hex code.
 *
 * @param {string}  color Effective six-digit hex colour, lowercase.
 * @param {boolean} isSet Whether the block stores an override for this text.
 * @return {string} Label for the closed colour control.
 */
function colorSwatchLabel( color, isSet ) {
	const swatch = NOMIA_SECTION_COLORS.find(
		( option ) => option.color.toLowerCase() === color
	);
	if ( swatch ) {
		return isSet
			? swatch.label
			: sprintf(
					/* translators: %s: palette swatch name, e.g. "Cinza 100". */
					__( '%s (predefinido)', 'getquick-nomia-blocks' ),
					swatch.label
			  );
	}
	return isSet
		? color.toUpperCase()
		: __( 'Predefinido', 'getquick-nomia-blocks' );
}

/**
 * Colour is picked in three steps, not one: the sidebar shows the colour in
 * use, opening it offers the theme swatches, and Gutenberg's own "Custom color"
 * button inside the palette is the only path to a free-form picker. Clearing
 * stores nothing, so the text falls back to its design token.
 *
 * @param {Object}   props
 * @param {string}   props.id       Control id, shared by the label and toggle.
 * @param {string}   props.label    Sidebar label for this text's colour.
 * @param {string}   props.color    Effective colour, the design default when unset.
 * @param {boolean}  props.isSet    Whether an override is stored.
 * @param {Function} props.onChange Commits a colour, or a falsy value to clear.
 */
function TextColorControl( { id, label, color, isSet, onChange } ) {
	return (
		<BaseControl __nextHasNoMarginBottom id={ id } label={ label }>
			<Dropdown
				className="page-hero-static-editor__color-control"
				popoverProps={ { placement: 'left-start', offset: 24 } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Button
						id={ id }
						className="page-hero-static-editor__color-toggle"
						variant="secondary"
						onClick={ onToggle }
						aria-expanded={ isOpen }
						aria-haspopup="true"
					>
						<ColorIndicator colorValue={ color } />
						<span>{ colorSwatchLabel( color, isSet ) }</span>
					</Button>
				) }
				renderContent={ () => (
					<div className="page-hero-static-editor__color-palette">
						<ColorPalette
							colors={ NOMIA_SECTION_COLORS }
							value={ color }
							enableAlpha={ false }
							clearable={ isSet }
							onChange={ onChange }
						/>
					</div>
				) }
			/>
		</BaseControl>
	);
}

const TEXT_ALIGNMENTS = [
	{
		value: 'left',
		icon: 'editor-alignleft',
		label: __( 'Alinhar texto à esquerda', 'getquick-nomia-blocks' ),
	},
	{
		value: 'center',
		icon: 'editor-aligncenter',
		label: __( 'Alinhar texto ao centro', 'getquick-nomia-blocks' ),
	},
	{
		value: 'right',
		icon: 'editor-alignright',
		label: __( 'Alinhar texto à direita', 'getquick-nomia-blocks' ),
	},
];

/**
 * One alignment for the whole stack: title, subtitle and CTA move together.
 *
 * @param {Object}   props
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Block attribute setter.
 */
function TextAlignmentControl( { attributes, setAttributes } ) {
	const align = readPageHeroTextAlign( attributes );

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id="page-hero-static-text-align"
			label={ __( 'Alinhamento do texto', 'getquick-nomia-blocks' ) }
			help={ __(
				'Move o título, o subtítulo e o botão em conjunto.',
				'getquick-nomia-blocks'
			) }
		>
			<ButtonGroup>
				{ TEXT_ALIGNMENTS.map( ( option ) => (
					<Button
						key={ option.value }
						size="compact"
						icon={ option.icon }
						label={ option.label }
						showTooltip
						variant={
							align === option.value ? 'primary' : 'secondary'
						}
						aria-pressed={ align === option.value }
						onClick={ () =>
							setAttributes( {
								[ PAGE_HERO_TEXT_ALIGN_ATTRIBUTE ]:
									option.value,
							} )
						}
					/>
				) ) }
			</ButtonGroup>
		</BaseControl>
	);
}

function TextTypographyControls( { field, attributes, setAttributes } ) {
	const label = textFieldLabel( field );
	const typography = readPageHeroTextTypography( attributes, field );
	const defaults = PAGE_HERO_TYPOGRAPHY_DEFAULTS[ field ];
	const fontSizeAttribute = pageHeroTextFontSizeAttribute( field );
	const colorAttribute = pageHeroTextColorAttribute( field );
	const color = typography.color || defaults.color;

	return (
		<div className="page-hero-static-editor__typography-controls">
			<RangeControl
				__nextHasNoMarginBottom
				label={ sprintf(
					/* translators: %s: hero text field name, e.g. "Título". */
					__( 'Tamanho de letra (%s)', 'getquick-nomia-blocks' ),
					label
				) }
				value={ typography.fontSize ?? defaults.fontSize }
				min={ PAGE_HERO_FONT_SIZE_BOUNDS.min }
				max={ PAGE_HERO_FONT_SIZE_BOUNDS.max }
				step={ 1 }
				allowReset={ typography.fontSize !== undefined }
				onChange={ ( next ) =>
					setAttributes( {
						[ fontSizeAttribute ]:
							normalizePageHeroFontSize( next ),
					} )
				}
			/>
			{ field === 'subtitle' ? (
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ sprintf(
						/* translators: %s: hero text field name, e.g. "Subtítulo". */
						__( 'Altura da linha (%s)', 'getquick-nomia-blocks' ),
						label
					) }
					value={ SUBTITLE_LINE_HEIGHT.read(
						attributes[ pageHeroTextLineHeightAttribute( field ) ]
					) }
					options={ subtitleLineHeightOptions() }
					onChange={ ( next ) =>
						setAttributes( {
							[ pageHeroTextLineHeightAttribute( field ) ]: next,
						} )
					}
				/>
			) : null }
			<TextColorControl
				id={ `page-hero-static-${ field }-color` }
				label={ sprintf(
					/* translators: %s: hero text field name, e.g. "Título". */
					__( 'Cor do texto (%s)', 'getquick-nomia-blocks' ),
					label
				) }
				color={ color }
				isSet={ Boolean( attributes[ colorAttribute ] ) }
				onChange={ ( next ) =>
					setAttributes( {
						[ colorAttribute ]: normalizePageHeroColor( next ),
					} )
				}
			/>
		</div>
	);
}

export function PageHeroStaticEdit( { attributes, setAttributes } ) {
	const height = HEIGHT.read( attributes.height );
	const canvas = pageHeroCanvasStyle( height );
	const heightLabels = pageHeroHeightLabels( HEIGHT.values );
	const blockProps = useBlockProps( {
		// `alignfull` is Gutenberg's own "escape the content column" class, so
		// this edge-to-edge hero fills the editor canvas the way it fills the
		// page. The block declares `supports.align: false` — editors must not
		// pick an alignment, and nothing is persisted, because the block saves
		// no markup. This is the canvas borrowing core's layout escape hatch,
		// not the block opting into alignment.
		className:
			'page-hero-static-editor alignfull getquick-nomia-blocks-full-width',
		style: {
			'--page-hero-static-height': canvas?.height,
			'--page-hero-static-padding': pageHeroCanvasPadding( height, {
				top: attributes.paddingTop,
				bottom: attributes.paddingBottom,
			} ),
		},
	} );

	/** Every edit also retires whatever legacy keys the block still carries. */
	const commit = useCallback(
		( next ) =>
			setAttributes( {
				...pageHeroLegacyAttributePatch( attributes ),
				...next,
			} ),
		[ attributes, setAttributes ]
	);

	const ctaHref = attributes.ctaHref || attributes.ctaUrl || '';
	const imageUrl = attributes.imageSrc || attributes.imageUrl || '';
	const imageAlt = attributes.imageAlt || '';
	const showCta =
		attributes.hideCta === true ? false : attributes.showCta !== false;
	const showSubtitle = attributes.showSubtitle !== false;
	const typographies = readPageHeroTextTypographies( attributes );
	const textAlign = readPageHeroTextAlign( attributes );

	function setHeroImage( media ) {
		const nextUrl = media?.url || '';
		commit( {
			imageId: media?.id,
			imageSrc: nextUrl,
			imageAlt: media?.alt ?? '',
		} );
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup
					label={ __(
						'Imagem do cabeçalho',
						'getquick-nomia-blocks'
					) }
				>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ attributes.imageId }
							onSelect={ setHeroImage }
							render={ ( { open } ) => (
								<ToolbarButton
									icon="format-image"
									label={
										imageUrl
											? __(
													'Substituir imagem',
													'getquick-nomia-blocks'
											  )
											: __(
													'Selecionar imagem',
													'getquick-nomia-blocks'
											  )
									}
									showTooltip
									onClick={ open }
								/>
							) }
						/>
					</MediaUploadCheck>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Conteúdo', 'getquick-nomia-blocks' ) }
					initialOpen={ false }
				>
					<MediaUploadButton
						imageId={ attributes.imageId }
						onSelect={ setHeroImage }
						previewUrl={ imageUrl }
						previewAlt={ imageAlt }
						labelSelect={ __(
							'Selecionar imagem',
							'getquick-nomia-blocks'
						) }
						labelReplace={ __(
							'Substituir imagem',
							'getquick-nomia-blocks'
						) }
						hasImage={ Boolean( imageUrl ) }
					/>
					<ToggleControl
						label={ __(
							'Mostrar subtítulo',
							'getquick-nomia-blocks'
						) }
						checked={ showSubtitle }
						onChange={ ( next ) =>
							commit( { showSubtitle: next } )
						}
					/>
					<ToggleControl
						label={ __( 'Mostrar botão', 'getquick-nomia-blocks' ) }
						checked={ showCta }
						onChange={ ( next ) => commit( { showCta: next } ) }
					/>
					{ showCta ? (
						<UrlField
							label={ __(
								'URL do botão',
								'getquick-nomia-blocks'
							) }
							value={ ctaHref }
							onChange={ ( next ) => commit( { ctaHref: next } ) }
						/>
					) : null }
				</PanelBody>
				<PanelBody
					title={ __( 'Tipografia', 'getquick-nomia-blocks' ) }
					initialOpen={ false }
				>
					<TextAlignmentControl
						attributes={ attributes }
						setAttributes={ commit }
					/>
					<TextTypographyControls
						field="title"
						attributes={ attributes }
						setAttributes={ commit }
					/>
					<TextTypographyControls
						field="subtitle"
						attributes={ attributes }
						setAttributes={ commit }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Disposição', 'getquick-nomia-blocks' ) }
					initialOpen={ false }
				>
					<BaseControl
						__nextHasNoMarginBottom
						id="page-hero-static-height"
						label={ __( 'Altura', 'getquick-nomia-blocks' ) }
						help={ sprintf(
							/* translators: 1: tallest step, e.g. XL. 2: the remaining steps, e.g. "XS, S, M e L". */
							__(
								'%1$s ocupa o ecrã inteiro; %2$s são faixas progressivamente mais baixas.',
								'getquick-nomia-blocks'
							),
							heightLabels.tallest,
							shorterStepsLabel( heightLabels.shorter )
						) }
					>
						<ButtonGroup>
							{ HEIGHT.values.map( ( option ) => (
								<Button
									key={ option }
									size="compact"
									variant={
										height === option
											? 'primary'
											: 'secondary'
									}
									aria-pressed={ height === option }
									onClick={ () =>
										commit( { height: option } )
									}
								>
									{ option.toUpperCase() }
								</Button>
							) ) }
						</ButtonGroup>
					</BaseControl>
					<PaddingStepControl
						label={ __(
							'Espaço superior',
							'getquick-nomia-blocks'
						) }
						steps={ PADDING_TOP }
						value={ attributes.paddingTop }
						onChange={ ( next ) => commit( { paddingTop: next } ) }
					/>
					<PaddingStepControl
						label={ __(
							'Espaço inferior',
							'getquick-nomia-blocks'
						) }
						steps={ PADDING_BOTTOM }
						value={ attributes.paddingBottom }
						onChange={ ( next ) =>
							commit( { paddingBottom: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="page-hero-static-editor__viewport">
					<div className="page-hero-static-editor__media" aria-hidden>
						{ imageUrl ? (
							<img src={ imageUrl } alt={ imageAlt } />
						) : (
							<div className="page-hero-static-editor__image-placeholder">
								{ __(
									'Selecionar imagem de fundo (opcional)',
									'getquick-nomia-blocks'
								) }
							</div>
						) }
						{ imageUrl ? (
							<div className="page-hero-static-editor__overlay" />
						) : null }
					</div>
					<div className="page-hero-static-editor__content">
						<div
							className={ `page-hero-static-editor__copy page-hero-static-editor__copy--${ textAlign }` }
						>
							{ /*
							 * No formats on any of the three fields. These
							 * attributes are plain strings that
							 * `NomiaPageHeroStatic.astro` interpolates as text,
							 * so markup such as a <strong> would reach the site
							 * as visible tags rather than as formatting. The
							 * subtitle alone takes line breaks: it reads as a
							 * short description, and Astro renders each line
							 * as its own paragraph.
							 */ }
							<RichText
								tagName="h1"
								value={ attributes.title || '' }
								style={ pageHeroTextStyleProperties(
									typographies.title
								) }
								placeholder={ __(
									'Título do cabeçalho',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [] }
								disableLineBreaks
								onChange={ ( next ) =>
									commit( { title: next } )
								}
							/>
							{ showSubtitle ? (
								<RichText
									tagName="p"
									value={ attributes.subtitle || '' }
									style={ pageHeroTextStyleProperties(
										typographies.subtitle
									) }
									className="page-hero-static-editor__subtitle"
									placeholder={ __(
										'Subtítulo ou descrição (Enter para novo parágrafo)',
										'getquick-nomia-blocks'
									) }
									allowedFormats={ [] }
									withoutInteractiveFormatting
									onChange={ ( next ) =>
										commit( { subtitle: next } )
									}
								/>
							) : null }
							{ showCta ? (
								<RichText
									tagName="span"
									className="page-hero-static-editor__cta"
									value={ attributes.ctaLabel || '' }
									placeholder={ __(
										'Texto do botão',
										'getquick-nomia-blocks'
									) }
									allowedFormats={ [] }
									disableLineBreaks
									onChange={ ( next ) =>
										commit( { ctaLabel: next } )
									}
								/>
							) : null }
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
