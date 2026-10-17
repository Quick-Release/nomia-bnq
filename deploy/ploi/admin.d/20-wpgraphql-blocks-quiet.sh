#!/usr/bin/env bash
# Apply the wpgraphql-blocks 2.2.0 quiet patch (see apps/cms/patches/wpgraphql-blocks/README.md).
# Idempotent: skips when both patched files match the expected sha256; attempts
# a repair otherwise; fails the deploy unless both files end up byte-exact with
# the known patched content (so a partially applied or drifted state fails the
# deploy loudly instead of half-silencing warnings).
set -uo pipefail

plugin="web/app/plugins/wpgraphql-blocks/plugin.php"
utils="web/app/plugins/wpgraphql-blocks/includes/utils.php"
patch_file="patches/wpgraphql-blocks/2.2.0-quiet-unsafe-access.patch"
# sha256 of plugin.php / includes/utils.php immediately after this patch on
# pristine 2.2.0 sources (verified by round-trip + payload-identity test).
expected_plugin_sha="7dee3f7934efa6a70c8c1666f36cb65dd0805ca0a8570ec03d577fb87edc0499"
expected_utils_sha="6c391ea3dbe2e0dc819f45fd267a61d7a3d4f60f3e0eed6d6086dd19cafd2624"

fail() {
  echo "ERROR: $1" >&2
  echo "       The plugin version probably changed upstream; re-review" >&2
  echo "       apps/cms/patches/wpgraphql-blocks/ and regen or drop the patch." >&2
  exit 1
}

[ -f "$plugin" ] || { echo "wpgraphql-blocks not present (plugin dir missing); skipping patch"; exit 0; }

sha_of() { sha256sum "$1" | cut -d' ' -f1; }

plugin_sha="$(sha_of "$plugin")"
utils_sha="$(sha_of "$utils" 2>/dev/null || echo missing)"

if [ "$plugin_sha" = "$expected_plugin_sha" ] && [ "$utils_sha" = "$expected_utils_sha" ]; then
  echo "wpgraphql-blocks 2.2.0 quiet patch already applied (sha match)"
  exit 0
fi

rc=0
patch -p1 --forward --fuzz=0 --no-backup-if-mismatch -r /dev/null < "$patch_file" || rc=$?

plugin_sha="$(sha_of "$plugin")"
utils_sha="$(sha_of "$utils")"
if [ "$plugin_sha" != "$expected_plugin_sha" ]; then
  fail "plugin.php sha256 $plugin_sha != expected $expected_plugin_sha after patching (rc=$rc)"
fi
if [ "$utils_sha" != "$expected_utils_sha" ]; then
  fail "utils.php sha256 $utils_sha != expected $expected_utils_sha after patching (rc=$rc)"
fi

lint() {
  if ! (php8.4 -l "$1" 2>/dev/null || php -l "$1"); then
    fail "$1 does not pass php -l after patching"
  fi
}
lint "$plugin"
lint "$utils"

echo "wpgraphql-blocks 2.2.0 quiet patch applied and linted"