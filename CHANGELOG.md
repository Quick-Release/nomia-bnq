# Changelog

## v0.14.0 - 2026-10-26

Previous release: v0.13.0

- b75ff89 Merge pull request #88 from Quick-Release/claude/gq-email-test
- 4341378 Merge remote-tracking branch 'origin/main' into claude/gq-email-test
- 04021b8 feat: add a Test column to the Email tab
- 089f734 Merge pull request #87 from Quick-Release/fix/gravity-forms
- 40b6f32 fix: restore Composer-managed Gravity Forms
- 125b659 Merge pull request #86 from Quick-Release/claude/gq-email-activation
- 113ad8d fix: activate gq-email on deploy

## v0.13.0 - 2026-10-26

Previous release: v0.12.0

- 0bf6774 Merge pull request #85 from Quick-Release/claude/gq-email
- 001bd5e feat: add gq-email plugin sending wp_mail through Cloudflare Email Service
- 32f6e66 Merge pull request #84 from Quick-Release/feat/oportunidades-entidades
- 2e94272 feat: add tag-style entities taxonomy to opportunities
- ccb7d23 Merge pull request #83 from Quick-Release/feat/legislacao-library
- 905f36b Merge pull request #82 from Quick-Release/claude/revert-paragraph-spacing
- 6e09318 feat: add legislation document fields and filtered library grid
- 6b94a17 revert: drop ineffective Site paragraph spacing
- ed4582e Merge pull request #81 from Quick-Release/fix/content-nightly-cold-cache
- 43f2fac fix: resolve nightly locks on cold runner metadata caches
- 054ae7d Merge pull request #78 from Quick-Release/feat/content-nightly-adoption
- d47af8a test: isolate fixture from inherited Git hook environment
- ee22f05 test: own admission Git fixture for archived CI workspaces
- 7a8ee61 fix: skip unchanged nightly snapshots before expensive preparation
- b5dd2f9 fix: expand deduplicated pnpm references in nightly graph guard
- 2472e03 fix: accept Content nightly-only plugin asset prefix
- cff22de fix: batch deployment fence reads for scheduled admission
- aa1be9a feat: adopt Content artifacts through shared Nomia nightlies

## v0.12.0 - 2026-10-26

Previous release: v0.11.0

- b4e28fc Merge pull request #80 from Quick-Release/fix/paragraph-spacing
- 17b713a Merge pull request #79 from Quick-Release/claude/indicator-chart-block
- 15783c8 fix: space consecutive paragraphs in core content bands
- e47c43f feat: add Indicador chart block
- 8078c32 feat: add site-owned header contact and search blocks
- bcaabc7 Merge remote-tracking branch 'origin/main' into fix/71-hero-editorial-colors
- 063a932 fix: respect editorial colors in media grid hero (#71)
- e629599 Merge pull request #77 from Quick-Release/docs/stable-only-live-editor-checks
- 0e9e6ee docs: reserve authenticated live editor checks for stable releases
- 7627b3b Merge pull request #76 from Quick-Release/fix/72-editor-style-cache-version
- 2f10511 fix: invalidate cached Nomia block editor styles by content
- 191f226 Merge pull request #75 from Quick-Release/fix/72-gutenberg-editor-spacing
- 0909c08 fix: preserve native Gutenberg spacing in Nomia hero editors
- 23b792d Merge pull request #74 from Quick-Release/feat/nomia-full-nightlies
- b206c27 feat: ship Nomia CMS and frontend together as development nightlies
- a85a2d9 Merge pull request #73 from Quick-Release/fix/nightly-status-transport
- 07845d4 fix: redact malformed completion response errors
- c6ddd5e fix: complete nightly deployment status over fresh HTTPS
- 7f15fd9 Merge pull request #70 from Quick-Release/fix/nightly-actions-environment-fence
- 0e1b54c fix: distinguish current Actions deployment from activation fences
- 53938d7 Merge pull request #69 from Quick-Release/feat/gq-design-nightly-opt-in
- cc568ba feat: prepare reserved Nomia nightly opt-in
- d98071c Merge pull request #68 from Quick-Release/feat/gq-design-nightly-adoption
- bd5c69a fix: validate complete assets and resume newest build after rollback
- c55ba99 docs: distinguish released Design 0.9.1 from Nomia locked baseline
- fc5524a fix: require nightly migration declaration and PHP 8.4
- af10f0b feat: prepare Nomia development Design nightly adoption

## v0.11.0 - 2026-10-24

Previous release: v0.10.8

- 7160304 Merge pull request #67 from Quick-Release/claude/archive-pages-v2
- 010b91a feat: archive Pages with Listing and Filters blocks served from the store
- 4129850 fix(cms): expose every gq-bioeconomia taxonomy to WPGraphQL

## v0.10.8 - 2026-10-24

Previous release: v0.10.7

- 29b316a Merge pull request #66 from Quick-Release/claude/page-owned-archive-urls
- 66a6fbb fix(cms): let the section Pages own their URLs over the CPT archives
- 1888feb Merge pull request #7 from Quick-Release/claude/media-uploads-path
- 3e6a638 Merge pull request #5 from Quick-Release/claude/palette-script-user
- 425f34f fix(cms): keep /uploads/ in the migration's media rewrite
- 9be489e fix(cms): run the palette script as an administrator

## v0.10.7 - 2026-10-24

Previous release: v0.10.6

- Emit the unchanged canonical scoped reset in Tailwind base so Site utility spacing and typography retain their authored values.
- Transfer the existing 180px header branding cap to the Site Logo wrapper so canonical image fill preserves the Site policy.
- Add actual Layout/header cascade and authorable logo sizing coverage; retain caption margins in media geometry evidence.

## v0.10.6 - 2026-10-24

Previous release: v0.10.5

- Adopt published content 0.3.2 and Design 0.9.0 through blueprint 0.23.2.
- Render shared neutral presentation, resolved themes and selected Query context in the actual Site paths.
- Mount owning Carousel, navigation, Video Hero and Cover motion lifecycles; preserve source semantics and consent.
- Verify saved producer fixtures and production CSS across responsive, native layout, media and language cases.

## v0.10.5 - 2026-10-23

Previous release: v0.10.4

- e6c361b fix: restore responsive Container sizing on the frontend

## v0.10.4 - 2026-10-23

Previous release: v0.10.3

- 7d64e47 fix: adopt shared responsive grid rendering for the header

## v0.10.3 - 2026-10-23

Previous release: v0.10.2

- 4bbff8d fix: use uniform submenu colors across thematic navigation items

## v0.10.2 - 2026-10-23

Previous release: v0.10.1

- bd832bc fix: generate navigation responsive utilities in one stylesheet

## v0.10.1 - 2026-10-23

Previous release: v0.10.0

- 97d731a fix: respect CMS background colors in header patterns
- 1ce7beb chore: adopt gq-design 0.8.1
- 219594d feat: use native color popovers for navigation hover settings
- de567bc fix: invalidate cached editor assets when their content changes

## v0.10.0 - 2026-10-23

Previous release: v0.9.1

- adc1d27 fix: keep navigation hover styles in the site stylesheet
- 0a821da feat: add navigation hover colors and submenu icon controls

## v0.9.1 - 2026-10-23

Previous release: v0.9.0

- 5bd58af Merge pull request #63 from Quick-Release/claude/header-css-order
- 8d6c5a6 fix: keep Tailwind's utilities in their order on pages with the header bar

## v0.9.0 - 2026-10-23

Previous release: v0.8.1

- ac8407d Merge pull request #62 from Quick-Release/claude/header-logo-colors
- e8c37fd feat: header bar with the site logo, and thematic colors in the navigation

## v0.8.1 - 2026-10-23

Previous release: v0.8.0

- 2c0f1e5 Merge pull request #61 from Quick-Release/claude/nav-uncolored-pills
- 4b84847 fix: draw navigation pills only for areas with a color

## v0.8.0 - 2026-10-23

Previous release: v0.7.2

- e9eba7f Merge pull request #60 from Quick-Release/claude/header-pattern
- 7632c2d feat: render the header GQ Design selects, with Nomia's navigation
- ac32c37 chore: adopt @getquick/site 0.22.0 and the gq-content 0.3.0 pair

## v0.7.2 - 2026-10-22

Previous release: v0.7.1

- e5b3385 Merge pull request #59 from Quick-Release/claude/gq-design-0.6.0
- 29a2f14 chore(cms): adopt GQ Design 0.6.0

## v0.7.1 - 2026-10-22

Previous release: v0.7.0

- 67b96ab Merge pull request #58 from Quick-Release/claude/gq-bioeconomia-name
- de9536d chore(cms): name the plugin GETQUICK Bio.Eco.Nomia at 0.65.0

## v0.7.0 - 2026-10-22

Previous release: v0.6.1

- ad0b0bb Merge pull request #57 from Quick-Release/claude/gq-bioeconomia
- b638828 refactor(cms): merge nomia-cpt into gq-bioeconomia and rename its data
- f76b987 refactor(cms): move nomia-blocks into the gq-bioeconomia plugin

## v0.6.1 - 2026-10-22

Previous release: v0.6.0

- 5597ee6 fix(cms): stop duplicating global taxonomy entries under Posts
- 1d161ee docs: point agents to git-ignored AGENTS.local.md
- 67a8a9a feat: configure thematic colors on taxonomy terms (#9)
- f9ea8a3 fix: align thematic colors in homepage cards and navigation (#9)
- 7d740be fix(cms): migrate legacy Nomia details to post meta

## v0.6.0 - 2026-10-22

Previous release: v0.5.0

- 54797e0 Merge pull request #52 from Quick-Release/claude/consent-pilot
- 9eb9330 docs: order the content-pair cutover in the consent enablement plan
- 3d4a79e Adopt the consent and legal-pages foundations

## v0.5.0 - 2026-10-22

Previous release: v0.4.7

- e297ae8 Merge pull request #53 from Quick-Release/claude/content-pair-migration
- 0788c47 Adopt @getquick/site 0.20.0 for the content package pair
- fdd05d5 Move onto the gq-content package pair at 0.2.0
- 353b776 Merge pull request #50 from Quick-Release/claude/bypass-gravity-forms
- 17dd8fc Pause Gravity Forms

## v0.4.7 - 2026-10-22

Previous release: v0.4.6

- 66069c6 Merge pull request #47 from Quick-Release/claude/library-details
- f359e35 fix(cms): keep biblioteca document details in post meta
- 7d942ca docs: route other-repository work through orchestrated T3 sessions
- 2e5e5cd Merge pull request #46 from Quick-Release/claude/gq-design-dev-main
- 7379d73 Install gq-design from dev-main via the registry
- ea24f99 docs: clarify shared content ownership routing

## v0.4.6 - 2026-10-21

Previous release: v0.4.5

- 7394a1c Update GQ Design to 0.4.6

## v0.4.5 - 2026-10-21

Previous release: v0.4.4

- 6c12b83 Fix Gravity Forms license hook path during deploy

## v0.4.4 - 2026-10-21

Previous release: v0.4.3

- 7f17d95 Install and license Gravity Forms through Composer

## v0.4.3 - 2026-10-20

Previous release: v0.4.2

- d33cfa0 Update CMS dependencies and add project skills and theme research

## v0.4.2 - 2026-10-19

Previous release: v0.4.1

- 9e52d24 chore(cms): update GQ Design to 0.4.3 and plugins

## v0.4.1 - 2026-10-19

Previous release: v0.4.0

- 16750b7 feat(blocks): title the navigation block nomia_navigation

## v0.4.0 - 2026-10-19

Previous release: v0.3.1

- 377a4f0 feat(blocks): add the Navegação block, bioeconomia.pt's header navigation

## v0.3.1 - 2026-10-18

Previous release: v0.3.0

- b52f8bd refactor(cms): build nomia-blocks the way GQ Design builds its blocks (#8)
- 1217ef1 chore(cms): import tooling for the full nomia-admin export

## v0.3.0 - 2026-10-18

Previous release: v0.2.2

- 2284309 refactor(frontend): keep the blueprint's Layout and global.css
- ebebfde feat: take Nomia's colors from GQ Design's palette
- c2b667b feat(frontend): render Nomia's blocks from the publication store
- 8d488aa feat(cms): migrate the nomia-blocks plugin from bioeconomia.pt

## v0.2.2 - 2026-10-18

Previous release: v0.2.1

- f8b5585 fix(ci): adopt site 0.18.3 Composer installer fix

## v0.2.1 - 2026-10-18

Previous release: v0.2.0

- 71382a7 fix(cms): adopt shared wpgraphql-blocks patch from site 0.18.2
- cb67c7d chore(ops): move the local dev admin email to a plus-address that production doesn't use
- 72f863d chore(cms): page-run import tooling and remote probes
- 7dfe71d chore(cms): hotfix production 502s from the wpgraphql-blocks stderr flood
- 68f08de chore(cms): add tooling for the nomia-admin content migration
- 6d22ce0 chore(cms): update WordPress core to 7.1.3 and plugins

## v0.2.0 - 2026-10-14

Previous release: v0.1.0

- 23cb962 fix(cms): register the PHPCS standards in the ruleset
- 2675343 feat(cms): migrate the nomia-cpt plugin from bioeconomia.pt

## v0.1.0 - 2026-10-14

Previous release: initial release

- b7d09a7 docs: name the Frontend Nomia
- 86b7200 fix: brand the Frontend and CMS as Nomia
- de9204d chore: record nomia-bnq's provisioned Ploi site ID
- 99a15f0 feat: generate nomia-bnq with gq new (0.18.0)
