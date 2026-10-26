<?php
/**
 * Cloudflare refused or never got a message.
 *
 * @package GetQuick\Email
 */

declare(strict_types=1);

namespace GetQuick\Email\Cloudflare;

use RuntimeException;

/**
 * Thrown when Email Sending doesn't accept a message. The message is safe to
 * log: it never contains the API token.
 */
final class SendFailed extends RuntimeException {}
