// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button, PanelBody, SelectControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { slugFromLabel } from '../lib/slug';
import { UrlField } from '../fields/UrlField';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import { ImageAltControl } from '../fields/ImageAltControl';
import './MapList.css';

const MAP_REGION_OPTIONS = [
	{ label: 'Norte', value: 'norte' },
	{ label: 'Centro', value: 'centro' },
	{ label: 'Lisboa', value: 'lisboa' },
	{ label: 'Alentejo', value: 'alentejo' },
	{ label: 'Algarve', value: 'algarve' },
	{ label: 'Açores', value: 'acores' },
	{ label: 'Madeira', value: 'madeira' },
];

const MAP_AUDIENCE_OPTIONS = [
	{ label: 'Empresas', value: 'empresas' },
	{ label: 'Cidadãos', value: 'cidadaos' },
	{ label: 'Investigação', value: 'investigacao' },
];

const DEFAULT_MAP_LIST_ITEM = {
	id: '',
	title: '',
	excerpt: '',
	dateLabel: '',
	imageId: undefined,
	imageSrc: '',
	imageAlt: '',
	href: '',
	regionId: 'alentejo',
	audienceIds: [],
};

function defaultMapRegions() {
	return MAP_REGION_OPTIONS.map( ( option ) => ( {
		id: option.value,
		label: option.label,
	} ) );
}

function defaultMapAudiences() {
	return MAP_AUDIENCE_OPTIONS.map( ( option ) => ( {
		id: option.value,
		label: option.label,
	} ) );
}

function normalizeMapTerms( value, defaults ) {
	return Array.isArray( value ) && value.length > 0
		? value.map( ( term ) => ( {
				id: term?.id || '',
				label: term?.label || '',
		  } ) )
		: defaults();
}

function normalizeMapItems( attributes ) {
	return Array.isArray( attributes.items )
		? attributes.items.map( ( item ) => ( {
				...DEFAULT_MAP_LIST_ITEM,
				id: item?.id || '',
				title: item?.title || '',
				excerpt: item?.excerpt || '',
				dateLabel: item?.dateLabel || '',
				imageId: item?.imageId,
				imageSrc: item?.imageSrc || item?.imageUrl || '',
				imageAlt: item?.imageAlt || '',
				href: item?.href || item?.url || '',
				regionId: item?.regionId || 'alentejo',
				audienceIds: Array.isArray( item?.audienceIds )
					? item.audienceIds
					: [],
		  } ) )
		: [];
}

export function MapListEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( { className: 'map-list-editor' } );
	const regions = normalizeMapTerms( attributes.regions, defaultMapRegions );
	const audiences = normalizeMapTerms(
		attributes.audiences,
		defaultMapAudiences
	);
	const items = normalizeMapItems( attributes );
	const [ selectedIndex, setSelectedIndex ] = useState( 0 );
	const selectedItem = items[ selectedIndex ] || DEFAULT_MAP_LIST_ITEM;
	const hasItems = items.length > 0;

	function updateRegionLabel( id, label ) {
		setAttributes( {
			regions: regions.map( ( region ) =>
				region.id === id ? { ...region, label } : region
			),
		} );
	}

	function updateAudienceLabel( id, label ) {
		setAttributes( {
			audiences: audiences.map( ( audience ) =>
				audience.id === id ? { ...audience, label } : audience
			),
		} );
	}

	function setItems( nextItems ) {
		setAttributes( { items: nextItems } );
	}

	function updateItem( index, patch ) {
		setItems(
			items.map( ( item, itemIndex ) =>
				itemIndex === index ? { ...item, ...patch } : item
			)
		);
	}

	function addItem() {
		const nextItems = [
			...items,
			{
				...DEFAULT_MAP_LIST_ITEM,
				id: `map-item-${ items.length + 1 }`,
			},
		];
		setItems( nextItems );
		setSelectedIndex( nextItems.length - 1 );
	}

	function removeItem( index ) {
		const nextItems = items.filter(
			( _, itemIndex ) => itemIndex !== index
		);
		setItems( nextItems );
		setSelectedIndex(
			Math.max( 0, Math.min( index, nextItems.length - 1 ) )
		);
	}

	function setMapItemImage( index, media ) {
		const nextUrl = media?.url || '';
		const item = items[ index ] || DEFAULT_MAP_LIST_ITEM;
		updateItem( index, {
			imageId: media?.id,
			imageSrc: nextUrl,
			imageAlt: media?.alt ?? item.imageAlt ?? '',
		} );
	}

	return (
		<>
			<InspectorControls>
				{ hasItems ? (
					<PanelBody
						title={ __(
							'Selected item fields',
							'getquick-nomia-blocks'
						) }
						initialOpen
					>
						<ImageAltControl
							value={ selectedItem.imageAlt || '' }
							onChange={ ( next ) =>
								updateItem( selectedIndex, { imageAlt: next } )
							}
						/>
						<UrlField
							label={ __( 'Item URL', 'getquick-nomia-blocks' ) }
							value={ selectedItem.href || '' }
							onChange={ ( next ) =>
								updateItem( selectedIndex, { href: next } )
							}
						/>
						<SelectControl
							label={ __( 'Region', 'getquick-nomia-blocks' ) }
							value={ selectedItem.regionId || 'alentejo' }
							options={ MAP_REGION_OPTIONS }
							onChange={ ( next ) =>
								updateItem( selectedIndex, { regionId: next } )
							}
						/>
						<SelectControl
							multiple
							label={ __( 'Audiences', 'getquick-nomia-blocks' ) }
							value={
								Array.isArray( selectedItem.audienceIds )
									? selectedItem.audienceIds
									: []
							}
							options={ MAP_AUDIENCE_OPTIONS }
							onChange={ ( next ) =>
								updateItem( selectedIndex, {
									audienceIds: Array.isArray( next )
										? next
										: [ next ],
								} )
							}
						/>
					</PanelBody>
				) : null }
			</InspectorControls>
			<section { ...blockProps }>
				<div className="map-list-editor__inner">
					<div className="map-list-editor__map">
						{ __(
							'Portugal regions map preview',
							'getquick-nomia-blocks'
						) }
					</div>
					<div className="map-list-editor__panel">
						<div className="map-list-editor__filters">
							<h2>
								{ __( 'Filtros', 'getquick-nomia-blocks' ) }
							</h2>
							<div>
								<RichText
									tagName="span"
									value={
										regions[ 0 ]?.label ||
										__( 'Região', 'getquick-nomia-blocks' )
									}
									placeholder={ __(
										'Region label',
										'getquick-nomia-blocks'
									) }
									allowedFormats={ [] }
									onChange={ ( next ) =>
										updateRegionLabel(
											regions[ 0 ]?.id || 'norte',
											next
										)
									}
								/>
								{ audiences.map( ( audience ) => (
									<RichText
										key={ audience.id }
										tagName="span"
										value={ audience.label || '' }
										placeholder={ __(
											'Audience label',
											'getquick-nomia-blocks'
										) }
										allowedFormats={ [] }
										onChange={ ( next ) =>
											updateAudienceLabel(
												audience.id,
												next
											)
										}
									/>
								) ) }
							</div>
							<Button variant="secondary" onClick={ addItem }>
								{ __( 'Add item', 'getquick-nomia-blocks' ) }
							</Button>
						</div>
						{ hasItems ? (
							<div className="map-list-editor__items">
								{ items.map( ( item, index ) => (
									<article
										className={ `map-list-editor__list-row${
											selectedIndex === index
												? ' is-selected'
												: ''
										}` }
										key={ index }
									>
										<div className="map-list-editor__image">
											{ item.imageSrc || item.imageUrl ? (
												<img
													src={
														item.imageSrc ||
														item.imageUrl
													}
													alt={ item.imageAlt || '' }
												/>
											) : (
												<div className="map-list-editor__image-placeholder">
													{ __(
														'Select image',
														'getquick-nomia-blocks'
													) }
												</div>
											) }
											<div className="map-list-editor__image-actions">
												<button
													type="button"
													className="getquick-nomia-blocks-selection-button"
													aria-label={ sprintf(
														/* translators: %d: the item position in the list. */
														__(
															'Select item %d',
															'getquick-nomia-blocks'
														),
														index + 1
													) }
													aria-pressed={
														selectedIndex === index
													}
													onClick={ () =>
														setSelectedIndex(
															index
														)
													}
												>
													{ selectedIndex === index
														? __(
																'Selected',
																'getquick-nomia-blocks'
														  )
														: __(
																'Select',
																'getquick-nomia-blocks'
														  ) }
												</button>
												<MediaUploadButton
													imageId={ item.imageId }
													onSelect={ ( media ) =>
														setMapItemImage(
															index,
															media
														)
													}
													labelSelect={ __(
														'Select image',
														'getquick-nomia-blocks'
													) }
													labelReplace={ __(
														'Replace image',
														'getquick-nomia-blocks'
													) }
													hasImage={ Boolean(
														item.imageSrc ||
															item.imageUrl
													) }
												/>
												<Button
													isDestructive
													variant="secondary"
													onClick={ () =>
														removeItem( index )
													}
												>
													{ __(
														'Remove',
														'getquick-nomia-blocks'
													) }
												</Button>
											</div>
										</div>
										<div className="map-list-editor__copy">
											<RichText
												tagName="h3"
												value={ item.title || '' }
												placeholder={ __(
													'Item title',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateItem( index, {
														title: next,
														id:
															item.id ||
															slugFromLabel(
																next
															),
													} )
												}
											/>
											<RichText
												tagName="p"
												value={ item.excerpt || '' }
												placeholder={ __(
													'Excerpt',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [
													'core/bold',
													'core/italic',
												] }
												onChange={ ( next ) =>
													updateItem( index, {
														excerpt: next,
													} )
												}
											/>
											<RichText
												tagName="span"
												value={ item.dateLabel || '' }
												placeholder={ __(
													'Date label',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateItem( index, {
														dateLabel: next,
													} )
												}
											/>
										</div>
									</article>
								) ) }
							</div>
						) : (
							<div className="map-list-editor__empty">
								<p>
									{ __(
										'Add an item to start editing the map list.',
										'getquick-nomia-blocks'
									) }
								</p>
								<Button variant="primary" onClick={ addItem }>
									{ __(
										'Add item',
										'getquick-nomia-blocks'
									) }
								</Button>
							</div>
						) }
					</div>
				</div>
			</section>
		</>
	);
}
