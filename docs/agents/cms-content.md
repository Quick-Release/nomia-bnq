# Reading and changing production CMS content

How an agent reads and changes raw Gutenberg `post_content` on the production
CMS (`nomia-cms.bnq.pt`). This Site is the first adopter of
[gq-platform ADR 0011](https://github.com/Quick-Release/gq-platform/blob/main/docs/adr/0011-agent-access-to-production-cms-content.md);
issue [#114](https://github.com/Quick-Release/nomia-bnq/issues/114) records
the adoption.

The route is `gq content` (REST with the agent's application password, behind
Cloudflare Access). The package guide,
`node_modules/@getquick/site/docs/guides/cms-content.md`, describes each
command in full. This page records what is specific to Nomia. Logging in
through `wp-login.php` and sending a cookie with a REST nonce no longer works:
Cloudflare Access gates `wp-login.php` and `wp-admin`, and Two Factor
protects the accounts. Never use the administrator account for content work.

## Credentials

Sigillo holds them in the `staging` alias (environment `prod`). This Site has
no `production` alias: where the package guide says
`gq sigillo run production`, use `pnpm exec gq sigillo run staging`. Never
print the values or pass them as command arguments.

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
  Editor saves through Access were checked on 2026-10-30.
- An editor whose eight-hour Access session expires while the editor is open
  can no longer save until the page is reloaded and they sign in again.
- Any request carrying the agent's credentials (its username in Basic auth,
  or its service token) is blocked unless it is a `GET` or `POST` to
  `/wp-json/wp/v2/pages…` with no `X-HTTP-Method-Override` header and no
  `_method` parameter. This applies to `/?rest_route=` and every other path
  too. This is the WAF custom rule
  "Nomia CMS: agent credentials only on page REST with GET/POST".
- So the agent can change pages only. `gq content --type post` (and custom
  post types) is blocked at the edge. Widening the rule needs the user's
  approval.
- Other `/wp-json` routes are not behind Access. Anonymous requests to them
  get 401 from `content-api.php`.

`gq content` uses the service token when Sigillo injects it (it prints
`Edge: service token.`). A person's `cloudflared access login
https://nomia-cms.bnq.pt/wp-json/wp/v2/pages` session also works. A redirect
to `getquick.cloudflareaccess.com` means the edge credential is missing or has
expired, and a 403 page from Cloudflare means the WAF rule matched.

## Read

Page 58 is the front page. Keep files outside the repository, under
`/data/agents/scratch/`.

```sh
pnpm exec gq sigillo run staging -- pnpm exec gq content get 58 --out "$DIR/page-58.html"
```

## Write

Production page-content writes need an explicit request from the user.

1. `get` the page, as above. The file is the baseline.
2. Edit the block tree (a `.json` output file), or change only block
   attributes or one attribute value in the markup. Never splice blocks in
   the markup as a string.
3. Show the user the diff:
   `pnpm exec gq sigillo run staging -- pnpm exec gq content diff 58 --file "$DIR/page-58.edit.html"`.
4. Validate in the local CMS:
   `pnpm exec gq sigillo run staging -- pnpm exec gq content validate 58 --file "$DIR/page-58.edit.html"`.
   It needs DDEV running with the CMS dependencies installed
   (`pnpm cms:composer`, then `pnpm cms:dev`), and a database from
   `pnpm db:sync` that has the page.
5. Write once:
   `pnpm exec gq sigillo run staging -- pnpm exec gq content put 58 --file "$DIR/page-58.edit.html" --yes`.
   It refuses a file that didn't pass `validate` or a page changed since
   `get`, then names the new revision and the one to roll back to.
6. Publish with `pnpm frontend:refresh --url https://nomia.bnq.pt`. Don't use
   the `gq frontend refresh --uri /` that `put` suggests: refresh refuses
   `/`, and the APA proxy can time out a full refresh, so call the Worker
   directly. Then check the live page on `bioeconomia.apambiente.pt`.

Links in content point to the canonical host,
`https://bioeconomia.apambiente.pt/…`, or are relative. Don't link to
`nomia.bnq.pt`. Since 2026-10-30 no published page does.

Rollback: `get 58 --revision <id> --out <file>`, then `validate` and `put`
that file. `put` prints the revision to use.

The agent user is an Editor, so it keeps `unfiltered_html` (this is not a
multisite and `DISALLOW_UNFILTERED_HTML` is unset). KSES then leaves saved
markup alone. On 2026-10-30 the front page round-tripped byte for byte through
REST in DDEV. The check also showed that a role without `unfiltered_html`
would change 22 of 270 content items. KSES would rewrite `/>` as ` />` in
image and separator markup, and strip the `<object>` embed from file blocks.
Don't move the agent to such a role without a fresh check.

### Local CMS in a worktree

Every worktree of this repository uses the DDEV project name
`nomia-bnq-admin`. If another worktree's CMS is running, `gq cms start` fails
with "a project (web container) in running state already exists". Give the
worktree its own name in `apps/cms/.ddev/config.local.yaml` (git ignores
it), for example `name: nomia-bnq-<task>`, rather than stopping the other
worktree's CMS. Stop it with `pnpm cms:stop` when you are done.

## Break-glass WP-CLI

Use WP-CLI only when REST is unavailable, and only through `gq wp`. It finds
the server from `gq.ops.json` and runs as the site's system user, never
through a hand-written SSH alias. It allows only listed commands, and it runs
`gq db backup` before any write:

```sh
pnpm exec gq sigillo run staging -- pnpm exec gq wp -- post get 58 --field=post_content
pnpm exec gq sigillo run staging -- pnpm exec gq wp --yes -- post update 58 "$DIR/page-58.edit.html"
```

Validate the file with `gq content validate` first, since `gq wp` skips the
block editor. Then confirm the revision and refresh as above.
