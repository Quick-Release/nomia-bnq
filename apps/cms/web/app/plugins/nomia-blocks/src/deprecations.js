/**
 * Block deprecations keyed by WordPress block name.
 *
 * Each entry takes the block's current contract attribute schemas and returns
 * its `deprecated` list (newest first), because a deprecation has to declare
 * the full attribute set of the version it parses.
 */
import { titleWithLabelDeprecated } from './editors/TitleWithLabel';

export const BLOCK_DEPRECATIONS = {
	'getquick/title-with-label': titleWithLabelDeprecated,
};
