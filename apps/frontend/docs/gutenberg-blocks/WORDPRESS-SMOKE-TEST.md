# WordPress plugin smoke test checklist

Use this checklist in a real WordPress install after building the same revision with
`pnpm cms:build` and deploying the tracked
`apps/cms/web/app/plugins/gq-bioeconomia` source and its built assets. The build
must provide `gq-bioeconomia.php`, `src/`, `assets/`, `blocks/` and
`languages/`: the editor scripts ship as written, with no build output. The optional
deployment zip is equivalent; the plugin is no longer installed through Composer.

## Prerequisites

- WordPress with the block editor enabled.
- The first-party `gq-bioeconomia` plugin deployed and activated.
- WPGraphQL installed for the headless Astro integration. Public Astro loaders are anonymous and prefer `wpBlocksJson`; they do not receive a source token.
- `apps/web` running and reachable from WordPress for editor previews.

Optional preview config in `wp-config.php` or environment-specific config:

```php
define('GQ_BIOECONOMIA_FRONTEND_URL', 'https://nomia.getquick.io');
// Only if apps/web sets NOMIA_WP_BLOCK_PREVIEW_TOKEN.
define('GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN', 'change-me');
```

## 1. Activate plugin

```bash
wp plugin activate gq-bioeconomia
wp plugin status gq-bioeconomia
```

Expected: plugin is active and no PHP warnings are emitted.

## 2. Verify custom block registration

```bash
wp eval '
$registry = WP_Block_Type_Registry::get_instance();
$expected = [
  "getquick/page-hero-static",
  "getquick/page-hero-slider",
  "getquick/content-list",
  "getquick/content-grid-filters",
  "getquick/map-list",
  "getquick/pie-chart-donut",
  "getquick/grafico-donut",
  "getquick/energy-consumption-chart",
  "getquick/resource-productivity-chart",
];
foreach ($expected as $name) {
  echo ($registry->is_registered($name) ? "OK " : "MISSING ") . $name . PHP_EOL;
}
'
```

Expected: every listed block prints `OK`. For a full check, compare the registered `getquick/*` names against `apps/cms/web/app/plugins/gq-bioeconomia/src/Contracts.php`.

## 3. Verify editor assets are enqueued

Create or edit a post in wp-admin and open the inserter. Expected:

- The blocks appear under GQ Design's `GETQUICK` category.
- Blocks listed in `apps/cms/web/app/plugins/gq-bioeconomia/src/Contracts.php` are available.
- Inspector controls expose content-only fields.
- Visual controls for color, typography, spacing, arbitrary classes, and alignment are absent.
- The Astro iframe preview loads from `/wp-block-preview` and auto-resizes.

## 4. Verify serialized `post_content`

Create a temporary post from WP-CLI:

```bash
POST_ID=$(wp post create \
  --post_type=post \
  --post_status=publish \
  --post_title='Nomia blocks smoke test' \
  --post_content='<!-- wp:getquick/page-hero-static {"schemaVersion":1,"blockId":"page-hero-static","title":"Smoke test hero","subtitle":"Serialized content contract","ctaLabel":"Read more","ctaHref":"/teste"} /-->' \
  --porcelain)

wp post get "$POST_ID" --field=post_content
```

Expected: `post_content` contains the `wp:getquick/page-hero-static` comment and JSON attributes.

## 5. Verify PHP block parser output

```bash
wp eval '
$post = get_post((int) getenv("POST_ID"));
$blocks = parse_blocks($post->post_content);
foreach ($blocks as $block) {
  echo $block["blockName"] . PHP_EOL;
  echo wp_json_encode($block["attrs"], JSON_PRETTY_PRINT) . PHP_EOL;
}
' POST_ID="$POST_ID"
```

Expected: parser returns `getquick/page-hero-static` and the saved attributes.

## 6. Verify anonymous WPGraphQL content

If WPGraphQL is installed, query the published temporary post exactly as the public Astro loaders do—without an authorization header:

```bash
curl -sS "$(wp option get siteurl)/graphql" \
  -H 'Content-Type: application/json' \
  --data-binary "$(jq -nc --arg id "$POST_ID" '{query:"query($id:ID!){ post(id:$id,idType:DATABASE_ID){ databaseId contentRaw:content(format:RAW) wpBlocksJson } }",variables:{id:$id}}')"
```

Expected: the published post is visible and `wpBlocksJson` contains the structured block payload. `contentRaw` may be `null` under the anonymous RAW-content policy; public rendering must still work from `wpBlocksJson`. Do not add `WORDPRESS_GRAPHQL_TOKEN_LOCAL` or `WORDPRESS_GRAPHQL_TOKEN_PRODUCTION` to public Astro loaders. Source tokens are limited to explicit preview requests and schema/drift tooling. To smoke-test a draft preview, use that dedicated authorized path and a short-lived credential rather than changing this anonymous request.

## 7. Verify Astro rendering

Point `apps/web` at the WordPress GraphQL endpoint and load a page that renders the post content through `WpBlock.astro`.

Expected:

- Astro reads `wpBlocksJson`, with RAW comments only as an available fallback.
- `WpCustomBlock.astro` dispatches the block by `blockName`.
- Final frontend markup is rendered by Astro components.
- WordPress frontend output for these blocks may be empty; this is expected because Astro owns frontend rendering.

## Cleanup

```bash
wp post delete "$POST_ID" --force
```
