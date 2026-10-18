// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button } from '@wordpress/components';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';

/*
 * Inspector media-upload button (the `Button variant="secondary"` envelope).
 *
 * Replaces the inline
 * `<MediaUploadCheck><MediaUpload allowedTypes={['image']} render={<Button variant="secondary">…}>` block duplicated
 * across the custom editors. `labelSelect`/`labelReplace` are the
 * already-translated button labels; `hasImage` picks between them.
 *
 * Block-toolbar variants (which use `ToolbarButton` + an icon) are intentionally
 * not handled here — keep those inline.
 *
 * Pass `previewUrl` to turn the control into the selected image itself: the
 * thumbnail becomes the button that opens the media library. Editors that do
 * not pass it keep the plain text button.
 */
export function MediaUploadButton( {
	imageId,
	onSelect,
	labelSelect,
	labelReplace,
	hasImage,
	previewUrl,
	previewAlt = '',
} ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				allowedTypes={ [ 'image' ] }
				value={ imageId }
				onSelect={ onSelect }
				render={ ( { open } ) =>
					previewUrl ? (
						<Button
							__next40pxDefaultSize
							className="getquick-nomia-blocks-media-upload__preview"
							label={ labelReplace }
							showTooltip
							onClick={ open }
						>
							<img src={ previewUrl } alt={ previewAlt } />
							<span>{ labelReplace }</span>
						</Button>
					) : (
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ open }
						>
							{ hasImage ? labelReplace : labelSelect }
						</Button>
					)
				}
			/>
		</MediaUploadCheck>
	);
}
