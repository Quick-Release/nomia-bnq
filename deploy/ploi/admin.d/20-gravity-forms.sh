#!/usr/bin/env bash
set -euo pipefail

wp eval-file "$APP_PATH/scripts/configure-gravity-forms.php"
