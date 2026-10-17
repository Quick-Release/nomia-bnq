// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { URLInput } from '@wordpress/block-editor';

/*
 * Inspector URL field (the `getquick-nomia-blocks-url-field` envelope).
 *
 * Replaces the inline `<div className="...url-field"><label/><URLInput/></div>`
 * block duplicated across the custom editors (CTA URL, Result URL, Item URL,
 * Listen/Share/Spotlight/Platform URL, …). `label` is the already-translated
 * field label; `value`/`onChange` are caller-supplied so this works for both
 * top-level attributes and array-item editors.
 */
export function UrlField( { label, value, onChange } ) {
	return (
		<div className="getquick-nomia-blocks-url-field">
			<URLInput
				__next40pxDefaultSize
				label={ label }
				value={ value || '' }
				onChange={ onChange }
			/>
		</div>
	);
}
