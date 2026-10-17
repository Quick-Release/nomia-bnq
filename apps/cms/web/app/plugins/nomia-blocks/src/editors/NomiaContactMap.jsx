// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BlockAlignmentControl,
	BlockControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { toGoogleMapsEmbedUrl } from '../../../../../../../frontend/src/lib/google-maps';
import { readNomiaContactMapAlignment } from '../../../../../../../frontend/src/lib/nomia-contact-map';
import { AttributeField } from '../fields/AttributeField';
import contracts from '../contracts.json';
import './NomiaContactMap.css';

const BLOCK_NAME = 'getquick/nomia-contact-map';
const ALIGNMENT_CONTROLS = [ 'left', 'right', 'full' ];
const FIELDS = [ 'mapUrl', 'title' ];

function alignmentLabel( align ) {
	return {
		none: __( 'Centrado (predefinição)', 'getquick-nomia-blocks' ),
		left: __( 'Alinhado à esquerda', 'getquick-nomia-blocks' ),
		right: __( 'Alinhado à direita', 'getquick-nomia-blocks' ),
		full: __( 'Largura total', 'getquick-nomia-blocks' ),
	}[ align ];
}

export function NomiaContactMapEdit( { attributes, setAttributes } ) {
	const align = readNomiaContactMapAlignment( attributes.align );
	const blockProps = useBlockProps( {
		// Full width uses Gutenberg's own `alignfull` escape from the content
		// column, like the page image hero, so the canvas matches the page.
		// Nothing is persisted: the block saves no markup.
		className: [
			'getquick-nomia-blocks-inline-editor',
			'getquick-contact-map-editor',
			`is-align-${ align }`,
			align === 'full'
				? 'alignfull getquick-nomia-blocks-full-width'
				: '',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );
	const contract = contracts.find(
		( item ) => item.blockName === BLOCK_NAME
	);
	const embedUrl = toGoogleMapsEmbedUrl(
		attributes.mapUrl || attributes.url || '',
		attributes.title || ''
	);

	return (
		<>
			<BlockControls group="block">
				<BlockAlignmentControl
					controls={ ALIGNMENT_CONTROLS }
					value={ align === 'none' ? undefined : align }
					onChange={ ( next ) =>
						setAttributes( {
							align: readNomiaContactMapAlignment( next ),
						} )
					}
				/>
			</BlockControls>
			<div { ...blockProps }>
				<p className="getquick-nomia-blocks-inline-editor__intro">
					{ contract?.description }
				</p>
				{ FIELDS.map( ( attributeName ) => (
					<AttributeField
						key={ attributeName }
						attributeName={ attributeName }
						schema={ contract?.attributes?.[ attributeName ] }
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) ) }
				<p className="getquick-contact-map-editor__alignment">
					{ __( 'Alinhamento:', 'getquick-nomia-blocks' ) }{ ' ' }
					<strong>{ alignmentLabel( align ) }</strong>
				</p>
				{ embedUrl ? (
					<div className="getquick-contact-map-editor__stage">
						<div className="getquick-contact-map-editor__map">
							<iframe
								src={ embedUrl }
								title={
									attributes.title ||
									__( 'Mapa', 'getquick-nomia-blocks' )
								}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						</div>
					</div>
				) : null }
			</div>
		</>
	);
}
