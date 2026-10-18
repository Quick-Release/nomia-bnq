// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BlockControls,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
	Warning,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	Button,
	PanelBody,
	Popover,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { contactDetailsLines } from '@nomia/web-src/lib/contact-details-card';
import { safeHref } from '@nomia/web-src/lib/safe-href';
import { ImageAltControl } from '../fields/ImageAltControl';
import { MediaUploadButton } from '../fields/MediaUploadButton';
import { UrlField } from '../fields/UrlField';
import './ContactDetailsCard.css';

// The `link` glyph from `@wordpress/icons`, which WordPress does not expose as a
// script global; inlined so the toolbar matches core's Button block without
// bundling the icon package.
const linkIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
	>
		<path
			d="M9.5 12L14.5 12M10 7.75H8.25C5.90279 7.75 4 9.65279 4 12C4 14.3472 5.90279 16.25 8.25 16.25H10M14 16.25H15.75C18.0972 16.25 20 14.3472 20 12C20 9.65279 18.0972 7.75 15.75 7.75L14 7.75"
			vectorEffect="non-scaling-stroke"
		/>
	</svg>
);

// The title and details take bold and italic, which the Astro renderer turns
// back into `<strong>`/`<em>`; the button text stays plain. No field gets link
// tooling, and only the details, whose lines are the point, take a `<br>`.
const PLAIN_TEXT_PROPS = {
	allowedFormats: [],
	withoutInteractiveFormatting: true,
};
const FORMATTED_TEXT_PROPS = {
	allowedFormats: [ 'core/bold', 'core/italic' ],
	withoutInteractiveFormatting: true,
};

function ArrowLargeRightIcon() {
	return (
		<svg
			viewBox="0 0 32 32"
			width={ 32 }
			height={ 32 }
			fill="none"
			aria-hidden
			focusable={ false }
		>
			<path
				d="M3.74348 16.2565L28.2565 16.2565M16.4903 4.49025L28.2565 16.2565L16.4903 28.0228"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ContactDetailsCardEdit( {
	attributes,
	setAttributes,
	isSelected,
} ) {
	const blockProps = useBlockProps( {
		className: 'getquick-contact-details-card-editor',
	} );
	// The link popover opens from the toolbar or from the link chip under the
	// button; the element that opened it is its anchor, and null means closed.
	const [ linkAnchor, setLinkAnchor ] = useState( null );
	// Close the popover with the selection, as core's Button block does, so it
	// does not reopen on the next selection against a stale anchor.
	useEffect( () => {
		if ( ! isSelected ) {
			setLinkAnchor( null );
		}
	}, [ isSelected ] );
	const iconUrl = attributes.iconUrl || '';
	const iconAlt = attributes.iconAlt || '';
	const buttonHref = attributes.buttonHref || '';
	const hideIcon = attributes.hideIcon === true;
	const hideButton = attributes.hideButton === true;
	// Mirrors ContactDetailsCardBlock.astro: the button needs a label and a
	// followable link, and the card needs at least one visible part.
	const hasButtonLabel =
		contactDetailsLines( attributes.buttonLabel ).length > 0;
	const hasSafeButtonHref = Boolean( safeHref( buttonHref ) );
	const isUnsafeButtonHref =
		Boolean( buttonHref.trim() ) && ! hasSafeButtonHref;
	const rendersButton = ! hideButton && hasButtonLabel && hasSafeButtonHref;
	const isButtonIncomplete =
		! hideButton &&
		! rendersButton &&
		( hasButtonLabel || Boolean( buttonHref.trim() ) );
	const rendersCard =
		contactDetailsLines( attributes.title ).length > 0 ||
		contactDetailsLines( attributes.details ).length > 0 ||
		rendersButton;
	const buttonWarning = isUnsafeButtonHref
		? __(
				'Este link não é aceite e o botão não aparece no site. Use uma página, https://…, mailto: ou tel:.',
				'getquick-nomia-blocks'
		  )
		: __(
				'O botão só aparece no site com texto e link.',
				'getquick-nomia-blocks'
		  );

	function toggleLinkEditor( anchor ) {
		setLinkAnchor( ( current ) => ( current === anchor ? null : anchor ) );
	}

	function setIcon( media ) {
		setAttributes( {
			iconId: media?.id,
			iconUrl: media?.url || '',
			iconAlt: media?.alt ?? '',
		} );
	}

	function removeIcon() {
		setAttributes( {
			iconId: undefined,
			iconUrl: '',
			iconAlt: '',
		} );
	}

	const linkField = (
		<>
			<UrlField
				label={ __( 'Link do botão', 'getquick-nomia-blocks' ) }
				value={ buttonHref }
				onChange={ ( next ) => setAttributes( { buttonHref: next } ) }
			/>
			<p className="getquick-contact-details-card-editor__hint">
				{ __(
					'Página, https://…, mailto:email@exemplo.pt ou tel:+351…. Sem link, o botão não aparece no site.',
					'getquick-nomia-blocks'
				) }
			</p>
		</>
	);

	return (
		<>
			{ hideButton ? null : (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon={ linkIcon }
							label={ __(
								'Editar link do botão',
								'getquick-nomia-blocks'
							) }
							showTooltip
							isPressed={ Boolean( linkAnchor || buttonHref ) }
							aria-expanded={ Boolean( linkAnchor ) }
							onClick={ ( event ) =>
								toggleLinkEditor( event.currentTarget )
							}
						/>
					</ToolbarGroup>
				</BlockControls>
			) }
			{ ! hideButton && isSelected && linkAnchor ? (
				<Popover
					anchor={ linkAnchor }
					placement="bottom-start"
					onClose={ () => setLinkAnchor( null ) }
					className="getquick-contact-details-card-editor__link-popover"
				>
					{ linkField }
				</Popover>
			) : null }
			<InspectorControls>
				<PanelBody
					title={ __( 'Ícone', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Mostrar ícone', 'getquick-nomia-blocks' ) }
						checked={ ! hideIcon }
						onChange={ ( show ) =>
							setAttributes( { hideIcon: ! show } )
						}
					/>
					{ hideIcon ? null : (
						<>
							<div className="getquick-contact-details-card-editor__icon-actions">
								<MediaUploadButton
									imageId={ attributes.iconId }
									onSelect={ setIcon }
									labelSelect={ __(
										'Carregar ícone',
										'getquick-nomia-blocks'
									) }
									labelReplace={ __(
										'Substituir ícone',
										'getquick-nomia-blocks'
									) }
									hasImage={ Boolean( iconUrl ) }
								/>
								{ iconUrl ? (
									<Button
										__next40pxDefaultSize
										variant="tertiary"
										isDestructive
										onClick={ removeIcon }
									>
										{ __(
											'Remover ícone',
											'getquick-nomia-blocks'
										) }
									</Button>
								) : null }
							</div>
							{ iconUrl ? (
								<ImageAltControl
									value={ iconAlt }
									onChange={ ( next ) =>
										setAttributes( { iconAlt: next } )
									}
								/>
							) : null }
						</>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Botão', 'getquick-nomia-blocks' ) }
					initialOpen
				>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Mostrar botão', 'getquick-nomia-blocks' ) }
						checked={ ! hideButton }
						onChange={ ( show ) => {
							setAttributes( { hideButton: ! show } );
							if ( ! show ) {
								setLinkAnchor( null );
							}
						} }
					/>
					{ hideButton ? null : <>{ linkField }</> }
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ rendersCard ? null : (
					<Warning className="getquick-contact-details-card-editor__warning">
						{ __(
							'Este bloco não aparece no site enquanto o título, os detalhes e o botão estiverem vazios.',
							'getquick-nomia-blocks'
						) }
					</Warning>
				) }
				{ isButtonIncomplete ? (
					<Warning className="getquick-contact-details-card-editor__warning">
						{ buttonWarning }
					</Warning>
				) : null }
				{ hideIcon ? null : (
					<MediaUploadCheck
						fallback={
							iconUrl ? (
								<span className="getquick-contact-details-card-editor__icon">
									<img src={ iconUrl } alt={ iconAlt } />
								</span>
							) : null
						}
					>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ attributes.iconId }
							onSelect={ setIcon }
							render={ ( { open } ) => (
								<button
									type="button"
									className="getquick-contact-details-card-editor__icon"
									data-empty={ iconUrl ? undefined : 'true' }
									aria-label={
										iconUrl
											? __(
													'Substituir ícone',
													'getquick-nomia-blocks'
											  )
											: __(
													'Carregar ícone',
													'getquick-nomia-blocks'
											  )
									}
									onClick={ open }
								>
									{ iconUrl ? (
										<img src={ iconUrl } alt="" />
									) : (
										<span aria-hidden>{ '+' }</span>
									) }
								</button>
							) }
						/>
					</MediaUploadCheck>
				) }
				<div className="getquick-contact-details-card-editor__copy">
					<RichText
						{ ...FORMATTED_TEXT_PROPS }
						disableLineBreaks
						tagName="p"
						identifier="title"
						aria-label={ __( 'Título', 'getquick-nomia-blocks' ) }
						className="getquick-contact-details-card-editor__title"
						value={ attributes.title || '' }
						placeholder={ __( 'Título', 'getquick-nomia-blocks' ) }
						onChange={ ( next ) =>
							setAttributes( { title: next } )
						}
					/>
					<RichText
						{ ...FORMATTED_TEXT_PROPS }
						tagName="p"
						identifier="details"
						aria-label={ __( 'Detalhes', 'getquick-nomia-blocks' ) }
						className="getquick-contact-details-card-editor__details"
						value={ attributes.details || '' }
						placeholder={ __(
							'Detalhes (Enter para nova linha)',
							'getquick-nomia-blocks'
						) }
						onChange={ ( next ) =>
							setAttributes( { details: next } )
						}
					/>
				</div>
				{ hideButton ? null : (
					<div className="getquick-contact-details-card-editor__button-group">
						<div
							className="getquick-contact-details-card-editor__button"
							data-missing-link={
								isButtonIncomplete ? 'true' : undefined
							}
						>
							<RichText
								{ ...PLAIN_TEXT_PROPS }
								disableLineBreaks
								tagName="span"
								identifier="buttonLabel"
								aria-label={ __(
									'Texto do botão',
									'getquick-nomia-blocks'
								) }
								value={ attributes.buttonLabel || '' }
								placeholder={ __(
									'Texto do botão',
									'getquick-nomia-blocks'
								) }
								onChange={ ( next ) =>
									setAttributes( { buttonLabel: next } )
								}
							/>
							<ArrowLargeRightIcon />
						</div>
						<button
							type="button"
							className="getquick-contact-details-card-editor__link-chip"
							data-missing={
								hasSafeButtonHref ? undefined : 'true'
							}
							aria-expanded={ Boolean( linkAnchor ) }
							onClick={ ( event ) =>
								toggleLinkEditor( event.currentTarget )
							}
						>
							{ buttonHref ||
								__(
									'Adicionar link — sem link o botão não aparece',
									'getquick-nomia-blocks'
								) }
						</button>
					</div>
				) }
			</div>
		</>
	);
}
