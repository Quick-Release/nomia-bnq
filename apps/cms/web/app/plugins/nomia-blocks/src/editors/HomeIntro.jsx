// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { TematicaEyebrowField, useTematicaEyebrow } from '../lib/tematica';
import { UrlField } from '../fields/UrlField';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import './HomeIntro.css';

/** @param {Record<string, unknown>} attributes */
function homeIntroShowsCta( attributes ) {
	if ( attributes.hideCta === true ) {
		return false;
	}
	return attributes.showCta !== false;
}

/** @param {Record<string, unknown>} attributes */
function homeIntroShowsTematica( attributes ) {
	return attributes.showTematica !== false;
}

/** @param {Record<string, unknown>} attributes */
function homeIntroShowsCaption( attributes ) {
	return attributes.showCaption !== false;
}

export function HomeIntroEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'getquick-home-intro-editor',
	} );
	const { selectedTematica, tematicaOptions, accent, setTematica } =
		useTematicaEyebrow( attributes, setAttributes );
	const ctaHref = attributes.ctaHref || attributes.ctaUrl || '';
	const showCta = homeIntroShowsCta( attributes );
	const showTematica = homeIntroShowsTematica( attributes );
	const showCaption = homeIntroShowsCaption( attributes );
	const heroImageUrl = attributes.heroSrc || attributes.heroUrl || '';
	const heroImageAlt = attributes.heroAlt || '';

	function setHeroImage( media ) {
		const nextUrl = media?.url || '';
		setAttributes( {
			heroId: media?.id,
			heroSrc: nextUrl,
			heroAlt: media?.alt ?? '',
		} );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Content', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<ToggleControl
						label={ __(
							'Show Tematic selector',
							'getquick-nomia-blocks'
						) }
						checked={ showTematica }
						onChange={ ( next ) =>
							setAttributes( { showTematica: next } )
						}
					/>
					<ToggleControl
						label={ __(
							'Show CTA button',
							'getquick-nomia-blocks'
						) }
						checked={ showCta }
						onChange={ ( next ) =>
							setAttributes( { showCta: next } )
						}
					/>
					{ showCta ? (
						<UrlField
							label={ __( 'CTA URL', 'getquick-nomia-blocks' ) }
							value={ ctaHref }
							onChange={ ( next ) =>
								setAttributes( { ctaHref: next } )
							}
						/>
					) : null }
					<ToggleControl
						label={ __(
							'Show description text',
							'getquick-nomia-blocks'
						) }
						checked={ showCaption }
						onChange={ ( next ) =>
							setAttributes( { showCaption: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="getquick-home-intro-editor__inner">
					<div className="getquick-home-intro-editor__intro">
						{ showTematica ? (
							<TematicaEyebrowField
								accent={ accent }
								selectedTematica={ selectedTematica }
								tematicaOptions={ tematicaOptions }
								setTematica={ setTematica }
								centered
							/>
						) : null }
						<div className="getquick-home-intro-editor__text">
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
						{ showCta ? (
							<RichText
								tagName="span"
								className="getquick-home-intro-editor__cta"
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
						) : null }
					</div>
					<figure className="getquick-home-intro-editor__figure">
						<div className="getquick-home-intro-editor__hero">
							{ heroImageUrl ? (
								<img
									src={ heroImageUrl }
									alt={ heroImageAlt }
								/>
							) : (
								<div className="getquick-home-intro-editor__hero-placeholder">
									{ __(
										'Select an image',
										'getquick-nomia-blocks'
									) }
								</div>
							) }
						</div>
						<div className="getquick-home-intro-editor__hero-actions">
							<MediaUploadButton
								imageId={ attributes.heroId }
								onSelect={ setHeroImage }
								labelSelect={ __(
									'Select hero image',
									'getquick-nomia-blocks'
								) }
								labelReplace={ __(
									'Replace hero image',
									'getquick-nomia-blocks'
								) }
								hasImage={ Boolean( heroImageUrl ) }
							/>
						</div>
						{ showCaption ? (
							<figcaption className="getquick-home-intro-editor__caption">
								<RichText
									tagName="p"
									className="getquick-home-intro-editor__caption-title"
									value={ attributes.captionHeading || '' }
									placeholder={ __(
										'Caption heading',
										'getquick-nomia-blocks'
									) }
									allowedFormats={ [] }
									onChange={ ( next ) =>
										setAttributes( {
											captionHeading: next,
										} )
									}
								/>
								<RichText
									tagName="p"
									className="getquick-home-intro-editor__caption-body"
									value={ attributes.captionBody || '' }
									placeholder={ __(
										'Caption body',
										'getquick-nomia-blocks'
									) }
									allowedFormats={ [
										'core/bold',
										'core/italic',
									] }
									onChange={ ( next ) =>
										setAttributes( { captionBody: next } )
									}
								/>
							</figcaption>
						) : null }
					</figure>
				</div>
			</section>
		</>
	);
}
