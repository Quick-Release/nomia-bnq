// The gq-bioeconomia editor's pure helpers (`assets/editor-lib.js`). The plugin
// ships them as a plain script that sets `window.gqBioeconomiaLib`, as
// GQ Design ships its editor code, so tests run that script to read them.
import { readFileSync } from "node:fs";

const path = new URL(
  "../../cms/web/app/plugins/gq-bioeconomia/assets/editor-lib.js",
  import.meta.url,
);
const window = {};
// Run in this realm, so the helpers' objects compare equal to the tests' own.
new Function("window", readFileSync(path, "utf8"))(window);

export const {
  enumFromContracts,
  pageHeroCanvasPadding,
  pageHeroCanvasStyle,
  pageHeroHeightLabels,
  pageHeroLegacyAttributePatch,
} = window.gqBioeconomiaLib;
