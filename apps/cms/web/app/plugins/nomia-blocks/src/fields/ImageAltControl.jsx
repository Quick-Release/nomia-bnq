// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/*
 * Image alt-text inspector field. The `TextControl` with the translatable
 * "Image alt text" label is duplicated in the editors that manage a primary
 * image (TwoColumnsTextImage, MapList).
 */
export function ImageAltControl( { value, onChange } ) {
	return (
		<TextControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ __(
				'Texto alternativo da imagem',
				'getquick-nomia-blocks'
			) }
			value={ value || '' }
			onChange={ onChange }
		/>
	);
}
