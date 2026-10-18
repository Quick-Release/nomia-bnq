/**
 * Canvas approximations of the published hero height scale.
 *
 * The plugin bundles separately from the frontend and cannot import Tailwind's
 * output, so these measurements restate what
 * `apps/frontend/src/components/page-heroes/pageHeroShared.ts` resolves each step to.
 * The restatement is checked rather than trusted: `page-hero-canvas-scale.test.mjs`
 * in `apps/frontend/tests/` derives the expected values from the frontend classes and
 * fails when the two drift, including when a new step arrives with no entry here.
 *
 * Padding mirrors the frontend's `md:` tier, because the editor canvas is wide.
 */
const PAGE_HERO_CANVAS_SCALE = {
	xs: {
		height: 'max(35svh, 280px)',
		top: '64px',
		sides: '64px',
		bottom: '64px',
	},
	s: {
		height: 'max(50svh, 360px)',
		top: '96px',
		sides: '64px',
		bottom: '96px',
	},
	m: {
		height: 'max(65svh, 440px)',
		top: '112px',
		sides: '64px',
		bottom: '160px',
	},
	l: {
		height: 'max(80svh, 560px)',
		top: '128px',
		sides: '64px',
		bottom: '192px',
	},
	xl: { height: '100svh', top: '128px', sides: '64px', bottom: '192px' },
};

/**
 * The `md:` tier of each named padding step in `pageHeroShared.ts`; "default"
 * is absent because it keeps the height step's own padding.
 */
const PAGE_HERO_CANVAS_PADDING_STEPS = {
	none: '0px',
	small: '48px',
	medium: '96px',
	large: '128px',
};

function paddingShorthand( top, sides, bottom ) {
	return top === bottom
		? `${ top } ${ sides }`
		: `${ top } ${ sides } ${ bottom }`;
}

/**
 * @param {string} step Height step, e.g. `l`.
 * @return {{height: string, padding: string}|undefined} Canvas measurements, or
 * undefined for a step this map does not cover.
 */
export function pageHeroCanvasStyle( step ) {
	const scale = PAGE_HERO_CANVAS_SCALE[ step ];
	if ( ! scale ) {
		return undefined;
	}
	return {
		height: scale.height,
		padding: paddingShorthand( scale.top, scale.sides, scale.bottom ),
	};
}

/**
 * Canvas padding for a height step with the block's padding steps applied.
 *
 * @param {string} step             Height step, e.g. `l`.
 * @param {Object} padding          Stored padding steps.
 * @param {string} [padding.top]    `paddingTop` step; "default" or unknown keeps the height's.
 * @param {string} [padding.bottom] `paddingBottom` step, likewise.
 * @return {string|undefined} CSS padding shorthand.
 */
export function pageHeroCanvasPadding( step, { top, bottom } = {} ) {
	const scale = PAGE_HERO_CANVAS_SCALE[ step ];
	if ( ! scale ) {
		return undefined;
	}
	return paddingShorthand(
		PAGE_HERO_CANVAS_PADDING_STEPS[ top ] ?? scale.top,
		scale.sides,
		PAGE_HERO_CANVAS_PADDING_STEPS[ bottom ] ?? scale.bottom
	);
}

export function pageHeroHeightLabels( steps ) {
	const labels = steps.map( ( step ) => step.toUpperCase() );

	return {
		tallest: labels[ labels.length - 1 ],
		shorter: labels.slice( 0, -1 ),
	};
}
