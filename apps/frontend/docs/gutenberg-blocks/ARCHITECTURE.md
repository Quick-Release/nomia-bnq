# WordPress block architecture for Astro-owned rendering

## Recommendation

Use WordPress Gutenberg blocks as **content contract blocks**, not visual implementation blocks.

WordPress should own:

- block insertion and ordering
- content fields
- basic editor validation
- serializing block attributes into `post_content`
- exposing `content(format: RAW)` through WPGraphQL

Astro should own:

- layout
- class names
- responsive behavior
- accessibility markup
- design tokens
- animations and interaction details
- frontend rendering
- version-to-version visual changes

This means a layout/class/accessibility change should usually require only a `apps/web` deploy. WordPress only changes when the **content schema** changes.

## Rendering boundary invariants

Recorded in [ADR 0013](../../../docs/adr/0013-astro-owns-block-rendering.md). WordPress produces no
public HTML; the `nomia-black` theme is an intentionally empty headless shell. Four rules follow:

1. A block may only be insertable where something renders it. The editor allowlist must be derived
   from renderer support, not maintained beside it.
2. A Structured block may only be inserted into a **block-rendering content kind** — a content kind
   whose loader parses blocks and runs the Astro dispatcher. Today that is the page alone; posts,
   events, and CPT entries request only `content(format: RENDERED)` and would show a debug comment.
3. Astro owns native-block presentation. WordPress's `block-library` stylesheet is deliberately not
   loaded, so a core block is supported only when an Astro renderer defines its appearance.
4. A **dynamic block** — one whose output cannot be derived from saved content — needs a named
   per-block integration. `gravityforms/form` is the only member.

## Data flow

1. Editor inserts a custom Gutenberg block, for example `getquick/page-hero-static`.
2. The block stores only content attributes in the block comment inside `post_content`.
3. WPGraphQL exposes `content(format: RAW)`.
4. `apps/web` parses raw block serialization with `@wordpress/block-serialization-default-parser`.
5. `WpBlock.astro` dispatches custom blocks through the generated `WpCustomBlock.astro` registry.
6. Known block names map to Astro components; unsupported custom blocks use the dispatcher's explicit fallback policy.
7. Astro maps block attributes to the current component props and renders the final UI.

## Gutenberg block type

Blocks register from standard per-block `block.json` metadata that is **generated** from a
single source of truth. See [Block registration model](#block-registration-model).

Prefer dynamic blocks with `save: () => null` or a minimal saved fallback.

The important part is that attributes remain serialized in the block comment, for example:

```html
<!-- wp:getquick/page-hero-static {"title":"...","subtitle":"...","imageId":123,"imageUrl":"..."} /-->
```

The WordPress frontend render callback can return a lightweight placeholder or nothing, because Astro is the canonical frontend. The editor can still render a preview using React.

## Editor preview strategy

Use one of these, in priority order:

### Option A: Astro preview iframe, best fidelity

Use the preview page in `apps/web`:

`/wp-block-preview?block=<wp-block-name>&attrs64=<base64url-json>`

Examples:

`/wp-block-preview?block=getquick/page-hero-static&attrs64=...`

The Gutenberg block editor sends:

- `block`: WordPress block name, e.g. `getquick/page-hero-static`
- `attrs64`: base64url-encoded JSON attributes, recommended for iframes
- or `attrs`: URL-encoded JSON attributes, useful for debugging
- `previewToken`: optional shared secret when `NOMIA_WP_BLOCK_PREVIEW_TOKEN` is configured in `apps/web`

The page renders the same Astro `WpBlock` dispatcher used by frontend WordPress content. Gutenberg displays it in an iframe. Preview explicitly selects the `diagnostic` unsupported-block policy, so release skew is visible instead of producing an empty iframe.

Normal frontend rendering asks for `saved-content`, but that branch is currently unreachable for 35 of
the 36 blocks: they are `save: () => null`, so `hasFallbackContent` is always false and
`resolveWpUnsupportedFallback` returns `diagnostic` regardless of the requested mode. Only
`getquick/section` can ever reach `saved-content`. An unmapped block therefore renders a reader-facing
amber `role="status"` panel on the public site. See ADR 0013; the marker is to become hidden and
assertable rather than visible, and the dead branch removed or made honest.

Security decision: the preview endpoint remains public by default for local development and staging simplicity. Production deployments that should not expose arbitrary preview attributes must set `NOMIA_WP_BLOCK_PREVIEW_TOKEN` in Astro and the matching `GETQUICK_NOMIA_BLOCK_PREVIEW_TOKEN` constant or `getquick_nomia_blocks_preview_token` filter in WordPress. When enabled, Astro returns `403` for missing or invalid preview tokens.

Pros:

- exact Astro output in the editor
- class/layout changes in `apps/web` appear without changing block editor rendering code
- lowest long-term design drift

Cons:

- needs preview endpoint and CORS/auth handling
- editor preview depends on local/staging Astro availability

### Option B: shared CSS and React preview, acceptable

Build a lightweight React editor preview that uses the same field data and imports the compiled design CSS/tokens.

Pros:

- simpler than iframe preview
- works offline inside WP editor

Cons:

- can drift from Astro markup
- visual changes may require updating the CMS plugin

### Option C: form-only preview, easiest

Show content fields and a simple title/thumbnail summary.

Pros:

- fastest to implement
- almost no design drift risk because it does not pretend to match frontend

Cons:

- editors do not see the final design

Given the requirement to see the block as it appears in Astro, choose **Option A** for high-value visual blocks and Option C for data-heavy/internal blocks if needed.

## Attribute schema rules

Expose content only. Do not expose visual controls.

Good attributes:

- strings: `title`, `subtitle`, `label`, `href`
- rich text content when needed: `body`, `description`
- images: `imageId`, `imageSrc`, `imageAlt`
- repeaters: `items`, `slides`, `objectives`, `results`
- taxonomy/content references: `postId`, `termId`, `queryType`

The rule is about the _shape_ of the value, not the name of the field: **a closed token enum is
content; a free-form CSS value is not.** `paddingTop: none|small|medium|large` expresses editorial
intent and leaves Astro owning what the token means, so `getquick/section`'s padding attributes are
legitimate. An unconstrained string that reaches CSS is not.

Avoid attributes that carry raw presentation:

- `backgroundColor` or `textColor` as free-form strings (a palette enum is acceptable; note that
  `getquick/section.backgroundColor` is currently an unconstrained string and is tracked as a defect
  in issue #16)
- `columns`, `alignment`, `padding` as raw CSS values rather than token enums
- `className`
- `style`
- `variant`, unless the variant is a content contract explicitly supported by Astro

## Repeater row contracts

An array attribute may declare its object row properties, required fields, editor control
intent, and nested legacy reads in the structured-block registration. The sync step carries
that metadata to the Gutenberg contract, where the shared repeater field creates blank rows,
hydrates legacy values, and reports incomplete rows. Astro renderers still normalize raw
WordPress rows into their domain props; the row contract does not make external content
trusted.

Top-level repeater mirrors such as `items` remain compatibility reads when a block has a
more specific canonical name such as `cards`, `slides`, or `results`. Editors write only the
canonical attribute. See [`ADR 0004`](../../../docs/adr/0004-centralize-repeater-row-contracts.md).

## Versioning

Each custom block should include a schema version attribute:

```json
{
  "schemaVersion": 1
}
```

## Block registration model

Each structured block is authored once under `src/structured-blocks/registrations/`. Root
`pnpm generate` discovers those registrations and generates Astro dispatch, preview fixtures,
Gutenberg editor dispatch, plugin JSON/PHP contracts, a committed machine-readable
content-contract adapter, mechanical documentation sections, the docs projection, and — for
WordPress — one `blocks/<catalogId>/block.json` per block plus `blocks/blocks-manifest.php`
([ADR 0014](../../../../docs/adr/0014-generate-block-json-from-registrations.md)).

- **Generated, never edited.** The `block.json` files and manifest, `src/Contracts.php`, the
  editor script of every block without a bespoke editor, and `assets/frontend-rules.js` are
  committed generated files; `pnpm structured-blocks:check` fails when they drift.
- **Registered the way GQ Design registers its blocks.** The editors are plain scripts on
  `window.wp`, with no build step. `Blocks\ContractBlocks` calls
  `wp_register_block_metadata_collection()`, then registers each block's own
  `blocks/<catalogId>/index.js` (with its translations) and
  `register_block_type( <dir>, [ 'editor_script' => …, 'render_callback' => … ] )`. Blocks use
  GQ Design's `getquick-design` inserter category and share the `getquick-nomia-blocks-editor`
  style.
- **i18n follows core.** `block.json` declares the `getquick-nomia-blocks` text domain, so
  WordPress translates titles, descriptions, and keywords under its `block title` /
  `block description` / `block keyword` contexts.

  This only holds because the server owns block metadata outright. Gutenberg merges the two
  registrations as `{ ...serverDefinition, ...jsSettings }`, so a `title` passed to
  `registerBlockType` in the editor bundle silently overrides the server's — and the
  server's is the translated copy, while the contracts carry the raw Portuguese
  source. `registerContractBlock()` (`assets/editor.js`) therefore registers `edit`, `save`,
  and `deprecated` and nothing else, and PHP passes only the editor script and
  `render_callback`. The plugin's tests enforce both sides.

- **The render model is unusual.** `render_callback` returns a debug placeholder (Astro
  owns rendering via `content(format: RAW)`), so there is no `render`, `viewScript`, or
  frontend `style` in the metadata.

````

Astro can migrate or normalize old attributes at render time. This avoids forced WordPress migrations for small schema changes.

## Block naming

Block names are **derived from** catalog IDs, never invented separately. One convention:

- **Catalog ID** (`catalogId`): the canonical EN kebab-case slug (`page-hero-static`,
  `horizontal-scroll-with-content`). This is the source of truth — referenced in specs, the
  `/blocks` catalog page, and doc briefs.
- **WordPress block name** (`blockName`): always `getquick/${catalogId}`. This makes
  `blockName ↔ catalogId` trivially derivable, so the Astro dispatcher map, the editor
  registry, and fixtures never drift from the contract.
- **Astro dispatcher key**: generated from the same `blockName`.

Example:

| Field | Value |
|-------|-------|
| `catalogId` | `page-hero-static` |
| `blockName` | `getquick/page-hero-static` |
| dispatcher key | `"getquick/page-hero-static"` |

Keep the catalog ID as an attribute too if useful:

```json
{
  "blockId": "page-hero-static",
  "schemaVersion": 1
}
````

### Checked renderer reference, no public `astroComponent` field

There is deliberately no decorative `astroComponent` field in the public content contract.
The internal structured block registration names a renderer module that must exist; sync then
generates the static `blockName → renderer` imports in `WpCustomBlock.astro`. The checked
reference owns wiring without exposing implementation metadata to WordPress content.

### The one intentional exception

`getquick/grafico-donut` keeps its PT `catalogId` because that string doubles as the
React component id (`GRAFICO_DONUT_COMPONENT_ID`) used for `client:only` hydration.
Renaming it would conflate block identity with component identity. Every other block
follows the `catalogId`-derives-`blockName` rule.

````

## Media handling

Store both media IDs and URLs:

```json
{
  "imageId": 123,
  "imageUrl": "https://.../image.jpg",
  "imageAlt": "..."
}
````

Astro can prefer transformed/source URLs from WPGraphQL when available, but URL fallback makes previews and rendering resilient.

## Preview and validation tools

`apps/web` includes an internal visual smoke page for all supported custom blocks:

`/wp-block-preview/catalog/`

This page renders fixture blocks through the same Astro `WpBlock` dispatcher used for WordPress content. Use it after changing contracts, renderers, or component props. An unsupported custom block renders a diagnostic marker in preview (`data-nomia-unsupported-block`) and preserves saved content when available.

CI/test coverage exercises the structured block registration interface and checks that every
generated adapter and mechanical documentation section is current. Orphan renderers, bespoke
editors, preview fixtures, and Gutenberg briefs fail registration validation.

## Agent authoring context and plans

The generated `data/structured-block-agent-context.json` is the repository-local context for
AI-assisted block work. It contains the content policy, media/URL/repeater field conventions,
design-token vocabulary, exact contracts, editor ownership, preview fixtures, and verification
commands. It is separate from the public
`/api/wp-block-contracts.json` projection, which intentionally omits implementation references.

Use the read-only plan command before changing a block:

```bash
pnpm structured-blocks:plan -- library-grid
pnpm structured-blocks:plan -- getquick/page-hero-static --json
```

The plan identifies the registration source, renderer/editor/documentation files, generated
projections, compatibility reads, editable fields, required repeater fields, and proof levels.
It does not write files. Edit the registration, then run `pnpm generate`; generated projections
remain read-only.

## Serialized content validation

`structured-blocks:validate-content` checks saved `getquick/*` block attributes against the
structured registrations. It validates canonical and explicitly supported legacy fields,
required repeater rows, enums, metadata, and unknown attributes. Non-Nomia blocks are parsed but
left to WordPress/core validators.

```bash
pnpm structured-blocks:validate-content -- content/**/*.html
pnpm structured-blocks:validate-content -- content/**/*.html --strict --json
```

Unknown future `getquick/*` block names are warnings by default so old content remains inspectable;
`--strict` promotes those warnings to failures. This validator is deliberately separate from
Gutenberg serialization validation: a syntactically valid block comment is not proof that its
Nomia attributes or Astro renderer are valid.

## Verification levels

Block work should name the strongest level actually run:

| Level            | Command                                | Establishes                                                             |
| ---------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| Contract         | `pnpm check`                           | Registration shape, generated projections, and cross-application parity |
| Astro preview    | `pnpm test:astro-preview`              | Fixture rendering through the Astro block dispatcher                    |
| CMS registration | `pnpm wp-plugin:test`                  | Tracked plugin registration and PHP test surfaces                       |
| RAW round-trip   | `pnpm structured-blocks:content-check` | Saved RAW comments parse into contract-valid attributes                 |
| Browser/editor   | `pnpm verify`                          | Complete build, CMS, browser, and packaging gate                        |

A contract check alone does not establish editor persistence or production behavior.

## Native Gutenberg content lane

Human Made's Block Runner is available as an isolated development dependency for simple native
content sections. Use it for authored HTML that should become `core/group`, `core/heading`,
`core/paragraph`, `core/buttons`, or `core/image` blocks:

```bash
pnpm block-runner convert page.html --out page.blocks.html
pnpm block-runner validate page.blocks.html
```

Review conversion warnings and the resulting markup before storing it in WordPress. A
`core/html` fallback is not equivalent to a native editable block; if the source is invented rather
than supplied HTML, prefer an intent-tree `assemble` flow. The lane does not replace structured
registrations, does not understand `getquick/*` contracts, and does not prove an Astro renderer or
bespoke editor. Custom blocks, repeaters, charts, maps, and dynamic data remain owned by the
existing registration → plugin projection → Astro renderer path. See
[ADR 0012](../../../docs/adr/0012-keep-block-runner-as-native-content-lane.md) for the boundary.

## Contract endpoint

`apps/web` exposes the current custom block contracts at:

`/api/wp-block-contracts.json`

The endpoint supports cross-origin `GET` and `OPTIONS`, so a WordPress admin/editor running on a different host can fetch it. Its response is the exact committed machine adapter generated from structured block registrations. The schema-version-1 envelope may gain additive fields; removals, renames, and semantic changes require a new envelope version.

The public projection includes identity, lifecycle, exact top-level attribute schemas and defaults, top-level compatibility reads, and resolved editor metadata. Renderer, fixture, bespoke editor module, and documentation references remain internal.

The WordPress block plugin can use this endpoint during development or CI to verify:

- supported WordPress block names
- stable catalog IDs
- current schema versions
- allowed content attributes
- Astro component ownership

Do not use this endpoint to add editor styling controls. It is a contract validation aid, not a page-builder schema.

## Astro renderer developer notes

The Astro-side renderer conventions are documented in:

`apps/web/src/components/wp-blocks/README.md`

Use that file when adding a new custom block renderer or changing a block contract.

## Recommended implementation pieces

### WordPress side

- One tracked first-party plugin at `apps/cms/web/app/plugins/nomia-blocks/` (`getquick-nomia-blocks`).
- Generated PHP/JSON contracts and per-block `block.json` metadata (ADR 0014).
- Shared field components for:
  - image picker
  - link picker
  - repeater items
  - rich text/plain text
- Blocks save only attributes, no editor-controlled styling.
- Optional iframe preview component shared by all blocks.

### Astro side

Add a dispatcher layer for custom blocks:

- Read `block.blockName`.
- Normalize `block.attrs` into component props.
- Render the current Astro component when the name is registered.
- Preserve saved HTML and nested blocks when the name is unsupported.
- Use a visible diagnostic policy for preview adapters.
- Ignore unknown visual/style attrs.

Suggested location:

- `src/components/wp-blocks/blocks/PageHeroStaticBlock.astro`
- `src/components/wp-blocks/blocks/PodcastListBlock.astro`
- etc.

Registration lives under `src/structured-blocks/registrations/`; generated Astro files must
not be edited directly.

## Why this is maintainable

With this model:

- Moving from `NomiaPageHero` to a redesigned hero needs only Astro changes if fields stay the same.
- Class changes never require a Gutenberg deploy.
- Accessibility fixes happen once in Astro.
- Responsive fixes happen once in Astro.
- Editors cannot break design consistency.
- Gutenberg remains a content-entry UI, not a page builder.

## When WordPress must change

A WordPress block update is needed only when:

- a new content field is required
- a field type changes
- a repeater structure changes
- a new block is introduced
- editor validation or selection UX changes

No WordPress update should be needed for:

- class changes
- spacing changes
- color/token changes
- responsive layout changes
- ARIA/accessibility improvements
- frontend animation changes
- image layout/cropping changes handled by Astro
