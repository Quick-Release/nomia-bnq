// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button, TextControl } from '@wordpress/components';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export function MediaField( { attributeName, attributes, setAttributes } ) {
	const value = attributes[ attributeName ] || '';
	const idAttribute = attributeName.replace( /(Url|Src)$/i, 'Id' );
	const altAttribute = attributeName.replace( /(Url|Src)$/i, 'Alt' );

	return (
		<div className="getquick-nomia-blocks-media-field">
			<TextControl
				label={ attributeName }
				value={ value }
				onChange={ ( next ) =>
					setAttributes( { [ attributeName ]: next } )
				}
			/>
			<MediaUploadCheck>
				<MediaUpload
					allowedTypes={ [ 'image' ] }
					value={ attributes[ idAttribute ] }
					onSelect={ ( media ) =>
						setAttributes( {
							[ idAttribute ]: media.id,
							[ attributeName ]: media.url,
							[ altAttribute ]: media.alt || '',
						} )
					}
					render={ ( { open } ) => (
						<Button variant="secondary" onClick={ open }>
							{ __(
								'Selecionar imagem',
								'getquick-nomia-blocks'
							) }
						</Button>
					) }
				/>
			</MediaUploadCheck>
		</div>
	);
}
