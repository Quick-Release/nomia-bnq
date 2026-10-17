import contracts from '../contracts.json';
import { enumFromContracts } from './contract-enum.mjs';

/**
 * Read an enum attribute's allowed values and default straight from the
 * generated `src/contracts.json`, so a bespoke editor's controls cannot drift
 * from the contract the Astro renderer reads the same attribute against.
 *
 * @param {string} blockName     Registered block name, e.g. `getquick/section`.
 * @param {string} attributeName Enum attribute to read from that block.
 * @return {{values: string[], fallback: string|undefined, read: (value: unknown) => string|undefined}} Allowed values, the default, and a reader that clamps onto it.
 */
export function contractEnum( blockName, attributeName ) {
	return enumFromContracts( contracts, blockName, attributeName );
}
