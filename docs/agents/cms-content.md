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

The user approved widening agent access to editorial content on 2026-11-09.
The live Access application and WAF rule were updated that day; this does not
by itself add import commands to the pinned `gq` CLI.

- The existing Access application "Nomia CMS administration" covers
  `/wp/wp-login.php`, `/wp/wp-admin` and `/wp-json/wp/v2` (with their
  subpaths). It keeps the same audience, named-user people policy, specific
  agent service-token policy and identity provider. Its current session is
  72 hours; an expired browser session still requires signing in again.
- REST remains in the same application as `wp-admin`, so a person's Access
  cookie works for block-editor saves. No public bypass policy was added.
- The WAF rule "Nomia CMS: agent editorial REST only with GET/POST" blocks
  requests carrying the agent's Basic-auth username or service-token client
  ID unless they match an allowed editorial route below. Only `GET` and
  `POST` pass. `X-HTTP-Method-Override` and `_method` stay blocked.
- Routes match an exact collection path or a descendant separated by `/`:
  `/pages-extra` does not inherit access from `/pages`. The alternate
  `/?rest_route=` entry point stays blocked for these credentials.
- All other agent routes remain blocked, including users, settings,
  plugins, theme configuration, `wp-admin`, GraphQL and PHP execution.
- WordPress authentication and capabilities still apply after Access and
  WAF. The agent remains an Editor; widening edge access does not grant
  administrator capabilities. Service-token-only requests reach WordPress
  but cannot read or write content without the application password.

All bases below are beneath `/wp-json/wp/v2/` and were discovered from the
live WordPress type/taxonomy registrations, rather than inferred from labels:

| Route group                                     | Allowed REST bases                                                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard content and media                      | `posts`, `pages`, `media`, `blocks`                                                                                                                                                                |
| Site content types                              | `gq_bio_gallery`, `biblioteca`, `glossario`, `recursos_educativos`, `eventos`, `indicadores`, `podcasts`, `videos`, `infografias`, `oportunidades`, `ferramentas`, `plataformas`, `bases_de_dados` |
| Editorial taxonomies                            | `categories`, `tags`, `wp_pattern_category`, `categoria_biblioteca`, `tipo_evento`, `tematicas`, `setor_atividade`, `categoria_oportunidade`, `entidades`, `regiao_nuts`                           |
| Menu content, subject to WordPress capabilities | `menu-items`, `navigation`, `menus`                                                                                                                                                                |
| Read-only registration discovery                | `types`, `taxonomies` (GET only)                                                                                                                                                                   |

This permits collection requests for creation/uploads, and descendants for
individual content, revisions and controller-specific media operations.
New REST bases require a deliberate WAF update. Theme templates, template
parts, global styles and font management are not editorial import routes.

Live verification on 2026-11-09 established:

- Edit-context reads succeed for pages, posts, media, reusable blocks, all
  Site content types and the import's `categoria_biblioteca` taxonomy.
- `menu-items`, `navigation`, `menus` and `regiao_nuts` edit-context reads
  receive WordPress `rest_forbidden_context` responses under the unchanged
  Editor role. Do not elevate the agent to work around these responses.
- POSTs to deliberately nonexistent library/media/term IDs reach WordPress
  and return its invalid-ID errors; no content was created by these probes.
- Users/settings/plugins, DELETE, `wp-admin`, method overrides and the
  alternate REST entry point are blocked with 403. An anonymous POST is
  redirected to Access, and a service-token-only POST receives WordPress 401.

Anonymous REST routes outside this Access namespace still receive 401 from
`content-api.php`. It already accepts authenticated editorial requests, so
no origin code or WordPress role change was needed.

### Roll back the edge change

Restore the Access application's REST destination from `/wp-json/wp/v2` to
`/wp-json/wp/v2/pages`, preserving its application ID, policies and other
settings. Restore the previous agent WAF rule's page-only expression and
description. Capture the complete application and ruleset immediately before
any change and restore only the owned application/rule, not unrelated zone
rules. Keep snapshots outside the repository with restricted permissions;
policy snapshots can contain personal data. Revoking or rotating the existing
agent credentials is not part of this rollback.

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
