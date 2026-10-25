<?php
/**
 * Site-owned header actions in Design layouts.
 *
 * @package GetQuick\Bioeconomia\Blocks
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Blocks;

use GetQuick\Bioeconomia\Contracts;

/** Declares Nomia's controls through Design's existing Site extension hook. */
final class HeaderActions {

	/** Registers the Site's layout declarations. */
	public function register(): void {
		add_filter( 'getquick_design_block_definitions', [ $this, 'declareToDesign' ] );
	}

	/**
	 * Retains the controls' saved settings when a header pattern is delivered.
	 *
	 * @param mixed $definitions Design's catalog, keyed by block name.
	 * @return mixed The catalog with Nomia's controls.
	 */
	public function declareToDesign( $definitions ) {
		if ( ! is_array( $definitions ) ) {
			return $definitions;
		}

		foreach ( Contracts::all() as $contract ) {
			if ( ! in_array( $contract['blockName'], [ 'getquick/header-contact', 'getquick/header-search' ], true ) ) {
				continue;
			}

			$definitions[ $contract['blockName'] ] = [
				'source'            => 'site',
				'regions'           => [ 'header', 'footer', 'content' ],
				'data_requirements' => [],
				'attributes'        => array_map( static fn( array $schema ): string => $schema['type'], $contract['attributes'] ),
				'tokens'            => [],
				'allowed_children'  => [],
				'renderer_fixture'  => null,
				'enabled'           => true,
			];
		}

		return $definitions;
	}
}
