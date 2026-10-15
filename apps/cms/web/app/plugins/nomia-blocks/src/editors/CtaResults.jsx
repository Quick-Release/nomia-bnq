// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
// eslint-disable-next-line import/no-extraneous-dependencies -- WordPress provides this host package.
import { Button, PanelBody, TextControl } from '@wordpress/components';
import { useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { UrlField } from '../fields/UrlField';
import './CtaResults.css';

const DEFAULT_CTA_RESULT = {
	year: '',
	value: '',
	unit: '',
	description: '',
	href: '',
	nodeId: '',
};

function normalizeCtaResults( attributes ) {
	const source =
		[ attributes.results, attributes.items ].find( Array.isArray ) ?? [];
	return source.map( ( item ) => ( {
		...DEFAULT_CTA_RESULT,
		year: item?.year || '',
		value: item?.value || '',
		unit: item?.unit || '',
		description: item?.description || '',
		href: item?.href || '',
		nodeId: item?.nodeId || '',
	} ) );
}

export function CtaResultsEdit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( { className: 'cta-results-editor' } );
	const results = normalizeCtaResults( attributes );
	const [ selectedIndex, setSelectedIndex ] = useState( 0 );
	const selectionButtons = useRef( [] );
	const selectedResult = results[ selectedIndex ] || DEFAULT_CTA_RESULT;
	const hasResults = results.length > 0;

	function setResults( nextResults ) {
		setAttributes( { results: nextResults } );
	}

	function updateResult( index, patch ) {
		setResults(
			results.map( ( result, resultIndex ) =>
				resultIndex === index ? { ...result, ...patch } : result
			)
		);
	}

	function addResult() {
		const nextResults = [
			...results,
			{
				...DEFAULT_CTA_RESULT,
				nodeId: `wp-barometro-result-${ results.length + 1 }`,
			},
		];
		setResults( nextResults );
		setSelectedIndex( nextResults.length - 1 );
	}

	function removeResult( index ) {
		const nextResults = results.filter(
			( _, resultIndex ) => resultIndex !== index
		);
		setResults( nextResults );
		setSelectedIndex(
			Math.max( 0, Math.min( index, nextResults.length - 1 ) )
		);
	}

	function moveSelectionFocus( event, index ) {
		let direction = 0;
		if ( event.key === 'ArrowDown' || event.key === 'ArrowRight' ) {
			direction = 1;
		} else if ( event.key === 'ArrowUp' || event.key === 'ArrowLeft' ) {
			direction = -1;
		}
		if ( direction === 0 || results.length < 2 ) {
			return;
		}

		event.preventDefault();
		const nextIndex =
			( index + direction + results.length ) % results.length;
		selectionButtons.current[ nextIndex ]?.focus();
	}

	return (
		<>
			<InspectorControls>
				{ hasResults ? (
					<PanelBody
						title={ __(
							'Selected result settings',
							'getquick-nomia-blocks'
						) }
						initialOpen
					>
						<UrlField
							label={ __(
								'Result URL',
								'getquick-nomia-blocks'
							) }
							value={ selectedResult.href || '' }
							onChange={ ( next ) =>
								updateResult( selectedIndex, {
									href: next,
								} )
							}
						/>
						<TextControl
							label={ __(
								'Node/content ID',
								'getquick-nomia-blocks'
							) }
							value={ selectedResult.nodeId || '' }
							onChange={ ( next ) =>
								updateResult( selectedIndex, { nodeId: next } )
							}
						/>
					</PanelBody>
				) : null }
			</InspectorControls>
			<section { ...blockProps }>
				<div className="cta-results-editor__outer">
					<div className="cta-results-editor__panel">
						<div className="cta-results-editor__intro">
							<div className="cta-results-editor__eyebrow">
								<span aria-hidden>{ '+' }</span>
								<p>
									{ __(
										'ECONOMIA',
										'getquick-nomia-blocks'
									) }
								</p>
							</div>
							<div className="cta-results-editor__heading">
								<h2>
									{ __(
										'Barómetro',
										'getquick-nomia-blocks'
									) }
								</h2>
								<p>
									{ __(
										'Promovendo a coordenação, o desenvolvimento e a divulgação da atividade estatística nacional.',
										'getquick-nomia-blocks'
									) }
								</p>
							</div>
						</div>
						{ hasResults ? (
							<div className="cta-results-editor__results">
								<div className="cta-results-editor__toolbar">
									<Button
										variant="secondary"
										onClick={ addResult }
									>
										{ __(
											'Add result',
											'getquick-nomia-blocks'
										) }
									</Button>
								</div>
								{ results.map( ( result, index ) => (
									<article
										className={ `cta-results-editor__card${
											selectedIndex === index
												? ' is-selected'
												: ''
										}` }
										key={ index }
									>
										<div className="cta-results-editor__card-actions">
											<button
												type="button"
												className="getquick-nomia-blocks-selection-button"
												ref={ ( element ) => {
													selectionButtons.current[
														index
													] = element;
												} }
												aria-keyshortcuts="ArrowDown ArrowUp ArrowLeft ArrowRight"
												aria-label={ sprintf(
													/* translators: %d: the result position in the list. */
													__(
														'Select result %d',
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
												onKeyDown={ ( event ) =>
													moveSelectionFocus(
														event,
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
											<Button
												isDestructive
												variant="secondary"
												onClick={ () =>
													removeResult( index )
												}
											>
												{ __(
													'Remove',
													'getquick-nomia-blocks'
												) }
											</Button>
										</div>
										<div className="cta-results-editor__year">
											<span aria-hidden>{ '+' }</span>
											<RichText
												tagName="span"
												value={ result.year || '' }
												placeholder={ __(
													'Year',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateResult( index, {
														year: next,
													} )
												}
											/>
										</div>
										<div className="cta-results-editor__metric">
											<RichText
												tagName="span"
												value={ result.value || '' }
												placeholder={ __(
													'Value',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateResult( index, {
														value: next,
													} )
												}
											/>
											<RichText
												tagName="span"
												value={ result.unit || '' }
												placeholder={ __(
													'Unit',
													'getquick-nomia-blocks'
												) }
												allowedFormats={ [] }
												onChange={ ( next ) =>
													updateResult( index, {
														unit: next,
													} )
												}
											/>
										</div>
										<RichText
											tagName="p"
											value={ result.description || '' }
											placeholder={ __(
												'Description',
												'getquick-nomia-blocks'
											) }
											allowedFormats={ [
												'core/bold',
												'core/italic',
											] }
											onChange={ ( next ) =>
												updateResult( index, {
													description: next,
												} )
											}
										/>
									</article>
								) ) }
							</div>
						) : (
							<div className="cta-results-editor__empty">
								<p>
									{ __(
										'Add a result to start editing the CTA results section.',
										'getquick-nomia-blocks'
									) }
								</p>
								<Button variant="primary" onClick={ addResult }>
									{ __(
										'Add result',
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
