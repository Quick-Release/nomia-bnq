export function slugFromLabel( label ) {
	return String( label || '' )
		.trim()
		.toLowerCase()
		.normalize( 'NFD' )
		.replace( /[\u0300-\u036f]/g, '' )
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /(^-|-$)/g, '' );
}
