import { useEffect, useRef, useState } from '@wordpress/element';
import {
	PREVIEW_DEFAULT_HEIGHT,
	buildPreviewUrl as buildPreviewRequestUrl,
	getPreviewOrigin,
	registerPreviewResizeListener,
} from '../../../../../../../frontend/src/lib/wp-block-preview-format';
import { NOMIA_FE_BASE_URL, PREVIEW_TOKEN } from './settings';

export function buildPreviewUrl( blockName, attributes ) {
	return buildPreviewRequestUrl( {
		baseUrl: NOMIA_FE_BASE_URL,
		blockName,
		attributes,
		previewToken: PREVIEW_TOKEN,
	} );
}

const PREVIEW_DEBOUNCE_MS = 300;

export function PreviewIframe( { title, src } ) {
	const iframeRef = useRef( null );
	const [ height, setHeight ] = useState( PREVIEW_DEFAULT_HEIGHT );

	// The preview URL encodes every attribute, so `src` changes on every keystroke.
	// Debounce it so the iframe only reloads shortly after typing pauses, instead
	// of once per keystroke (which causes visible flicker + a preview round-trip).
	const [ debouncedSrc, setDebouncedSrc ] = useState( src );
	useEffect( () => {
		const id = setTimeout(
			() => setDebouncedSrc( src ),
			PREVIEW_DEBOUNCE_MS
		);
		return () => clearTimeout( id );
	}, [ src ] );

	useEffect( () => {
		const expectedOrigin = getPreviewOrigin( NOMIA_FE_BASE_URL );

		return registerPreviewResizeListener(
			window,
			() => ( {
				expectedOrigin,
				source: iframeRef.current?.contentWindow,
			} ),
			( nextHeight ) => setHeight( nextHeight )
		);
	}, [] );

	return (
		<iframe
			ref={ iframeRef }
			title={ title }
			src={ debouncedSrc }
			loading="lazy"
			style={ { height: `${ height }px` } }
		/>
	);
}
