// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	Button,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { URLInput } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { fieldKind } from '../lib/field-kind';
import {
	arrayItemFields,
	blankArrayItem,
	isValidArrayItem,
	normalizeArrayItem,
} from '../lib/repeater-schema';
import { JsonField } from './JsonField';
import { MediaUploadButton } from './MediaUploadButton';

function isPlainObject( value ) {
	return (
		value !== null && typeof value === 'object' && ! Array.isArray( value )
	);
}

function blankValue( value ) {
	if ( Array.isArray( value ) ) {
		return [];
	}
	if ( isPlainObject( value ) ) {
		return Object.fromEntries(
			Object.keys( value ).map( ( key ) => [ key, '' ] )
		);
	}
	return '';
}

function inferArrayTemplate( rows ) {
	const firstObject = rows.find( isPlainObject );
	if ( firstObject ) {
		return Object.fromEntries(
			Object.keys( firstObject ).map( ( key ) => [
				key,
				blankValue( firstObject[ key ] ),
			] )
		);
	}
	return '';
}

function schemaValue( row, fieldName ) {
	return isPlainObject( row ) ? row[ fieldName ] : '';
}

function updateField( row, fieldName, onRowChange, next ) {
	onRowChange( { ...row, [ fieldName ]: next } );
}

function ArrayRowField( { fieldName, row, onRowChange, schema, required } ) {
	const value = schemaValue( row, fieldName );
	const kind = fieldKind( fieldName, schema );

	if ( kind === 'media' ) {
		const idField = /(Url|Src)$/i.test( fieldName )
			? fieldName.replace( /(Url|Src)$/i, 'Id' )
			: `${ fieldName }Id`;
		const altField = /(Url|Src)$/i.test( fieldName )
			? fieldName.replace( /(Url|Src)$/i, 'Alt' )
			: `${ fieldName }Alt`;
		return (
			<div className="getquick-nomia-blocks-media-field">
				<TextControl
					label={ fieldName }
					value={ value || '' }
					required={ required }
					onChange={ ( next ) =>
						updateField( row, fieldName, onRowChange, next )
					}
				/>
				<MediaUploadButton
					imageId={ row[ idField ] }
					onSelect={ ( media ) =>
						onRowChange( {
							...row,
							[ idField ]: media.id,
							[ fieldName ]: media.url,
							[ altField ]: media.alt || row[ altField ] || '',
						} )
					}
					labelSelect={ __(
						'Select image',
						'getquick-nomia-blocks'
					) }
					labelReplace={ __(
						'Replace image',
						'getquick-nomia-blocks'
					) }
					hasImage={ Boolean( row[ idField ] || value ) }
				/>
			</div>
		);
	}

	if ( kind === 'url' ) {
		return (
			<div className="getquick-nomia-blocks-url-field">
				<URLInput
					label={ fieldName }
					value={ value || '' }
					onChange={ ( next ) =>
						updateField( row, fieldName, onRowChange, next )
					}
				/>
			</div>
		);
	}

	if ( kind === 'select' ) {
		return (
			<SelectControl
				label={ fieldName }
				value={ value ?? '' }
				options={ ( schema.enum || [] ).map( ( option ) => ( {
					label: option,
					value: option,
				} ) ) }
				required={ required }
				onChange={ ( next ) =>
					updateField( row, fieldName, onRowChange, next )
				}
			/>
		);
	}

	if ( kind === 'boolean' ) {
		return (
			<ToggleControl
				label={ fieldName }
				checked={ value === true || value === 'true' }
				onChange={ ( next ) =>
					updateField( row, fieldName, onRowChange, next )
				}
			/>
		);
	}

	if ( kind === 'number' ) {
		return (
			<TextControl
				label={ fieldName }
				type="number"
				value={ value ?? '' }
				required={ required }
				onChange={ ( next ) => {
					const numeric = Number( next );
					updateField(
						row,
						fieldName,
						onRowChange,
						next === '' || ! Number.isFinite( numeric )
							? next
							: numeric
					);
				} }
			/>
		);
	}

	if ( kind === 'json' ) {
		return (
			<JsonField
				label={ fieldName }
				value={ value }
				onChange={ ( next ) =>
					updateField( row, fieldName, onRowChange, next )
				}
			/>
		);
	}

	const FieldControl = kind === 'textarea' ? TextareaControl : TextControl;
	return (
		<FieldControl
			label={ fieldName }
			value={
				isPlainObject( value ) || Array.isArray( value )
					? JSON.stringify( value, null, 2 )
					: value ?? ''
			}
			rows={ FieldControl === TextareaControl ? 3 : undefined }
			required={ required }
			onChange={ ( next ) =>
				updateField( row, fieldName, onRowChange, next )
			}
		/>
	);
}

export function ArrayField( { attributeName, schema, value, onChange } ) {
	const rows = Array.isArray( value ) ? value : [];
	const fields = arrayItemFields( schema );
	const hasSchemaFields = fields !== null && Object.keys( fields ).length > 0;
	const template = hasSchemaFields
		? blankArrayItem( schema )
		: inferArrayTemplate( rows );
	const objectRows =
		hasSchemaFields ||
		( rows.every( ( row ) => isPlainObject( row ) ) &&
			isPlainObject( template ) );
	const objectKeys = objectRows
		? Object.keys( hasSchemaFields ? fields : template )
		: [];
	const requiredFields = schema?.items?.required || [];
	const invalidRowCount = hasSchemaFields
		? rows.filter( ( row ) => ! isValidArrayItem( row, schema ) ).length
		: 0;

	function updateRow( index, nextRow ) {
		const normalizedRow = hasSchemaFields
			? normalizeArrayItem( nextRow, schema )
			: nextRow;
		onChange(
			rows.map( ( row, rowIndex ) =>
				rowIndex === index ? normalizedRow : row
			)
		);
	}

	function addRow() {
		onChange( [
			...rows,
			hasSchemaFields ? blankArrayItem( schema ) : template,
		] );
	}

	function removeRow( index ) {
		onChange( rows.filter( ( _, rowIndex ) => rowIndex !== index ) );
	}

	return (
		<div className="getquick-nomia-blocks-array-field">
			<div className="getquick-nomia-blocks-array-field__header">
				<strong>{ attributeName }</strong>
				<Button variant="secondary" onClick={ addRow }>
					{ __( 'Adicionar item', 'getquick-nomia-blocks' ) }
				</Button>
			</div>
			{ invalidRowCount > 0 ? (
				<p
					className="getquick-nomia-blocks-array-field__validation"
					role="alert"
				>
					{ `${ invalidRowCount } ${ __(
						'incomplete item(s). Complete the required fields before publishing.',
						'getquick-nomia-blocks'
					) }` }
				</p>
			) : null }
			{ rows.length === 0 ? (
				<p className="getquick-nomia-blocks-array-field__empty">
					{ __( 'Ainda sem itens.', 'getquick-nomia-blocks' ) }
				</p>
			) : null }
			{ rows.map( ( row, index ) => {
				const displayRow = hasSchemaFields
					? normalizeArrayItem( row, schema )
					: row;
				return (
					<div
						className="getquick-nomia-blocks-array-field__item"
						key={ index }
					>
						<div className="getquick-nomia-blocks-array-field__item-header">
							<span>
								{ __( 'Item', 'getquick-nomia-blocks' ) }{ ' ' }
								{ index + 1 }
							</span>
							<Button
								isDestructive
								variant="tertiary"
								onClick={ () => removeRow( index ) }
							>
								{ __( 'Remover', 'getquick-nomia-blocks' ) }
							</Button>
						</div>
						{ objectRows ? (
							objectKeys.map( ( key ) => (
								<ArrayRowField
									key={ key }
									fieldName={ key }
									row={ displayRow }
									onRowChange={ ( nextRow ) =>
										updateRow( index, nextRow )
									}
									schema={
										hasSchemaFields
											? fields[ key ]
											: undefined
									}
									required={ requiredFields.includes( key ) }
								/>
							) )
						) : (
							<TextControl
								label={ attributeName }
								value={ row ?? '' }
								onChange={ ( next ) =>
									updateRow( index, next )
								}
							/>
						) }
					</div>
				);
			} ) }
		</div>
	);
}
