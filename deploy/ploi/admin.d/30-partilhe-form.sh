#!/usr/bin/env bash
# Creates the Partilhe form (/partilhe/) when the CMS has none, and otherwise
# keeps its content types in step with gq-bioeconomia's post types. The script
# is idempotent and leaves labels, notifications and confirmations edited in
# the CMS alone (docs/plans/partilhe-submissions.md).
#
# Gravity Forms only lets a user with its capabilities create a form, so the
# script runs as the oldest administrator.
set -euo pipefail

admin="$(wp user list --role=administrator --field=ID --orderby=ID --order=ASC --number=1)"
if [ -z "$admin" ]; then
  echo "ERROR: no administrator to create the Partilhe form as" >&2
  exit 1
fi

wp --user="$admin" eval-file scripts/partilhe-form.php
