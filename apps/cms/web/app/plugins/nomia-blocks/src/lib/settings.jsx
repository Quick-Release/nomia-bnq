/**
 * Runtime settings injected by WordPress via `window.getquickNomiaBlocks`.
 *
 * Centralised here (rather than in the entry `src/index.jsx`) so that
 * `lib/preview.jsx` can read them without importing the entry and creating a
 * circular dependency.
 */
const settings = window.getquickNomiaBlocks || {};

export const NOMIA_FE_BASE_URL =
	settings.nomiaFeBaseUrl || 'http://localhost:4321';
export const PREVIEW_TOKEN = settings.previewToken || '';
