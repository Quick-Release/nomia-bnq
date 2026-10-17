import type {
  WP_CUSTOM_BLOCK_COMPATIBILITY_READS,
  WP_CUSTOM_BLOCK_CONTRACTS,
} from "./custom-block-contracts";

type ContractByName<N extends string> = Extract<
  (typeof WP_CUSTOM_BLOCK_CONTRACTS)[number],
  { blockName: N }
>;

/** All WordPress block attrs are a record of unknown values. */
export type WpBlockAttrs = Record<string, unknown>;

/**
 * Attrs type derived from a block's canonical attributes and declared legacy
 * compatibility reads, so renderers cannot read or mistype unregistered fields.
 */
type CompatibilityReadsByName<N extends string> =
  N extends keyof typeof WP_CUSTOM_BLOCK_COMPATIBILITY_READS
    ? (typeof WP_CUSTOM_BLOCK_COMPATIBILITY_READS)[N][number]
    : never;

export type AttrsFor<N extends string> = {
  [K in ContractByName<N>["contentAttributes"][number] | CompatibilityReadsByName<N>]: unknown;
};
