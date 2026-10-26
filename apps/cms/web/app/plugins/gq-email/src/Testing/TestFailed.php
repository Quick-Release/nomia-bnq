<?php
/**
 * A test message wasn't sent.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Testing;

use RuntimeException;

/**
 * Thrown by TestEmail with a message for people; it never contains the API token.
 */
final class TestFailed extends RuntimeException {}
