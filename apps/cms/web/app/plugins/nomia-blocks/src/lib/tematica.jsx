import { useMemo } from '@wordpress/element';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { useSelect } from '@wordpress/data';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import './tematica.css';

export const TEMATICAS_TAXONOMY = 'tematicas';
export const FALLBACK_TEMATICAS = [
	{
		id: 'bioeconomia-sustentavel',
		name: 'Bioeconomia Sustentável',
		slug: 'bioeconomia-sustentavel',
	},
	{
		id: 'economia-circular',
		name: 'Economia Circular',
		slug: 'economia-circular',
	},
];

function normalizeTematicaOptions( terms, selectedLabel ) {
	const sourceTerms =
		Array.isArray( terms ) && terms.length > 0 ? terms : FALLBACK_TEMATICAS;
	const options = sourceTerms.map( ( term ) => ( {
		label: term.name,
		value: term.name,
		slug: term.slug || '',
	} ) );

	if (
		selectedLabel &&
		! options.some( ( option ) => option.value === selectedLabel )
	) {
		return [
			{ label: selectedLabel, value: selectedLabel, slug: '' },
			...options,
		];
	}

	return options;
}

function accentForTematica( label, slug = '' ) {
	const value = `${ label } ${ slug }`.toLowerCase();
	return value.includes( 'bioeconomia' ) || value.includes( 'sustentavel' )
		? 'botnico'
		: 'ciano';
}

export function useTematicaEyebrow( attributes, setAttributes ) {
	const eyebrow = attributes.eyebrowLabel || attributes.eyebrow || '';
	const tematicaTerms = useSelect(
		( select ) =>
			select( 'core' )?.getEntityRecords?.(
				'taxonomy',
				TEMATICAS_TAXONOMY,
				{
					per_page: -1,
					orderby: 'name',
					order: 'asc',
				}
			),
		[]
	);
	const tematicaOptions = useMemo(
		() => normalizeTematicaOptions( tematicaTerms, eyebrow ),
		[ tematicaTerms, eyebrow ]
	);
	const selectedTematica = eyebrow || 'Economia Circular';
	const selectedOption = tematicaOptions.find(
		( option ) => option.value === selectedTematica
	);
	const accent = accentForTematica( selectedTematica, selectedOption?.slug );

	function setTematica( next ) {
		const nextOption = tematicaOptions.find(
			( option ) => option.value === next
		);
		setAttributes( {
			eyebrowLabel: next,
			eyebrow: next,
			accent: accentForTematica( next, nextOption?.slug ),
		} );
	}

	return { selectedTematica, tematicaOptions, accent, setTematica };
}

export function TematicaEyebrowField( {
	accent,
	selectedTematica,
	tematicaOptions,
	setTematica,
	centered = false,
} ) {
	return (
		<div
			className={ `getquick-nomia-tematica-eyebrow is-${ accent }${
				centered ? ' is-centered' : ''
			}` }
		>
			<span aria-hidden>{ '+' }</span>
			<SelectControl
				label={ __( 'Temática', 'getquick-nomia-blocks' ) }
				hideLabelFromVision
				value={ selectedTematica }
				options={ tematicaOptions }
				onChange={ setTematica }
			/>
		</div>
	);
}
