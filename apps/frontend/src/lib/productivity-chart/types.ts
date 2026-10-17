/**
 * One observation for the “Ano vs Produtividade de Recursos” chart.
 * Shape matches one CPT row once WPGraphQL exposes year + value fields.
 */
export type ResourceProductivityPoint = {
  year: number;
  value: number;
};

export type ResourceProductivityChartMeta = {
  title: string;
  filterLabels: string[];
};
