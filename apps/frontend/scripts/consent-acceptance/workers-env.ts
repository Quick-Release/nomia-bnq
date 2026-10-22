// The acceptance build's `cloudflare:workers` (run.mjs aliases it): the
// Worker's bindings as the deployed Frontend has them, with the publication
// store and the consent database on Node's SQLite (the same SQL as D1). Paths
// and tokens come from run.mjs; nothing here reaches Cloudflare.
import { openTestD1 } from "../../src/test/sqlite-d1";

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is set by scripts/consent-acceptance/run.mjs`);
  return value;
};
const data = required("CONSENT_ACCEPTANCE_DATA");

export const env = {
  PUBLICATION_DB: openTestD1(`${data}/publications.sqlite`, required("PUBLICATION_MIGRATIONS")),
  CONSENT_DB: openTestD1(`${data}/consent.sqlite`, required("CONSENT_MIGRATIONS")),
  FRONTEND_REFRESH_TOKEN: required("CONSENT_ACCEPTANCE_REFRESH_TOKEN"),
  CONSENT_READ_TOKEN: required("CONSENT_ACCEPTANCE_READ_TOKEN"),
};
