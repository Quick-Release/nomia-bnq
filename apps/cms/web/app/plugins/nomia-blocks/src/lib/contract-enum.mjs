/**
 * Enum attribute reader, kept free of the generated `contracts.json` import so
 * it can be exercised outside webpack. `contract-enum.js` supplies the real
 * contracts; tests supply their own.
 *
 * `read()` clamps leniently — trimming and lowercasing before matching — so the
 * editor resolves a stored value exactly as the Astro renderer does. A sidebar
 * that highlighted one step while the page rendered another would be worse than
 * either being strict.
 *
 * @param {Array<{blockName: string, attributes?: Object}>} contracts     Generated block contracts.
 * @param {string}                                          blockName     Registered block name, e.g. `getquick/section`.
 * @param {string}                                          attributeName Enum attribute to read from that block.
 * @return {{values: string[], fallback: string|undefined, read: (value: unknown) => string|undefined}} Allowed values, the contract default, and a reader that clamps onto it.
 */
export function enumFromContracts( contracts, blockName, attributeName ) {
	const schema = contracts.find( ( item ) => item.blockName === blockName )
		?.attributes?.[ attributeName ];
	const values = Array.isArray( schema?.enum ) ? schema.enum : [];
	const fallback = values.includes( schema?.default )
		? schema.default
		: values[ 0 ];

	return {
		values,
		fallback,
		read: ( value ) => {
			if ( typeof value !== 'string' ) {
				return fallback;
			}
			const step = value.trim().toLowerCase();
			return values.includes( step ) ? step : fallback;
		},
	};
}
