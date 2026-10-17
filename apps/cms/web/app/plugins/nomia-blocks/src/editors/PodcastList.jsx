// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button, PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { UrlField } from '../fields/UrlField';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import './PodcastList.css';

const DEFAULT_PODCAST_ITEM = {
	episodeNumber: '',
	dateLabel: '',
	title: '',
	imageId: undefined,
	imageSrc: '',
	imageAlt: '',
	listenHref: '',
	shareUrl: '',
};

function normalizePodcastItems( attributes ) {
	const source =
		[ attributes.items, attributes.episodes ].find( Array.isArray ) ?? [];
	return source.map( ( item ) => ( {
		...DEFAULT_PODCAST_ITEM,
		episodeNumber: item?.episodeNumber ?? '',
		dateLabel: item?.dateLabel || '',
		title: item?.title || '',
		imageId: item?.imageId,
		imageSrc: item?.imageSrc || item?.imageUrl || '',
		imageAlt: item?.imageAlt || '',
		listenHref: item?.listenHref || item?.listenUrl || '',
		shareUrl: item?.shareUrl || '',
	} ) );
}

export function PodcastListEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( { className: 'content-list-editor' } );
	const items = normalizePodcastItems( attributes );
	const [ selectedIndex, setSelectedIndex ] = useState( 0 );
	const selectedItem = items[ selectedIndex ] || DEFAULT_PODCAST_ITEM;
	const hasItems = items.length > 0;

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
				...DEFAULT_PODCAST_ITEM,
				episodeNumber: items.length + 1,
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

	function setPodcastImage( index, media ) {
		const nextUrl = media?.url || '';
		updateItem( index, {
			imageId: media?.id,
			imageSrc: nextUrl,
			imageAlt: media?.alt ?? '',
		} );
	}

	return (
		<>
			<InspectorControls>
				{ hasItems ? (
					<PanelBody
						title={ __(
							'Selected episode fields',
							'getquick-nomia-blocks'
						) }
						initialOpen
					>
						<UrlField
							label={ __(
								'Listen URL',
								'getquick-nomia-blocks'
							) }
							value={
								selectedItem.listenHref ||
								selectedItem.listenUrl ||
								''
							}
							onChange={ ( next ) =>
								updateItem( selectedIndex, {
									listenHref: next,
								} )
							}
						/>
						<UrlField
							label={ __( 'Share URL', 'getquick-nomia-blocks' ) }
							value={ selectedItem.shareUrl || '' }
							onChange={ ( next ) =>
								updateItem( selectedIndex, {
									shareUrl: next,
								} )
							}
						/>
					</PanelBody>
				) : null }
			</InspectorControls>
			<section { ...blockProps }>
				{ hasItems ? (
					<div className="content-list-editor__inner">
						<div className="content-list-editor__toolbar">
							<Button variant="secondary" onClick={ addItem }>
								{ __( 'Add episode', 'getquick-nomia-blocks' ) }
							</Button>
						</div>
						{ items.map( ( item, index ) => (
							<article
								className={ `content-list-editor__item${
									selectedIndex === index
										? ' is-selected'
										: ''
								}` }
								key={ index }
							>
								<div className="content-list-editor__image">
									{ item.imageUrl || item.imageSrc ? (
										<img
											src={
												item.imageUrl || item.imageSrc
											}
											alt={ item.imageAlt || '' }
										/>
									) : (
										<div className="content-list-editor__image-placeholder">
											{ __(
												'Select image',
												'getquick-nomia-blocks'
											) }
										</div>
									) }
									<div className="content-list-editor__image-actions">
										<button
											type="button"
											className="getquick-nomia-blocks-selection-button"
											aria-label={ sprintf(
												/* translators: %d: the episode position in the list. */
												__(
													'Select episode %d',
													'getquick-nomia-blocks'
												),
												index + 1
											) }
											aria-pressed={
												selectedIndex === index
											}
											onClick={ () =>
												setSelectedIndex( index )
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
												setPodcastImage( index, media )
											}
											labelSelect={ __(
												'Select episode image',
												'getquick-nomia-blocks'
											) }
											labelReplace={ __(
												'Replace episode image',
												'getquick-nomia-blocks'
											) }
											hasImage={ Boolean(
												item.imageUrl || item.imageSrc
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
								<div className="content-list-editor__copy">
									<div className="content-list-editor__meta">
										<span className="content-list-editor__badge">
											{ `${ __(
												'Episode',
												'getquick-nomia-blocks'
											) } ` }
											<RichText
												tagName="span"
												value={ String(
													item.episodeNumber ?? ''
												) }
												placeholder="1"
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateItem( index, {
														episodeNumber: next,
													} )
												}
											/>
										</span>
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
									<RichText
										tagName="h2"
										value={ item.title || '' }
										placeholder={ __(
											'Episode title',
											'getquick-nomia-blocks'
										) }
										allowedFormats={ [] }
										onChange={ ( next ) =>
											updateItem( index, { title: next } )
										}
									/>
									<div className="content-list-editor__actions">
										<span>
											{ __(
												'Ouvir',
												'getquick-nomia-blocks'
											) }
										</span>
										<span>
											{ __(
												'Partilhar',
												'getquick-nomia-blocks'
											) }
										</span>
									</div>
								</div>
							</article>
						) ) }
					</div>
				) : (
					<div className="content-list-editor__empty">
						<p>
							{ __(
								'Add an episode to start editing the podcast list.',
								'getquick-nomia-blocks'
							) }
						</p>
						<Button variant="primary" onClick={ addItem }>
							{ __( 'Add episode', 'getquick-nomia-blocks' ) }
						</Button>
					</div>
				) }
			</section>
		</>
	);
}
