// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BlockControls,
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	PanelBody,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { TematicaEyebrowField, useTematicaEyebrow } from '../lib/tematica';
import { UrlField } from '../fields/UrlField';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import { ImageAltControl } from '../fields/ImageAltControl';
import './TwoColumnsTextImage.css';

function normalizedMediaPosition( value ) {
	return value === 'left' ? 'left' : 'right';
}

function ImageLeftIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ 24 }
			height={ 24 }
			aria-hidden
			focusable={ false }
		>
			<path d="M4 5.5h7v13H4v-13Zm9.5 1h6v1.5h-6V6.5Zm0 4h6V12h-6v-1.5Zm0 4h6V16h-6v-1.5Z" />
		</svg>
	);
}

function ImageRightIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			width={ 24 }
			height={ 24 }
			aria-hidden
			focusable={ false }
		>
			<path d="M13 5.5h7v13h-7v-13Zm-8.5 1h6v1.5h-6V6.5Zm0 4h6V12h-6v-1.5Zm0 4h6V16h-6v-1.5Z" />
		</svg>
	);
}

export function TwoColumnsTextImageEdit( { attributes, setAttributes } ) {
	const mediaPosition = normalizedMediaPosition( attributes.mediaPosition );
	const blockProps = useBlockProps( {
		className: `two-columns-text-image-editor has-media-${ mediaPosition }`,
	} );
	const { selectedTematica, tematicaOptions, accent, setTematica } =
		useTematicaEyebrow( attributes, setAttributes );
	const ctaHref = attributes.ctaHref || '';
	const hideCta = attributes.hideCta === true;
	const hideTaxonomy = attributes.hideTaxonomy === true;
	const primaryImageUrl = attributes.primarySrc || '';
	const primaryImageAlt = attributes.primaryAlt || '';

	function setPrimaryImage( media ) {
		const nextUrl = media?.url || '';
		setAttributes( {
			primaryId: media?.id,
			primarySrc: nextUrl,
			primaryAlt: media?.alt ?? '',
		} );
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup
					label={ __( 'Image position', 'getquick-nomia-blocks' ) }
				>
					<ToolbarButton
						icon={ <ImageLeftIcon /> }
						isPressed={ mediaPosition === 'left' }
						label={ __( 'Image left', 'getquick-nomia-blocks' ) }
						showTooltip
						onClick={ () =>
							setAttributes( { mediaPosition: 'left' } )
						}
					/>
					<ToolbarButton
						icon={ <ImageRightIcon /> }
						isPressed={ mediaPosition === 'right' }
						label={ __( 'Image right', 'getquick-nomia-blocks' ) }
						showTooltip
						onClick={ () =>
							setAttributes( { mediaPosition: 'right' } )
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls>
				<PanelBody
					title={ __( 'Content', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<ToggleControl
						label={ __(
							'Hide taxonomy label',
							'getquick-nomia-blocks'
						) }
						checked={ hideTaxonomy }
						onChange={ ( next ) =>
							setAttributes( { hideTaxonomy: next } )
						}
					/>
					<ToggleControl
						label={ __(
							'Hide CTA button',
							'getquick-nomia-blocks'
						) }
						checked={ hideCta }
						onChange={ ( next ) =>
							setAttributes( { hideCta: next } )
						}
					/>
					{ hideCta ? null : (
						<UrlField
							label={ __( 'CTA URL', 'getquick-nomia-blocks' ) }
							value={ ctaHref }
							onChange={ ( next ) =>
								setAttributes( { ctaHref: next } )
							}
						/>
					) }
					<ImageAltControl
						value={ primaryImageAlt }
						onChange={ ( next ) =>
							setAttributes( { primaryAlt: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="two-columns-text-image-editor__inner">
					<div className="two-columns-text-image-editor__copy">
						{ hideTaxonomy ? null : (
							<TematicaEyebrowField
								accent={ accent }
								selectedTematica={ selectedTematica }
								tematicaOptions={ tematicaOptions }
								setTematica={ setTematica }
							/>
						) }
						<div className="two-columns-text-image-editor__text">
							<RichText
								tagName="h2"
								value={ attributes.heading || '' }
								placeholder={ __(
									'Heading',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [] }
								onChange={ ( next ) =>
									setAttributes( { heading: next } )
								}
							/>
							<RichText
								tagName="p"
								value={ attributes.body || '' }
								placeholder={ __(
									'Body copy',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								onChange={ ( next ) =>
									setAttributes( { body: next } )
								}
							/>
						</div>
						{ hideCta ? null : (
							<RichText
								tagName="span"
								className="two-columns-text-image-editor__cta"
								value={ attributes.ctaLabel || '' }
								placeholder={ __(
									'CTA label',
									'getquick-nomia-blocks'
								) }
								allowedFormats={ [] }
								onChange={ ( next ) =>
									setAttributes( { ctaLabel: next } )
								}
							/>
						) }
					</div>
					<div className="two-columns-text-image-editor__visual">
						<figure className="two-columns-text-image-editor__frame">
							<div className="two-columns-text-image-editor__native-image">
								{ primaryImageUrl ? (
									<img
										src={ primaryImageUrl }
										alt={ primaryImageAlt }
									/>
								) : (
									<div className="two-columns-text-image-editor__native-image-placeholder">
										{ __(
											'Select an image',
											'getquick-nomia-blocks'
										) }
									</div>
								) }
							</div>
							<div className="two-columns-text-image-editor__image-actions">
								<MediaUploadButton
									imageId={ attributes.primaryId }
									onSelect={ setPrimaryImage }
									labelSelect={ __(
										'Select image',
										'getquick-nomia-blocks'
									) }
									labelReplace={ __(
										'Replace image',
										'getquick-nomia-blocks'
									) }
									hasImage={ Boolean( primaryImageUrl ) }
								/>
							</div>
						</figure>
					</div>
				</div>
			</section>
		</>
	);
}
