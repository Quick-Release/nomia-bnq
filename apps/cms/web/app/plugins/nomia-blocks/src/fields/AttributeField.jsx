// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { URLInput } from '@wordpress/block-editor';
import { fieldKind } from '../lib/field-kind';
import { ArrayField } from './ArrayField';
import { JsonField } from './JsonField';
import { MediaField } from './MediaField';

export function AttributeField( {
	attributeName,
	schema,
	attributes,
	setAttributes,
} ) {
	if ( attributeName === 'schemaVersion' || attributeName === 'blockId' ) {
		return null;
	}

	if ( schema?.type === 'array' ) {
		return (
			<ArrayField
				attributeName={ attributeName }
				schema={ schema }
				value={ attributes[ attributeName ] }
				onChange={ ( next ) =>
					setAttributes( { [ attributeName ]: next } )
				}
			/>
		);
	}

	const kind = fieldKind( attributeName, schema );
	const value = attributes[ attributeName ];

	if ( kind === 'json' ) {
		return (
			<JsonField
				label={ attributeName }
				value={ value }
				onChange={ ( next ) =>
					setAttributes( { [ attributeName ]: next } )
				}
			/>
		);
	}

	if ( kind === 'media' ) {
		return (
			<MediaField
				attributeName={ attributeName }
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
		);
	}

	if ( kind === 'url' ) {
		return (
			<div className="getquick-nomia-blocks-url-field">
				<URLInput
					label={ attributeName }
					value={ value || '' }
					onChange={ ( next ) =>
						setAttributes( { [ attributeName ]: next } )
					}
				/>
			</div>
		);
	}

	if ( kind === 'select' ) {
		return (
			<SelectControl
				label={ attributeName }
				value={ value ?? schema.default ?? '' }
				options={ ( schema.enum || [] ).map( ( option ) => ( {
					label: option,
					value: option,
				} ) ) }
				onChange={ ( next ) =>
					setAttributes( { [ attributeName ]: next } )
				}
			/>
		);
	}

	if ( kind === 'boolean' ) {
		return (
			<ToggleControl
				label={ attributeName }
				checked={
					( value ?? schema.default ) === true ||
					( value ?? schema.default ) === 'true'
				}
				onChange={ ( next ) =>
					setAttributes( { [ attributeName ]: next } )
				}
			/>
		);
	}

	if ( kind === 'number' ) {
		return (
			<TextControl
				label={ attributeName }
				type="number"
				value={ value ?? '' }
				onChange={ ( next ) => {
					const numeric = Number( next );
					setAttributes( {
						[ attributeName ]:
							next === '' || ! Number.isFinite( numeric )
								? next
								: numeric,
					} );
				} }
			/>
		);
	}

	const Control = kind === 'textarea' ? TextareaControl : TextControl;
	return (
		<Control
			label={ attributeName }
			value={ value || '' }
			rows={ kind === 'textarea' ? 4 : undefined }
			onChange={ ( next ) =>
				setAttributes( { [ attributeName ]: next } )
			}
		/>
	);
}
