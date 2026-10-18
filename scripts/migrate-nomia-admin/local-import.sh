#!/usr/bin/env bash
# Rehearses a nomia-admin WXR import locally in DDEV, against a `pnpm db:sync`
# copy of the production DB. Nothing runs against production.
#
# Usage: POST_TYPES=post,attachment scripts/migrate-nomia-admin/local-import.sh /path/to/export.xml
#
# POST_TYPES limits what the WordPress importer pulls from the file (default
# post,attachment for the posts export; a pages export would use page,attachment
# or page only). The DDEV copy is snapshotted first (gq db sync already snapshots
# once per sync; this is the import-time one), so the rehearsal rolls back with
# `ddev snapshot restore <name>` instead of re-running the whole sync.

set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: POST_TYPES=post,attachment $0 <path/to/export.xml>" >&2
  exit 2
fi

POST_TYPES="${POST_TYPES:-post,attachment}"
POST_TYPES="$(printf '%s' "$POST_TYPES" | tr -cd 'a-z0-9,_')"   # keep only post-type characters

export POST_TYPES

WXR_SRC="$(realpath "$1")"
CMS="apps/cms"
MIGRATION="$CMS/migration"
# As an administrator: without a user, WordPress skips capability-gated steps
# (safe-svg's SVG uploads, a Global Styles record's theme link).
WP="ddev wp --user=${WP_USER:-dev}"
# `wp import` side-loads files outside safe-svg's upload screens, so SVG is
# allowed for the import run only; sanitize-svgs.php cleans them right after.
ALLOW_SVG='WP_CLI::add_wp_hook("upload_mimes", static fn($m) => $m + ["svg" => "image/svg+xml"]);'

# Old domains of the source site (its media host, admin host, and the old
# frontend host), rewritten to this site's production web/media domains.
MEDIA_OLD="https://nomia-media.getquick.io/uploads/"
OLD_ADMIN_HOST="https://nomia-admin.getquick.io"
OLD_FRONT_HOST="https://nomia.getquick.io"

cd "$(realpath "$(dirname "$0")")/../.."

if [ ! -f "$CMS/.env" ]; then
  echo "apps/cms/.env is missing — run 'pnpm db:sync' first (it provisions DDEV)." >&2
  exit 1
fi

mkdir -p "$MIGRATION"

# The DDEV container only sees apps/cms, so the WXR and the remap script work
# from copies in there.
echo "» Staging the WXR in $MIGRATION"
python3 scripts/migrate-nomia-admin/filter-wxr.py \
  "$WXR_SRC" "$MIGRATION/import.wxr" "$POST_TYPES"
cp scripts/migrate-nomia-admin/{remap,block-refs,sanitize-svgs}.php "$MIGRATION/"
WXR="$MIGRATION/import.wxr"

echo "» Snapshotting the local DDEV database"
snapshot_name="pre-import-$(date +%Y%m%dT%H%M%S)"
(cd "$CMS" && ddev snapshot -n "$snapshot_name" >/dev/null) && echo "  snapshot: $snapshot_name"

# DDEV commands resolve the project from the current directory, so everything
# below runs from apps/cms; paths are relative to it.
cd "$CMS"

echo "» Installing the WordPress importer plugin"
$WP plugin install wordpress-importer --activate

echo "» Importing $POST_TYPES from the WXR"
# Once per WXR: the importer skips posts and attachments that already exist,
# but adds every menu item again.
$WP --exec="$ALLOW_SVG" import "migration/import.wxr" --authors=create

echo "» Sanitizing SVG attachments"
$WP eval-file migration/sanitize-svgs.php

echo "» Pointing reusable-block refs at the imported blocks"
$WP eval-file migration/block-refs.php wxr="migration/import.wxr"

echo "» Remapping attachment IDs in nomia-cpt stores"
# The marker guards one WXR's remap; this import is another.
$WP option delete nomia_cpt_migration_attachment_remap >/dev/null 2>&1 || true
$WP eval-file migration/remap.php wxr="migration/import.wxr"

echo "» Rewriting source URLs"
$WP search-replace "$MEDIA_OLD" "https://nomia-media.bnq.pt/uploads/" --all-tables-with-prefix --precise --report-changed-only
$WP search-replace "$OLD_ADMIN_HOST" "https://nomia-cms.bnq.pt" --all-tables-with-prefix --precise --report-changed-only
$WP search-replace "$OLD_FRONT_HOST" "https://nomia.bnq.pt" --all-tables-with-prefix --precise --report-changed-only

echo "» Removing the WordPress importer plugin"
$WP plugin deactivate wordpress-importer --quiet
$WP plugin delete wordpress-importer --quiet

echo "» Done. See docs/plans/migrate-nomia-admin-content.md for the verification checklist."