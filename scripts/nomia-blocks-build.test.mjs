// The nomia-blocks editor build is committed (a CMS release ships only tracked
// files), so it must be what its source builds to. Rebuilds it into a
// temporary directory and compares. On a failure:
//   pnpm --dir apps/cms/web/app/plugins/nomia-blocks build
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const plugin = new URL("../apps/cms/web/app/plugins/nomia-blocks/", import.meta.url).pathname;

test("the committed nomia-blocks editor build matches its source", () => {
  const output = mkdtempSync(join(tmpdir(), "nomia-blocks-build-"));
  try {
    execFileSync(
      join(plugin, "node_modules/.bin/wp-scripts"),
      ["build", "index=./src/index.jsx", `--output-path=${output}`],
      { cwd: plugin, stdio: ["ignore", "ignore", "inherit"] },
    );
    const committed = join(plugin, "build");
    const files = readdirSync(output).sort();
    assert.deepEqual(readdirSync(committed).sort(), files, "build/ has other files than a build");
    for (const file of files) {
      assert.ok(
        readFileSync(join(committed, file)).equals(readFileSync(join(output, file))),
        `build/${file} is stale: run pnpm --dir apps/cms/web/app/plugins/nomia-blocks build`,
      );
    }
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
});
