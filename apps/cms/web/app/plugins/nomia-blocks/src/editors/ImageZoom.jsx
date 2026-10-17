// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ImageAltControl } from '../fields/ImageAltControl';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import './ImageZoom.css';

export function ImageZoomEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'image-zoom-editor',
	} );
	const imageUrl = attributes.imageSrc || '';
	const imageAlt = attributes.imageAlt || '';

	function setImage( media ) {
		const nextUrl = media?.url || '';
		setAttributes( {
			imageId: media?.id,
			imageSrc: nextUrl,
			imageAlt: media?.alt ?? '',
		} );
	}

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Image', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<MediaUploadButton
						imageId={ attributes.imageId }
						onSelect={ setImage }
						labelSelect={ __(
							'Select image',
							'getquick-nomia-blocks'
						) }
						labelReplace={ __(
							'Replace image',
							'getquick-nomia-blocks'
						) }
						hasImage={ Boolean( imageUrl ) }
					/>
					<ImageAltControl
						value={ imageAlt }
						onChange={ ( next ) =>
							setAttributes( { imageAlt: next } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<figure { ...blockProps }>
				<div className="image-zoom-editor__frame">
					{ imageUrl ? (
						<img src={ imageUrl } alt={ imageAlt } />
					) : (
						<div className="image-zoom-editor__placeholder">
							{ __( 'Select an image', 'getquick-nomia-blocks' ) }
						</div>
					) }
				</div>
				<div className="image-zoom-editor__actions">
					<MediaUploadButton
						imageId={ attributes.imageId }
						onSelect={ setImage }
						labelSelect={ __(
							'Select image',
							'getquick-nomia-blocks'
						) }
						labelReplace={ __(
							'Replace image',
							'getquick-nomia-blocks'
						) }
						hasImage={ Boolean( imageUrl ) }
					/>
				</div>
				<RichText
					tagName="figcaption"
					value={ attributes.caption || '' }
					placeholder={ __(
						'Optional caption',
						'getquick-nomia-blocks'
					) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
					onChange={ ( next ) => setAttributes( { caption: next } ) }
				/>
			</figure>
		</>
	);
}
