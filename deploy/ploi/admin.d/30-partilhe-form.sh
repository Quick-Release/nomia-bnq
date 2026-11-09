#!/usr/bin/env bash
# Creates the Partilhe form (/partilhe/) when the CMS has none, and otherwise
# keeps its content types in step with gq-bioeconomia's post types. The script
# is idempotent and leaves labels, notifications and confirmations edited in
# the CMS alone (docs/plans/partilhe-submissions.md).
#
# Gravity Forms only lets a user with its capabilities create a form, so the
# script runs as the oldest administrator.
#
# Never fails the deploy: the form isn't needed for the CMS to work, and the
# next deploy tries again. Every problem is logged and the step exits 0.
set -euo pipefail

skip() {
  echo "WARNING: Partilhe form not created or updated: $1. The next deploy tries again." >&2
  exit 0
}

wp plugin is-active gravityforms 2>/dev/null || skip "Gravity Forms isn't active"
wp plugin is-active gq-bioeconomia 2>/dev/null || skip "gq-bioeconomia isn't active"

admin="$(wp user list --role=administrator --field=ID --orderby=ID --order=ASC --number=1 2>/dev/null)" \
  || skip "the administrators couldn't be listed"
[ -n "$admin" ] || skip "there is no administrator to create it as"

status=0
wp --user="$admin" eval-file scripts/partilhe-form.php || status=$?
[ "$status" -eq 0 ] || skip "scripts/partilhe-form.php failed (exit $status)"
