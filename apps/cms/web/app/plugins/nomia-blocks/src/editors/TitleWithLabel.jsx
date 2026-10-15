// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	BlockControls,
	HeadingLevelDropdown,
	InspectorControls,
	RichText,
	useBlockProps,
	Warning,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	Button,
	PanelBody,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	TITLE_WITH_LABEL_FIELDS,
	TITLE_WITH_LABEL_HEADING_LEVELS,
	TITLE_WITH_LABEL_LEGACY_ATTRIBUTES,
	TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS,
	TITLE_WITH_LABEL_SIZE_TOKENS,
	TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS,
	hasTitleWithLabelLegacyTypography,
	migrateTitleWithLabelLegacyTypography,
	normalizeTitleWithLabelHeadingLevel,
	readTitleWithLabelTypographies,
	titleWithLabelFieldStyleProperties,
	titleWithLabelLineHeightPx,
	titleWithLabelSizePx,
	withTitleWithLabelTypography,
} from '@nomia/web-src/lib/title-with-label-typography';
import './TitleWithLabel.css';

function fieldTitles() {
	return {
		label: __( 'Etiqueta', 'getquick-nomia-blocks' ),
		titleLine1: __( 'Título · linha 1', 'getquick-nomia-blocks' ),
		titleLine2: __( 'Título · linha 2', 'getquick-nomia-blocks' ),
	};
}

function sizeNames() {
	return {
		extra: __( 'Extra', 'getquick-nomia-blocks' ),
		notes: __( 'Notas', 'getquick-nomia-blocks' ),
		body: __( 'Corpo', 'getquick-nomia-blocks' ),
		'body-large': __( 'Corpo grande', 'getquick-nomia-blocks' ),
		subtitle: __( 'Subtítulo', 'getquick-nomia-blocks' ),
		h4: __( 'Título 4', 'getquick-nomia-blocks' ),
		h3: __( 'Título 3', 'getquick-nomia-blocks' ),
		h2: __( 'Título 2', 'getquick-nomia-blocks' ),
		h1: __( 'Título 1', 'getquick-nomia-blocks' ),
		large: __( 'Grande', 'getquick-nomia-blocks' ),
		super: __( 'Super', 'getquick-nomia-blocks' ),
	};
}

function sizeLabel( slug ) {
	return sprintf(
		/* translators: 1: design-system size name, e.g. "Título 4". 2: pixels. */
		__( '%1$s · %2$spx', 'getquick-nomia-blocks' ),
		sizeNames()[ slug ],
		titleWithLabelSizePx( slug )
	);
}

function lineHeightLabel( slug ) {
	return sprintf(
		/* translators: %s: pixels. */
		__( '%spx', 'getquick-nomia-blocks' ),
		titleWithLabelLineHeightPx( slug )
	);
}

/**
 * The empty option keeps the field on its design default, and names that
 * default so an editor sees what "nothing chosen" looks like.
 *
 * @param {string}   defaultLabel Label of the token the field inherits.
 * @param {Object[]} tokens       Token list, ascending.
 * @param {Function} label        Formats one token slug for display.
 * @return {Object[]} SelectControl options.
 */
function tokenOptions( defaultLabel, tokens, label ) {
	return [
		{
			value: '',
			label: sprintf(
				/* translators: %s: the design default, e.g. "Título 4 · 32px". */
				__( 'Predefinido (%s)', 'getquick-nomia-blocks' ),
				defaultLabel
			),
		},
		...tokens.map( ( { slug } ) => ( {
			value: slug,
			label: label( slug ),
		} ) ),
	];
}

/**
 * One field's typography as an inspector panel: every control picks a design
 * token or a whole-field style, and "Repor" clears the field. Built from stable
 * components only — `ToolsPanel` is still `__experimental` in WordPress 7.1.
 *
 * @param {Object}   props
 * @param {string}   props.field       Field key.
 * @param {string}   props.title       Field name shown in the panel header.
 * @param {Object}   props.typography  Current overrides for the field.
 * @param {boolean}  props.initialOpen Whether the panel starts expanded.
 * @param {Function} props.onChange    Receives the field's next overrides.
 */
function FieldTypographyPanel( {
	field,
	title,
	typography,
	initialOpen,
	onChange,
} ) {
	const defaults = TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS[ field ];
	const update = ( property, value ) =>
		onChange( { ...typography, [ property ]: value || undefined } );
	const hasOverride = Object.keys( typography ).length > 0;

	return (
		<PanelBody
			title={ sprintf(
				/* translators: %s: field name, e.g. "Título · linha 1". */
				__( 'Tipografia: %s', 'getquick-nomia-blocks' ),
				title
			) }
			initialOpen={ initialOpen }
		>
			<div className="getquick-title-with-label-editor-panel">
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Tamanho', 'getquick-nomia-blocks' ) }
					value={ typography.size ?? '' }
					options={ tokenOptions(
						sizeLabel( defaults.size ),
						TITLE_WITH_LABEL_SIZE_TOKENS,
						sizeLabel
					) }
					onChange={ ( next ) => update( 'size', next ) }
				/>
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Altura da linha', 'getquick-nomia-blocks' ) }
					value={ typography.lineHeight ?? '' }
					options={ tokenOptions(
						lineHeightLabel( defaults.lineHeight ),
						TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS,
						lineHeightLabel
					) }
					onChange={ ( next ) => update( 'lineHeight', next ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Negrito', 'getquick-nomia-blocks' ) }
					checked={ typography.bold === true }
					onChange={ ( next ) => update( 'bold', next ) }
				/>
				<ToggleControl
					__nextHasNoMarginBottom
					label={ __( 'Itálico', 'getquick-nomia-blocks' ) }
					checked={ typography.italic === true }
					onChange={ ( next ) => update( 'italic', next ) }
				/>
				<Button
					__next40pxDefaultSize
					variant="secondary"
					disabled={ ! hasOverride }
					accessibleWhenDisabled
					onClick={ () => onChange( {} ) }
				>
					{ __( 'Repor', 'getquick-nomia-blocks' ) }
				</Button>
			</div>
		</PanelBody>
	);
}

export function TitleWithLabelEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'getquick-title-with-label-editor',
	} );
	const titles = fieldTitles();
	const typography = readTitleWithLabelTypographies( attributes );
	const level = normalizeTitleWithLabelHeadingLevel( attributes.level );
	const Heading = `h${ level }`;
	// Astro renders nothing without these two, so say so before publishing.
	const isMissingRequired = ! attributes.label || ! attributes.titleLine1;

	// The text fields store plain copy: no formats, and Enter/Shift+Enter
	// cannot insert a `<br>` that the published heading would not honour.
	const textProps = {
		allowedFormats: [],
		disableLineBreaks: true,
		withoutInteractiveFormatting: true,
	};

	return (
		<>
			<BlockControls group="block">
				<HeadingLevelDropdown
					options={ TITLE_WITH_LABEL_HEADING_LEVELS }
					value={ level }
					onChange={ ( next ) => setAttributes( { level: next } ) }
				/>
			</BlockControls>
			<InspectorControls>
				{ TITLE_WITH_LABEL_FIELDS.map( ( field ) => (
					<FieldTypographyPanel
						key={ field }
						field={ field }
						initialOpen={ field === TITLE_WITH_LABEL_FIELDS[ 0 ] }
						title={ titles[ field ] }
						typography={ typography[ field ] }
						onChange={ ( next ) =>
							setAttributes( {
								typography: withTitleWithLabelTypography(
									attributes.typography,
									field,
									next
								),
							} )
						}
					/>
				) ) }
			</InspectorControls>
			<section { ...blockProps }>
				{ isMissingRequired ? (
					<Warning>
						{ __(
							'Este bloco não aparece no site enquanto a etiqueta e a primeira linha do título estiverem vazias.',
							'getquick-nomia-blocks'
						) }
					</Warning>
				) : null }
				<div className="getquick-title-with-label-editor__inner">
					<div className="getquick-title-with-label-editor__grid">
						<div className="getquick-title-with-label-editor__eyebrow">
							<span
								className="getquick-title-with-label-editor__eyebrow-icon"
								aria-hidden
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									focusable={ false }
								>
									<path
										d="M12 4v16M4 12h16M6.34 6.34l11.32 11.32M17.66 6.34L6.34 17.66"
										stroke="currentColor"
										strokeWidth="1.35"
										strokeLinecap="round"
									/>
								</svg>
							</span>
							<RichText
								{ ...textProps }
								tagName="p"
								identifier="label"
								aria-label={ titles.label }
								className="getquick-title-with-label-editor__eyebrow-label"
								style={ titleWithLabelFieldStyleProperties(
									typography.label
								) }
								value={ attributes.label || '' }
								placeholder={ __(
									'Etiqueta',
									'getquick-nomia-blocks'
								) }
								onChange={ ( next ) =>
									setAttributes( { label: next } )
								}
							/>
						</div>
						<Heading className="getquick-title-with-label-editor__title">
							<RichText
								{ ...textProps }
								tagName="span"
								identifier="titleLine1"
								aria-label={ titles.titleLine1 }
								className="getquick-title-with-label-editor__line getquick-title-with-label-editor__line--1"
								style={ titleWithLabelFieldStyleProperties(
									typography.titleLine1
								) }
								value={ attributes.titleLine1 || '' }
								placeholder={ __(
									'Primeira linha do título',
									'getquick-nomia-blocks'
								) }
								onChange={ ( next ) =>
									setAttributes( { titleLine1: next } )
								}
							/>
							<RichText
								{ ...textProps }
								tagName="span"
								identifier="titleLine2"
								aria-label={ titles.titleLine2 }
								className="getquick-title-with-label-editor__line getquick-title-with-label-editor__line--2"
								style={ titleWithLabelFieldStyleProperties(
									typography.titleLine2
								) }
								value={ attributes.titleLine2 || '' }
								placeholder={ __(
									'Segunda linha do título (opcional)',
									'getquick-nomia-blocks'
								) }
								onChange={ ( next ) =>
									setAttributes( { titleLine2: next } )
								}
							/>
						</Heading>
					</div>
				</div>
			</section>
		</>
	);
}

/**
 * Block deprecation for content saved before the token schema, when each field
 * stored free pixel values (`titleLine1FontSize: 40`, `labelBold: true`, …).
 *
 * The block saves `null`, so a deprecation never runs for invalid markup; it
 * runs because `isEligible` sees a retired attribute in the comment delimiter.
 * `migrate` moves each value onto the nearest design token — the same mapping
 * the Astro renderer applies to not-yet-migrated content, so the page does not
 * change when the post is next saved — and drops the retired keys.
 *
 * @param {Object} attributes Current contract attribute schemas.
 * @return {Object[]} `deprecated` entries, newest first.
 */
export function titleWithLabelDeprecated( attributes ) {
	const { typography: _typography, ...current } = attributes;
	const legacy = Object.fromEntries(
		Object.entries( TITLE_WITH_LABEL_LEGACY_ATTRIBUTES ).map(
			( [ name, type ] ) => [ name, { type } ]
		)
	);

	return [
		{
			attributes: { ...current, ...legacy },
			isEligible: hasTitleWithLabelLegacyTypography,
			migrate( stored ) {
				const next = { ...stored };
				for ( const name of Object.keys( legacy ) ) {
					delete next[ name ];
				}
				const migrated =
					migrateTitleWithLabelLegacyTypography( stored );
				return {
					...next,
					typography:
						Object.keys( migrated ).length > 0
							? migrated
							: undefined,
				};
			},
			save: () => null,
		},
	];
}
