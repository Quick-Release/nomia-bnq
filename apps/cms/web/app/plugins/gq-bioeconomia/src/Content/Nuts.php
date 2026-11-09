<?php
/**
 * NUTS regions.
 *
 * @package GetQuick\Bioeconomia\Content
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Content;

/**
 * Portugal's NUTS 2024 units (in force since 1 January 2024), the terms of
 * the `regiao_nuts` taxonomy.
 *
 * Each unit is a term whose slug is its code in lower case (`pt1c`) and whose
 * parent is its parent unit's term; its code, level and English label are
 * kept as term meta. The codes nest by prefix (PT → PT1 → PT1C → PT1C2), so
 * the Frontend finds a region's sub-regions from the codes alone. The
 * Extra-Regio codes (PTZ, PTZZ, PTZZZ) are left out.
 *
 * One more term, Internacional (`internacional`), marks an entry outside
 * Portugal: the NUTS map leaves it out and lists it under Boas Práticas
 * internacionais instead.
 *
 * Source: Eurostat, NUTS 2024 (https://ec.europa.eu/eurostat/web/nuts/).
 * `apps/frontend/src/lib/nuts.ts` holds the same table; its test compares them.
 */
final class Nuts {

	public const TAXONOMY = 'regiao_nuts';

	public const META_CODE = 'gq_bioeconomia_nuts_code';

	public const META_LEVEL = 'gq_bioeconomia_nuts_level';

	public const META_LABEL_EN = 'gq_bioeconomia_nuts_label_en';

	public const INTERNATIONAL_SLUG = 'internacional';

	/**
	 * Every unit, parents before their children: code, level, parent code,
	 * Portuguese name (as displayed), English label.
	 *
	 * @return list<array{0: string, 1: int, 2: string|null, 3: string, 4: string}>
	 */
	public static function units(): array {
		return [
			[ 'PT', 0, null, 'Portugal', 'Portugal' ],
			[ 'PT1', 1, 'PT', 'Continente', 'Mainland Portugal' ],
			[ 'PT2', 1, 'PT', 'Região Autónoma dos Açores', 'Autonomous Region of the Azores' ],
			[ 'PT3', 1, 'PT', 'Região Autónoma da Madeira', 'Autonomous Region of Madeira' ],
			[ 'PT11', 2, 'PT1', 'Norte', 'North' ],
			[ 'PT19', 2, 'PT1', 'Centro', 'Centre' ],
			[ 'PT1D', 2, 'PT1', 'Oeste e Vale do Tejo', 'West and Tagus Valley' ],
			[ 'PT1A', 2, 'PT1', 'Grande Lisboa', 'Greater Lisbon' ],
			[ 'PT1B', 2, 'PT1', 'Península de Setúbal', 'Setúbal Peninsula' ],
			[ 'PT1C', 2, 'PT1', 'Alentejo', 'Alentejo' ],
			[ 'PT15', 2, 'PT1', 'Algarve', 'Algarve' ],
			[ 'PT20', 2, 'PT2', 'Região Autónoma dos Açores', 'Autonomous Region of the Azores' ],
			[ 'PT30', 2, 'PT3', 'Região Autónoma da Madeira', 'Autonomous Region of Madeira' ],
			[ 'PT111', 3, 'PT11', 'Alto Minho', 'Upper Minho' ],
			[ 'PT112', 3, 'PT11', 'Cávado', 'Cávado' ],
			[ 'PT119', 3, 'PT11', 'Ave', 'Ave' ],
			[ 'PT11A', 3, 'PT11', 'Área Metropolitana do Porto', 'Porto Metropolitan Area' ],
			[ 'PT11B', 3, 'PT11', 'Alto Tâmega e Barroso', 'Upper Tâmega and Barroso' ],
			[ 'PT11C', 3, 'PT11', 'Tâmega e Sousa', 'Tâmega and Sousa' ],
			[ 'PT11D', 3, 'PT11', 'Douro', 'Douro' ],
			[ 'PT11E', 3, 'PT11', 'Terras de Trás-os-Montes', 'Terras de Trás-os-Montes' ],
			[ 'PT191', 3, 'PT19', 'Região de Aveiro', 'Aveiro Region' ],
			[ 'PT192', 3, 'PT19', 'Região de Coimbra', 'Coimbra Region' ],
			[ 'PT193', 3, 'PT19', 'Região de Leiria', 'Leiria Region' ],
			[ 'PT194', 3, 'PT19', 'Viseu Dão Lafões', 'Viseu Dão Lafões' ],
			[ 'PT195', 3, 'PT19', 'Beira Baixa', 'Beira Baixa' ],
			[ 'PT196', 3, 'PT19', 'Beiras e Serra da Estrela', 'Beiras and Serra da Estrela' ],
			[ 'PT1D1', 3, 'PT1D', 'Oeste', 'West' ],
			[ 'PT1D2', 3, 'PT1D', 'Médio Tejo', 'Middle Tagus' ],
			[ 'PT1D3', 3, 'PT1D', 'Lezíria do Tejo', 'Lezíria do Tejo' ],
			[ 'PT1A0', 3, 'PT1A', 'Grande Lisboa', 'Greater Lisbon' ],
			[ 'PT1B0', 3, 'PT1B', 'Península de Setúbal', 'Setúbal Peninsula' ],
			[ 'PT1C1', 3, 'PT1C', 'Alentejo Litoral', 'Coastal Alentejo' ],
			[ 'PT1C2', 3, 'PT1C', 'Baixo Alentejo', 'Lower Alentejo' ],
			[ 'PT1C3', 3, 'PT1C', 'Alto Alentejo', 'Upper Alentejo' ],
			[ 'PT1C4', 3, 'PT1C', 'Alentejo Central', 'Central Alentejo' ],
			[ 'PT150', 3, 'PT15', 'Algarve', 'Algarve' ],
			[ 'PT200', 3, 'PT20', 'Região Autónoma dos Açores', 'Autonomous Region of the Azores' ],
			[ 'PT300', 3, 'PT30', 'Região Autónoma da Madeira', 'Autonomous Region of Madeira' ],
		];
	}

	/**
	 * A unit's term slug: its code in lower case.
	 *
	 * @param string $code NUTS code.
	 */
	public static function slug( string $code ): string {
		return strtolower( $code );
	}

	/**
	 * Inserts the units that are missing, under their parents, and keeps each
	 * term's code, level and English label in its meta; then the Internacional
	 * term. Existing terms are found by slug, so an administrator's renaming
	 * is kept.
	 *
	 * @return bool Whether a term was inserted.
	 */
	public static function seed(): bool {
		if ( ! taxonomy_exists( self::TAXONOMY ) ) {
			return false;
		}

		$inserted = false;
		$term_ids = [];

		foreach ( self::units() as [ $code, $level, $parent, $name, $label_en ] ) {
			$term = get_term_by( 'slug', self::slug( $code ), self::TAXONOMY );

			if ( $term instanceof \WP_Term ) {
				$term_id = (int) $term->term_id;
			} else {
				$result = wp_insert_term(
					$name,
					self::TAXONOMY,
					[
						'slug'   => self::slug( $code ),
						'parent' => null === $parent ? 0 : (int) ( $term_ids[ $parent ] ?? 0 ),
					],
				);

				if ( is_wp_error( $result ) ) {
					continue;
				}

				$term_id  = (int) $result['term_id'];
				$inserted = true;
			}

			$term_ids[ $code ] = $term_id;
			update_term_meta( $term_id, self::META_CODE, $code );
			update_term_meta( $term_id, self::META_LEVEL, $level );
			update_term_meta( $term_id, self::META_LABEL_EN, $label_en );
		}

		if ( ! get_term_by( 'slug', self::INTERNATIONAL_SLUG, self::TAXONOMY ) instanceof \WP_Term ) {
			$result   = wp_insert_term( __( 'Internacional', 'gq-bioeconomia' ), self::TAXONOMY, [ 'slug' => self::INTERNATIONAL_SLUG ] );
			$inserted = ! is_wp_error( $result ) || $inserted;
		}

		return $inserted;
	}
}
