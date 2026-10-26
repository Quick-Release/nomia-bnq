# GETQUICK Email

Sends WordPress's transactional email (`wp_mail()`: password resets, new-user
and admin notices, plugin notifications) through
[Cloudflare Email Service](https://developers.cloudflare.com/email-service/).
It's configured in the **Email** tab of **GETQUICK → Options**
(`wp-admin/admin.php?page=getquick-options#/email`).

The plugin is meant to become a shared GETQUICK plugin. For now it lives in
this Site's tree at `apps/cms/web/app/plugins/gq-email`. It isn't a Composer
package and has no dependencies beyond WordPress and GQ Config. Nothing in it
is specific to Nomia, so it can be extracted as is.

## How it sends

The plugin posts each message to Email Sending's REST API,
[`POST /accounts/{account_id}/email/sending/send_raw`](https://developers.cloudflare.com/api/resources/email_sending/methods/send_raw/),
over HTTPS through WordPress's HTTP API.

WordPress's PHPMailer still builds the whole message: headers, HTML and text
parts, attachments and embeds. Only the last step changes. Before each
message, the plugin makes wp_mail()'s global mailer a `CloudflareMailer`, a
`WP_PHPMailer` with a `cloudflare` mailer. On `phpmailer_init` it selects that
mailer, and PHPMailer then hands the built message to `cloudflareSend()`
instead of `mail()`. Whatever other plugins do to the message keeps working.
The request's envelope names every recipient (To, Cc and Bcc), and the Bcc
addresses never appear in the message headers.

Cloudflare only accepts mail from a domain onboarded to Email Sending, so
every message is sent from the configured From address, which is also the
envelope sender. If the message set no Reply-To of its own, the plugin adds
one:

1. The message's original From, if it came from another address. A contact
   form sent "from" the visitor, for example, replies to the visitor.
2. Otherwise, the tab's Reply-to address, if set.

Until the tab is complete (turned on, an account ID, a valid From address,
and the token in the environment), WordPress keeps its own transport.

### Results and failures

Cloudflare reports what it did with each recipient: delivered, queued,
permanently bounced, or suppressed (on the account's suppression list).

- **Refused or unreachable.** The message fails through wp_mail()'s
  `wp_mail_failed`, with Cloudflare's error code. For example: `10102`, the
  token lacks the permission; `10203`, sending is disabled; `10004`,
  throttled. The failure is logged to the PHP error log, prefixed with
  `gq-email:`.
- **Reached no one.** If every recipient bounced or was suppressed, the
  message fails the same way.
- **Reached some recipients.** The message is sent, and the recipients who
  won't get it are logged.

The plugin doesn't retry: wp_mail() is synchronous, and the request times out
after 30 seconds.

## The Email tab

The plugin adds GQ Config's `email` area through the
`getquick_config_settings_areas` filter. GQ Config stores it, validates it and
serves it at `getquick-config/v1/options/email`.

| Field          | What it is                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`      | Send through Cloudflare. Its help says whether the environment has the API token.                                                                  |
| `account_id`   | The Cloudflare account that owns the sending domain and the token. `GQ_EMAIL_CLOUDFLARE_ACCOUNT_ID` overrides it, and the field is then read-only. |
| `from_address` | The sender. Its domain must be onboarded to Email Sending on that account.                                                                         |
| `from_name`    | Optional. Defaults to the message's own name, or else the site title.                                                                              |
| `reply_to`     | Optional. See above.                                                                                                                               |

### The API token

The token is not a field. GQ Config sends saved values back to the admin page,
and the token is a credential: anyone who holds it can send mail from every
onboarded domain on the account. The plugin reads it only from the
`GQ_EMAIL_CLOUDFLARE_API_TOKEN` constant or environment variable, which on
Ploi is the CMS's `.env`.

An environment without the token keeps WordPress's transport. That includes a
local CMS that has the production database (`pnpm db:sync`), so a local copy
can't send real mail through the production account by accident.

## Setting it up

1. In Cloudflare, onboard the sending domain under **Email Service → Email
   Sending** and let it add the DNS records (SPF, DKIM, DMARC).
2. Create an account-owned API token with the **Email Sending: Edit**
   permission.
3. Store it in Sigillo (Nomia BNQ, `staging`) as
   `GQ_EMAIL_CLOUDFLARE_API_TOKEN`, then set the same line in the Ploi site's
   `.env`.
4. In **GETQUICK → Options → Email**, turn it on, enter the account ID, and
   set the From address on the onboarded domain.
5. Check and test it from the CMS:

   ```sh
   wp gq-email status
   wp gq-email test you@example.com
   ```

   `test` prints Cloudflare's Message-ID and what it did with the recipient.
   Send tests to an address you control: bounces hurt the domain's sending
   reputation.

## Layout

| Path                                 | What it is                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `gq-email.php`                       | Plugin header, constants and the PSR-4 autoloader; boots `Plugin` on `plugins_loaded`. |
| `src/Plugin.php`                     | Wires the components below.                                                            |
| `src/Settings.php`                   | The Email area, the token, and whether the setup is complete.                          |
| `src/CloudflareTransport.php`        | Installs the mailer, selects Cloudflare per message and sets the sender.               |
| `src/CloudflareMailer.php`           | `WP_PHPMailer` with the `cloudflare` mailer.                                           |
| `src/Cloudflare/EmailSendingApi.php` | The `send_raw` request and its response.                                               |
| `src/Cloudflare/SendResult.php`      | What Cloudflare did with each recipient.                                               |
| `src/Cloudflare/SendFailed.php`      | Cloudflare refused, couldn't be reached, or reached no one.                            |
| `src/Cli/EmailCommand.php`           | `wp gq-email status` and `wp gq-email test <to>`.                                      |
| `tests/`                             | The Pest suite, run by `composer test` in `apps/cms`.                                  |
