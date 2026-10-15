export function fieldKind( attributeName, schema ) {
	if ( schema?.ui?.kind ) {
		return schema.ui.kind;
	}
	if ( Array.isArray( schema?.enum ) ) {
		return 'select';
	}
	if ( schema?.type === 'array' || schema?.type === 'object' ) {
		return 'json';
	}
	if ( schema?.type === 'boolean' ) {
		return 'boolean';
	}
	if ( schema?.type === 'number' ) {
		return 'number';
	}
	if (
		/image.*(Id|Url|Src)|hero.*(Url|Src)|primary.*(Url|Src)|leftImage.*(Url|Src)|rightImage.*(Url|Src)/i.test(
			attributeName
		)
	) {
		return 'media';
	}
	if ( /href|url|link/i.test( attributeName ) ) {
		return 'url';
	}
	if (
		/body|description|summary|intro|subtitle|heading/i.test( attributeName )
	) {
		return 'textarea';
	}
	return 'text';
}
