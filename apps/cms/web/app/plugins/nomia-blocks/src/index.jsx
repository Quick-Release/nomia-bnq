// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	getBlockType,
	registerBlockType,
	registerBlockVariation,
} from '@wordpress/blocks';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button, ColorPicker, Notice } from '@wordpress/components';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { useDispatch, useSelect } from '@wordpress/data';
/*
 * `@wordpress/editor`, not `@wordpress/edit-post`: the document setting panel
 * moved in WordPress 6.6 and `wp.editPost` only re-exports it behind a
 * deprecation notice, returning null in the site editor.
 */

import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { registerPlugin } from '@wordpress/plugins';
import contracts from './contracts.json';
import './editor.css';
import { AttributeField } from './fields/AttributeField';
import { normalizeHexColor, useSiteColors } from './lib/colors';
import { buildPreviewUrl, PreviewIframe } from './lib/preview';
import { CUSTOM_EDITORS } from './editors';
import { BLOCK_DEPRECATIONS } from './deprecations';

const PAGE_BACKGROUND_META_KEY = '_nomia_page_background_color';

const INLINE_EDITOR_HIDDEN_ATTRIBUTES = new Set( [
	'schemaVersion',
	'blockId',
] );

function NomiaPageBackgroundPanel() {
	const siteColors = useSiteColors();
	const postType = useSelect(
		( select ) => select( 'core/editor' )?.getCurrentPostType?.(),
		[]
	);
	const meta =
		useSelect(
			( select ) =>
				select( 'core/editor' )?.getEditedPostAttribute?.( 'meta' ) ||
				{},
			[]
		) || {};
	const { editPost } = useDispatch( 'core/editor' );

	if ( postType !== 'page' ) {
		return null;
	}

	const currentColor = normalizeHexColor(
		meta[ PAGE_BACKGROUND_META_KEY ] || ''
	);

	const setBackgroundColor = ( nextColor ) => {
		editPost( {
			meta: {
				...meta,
				[ PAGE_BACKGROUND_META_KEY ]: normalizeHexColor( nextColor ),
			},
		} );
	};

	return (
		<PluginDocumentSettingPanel
			name="nomia-page-background"
			title={ __( 'Fundo da página', 'getquick-nomia-blocks' ) }
			className="getquick-nomia-page-background-panel"
		>
			<div className="getquick-nomia-page-background-panel__theme-colors">
				{ siteColors.map( ( option ) => {
					const color = normalizeHexColor( option.color );
					const isSelected = currentColor === color;

					return (
						<button
							key={ option.slug }
							type="button"
							className="getquick-nomia-page-background-panel__swatch"
							data-selected={ isSelected ? 'true' : undefined }
							style={ {
								'--nomia-page-background-swatch': color,
							} }
							aria-label={ option.label }
							aria-pressed={ isSelected }
							title={ option.label }
							onClick={ () => setBackgroundColor( color ) }
						>
							<span className="screen-reader-text">
								{ option.label }
							</span>
						</button>
					);
				} ) }
			</div>
			<ColorPicker
				color={ currentColor || '#ffffff' }
				enableAlpha={ false }
				onChange={ setBackgroundColor }
			/>
			<div
				className="getquick-nomia-page-background-panel__actions"
				style={ {
					'--nomia-page-background-preview':
						currentColor || '#ffffff',
				} }
			>
				<span className="getquick-nomia-page-background-panel__preview" />
				<Button
					variant="secondary"
					onClick={ () => setBackgroundColor( '' ) }
					disabled={ ! currentColor }
				>
					{ __( 'Repor', 'getquick-nomia-blocks' ) }
				</Button>
			</div>
		</PluginDocumentSettingPanel>
	);
}

function Edit( props ) {
	const { name, attributes, setAttributes } = props;
	const contract = contracts.find( ( item ) => item.blockName === name );
	const previewUrl = useMemo(
		() => buildPreviewUrl( name, attributes ),
		[ name, attributes ]
	);
	const blockProps = useBlockProps( {
		className: 'getquick-nomia-blocks-inline-editor',
	} );

	if ( ! contract ) {
		return (
			<Notice status="error" isDismissible={ false }>
				{ __(
					'Contrato de bloco Nomia em falta.',
					'getquick-nomia-blocks'
				) }
			</Notice>
		);
	}

	const CustomEditor = CUSTOM_EDITORS[ name ];
	if ( CustomEditor ) {
		// Forward every block prop: bespoke editors that float per-field
		// controls need `isSelected`/`clientId`, not just the attributes.
		return <CustomEditor { ...props } />;
	}

	const editableAttributes = Object.entries( contract.attributes ).filter(
		( [ attributeName ] ) =>
			! INLINE_EDITOR_HIDDEN_ATTRIBUTES.has( attributeName )
	);

	// The registry holds the copy that went through `__()` on the PHP side;
	// `contracts.json` only carries the untranslated Portuguese source.
	const blockType = getBlockType( name );

	return (
		<div { ...blockProps }>
			<p className="getquick-nomia-blocks-inline-editor__intro">
				{ blockType?.description ?? contract.description }
			</p>
			{ editableAttributes.map( ( [ attributeName, schema ] ) => (
				<AttributeField
					key={ attributeName }
					attributeName={ attributeName }
					schema={ schema }
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) ) }
			{ contract.editorExperience === 'inline-fields' ? null : (
				<div className="getquick-nomia-blocks-editor-preview">
					<PreviewIframe
						title={ sprintf(
							/* translators: %s: block title. */
							__(
								'Pré-visualização: %s',
								'getquick-nomia-blocks'
							),
							blockType?.title ?? contract.title
						) }
						src={ previewUrl }
					/>
				</div>
			) }
		</div>
	);
}

/*
 * Only `edit`, `save`, and any `deprecated` versions are registered here.
 * Everything else — apiVersion, title, description, icon, category, keywords,
 * example, attributes, supports — comes from each block's generated
 * `block.json`, which PHP registers and WordPress serializes into the editor
 * before this script runs.
 *
 * This is not just deduplication. `processBlockType` merges the two as
 * `{ ...serverDefinition, ...jsSettings }`, so anything passed here wins — and
 * the strings in `contracts.json` are the raw Portuguese source, while the
 * server definition carries the copy WordPress translated through the
 * `block.json` text domain. Passing a title here would pin the inserter to
 * Portuguese in every locale and make the translation catalogs dead weight.
 */
for ( const contract of contracts ) {
	const deprecated = BLOCK_DEPRECATIONS[ contract.blockName ]?.(
		contract.attributes
	);
	registerBlockType( contract.blockName, {
		edit: Edit,
		// Container blocks must serialize their children into post_content;
		// Astro reads them back from `content(format: RAW)`. Every other block
		// is attribute-only and saves nothing.
		save: contract.container ? () => <InnerBlocks.Content /> : () => null,
		...( deprecated ? { deprecated } : {} ),
	} );
}

/*
 * The visual prototype is a native `core/button` variation rather than a
 * second custom block. WordPress still owns the button text/link controls and
 * serialization; Astro recognizes the class and owns the final markup.
 */
registerBlockVariation( 'core/button', {
	name: 'bioeconomia',
	title: __( 'Botão Bioeconomia', 'getquick-nomia-blocks' ),
	description: __(
		'Botão animado com o estilo visual da Bioeconomia.',
		'getquick-nomia-blocks'
	),
	icon: 'button',
	attributes: {
		className: 'is-style-bioeconomia',
		text: 'Explora a Bionomia',
	},
	scope: [ 'inserter' ],
} );

registerPlugin( 'getquick-nomia-page-background', {
	render: NomiaPageBackgroundPanel,
} );
