function isPlainObject( value ) {
	return (
		value !== null && typeof value === 'object' && ! Array.isArray( value )
	);
}

function cloneValue( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( cloneValue );
	}
	if ( isPlainObject( value ) ) {
		return Object.fromEntries(
			Object.entries( value ).map( ( [ key, entry ] ) => [
				key,
				cloneValue( entry ),
			] )
		);
	}
	return value;
}

export function arrayItemFields( schema ) {
	const itemSchema = schema?.items;
	return itemSchema?.type === 'object' &&
		isPlainObject( itemSchema.properties )
		? itemSchema.properties
		: null;
}

export function blankValueForSchema( schema ) {
	if ( schema && 'default' in schema ) {
		return cloneValue( schema.default );
	}
	if ( schema?.type === 'array' ) {
		return [];
	}
	if ( schema?.type === 'object' ) {
		return {};
	}
	if ( schema?.type === 'boolean' ) {
		return false;
	}
	if ( schema?.type === 'number' ) {
		return undefined;
	}
	return '';
}

export function blankArrayItem( schema ) {
	const fields = arrayItemFields( schema );
	if ( ! fields ) {
		return '';
	}
	return Object.fromEntries(
		Object.entries( fields ).map( ( [ name, fieldSchema ] ) => [
			name,
			blankValueForSchema( fieldSchema ),
		] )
	);
}

function hasValue( value ) {
	if ( typeof value === 'string' ) {
		return value.trim() !== '';
	}
	if ( Array.isArray( value ) ) {
		return value.length > 0;
	}
	return value !== null && value !== undefined;
}

function readFieldValue( row, fieldName, schema ) {
	const current = row[ fieldName ];
	if ( hasValue( current ) ) {
		return current;
	}
	for ( const legacyName of schema?.legacyReads || [] ) {
		if ( hasValue( row[ legacyName ] ) ) {
			return row[ legacyName ];
		}
	}
	return current;
}

export function normalizeArrayItem( row, schema ) {
	const fields = arrayItemFields( schema );
	if ( ! fields || ! isPlainObject( row ) ) {
		return row;
	}
	return Object.fromEntries(
		Object.entries( fields ).map( ( [ name, fieldSchema ] ) => [
			name,
			readFieldValue( row, name, fieldSchema ),
		] )
	);
}

function matchesType( value, schema ) {
	if ( value === '' || value === null || value === undefined ) {
		return true;
	}
	if ( schema?.type === 'array' ) {
		return Array.isArray( value );
	}
	if ( schema?.type === 'object' ) {
		return isPlainObject( value );
	}
	if ( schema?.type === 'boolean' ) {
		return (
			value === true ||
			value === false ||
			value === 'true' ||
			value === 'false'
		);
	}
	if ( schema?.type === 'number' ) {
		return Number.isFinite(
			typeof value === 'number' ? value : Number( value )
		);
	}
	if ( schema?.type === 'string' ) {
		return typeof value === 'string' || typeof value === 'number';
	}
	return true;
}

export function isValidArrayItem( row, schema ) {
	const fields = arrayItemFields( schema );
	const itemSchema = schema?.items;
	if ( ! fields || ! isPlainObject( row ) ) {
		return ! itemSchema?.required?.length;
	}
	const normalized = normalizeArrayItem( row, schema );
	const required = itemSchema.required || [];
	return (
		required.every( ( name ) => hasValue( normalized[ name ] ) ) &&
		Object.entries( fields ).every( ( [ name, fieldSchema ] ) => {
			const value = normalized[ name ];
			return (
				matchesType( value, fieldSchema ) &&
				( ! hasValue( value ) ||
					! Array.isArray( fieldSchema?.enum ) ||
					fieldSchema.enum.includes( value ) )
			);
		} )
	);
}
