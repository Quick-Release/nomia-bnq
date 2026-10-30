# Reading and changing production CMS content

How an agent reads and changes raw Gutenberg `post_content` on the production
CMS (`nomia-cms.bnq.pt`). This Site is the first adopter of
[gq-platform ADR 0011](https://github.com/Quick-Release/gq-platform/blob/main/docs/adr/0011-agent-access-to-production-cms-content.md);
issue [#114](https://github.com/Quick-Release/nomia-bnq/issues/114) records
the adoption.

The route is REST with the agent's application password. Logging in through
`wp-login.php` and sending a cookie with a REST nonce no longer works: Cloudflare
Access gates `wp-login.php` and `wp-admin`, and Two Factor protects the
accounts. Never use the administrator account for content work.

## Credentials

Sigillo holds them in the `staging` alias (environment `prod`). Use them only
through `pnpm exec gq sigillo run staging -- <command>`, and never print them
or pass them as command arguments.

| Name                                        | What it is                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `GQ_CMS_AGENT_USERNAME`                     | The dedicated agent WordPress user, role Editor. Agents use it, people don't. |
| `GQ_CMS_AGENT_APPLICATION_PASSWORD`         | That user's application password. REST only.                                  |
| `GQ_CMS_AGENT_ACCESS_CLIENT_ID` / `_SECRET` | The Access service token for unattended work.                                 |

They are separate from the preview, GraphQL, automation and `gq-design` MCP
credentials. Never reuse them elsewhere.

## What the edge enforces

- The Access application "Nomia CMS administration" covers
  `/wp/wp-login.php`, `/wp/wp-admin` and `/wp-json/wp/v2/pages` (with their
  subpaths). Its people policy admits the named CMS users by email one-time
  PIN. A Service Auth policy admits the agent's service token and nothing
  else.
- The page route belongs to the same application as `wp-admin`, not to a
  separate one. Access issues one token per application, and a separate
  application would reject the block editor's own saves to that route.
- An editor whose eight-hour Access session expires while the editor is open
  can no longer save until the page is reloaded and they sign in again.
- Any request carrying the agent's credentials (its username in Basic auth,
  or its service token) is blocked unless it is a `GET` or `POST` to
  `/wp-json/wp/v2/pages…` with no `X-HTTP-Method-Override` header and no
  `_method` parameter. This applies to `/?rest_route=` and every other path
  too. This is the WAF custom rule
  "Nomia CMS: agent credentials only on page REST with GET/POST".
- Other `/wp-json` routes are not behind Access. Anonymous requests to them
  get 401 from `content-api.php`.

## Edge credential

Either of these:

- **Interactive.** A person runs
  `cloudflared access login https://nomia-cms.bnq.pt/wp-json/wp/v2/pages`
  once per session (the browser opens), and the agent sends
  `cf-access-token` from
  `cloudflared access token -app=https://nomia-cms.bnq.pt/wp-json/wp/v2/pages`.
- **Unattended.** Send `CF-Access-Client-Id` and `CF-Access-Client-Secret`
  from the service-token pair.

Either way, also send `Authorization: Basic` with the agent username and
application password. The edge credential only gets the request past Access.
WordPress authenticates the request with the application password.

## Read

Page 58 is the front page. The unattended read:

```sh
pnpm exec gq sigillo run staging -- sh -c 'printf "header = \"CF-Access-Client-Id: %s\"\nheader = \"CF-Access-Client-Secret: %s\"\nuser = \"%s:%s\"\n" \
  "$GQ_CMS_AGENT_ACCESS_CLIENT_ID" "$GQ_CMS_AGENT_ACCESS_CLIENT_SECRET" \
  "$GQ_CMS_AGENT_USERNAME" "$GQ_CMS_AGENT_APPLICATION_PASSWORD" |
  curl -sS --fail-with-body --max-redirs 0 -K - \
    "https://nomia-cms.bnq.pt/wp-json/wp/v2/pages/58?context=edit"' > "$OUT"
```

`$OUT` is a file outside the repository. `content.raw` is the stored markup.
It is returned only with `context=edit`. For the interactive route, replace
the two service-token headers with `header = "cf-access-token: …"`. Set the token in an environment variable
first; never paste it into the command. `printf` is a shell builtin, so the
values stay out of the process list. A 302 to `getquick.cloudflareaccess.com`
means the edge credential is missing or has expired, and a 403 page from
Cloudflare means the WAF rule matched.

## Write

Production page-content writes need an explicit request from the user.

1. Read the page at `context=edit` and keep the response as the baseline.
2. Edit the parsed block tree, not the string. Splicing markup skips the
   block editor, and nothing then checks static blocks against `save()`.
3. Show the diff of the raw markup.
4. Validate in DDEV. Run `pnpm db:sync`, apply the new markup to the same
   page as an Editor, open it in the block editor and confirm that
   `wp.data.select('core/block-editor').getBlocks()` has no invalid blocks.
5. Write once: `POST /wp-json/wp/v2/pages/<id>` with a JSON `content` field.
6. Confirm that `GET /wp-json/wp/v2/pages/<id>/revisions` shows the new
   revision. It is the rollback.
7. Publish with `pnpm frontend:refresh --url https://nomia.bnq.pt` (the Worker
   directly; the APA proxy can time out a full refresh). Then verify the live
   page on `bioeconomia.apambiente.pt`.

The agent user is an Editor, so it keeps `unfiltered_html` (this is not a
multisite and `DISALLOW_UNFILTERED_HTML` is unset). KSES then leaves saved
markup alone. On 2026-10-30 the front page round-tripped byte for byte through
REST in DDEV. The check also showed that a role without `unfiltered_html`
would change 22 of 270 content items. KSES would rewrite `/>` as ` />` in
image and separator markup, and strip the `<object>` embed from file blocks.
Don't move the agent to such a role without a fresh check.

## Break-glass WP-CLI

Use WP-CLI only when REST is unavailable. Run `pnpm db:backup` first. Take the
host from Ploi (`pnpm exec gq sigillo run staging -- pnpm exec gq ploi server
show`) and the system user from `gq.ops.json` `ploi.systemUser`, never from a
hand-written SSH alias. Write through `wp post update <id> <file>`, never raw
SQL, and confirm the revision afterwards.
