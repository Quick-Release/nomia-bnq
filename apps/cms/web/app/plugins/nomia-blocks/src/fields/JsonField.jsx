// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function JsonField( { label, value, onChange } ) {
	const stringValue =
		typeof value === 'string'
			? value
			: JSON.stringify( value ?? {}, null, 2 );
	return (
		<TextareaControl
			label={ label }
			value={ stringValue }
			rows={ 8 }
			help={ __(
				'Structured content only. Visual styling is controlled by the Astro web app.',
				'getquick-nomia-blocks'
			) }
			onChange={ ( next ) => {
				try {
					onChange( JSON.parse( next || 'null' ) );
				} catch {
					onChange( next );
				}
			} }
		/>
	);
}
