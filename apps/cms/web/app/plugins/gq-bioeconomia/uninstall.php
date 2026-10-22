<?php
/**
 * Uninstall handler.
 *
 * @package GetQuick\Bioeconomia
 */

declare(strict_types=1);

use GetQuick\Bioeconomia\Lifecycle\Lifecycle;

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

require_once __DIR__ . '/gq-bioeconomia.php';

Lifecycle::uninstall();
