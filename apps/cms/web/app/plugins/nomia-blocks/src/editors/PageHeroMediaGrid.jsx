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
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { UrlField } from '../fields/UrlField';
import './PageHeroMediaGrid.css';

const DEFAULT_COLUMN_BACKGROUND = '#ffffff';
const DEFAULT_COLUMN_HOVER_BACKGROUND = '#f2a900';
const DEFAULT_COLUMN_TITLE_COLOR = '#ffffff';
const DEFAULT_COLUMN_TEXT_COLOR = '#ffffff';
const DEFAULT_COLUMN_BORDER_RADIUS = 40;
const DEFAULT_TEXT_VERTICAL_ALIGN = 'bottom';
const SHARE_HREF = 'https://nomia.getquick.io/partilhar/';
const SHARE_LABEL = 'Partilhar';
const TEXT_VERTICAL_ALIGN_OPTIONS = new Set( [ 'top', 'bottom' ] );

const COLUMN_COLOR_OPTIONS = [
	{ name: 'White', color: '#ffffff' },
	{ name: 'Orange', color: '#f2a900' },
	{ name: 'Teal', color: '#007b73' },
	{ name: 'Dark teal', color: '#003333' },
	{ name: 'Cyan', color: '#00a9ce' },
	{ name: 'Botanical', color: '#67863f' },
	{ name: 'Grey', color: '#444444' },
];

function TextTopIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ 24 }
			height={ 24 }
			aria-hidden
			focusable={ false }
		>
			<path d="M5 4.5h14V6H5V4.5Zm1 3.5h12v1.5H6V8Zm0 3.5h8V13H6v-1.5Zm-1 5h14V18H5v-1.5Z" />
		</svg>
	);
}

function TextBottomIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ 24 }
			height={ 24 }
			aria-hidden
			focusable={ false }
		>
			<path d="M5 4.5h14V6H5V4.5Zm1 6.5h8v1.5H6V11Zm0 3.5h12V16H6v-1.5Zm0 3.5h12v1.5H6V18Z" />
		</svg>
	);
}

function MediaButton( { allowedTypes, value, onSelect, label, replaceLabel } ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				allowedTypes={ allowedTypes }
				value={ value }
				onSelect={ onSelect }
				render={ ( { open } ) => (
					<Button variant="secondary" onClick={ open }>
						{ value ? replaceLabel : label }
					</Button>
				) }
			/>
		</MediaUploadCheck>
	);
}

function borderRadiusValue( value ) {
	const parsed = Number.parseInt( value, 10 );

	if ( ! Number.isFinite( parsed ) ) {
		return DEFAULT_COLUMN_BORDER_RADIUS;
	}

	return Math.min( 80, Math.max( 0, parsed ) );
}

function borderRadiusStyle( value ) {
	return `${ borderRadiusValue( value ) }px`;
}

function BorderRadiusControl( { label, name, attributes, setAttributes } ) {
	return (
		<RangeControl
			label={ label }
			value={ borderRadiusValue( attributes[ name ] ) }
			min={ 0 }
			max={ 80 }
			step={ 1 }
			onChange={ ( next ) =>
				setAttributes( {
					[ name ]: String( borderRadiusValue( next ) ),
				} )
			}
		/>
	);
}

function ColumnPanel( {
	hrefName,
	backgroundName,
	hoverBackgroundName,
	titleColorName,
	textColorName,
	borderRadiusName,
	attributes,
	setAttributes,
} ) {
	const backgroundColor =
		attributes[ backgroundName ] || DEFAULT_COLUMN_BACKGROUND;
	const hoverBackgroundColor =
		attributes[ hoverBackgroundName ] || DEFAULT_COLUMN_HOVER_BACKGROUND;
	const titleColor =
		attributes[ titleColorName ] || DEFAULT_COLUMN_TITLE_COLOR;
	const textColor = attributes[ textColorName ] || DEFAULT_COLUMN_TEXT_COLOR;

	return (
		<div className="page-hero-media-grid-editor__inspector-group">
			<UrlField
				label={ __( 'URL', 'getquick-nomia-blocks' ) }
				value={ attributes[ hrefName ] || '' }
				onChange={ ( next ) => setAttributes( { [ hrefName ]: next } ) }
			/>
			<p className="page-hero-media-grid-editor__inspector-label">
				{ __( 'Background color', 'getquick-nomia-blocks' ) }
			</p>
			<ColorPalette
				colors={ COLUMN_COLOR_OPTIONS }
				value={ backgroundColor }
				onChange={ ( next ) =>
					setAttributes( {
						[ backgroundName ]: next || DEFAULT_COLUMN_BACKGROUND,
					} )
				}
			/>
			<p className="page-hero-media-grid-editor__inspector-label">
				{ __( 'Hover color', 'getquick-nomia-blocks' ) }
			</p>
			<ColorPalette
				colors={ COLUMN_COLOR_OPTIONS }
				value={ hoverBackgroundColor }
				onChange={ ( next ) =>
					setAttributes( {
						[ hoverBackgroundName ]:
							next || DEFAULT_COLUMN_HOVER_BACKGROUND,
					} )
				}
			/>
			<p className="page-hero-media-grid-editor__inspector-label">
				{ __( 'Title color', 'getquick-nomia-blocks' ) }
			</p>
			<ColorPalette
				colors={ COLUMN_COLOR_OPTIONS }
				value={ titleColor }
				onChange={ ( next ) =>
					setAttributes( {
						[ titleColorName ]: next || DEFAULT_COLUMN_TITLE_COLOR,
					} )
				}
			/>
			<p className="page-hero-media-grid-editor__inspector-label">
				{ __( 'Paragraph color', 'getquick-nomia-blocks' ) }
			</p>
			<ColorPalette
				colors={ COLUMN_COLOR_OPTIONS }
				value={ textColor }
				onChange={ ( next ) =>
					setAttributes( {
						[ textColorName ]: next || DEFAULT_COLUMN_TEXT_COLOR,
					} )
				}
			/>
			<BorderRadiusControl
				label={ __( 'Corner radius', 'getquick-nomia-blocks' ) }
				name={ borderRadiusName }
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		</div>
	);
}

export function PageHeroMediaGridEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'page-hero-media-grid-editor',
	} );
	const backgroundImageUrl = attributes.backgroundImageSrc || '';
	const videoSrc = attributes.videoSrc || '';
	const videoPosterSrc = attributes.videoPosterSrc || '';
	const heading = attributes.heading || 'Destaques e video';
	const shareHref = attributes.shareHref ?? SHARE_HREF;
	const shareLabel = attributes.shareLabel ?? SHARE_LABEL;
	const firstBackgroundColor =
		attributes.firstBackgroundColor || DEFAULT_COLUMN_BACKGROUND;
	const firstHoverBackgroundColor =
		attributes.firstHoverBackgroundColor || DEFAULT_COLUMN_HOVER_BACKGROUND;
	const firstTitleColor =
		attributes.firstTitleColor || DEFAULT_COLUMN_TITLE_COLOR;
	const firstTextColor =
		attributes.firstTextColor || DEFAULT_COLUMN_TEXT_COLOR;
	const secondBackgroundColor =
		attributes.secondBackgroundColor || DEFAULT_COLUMN_BACKGROUND;
	const secondHoverBackgroundColor =
		attributes.secondHoverBackgroundColor ||
		DEFAULT_COLUMN_HOVER_BACKGROUND;
	const secondTitleColor =
		attributes.secondTitleColor || DEFAULT_COLUMN_TITLE_COLOR;
	const secondTextColor =
		attributes.secondTextColor || DEFAULT_COLUMN_TEXT_COLOR;
	const firstBorderRadius = borderRadiusStyle( attributes.firstBorderRadius );
	const secondBorderRadius = borderRadiusStyle(
		attributes.secondBorderRadius
	);
	const videoBorderRadius = borderRadiusStyle( attributes.videoBorderRadius );
	const textVerticalAlign = TEXT_VERTICAL_ALIGN_OPTIONS.has(
		attributes.textVerticalAlign
	)
		? attributes.textVerticalAlign
		: DEFAULT_TEXT_VERTICAL_ALIGN;
	const textVerticalAlignClass = `page-hero-media-grid-editor__button--text-${ textVerticalAlign }`;

	function setBackgroundImage( media ) {
		setAttributes( {
			backgroundImageId: media?.id,
			backgroundImageSrc: media?.url || '',
			backgroundImageAlt: media?.alt || '',
		} );
	}

	function setVideo( media ) {
		setAttributes( {
			videoId: media?.id,
			videoSrc: media?.url || '',
			videoTitle: media?.title || attributes.videoTitle || '',
		} );
	}

	function setVideoPoster( media ) {
		setAttributes( {
			videoPosterId: media?.id,
			videoPosterSrc: media?.url || '',
		} );
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup
					label={ __(
						'Paragraph vertical alignment',
						'getquick-nomia-blocks'
					) }
				>
					<ToolbarButton
						icon={ <TextTopIcon /> }
						label={ __( 'Top aligned', 'getquick-nomia-blocks' ) }
						isPressed={ textVerticalAlign === 'top' }
						showTooltip
						onClick={ () =>
							setAttributes( { textVerticalAlign: 'top' } )
						}
					/>
					<ToolbarButton
						icon={ <TextBottomIcon /> }
						label={ __(
							'Bottom aligned',
							'getquick-nomia-blocks'
						) }
						isPressed={ textVerticalAlign === 'bottom' }
						showTooltip
						onClick={ () =>
							setAttributes( { textVerticalAlign: 'bottom' } )
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Background', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<div className="page-hero-media-grid-editor__inspector-group">
						<TextControl
							label={ __(
								'Accessible section label',
								'getquick-nomia-blocks'
							) }
							value={ heading }
							onChange={ ( next ) =>
								setAttributes( { heading: next } )
							}
						/>
						<p className="page-hero-media-grid-editor__inspector-label">
							{ __(
								'Background image',
								'getquick-nomia-blocks'
							) }
						</p>
						<MediaButton
							allowedTypes={ [ 'image' ] }
							value={ attributes.backgroundImageId }
							onSelect={ setBackgroundImage }
							label={ __(
								'Select background image',
								'getquick-nomia-blocks'
							) }
							replaceLabel={ __(
								'Replace background image',
								'getquick-nomia-blocks'
							) }
						/>
					</div>
				</PanelBody>
				<PanelBody
					title={ __( 'Column A', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<ColumnPanel
						hrefName="firstHref"
						backgroundName="firstBackgroundColor"
						hoverBackgroundName="firstHoverBackgroundColor"
						titleColorName="firstTitleColor"
						textColorName="firstTextColor"
						borderRadiusName="firstBorderRadius"
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Column B', 'getquick-nomia-blocks' ) }
					initialOpen={ false }
				>
					<ColumnPanel
						hrefName="secondHref"
						backgroundName="secondBackgroundColor"
						hoverBackgroundName="secondHoverBackgroundColor"
						titleColorName="secondTitleColor"
						textColorName="secondTextColor"
						borderRadiusName="secondBorderRadius"
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Column C', 'getquick-nomia-blocks' ) }
					initialOpen={ false }
				>
					<div className="page-hero-media-grid-editor__inspector-group">
						<p className="page-hero-media-grid-editor__inspector-label">
							{ __( 'Video', 'getquick-nomia-blocks' ) }
						</p>
						<MediaButton
							allowedTypes={ [ 'video' ] }
							value={ attributes.videoId }
							onSelect={ setVideo }
							label={ __(
								'Select video',
								'getquick-nomia-blocks'
							) }
							replaceLabel={ __(
								'Replace video',
								'getquick-nomia-blocks'
							) }
						/>
						<UrlField
							label={ __( 'Video URL', 'getquick-nomia-blocks' ) }
							value={ videoSrc }
							onChange={ ( next ) =>
								setAttributes( { videoSrc: next } )
							}
						/>
						<TextControl
							label={ __(
								'Video title',
								'getquick-nomia-blocks'
							) }
							value={ attributes.videoTitle || '' }
							onChange={ ( next ) =>
								setAttributes( { videoTitle: next } )
							}
						/>
						<UrlField
							label={ __( 'Share URL', 'getquick-nomia-blocks' ) }
							value={ shareHref }
							onChange={ ( next ) =>
								setAttributes( { shareHref: next } )
							}
						/>
						<TextControl
							label={ __(
								'Share label',
								'getquick-nomia-blocks'
							) }
							value={ shareLabel }
							onChange={ ( next ) =>
								setAttributes( { shareLabel: next } )
							}
						/>
						<BorderRadiusControl
							label={ __(
								'Corner radius',
								'getquick-nomia-blocks'
							) }
							name="videoBorderRadius"
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</div>
					<div className="page-hero-media-grid-editor__inspector-group">
						<p className="page-hero-media-grid-editor__inspector-label">
							{ __(
								'Video poster image',
								'getquick-nomia-blocks'
							) }
						</p>
						<MediaButton
							allowedTypes={ [ 'image' ] }
							value={ attributes.videoPosterId }
							onSelect={ setVideoPoster }
							label={ __(
								'Select poster image',
								'getquick-nomia-blocks'
							) }
							replaceLabel={ __(
								'Replace poster image',
								'getquick-nomia-blocks'
							) }
						/>
					</div>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps } aria-label={ heading }>
				<div
					className="page-hero-media-grid-editor__background"
					aria-hidden
				>
					{ backgroundImageUrl ? (
						<img src={ backgroundImageUrl } alt="" />
					) : null }
					<div className="page-hero-media-grid-editor__overlay" />
				</div>
				<div className="page-hero-media-grid-editor__content">
					<div className="page-hero-media-grid-editor__grid">
						<div
							className={ `page-hero-media-grid-editor__button ${ textVerticalAlignClass }` }
							style={ {
								'--column-background': firstBackgroundColor,
								'--column-hover-background':
									firstHoverBackgroundColor,
								'--column-title-color': firstTitleColor,
								'--column-text-color': firstTextColor,
								'--column-border-radius': firstBorderRadius,
							} }
						>
							<RichText
								tagName="span"
								className="page-hero-media-grid-editor__button-title"
								value={ attributes.firstTitle || '' }
								placeholder={ __(
									'First title',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [] }
								onChange={ ( next ) =>
									setAttributes( { firstTitle: next } )
								}
							/>
							<RichText
								tagName="span"
								className="page-hero-media-grid-editor__button-text"
								value={ attributes.firstText || '' }
								placeholder={ __(
									'First text',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								onChange={ ( next ) =>
									setAttributes( { firstText: next } )
								}
							/>
						</div>
						<div
							className={ `page-hero-media-grid-editor__button ${ textVerticalAlignClass }` }
							style={ {
								'--column-background': secondBackgroundColor,
								'--column-hover-background':
									secondHoverBackgroundColor,
								'--column-title-color': secondTitleColor,
								'--column-text-color': secondTextColor,
								'--column-border-radius': secondBorderRadius,
							} }
						>
							<RichText
								tagName="span"
								className="page-hero-media-grid-editor__button-title"
								value={ attributes.secondTitle || '' }
								placeholder={ __(
									'Second title',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [] }
								onChange={ ( next ) =>
									setAttributes( { secondTitle: next } )
								}
							/>
							<RichText
								tagName="span"
								className="page-hero-media-grid-editor__button-text"
								value={ attributes.secondText || '' }
								placeholder={ __(
									'Second text',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								onChange={ ( next ) =>
									setAttributes( { secondText: next } )
								}
							/>
						</div>
						<div
							className="page-hero-media-grid-editor__video"
							style={ {
								'--video-border-radius': videoBorderRadius,
							} }
						>
							{ videoSrc ? (
								<>
									<video
										autoPlay
										loop
										muted
										playsInline
										poster={ videoPosterSrc || undefined }
									>
										<source src={ videoSrc } />
									</video>
									{ shareHref && shareLabel ? (
										<a
											className="page-hero-media-grid-editor__share"
											href={ shareHref }
										>
											{ shareLabel }
										</a>
									) : null }
								</>
							) : (
								<div className="page-hero-media-grid-editor__video-placeholder">
									{ __(
										'Select a video',
										'getquick-nomia-blocks'
									) }
								</div>
							) }
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
