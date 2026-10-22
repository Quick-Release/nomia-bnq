// Generated from apps/frontend/src/lib/editor-rules.ts by `pnpm structured-blocks:sync`. Do not edit directly.
/* eslint-disable -- compiled Frontend source, which is linted where it lives. */
var getquickNomiaFrontendRules = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region src/lib/contact-details-card.ts
	var NAMED_ENTITIES = {
		amp: "&",
		apos: "'",
		gt: ">",
		lt: "<",
		nbsp: " ",
		quot: "\""
	};
	function decodeEntities(value) {
		return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
			if (code[0] === "#") {
				const point = code[1] === "x" || code[1] === "X" ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
				return Number.isFinite(point) && point > 0 && point <= 1114111 ? String.fromCodePoint(point) : entity;
			}
			return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
		});
	}
	/**
	* Splits the card's details into display lines.
	*
	* The editor stores the details as RichText HTML where each line is separated
	* by `<br>`; older or pasted content may use newlines instead. Tags are
	* stripped and entities decoded so Astro escapes the text exactly once.
	*/
	function contactDetailsLines(value) {
		if (typeof value !== "string") return [];
		return value.split(/<br\s*\/?>|\r?\n/i).map((line) => decodeEntities(line.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim()).filter(Boolean);
	}
	var BOLD_TAGS = /* @__PURE__ */ new Set(["b", "strong"]);
	var ITALIC_TAGS = /* @__PURE__ */ new Set(["em", "i"]);
	/**
	* Splits a RichText value into display lines of bold/italic runs.
	*
	* The editor allows only `core/bold` and `core/italic`, but the value is HTML
	* stored in a block attribute, which WordPress does not filter. So nothing is
	* passed through as markup: `<strong>`/`<b>` and `<em>`/`<i>` become flags on
	* plain-text runs, `<br>` and newlines end a line, every other tag is dropped
	* and entities are decoded, leaving Astro to escape the text once and emit the
	* only elements it chooses to.
	*/
	function contactDetailsRichLines(value) {
		if (typeof value !== "string") return [];
		const lines = [];
		let line = [];
		let bold = 0;
		let italic = 0;
		const endLine = () => {
			const last = line.at(-1);
			if (last) last.text = last.text.trimEnd();
			line = line.filter((run) => run.text);
			if (line.length > 0) lines.push(line);
			line = [];
		};
		const pushText = (raw) => {
			const previous = line.at(-1);
			let text = decodeEntities(raw).replace(/\s+/g, " ");
			if (!previous || previous.text.endsWith(" ")) text = text.trimStart();
			if (!text) return;
			const format = {
				bold: bold > 0,
				italic: italic > 0
			};
			if (previous && previous.bold === format.bold && previous.italic === format.italic) previous.text += text;
			else line.push({
				text,
				...format
			});
		};
		for (const part of value.split(/(<[^>]*>|\r?\n)/)) {
			const tag = /^<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>$/i.exec(part);
			if (part === "\n" || part === "\r\n" || tag?.[2].toLowerCase() === "br") endLine();
			else if (tag) {
				const name = tag[2].toLowerCase();
				const step = tag[1] ? -1 : tag[3] ? 0 : 1;
				if (BOLD_TAGS.has(name)) bold = Math.max(0, bold + step);
				if (ITALIC_TAGS.has(name)) italic = Math.max(0, italic + step);
			} else if (!part.startsWith("<")) pushText(part);
		}
		endLine();
		return lines;
	}
	//#endregion
	//#region src/lib/content-collections.ts
	var GLOBAL_TAXONOMIES = [{
		taxonomy: "tematicas",
		param: "tematica",
		label: "Temática"
	}, {
		taxonomy: "setor_atividade",
		param: "setor",
		label: "Setor de atividade"
	}];
	var CONTENT_COLLECTIONS = {
		biblioteca: {
			label: "Biblioteca",
			graphqlType: "Biblioteca",
			taxonomies: [{
				taxonomy: "categoria_biblioteca",
				param: "categoria",
				label: "Categoria"
			}, ...GLOBAL_TAXONOMIES]
		},
		eventos: {
			label: "Eventos",
			graphqlType: "Evento",
			taxonomies: [{
				taxonomy: "tipo_evento",
				param: "tipo",
				label: "Tipo de evento"
			}, ...GLOBAL_TAXONOMIES]
		},
		oportunidades: {
			label: "Oportunidades",
			graphqlType: "Oportunidade",
			taxonomies: [{
				taxonomy: "categoria_oportunidade",
				param: "categoria",
				label: "Categoria"
			}, ...GLOBAL_TAXONOMIES]
		},
		recursos_educativos: {
			label: "Recursos educativos",
			graphqlType: "RecursoEducativo",
			taxonomies: GLOBAL_TAXONOMIES
		},
		glossario: {
			label: "Glossário",
			graphqlType: "Glossario",
			taxonomies: GLOBAL_TAXONOMIES
		},
		indicadores: {
			label: "Indicadores",
			graphqlType: "Indicador",
			taxonomies: GLOBAL_TAXONOMIES
		},
		infografias: {
			label: "Infografias",
			graphqlType: "Infografia",
			taxonomies: GLOBAL_TAXONOMIES
		},
		videos: {
			label: "Vídeos",
			graphqlType: "Video",
			taxonomies: GLOBAL_TAXONOMIES
		},
		podcasts: {
			label: "Podcasts",
			graphqlType: "Podcast",
			taxonomies: GLOBAL_TAXONOMIES
		},
		ferramentas: {
			label: "Ferramentas",
			graphqlType: "Ferramenta",
			taxonomies: GLOBAL_TAXONOMIES
		},
		plataformas: {
			label: "Plataformas",
			graphqlType: "Plataforma",
			taxonomies: GLOBAL_TAXONOMIES
		},
		bases_de_dados: {
			label: "Bases de dados",
			graphqlType: "BaseDeDados",
			taxonomies: GLOBAL_TAXONOMIES
		}
	};
	/**
	* The runtime's `collections` setting (@getquick/content's `CollectionConfig`):
	* which nomia-cpt types gq-content stores, and the taxonomies their items keep
	* (src/lib/content.ts). Every taxonomy must be in WPGraphQL: nomia-cpt shows
	* them all.
	*/
	var RUNTIME_COLLECTIONS = Object.fromEntries(Object.entries(CONTENT_COLLECTIONS).map(([postType, collection]) => [postType, {
		postType,
		graphqlType: collection.graphqlType,
		taxonomies: collection.taxonomies.map(({ taxonomy }) => taxonomy)
	}]));
	var COLLECTION_KEYS = Object.keys(CONTENT_COLLECTIONS);
	/** The Listing's presentations, ported from bioeconomia.pt's archive shells. */
	var LISTING_DISPLAYS = [
		"list",
		"thumbnail-grid",
		"titled-thumbnail-grid"
	];
	var LISTING_PER_PAGE_DEFAULT = 12;
	var LISTING_PER_PAGE_MAX = 48;
	/** The query parameters every Listing reads besides its collection's taxonomies. */
	var LISTING_PARAMS = {
		search: "q",
		page: "pagina"
	};
	function readCollection(value) {
		return typeof value === "string" && value in CONTENT_COLLECTIONS ? value : null;
	}
	function readListingDisplay(value) {
		return LISTING_DISPLAYS.includes(value) ? value : "list";
	}
	function readPerPage(value) {
		const count = typeof value === "number" ? value : Number(value);
		if (!Number.isInteger(count) || count < 1) return 12;
		return Math.min(count, 48);
	}
	/**
	* The query for a visit. A term fixed in the block always applies; the
	* Filters block's parameters narrow it further. A parameter for a taxonomy
	* the editor already fixed is ignored, so a category Page can't be widened.
	*/
	function listingQuery(settings, params) {
		const collection = CONTENT_COLLECTIONS[settings.collection];
		const terms = {};
		const fixed = settings.taxonomy && settings.term ? settings.taxonomy : null;
		if (fixed) terms[fixed] = [settings.term];
		for (const { taxonomy, param } of collection.taxonomies) {
			if (taxonomy === fixed) continue;
			const slugs = params.getAll(param).map((slug) => slug.trim()).filter(Boolean);
			if (slugs.length > 0) terms[taxonomy] = [...new Set(slugs)];
		}
		const search = params.get(LISTING_PARAMS.search)?.trim();
		const page = Number(params.get(LISTING_PARAMS.page));
		return {
			collection: settings.collection,
			terms,
			...search ? { search } : {},
			page: Number.isInteger(page) && page > 1 ? page : 1,
			perPage: settings.perPage
		};
	}
	/** Whether the visitor narrowed the listing, beyond the term the editor fixed. */
	function isFilteredByVisitor(settings, query) {
		const fixed = settings.taxonomy && settings.term ? settings.taxonomy : null;
		return Boolean(query.search) || Object.keys(query.terms).some((taxonomy) => taxonomy !== fixed);
	}
	/** The same address on another page of the listing, keeping its filters. */
	function listingPageHref(url, page) {
		const params = new URLSearchParams(url.search);
		if (page > 1) params.set(LISTING_PARAMS.page, String(page));
		else params.delete(LISTING_PARAMS.page);
		const query = params.toString();
		return query ? `${url.pathname}?${query}` : url.pathname;
	}
	/** The Listing's pagination links for a visit: every page, and the previous and next. */
	function listingPagination(url, page, pages) {
		return {
			pages: Array.from({ length: pages }, (_, index) => ({
				page: index + 1,
				href: listingPageHref(url, index + 1),
				current: index + 1 === page
			})),
			previous: page > 1 ? listingPageHref(url, page - 1) : null,
			next: page < pages ? listingPageHref(url, page + 1) : null
		};
	}
	//#endregion
	//#region src/lib/google-maps.ts
	var GOOGLE_MAPS_HOSTS = /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$/i;
	var GOOGLE_MAPS_SHORT_HOST = /^maps\.app\.goo\.gl$/i;
	function googleMapsEmbedSearchUrl(query) {
		return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
	}
	/**
	* Converts editor-friendly Google Maps links into URLs that Google allows in iframes.
	*/
	function toGoogleMapsEmbedUrl(value, fallbackQuery = "") {
		const rawUrl = value.trim();
		if (!rawUrl) return "";
		let url;
		try {
			url = new URL(rawUrl);
		} catch {
			return "";
		}
		if (!GOOGLE_MAPS_HOSTS.test(url.hostname)) return "";
		if (url.pathname.includes("/maps/embed")) return url.toString();
		const query = url.searchParams.get("query") || url.searchParams.get("q");
		if (query) return googleMapsEmbedSearchUrl(query);
		const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
		if (placeMatch?.[1]) return googleMapsEmbedSearchUrl(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")));
		const dataCoordinates = url.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
		if (dataCoordinates) return googleMapsEmbedSearchUrl(`${dataCoordinates[1]},${dataCoordinates[2]}`);
		const coordinates = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
		if (coordinates) return googleMapsEmbedSearchUrl(`${coordinates[1]},${coordinates[2]}`);
		const fallback = fallbackQuery.trim();
		if (fallback && GOOGLE_MAPS_SHORT_HOST.test(url.hostname)) return googleMapsEmbedSearchUrl(fallback);
		return "";
	}
	//#endregion
	//#region src/lib/nomia-contact-map.ts
	/**
	* Block alignment for `getquick/nomia-contact-map`.
	*
	* `none` keeps the historical centred map; `left` / `right` pin a narrower map
	* to that side without floating it (a float would let the next full-width band
	* slide underneath); `full` bleeds the map to the viewport edges.
	*/
	var NOMIA_CONTACT_MAP_ALIGNMENTS = [
		"none",
		"left",
		"right",
		"full"
	];
	var NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT = "none";
	function readNomiaContactMapAlignment(value) {
		return NOMIA_CONTACT_MAP_ALIGNMENTS.find((alignment) => alignment === value) ?? "none";
	}
	//#endregion
	//#region src/lib/typography-tokens.ts
	/**
	* The design system's `--typography-line-height-*` tokens (`src/styles/nomia-theme.css`),
	* ascending, with their pixel value at a 16px root.
	*
	* Blocks store the slug, never a measurement (ADR 0013): Astro emits
	* `var(--typography-line-height-<slug>)`, and the Gutenberg canvas, which cannot
	* read the site's stylesheet, previews the pixel value.
	*/
	var LINE_HEIGHT_TOKENS = [
		{
			slug: "j",
			px: 16
		},
		{
			slug: "i",
			px: 24
		},
		{
			slug: "h",
			px: 32
		},
		{
			slug: "g",
			px: 40
		},
		{
			slug: "f",
			px: 48
		},
		{
			slug: "e",
			px: 64
		},
		{
			slug: "d",
			px: 80
		},
		{
			slug: "c",
			px: 88
		},
		{
			slug: "b",
			px: 96
		},
		{
			slug: "a",
			px: 112
		}
	];
	var LINE_HEIGHT_SLUGS = LINE_HEIGHT_TOKENS.map((token) => token.slug);
	function isLineHeightToken(value) {
		return typeof value === "string" && LINE_HEIGHT_SLUGS.includes(value);
	}
	function lineHeightTokenPx(slug) {
		return LINE_HEIGHT_TOKENS.find((token) => token.slug === slug)?.px ?? 0;
	}
	//#endregion
	//#region src/lib/page-hero-typography.ts
	/**
	* Per-text typography overrides for `getquick/page-hero-static`.
	*
	* The registration, Gutenberg canvas and Astro renderer all use this module so
	* an editor sees the same bounded values that the public page will render.
	* Overrides are optional: when unset, the hero keeps its design-token styles.
	*/
	var PAGE_HERO_TEXT_FIELDS = ["title", "subtitle"];
	/**
	* `subtitleLineHeight` stores "default" or a line-height token slug. "default"
	* keeps the line height of the subtitle's `text-subtitle` class.
	*/
	var PAGE_HERO_LINE_HEIGHT_DEFAULT = "default";
	var PAGE_HERO_LINE_HEIGHTS = [PAGE_HERO_LINE_HEIGHT_DEFAULT, ...LINE_HEIGHT_SLUGS];
	/** The token `text-subtitle` resolves to, named by the editor's "default" option. */
	var PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN = "g";
	var PAGE_HERO_FONT_SIZE_BOUNDS = {
		min: 8,
		max: 160
	};
	/**
	* Horizontal placement of the hero copy. It is one block-level choice, not a
	* per-text one: the title, the subtitle and the CTA move together so the hero
	* keeps reading as a single stack.
	*/
	var PAGE_HERO_TEXT_ALIGNS = [
		"left",
		"center",
		"right"
	];
	/** Left is where every hero saved before this control existed already sits. */
	var PAGE_HERO_TEXT_ALIGN_DEFAULT = "left";
	var PAGE_HERO_TEXT_ALIGN_ATTRIBUTE = "textAlign";
	function resolvePageHeroTextAlign(value) {
		const candidate = typeof value === "string" ? value.trim().toLowerCase() : "";
		return PAGE_HERO_TEXT_ALIGNS.includes(candidate) ? candidate : PAGE_HERO_TEXT_ALIGN_DEFAULT;
	}
	function readPageHeroTextAlign(attrs) {
		return resolvePageHeroTextAlign((attrs && typeof attrs === "object" && !Array.isArray(attrs) ? attrs : {})[PAGE_HERO_TEXT_ALIGN_ATTRIBUTE]);
	}
	/** The current values resolved by the hero's `text-h2` and `text-subtitle` classes. */
	var PAGE_HERO_TYPOGRAPHY_DEFAULTS = {
		title: {
			fontSize: 56,
			color: "#f0f0f0"
		},
		subtitle: {
			fontSize: 24,
			color: "#f0f0f0"
		}
	};
	var PAGE_HERO_COLOR_PATTERN = /^#[\da-f]{6}$/i;
	function pageHeroTextFontSizeAttribute(field) {
		return `${field}TextFontSize`;
	}
	function pageHeroTextColorAttribute(field) {
		return `${field}TextColor`;
	}
	function pageHeroTextLineHeightAttribute(field) {
		return `${field}LineHeight`;
	}
	/** A token slug, or `undefined` for "default" and anything unrecognised. */
	function normalizePageHeroLineHeight(value) {
		return isLineHeightToken(value) ? value : void 0;
	}
	/** Whole pixels inside the supported range; invalid values keep the design default. */
	function normalizePageHeroFontSize(value) {
		const raw = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
		if (!Number.isFinite(raw)) return void 0;
		const pixels = Math.round(raw);
		if (pixels < PAGE_HERO_FONT_SIZE_BOUNDS.min || pixels > PAGE_HERO_FONT_SIZE_BOUNDS.max) return;
		return pixels;
	}
	/** Only opaque six-digit hex colours are allowed into the inline style. */
	function normalizePageHeroColor(value) {
		const candidate = typeof value === "string" ? value.trim() : "";
		return PAGE_HERO_COLOR_PATTERN.test(candidate) ? candidate.toLowerCase() : void 0;
	}
	function readPageHeroTextTypography(attrs, field) {
		const source = attrs && typeof attrs === "object" && !Array.isArray(attrs) ? attrs : {};
		const fontSize = normalizePageHeroFontSize(source[pageHeroTextFontSizeAttribute(field)]);
		const color = normalizePageHeroColor(source[pageHeroTextColorAttribute(field)]);
		const lineHeight = normalizePageHeroLineHeight(source[pageHeroTextLineHeightAttribute(field)]);
		return {
			...fontSize === void 0 ? {} : { fontSize },
			...color === void 0 ? {} : { color },
			...lineHeight === void 0 ? {} : { lineHeight }
		};
	}
	function readPageHeroTextTypographies(attrs) {
		return {
			title: readPageHeroTextTypography(attrs, "title"),
			subtitle: readPageHeroTextTypography(attrs, "subtitle")
		};
	}
	/** Inline declarations for one text, or `undefined` when it keeps its classes. */
	function pageHeroTextStyle(typography) {
		const fontSize = normalizePageHeroFontSize(typography?.fontSize);
		const color = normalizePageHeroColor(typography?.color);
		const lineHeight = normalizePageHeroLineHeight(typography?.lineHeight);
		const declarations = [];
		if (fontSize !== void 0) declarations.push(`font-size: ${fontSize}px`);
		if (color !== void 0) declarations.push(`color: ${color}`);
		if (lineHeight !== void 0) declarations.push(`line-height: var(--typography-line-height-${lineHeight})`);
		return declarations.length > 0 ? declarations.join("; ") : void 0;
	}
	/** The same safe overrides as a React style object for the Gutenberg canvas. */
	function pageHeroTextStyleProperties(typography) {
		const fontSize = normalizePageHeroFontSize(typography?.fontSize);
		const color = normalizePageHeroColor(typography?.color);
		const lineHeight = normalizePageHeroLineHeight(typography?.lineHeight);
		if (fontSize === void 0 && color === void 0 && lineHeight === void 0) return void 0;
		return {
			...fontSize === void 0 ? {} : { fontSize: `${fontSize}px` },
			...color === void 0 ? {} : { color },
			...lineHeight === void 0 ? {} : { lineHeight: `${lineHeightTokenPx(lineHeight)}px` }
		};
	}
	//#endregion
	//#region src/lib/safe-href.ts
	var SAFE_SCHEMES = /* @__PURE__ */ new Set([
		"http:",
		"https:",
		"mailto:",
		"tel:"
	]);
	var IGNORED_URL_CHARACTERS = /[\u0000- \u007f]/g;
	/**
	* Returns an editor-supplied link when a browser can follow it safely, or ""
	* when it cannot.
	*
	* WordPress runs `esc_url()` over links it renders; Astro renders these blocks
	* instead, so block attributes reach `href` without that filter. Relative paths,
	* `?query` and `#fragment` links pass; absolute URLs pass only for http(s),
	* `mailto:` and `tel:`, which rejects `javascript:`, `data:` and `vbscript:`.
	*/
	function safeHref(value) {
		if (typeof value !== "string") return "";
		const href = value.trim();
		if (!href) return "";
		const scheme = /^([a-z][a-z\d+.-]*):/i.exec(href.replace(IGNORED_URL_CHARACTERS, ""));
		if (!scheme) return href;
		return SAFE_SCHEMES.has(`${scheme[1].toLowerCase()}:`) ? href : "";
	}
	function safeLinkValues(value, keys) {
		if (Array.isArray(value)) return value.map((item) => safeLinkValues(item, keys));
		if (!value || typeof value !== "object") return value;
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, keys.has(key) && typeof item === "string" ? safeHref(item) : safeLinkValues(item, keys)]));
	}
	/**
	* Returns the block with every string under one of `keys`, at any depth of its
	* attributes, passed through `safeHref`, so an unsafe link reaches the renderer
	* as "" — the same as a link nobody filled in. Matching by key name rather than
	* path also covers the legacy arrays a renderer still reads under another name.
	*/
	function withSafeLinks(block, keys) {
		if (!keys?.length || !block.attrs || typeof block.attrs !== "object") return block;
		return {
			...block,
			attrs: safeLinkValues(block.attrs, new Set(keys))
		};
	}
	//#endregion
	//#region src/lib/title-with-label-typography.ts
	/**
	* Per-field typography knowledge for `getquick/title-with-label`.
	*
	* Shared by the surfaces that have to agree on it: the structured block
	* registration (the `typography` attribute schema), the Astro renderer (inline
	* styles), the Gutenberg editor (controls, canvas preview) and the editor's
	* deprecation that migrates the retired per-field pixel attributes.
	*
	* Stored values are design-token slugs, never CSS: ADR 0013 keeps free-form CSS
	* out of post content, so an editor chooses "h4", and Astro owns what "h4" means.
	*/
	var TITLE_WITH_LABEL_FIELDS = [
		"label",
		"titleLine1",
		"titleLine2"
	];
	/**
	* Heading levels the title may take. h1 belongs to the page hero, and nothing
	* below h4 reads as a section title; the editor offers exactly this list.
	*/
	var TITLE_WITH_LABEL_HEADING_LEVELS = [
		2,
		3,
		4
	];
	var TITLE_WITH_LABEL_DEFAULT_HEADING_LEVEL = 2;
	function normalizeTitleWithLabelHeadingLevel(value) {
		const level = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
		return TITLE_WITH_LABEL_HEADING_LEVELS.find((candidate) => candidate === level) ?? 2;
	}
	/**
	* The `--typography-font-size-*` tokens in apps/web/src/styles/global.css, in
	* ascending order, with the pixels each resolves to at the 16px root. The
	* pixels are only for the Gutenberg canvas (which does not load the site
	* stylesheet) and for mapping retired pixel values onto the nearest token.
	*/
	var TITLE_WITH_LABEL_SIZE_TOKENS = [
		{
			slug: "extra",
			px: 12
		},
		{
			slug: "notes",
			px: 14
		},
		{
			slug: "body",
			px: 16
		},
		{
			slug: "body-large",
			px: 20
		},
		{
			slug: "subtitle",
			px: 24
		},
		{
			slug: "h4",
			px: 32
		},
		{
			slug: "h3",
			px: 40
		},
		{
			slug: "h2",
			px: 56
		},
		{
			slug: "h1",
			px: 64
		},
		{
			slug: "large",
			px: 72
		},
		{
			slug: "super",
			px: 88
		}
	];
	/** The `--typography-line-height-*` tokens, ascending. */
	var TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS = LINE_HEIGHT_TOKENS;
	var TITLE_WITH_LABEL_SIZE_SLUGS = TITLE_WITH_LABEL_SIZE_TOKENS.map((token) => token.slug);
	var TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS = TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS.map((token) => token.slug);
	/**
	* Weight a bolded field takes. The title lines already sit at `font-semibold`
	* (600) and the eyebrow at `font-medium` (500), so bolding is a real step up
	* from either rather than a no-op on the headings.
	*/
	var TITLE_WITH_LABEL_BOLD_FONT_WEIGHT = 700;
	/** The tokens each field's classes use when nothing is overridden. */
	var TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS = {
		label: {
			size: "body",
			lineHeight: "i"
		},
		titleLine1: {
			size: "h4",
			lineHeight: "f"
		},
		titleLine2: {
			size: "h4",
			lineHeight: "f"
		}
	};
	/** JSON schema of one field's overrides, as the block contract declares it. */
	var TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA = {
		type: "object",
		properties: {
			size: {
				type: "string",
				enum: TITLE_WITH_LABEL_SIZE_SLUGS
			},
			lineHeight: {
				type: "string",
				enum: TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS
			},
			bold: { type: "boolean" },
			italic: { type: "boolean" }
		},
		additionalProperties: false
	};
	function isPlainObject(value) {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}
	function tokenPx(tokens, slug) {
		return tokens.find((token) => token.slug === slug)?.px;
	}
	function titleWithLabelSizePx(slug) {
		return tokenPx(TITLE_WITH_LABEL_SIZE_TOKENS, slug) ?? 0;
	}
	function titleWithLabelLineHeightPx(slug) {
		return tokenPx(TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS, slug) ?? 0;
	}
	/**
	* The token closest to `px`. A tie resolves to the larger token, so a value
	* half-way between two steps never shrinks the copy it styled.
	*/
	function nearestToken(tokens, px) {
		let best = tokens[0];
		for (const token of tokens) if (Math.abs(token.px - px) <= Math.abs(best.px - px)) best = token;
		return best.slug;
	}
	function legacyPx(value) {
		const raw = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
		return Number.isFinite(raw) && raw > 0 ? raw : void 0;
	}
	function legacyFlag(value) {
		return value === true || value === "true";
	}
	/**
	* The retired schema stored free pixel values per field:
	* `<field>FontSize`, `<field>LineHeight`, `<field>Bold`, `<field>Italic`.
	*/
	var TITLE_WITH_LABEL_LEGACY_ATTRIBUTES = Object.fromEntries(TITLE_WITH_LABEL_FIELDS.flatMap((field) => [
		[`${field}FontSize`, "number"],
		[`${field}LineHeight`, "number"],
		[`${field}Bold`, "boolean"],
		[`${field}Italic`, "boolean"]
	]));
	function hasTitleWithLabelLegacyTypography(attrs) {
		return isPlainObject(attrs) && Object.keys(TITLE_WITH_LABEL_LEGACY_ATTRIBUTES).some((name) => name in attrs);
	}
	/**
	* Map the retired pixel attributes onto tokens: each value moves to the
	* nearest step of the scale. Returns only the fields that carried something.
	*/
	function migrateTitleWithLabelLegacyTypography(attrs) {
		if (!isPlainObject(attrs)) return {};
		const migrated = {};
		for (const field of TITLE_WITH_LABEL_FIELDS) {
			const fontSize = legacyPx(attrs[`${field}FontSize`]);
			const lineHeight = legacyPx(attrs[`${field}LineHeight`]);
			const typography = {
				...fontSize === void 0 ? {} : { size: nearestToken(TITLE_WITH_LABEL_SIZE_TOKENS, fontSize) },
				...lineHeight === void 0 ? {} : { lineHeight: nearestToken(TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS, lineHeight) },
				...legacyFlag(attrs[`${field}Bold`]) ? { bold: true } : {},
				...legacyFlag(attrs[`${field}Italic`]) ? { italic: true } : {}
			};
			if (Object.keys(typography).length > 0) migrated[field] = typography;
		}
		return migrated;
	}
	/** One field's stored overrides, keeping only values the contract allows. */
	function normalizeTitleWithLabelTypography(value) {
		if (!isPlainObject(value)) return {};
		const size = TITLE_WITH_LABEL_SIZE_SLUGS.find((slug) => slug === value.size);
		const lineHeight = TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS.find((slug) => slug === value.lineHeight);
		return {
			...size === void 0 ? {} : { size },
			...lineHeight === void 0 ? {} : { lineHeight },
			...value.bold === true ? { bold: true } : {},
			...value.italic === true ? { italic: true } : {}
		};
	}
	/**
	* Every field's overrides from block attributes. A block that still carries the
	* retired pixel attributes (saved before the token schema and not edited since)
	* is read through the same migration the editor applies, so the published page
	* and the migrated editor always agree.
	*/
	function readTitleWithLabelTypographies(attrs) {
		const source = isPlainObject(attrs) ? attrs : {};
		const stored = isPlainObject(source.typography) ? source.typography : migrateTitleWithLabelLegacyTypography(source);
		return {
			label: normalizeTitleWithLabelTypography(stored.label),
			titleLine1: normalizeTitleWithLabelTypography(stored.titleLine1),
			titleLine2: normalizeTitleWithLabelTypography(stored.titleLine2)
		};
	}
	/**
	* Write one field's overrides into the block's `typography` attribute. Empty
	* fields are dropped and an empty map becomes `undefined`, which removes the
	* attribute from the serialized block instead of storing `{}`.
	*/
	function withTitleWithLabelTypography(current, field, typography) {
		const next = {};
		for (const name of TITLE_WITH_LABEL_FIELDS) {
			const value = normalizeTitleWithLabelTypography(name === field ? typography : isPlainObject(current) ? current[name] : void 0);
			if (Object.keys(value).length > 0) next[name] = value;
		}
		return Object.keys(next).length > 0 ? next : void 0;
	}
	/**
	* Inline declarations for one field, or `undefined` to keep the design tokens.
	* Values are `var()` references to token names from a closed list, so nothing
	* stored can reach CSS as text.
	*/
	function titleWithLabelFieldStyle(typography) {
		const { size, lineHeight, bold, italic } = normalizeTitleWithLabelTypography(typography);
		const declarations = [];
		if (size) declarations.push(`font-size: var(--typography-font-size-${size})`);
		if (lineHeight) declarations.push(`line-height: var(--typography-line-height-${lineHeight})`);
		if (bold) declarations.push(`font-weight: 700`);
		if (italic) declarations.push("font-style: italic");
		return declarations.length > 0 ? declarations.join("; ") : void 0;
	}
	/**
	* The same overrides as a React style object for the Gutenberg canvas, which
	* does not load the site stylesheet and so gets the tokens' resolved pixels.
	* Kept next to `titleWithLabelFieldStyle` so the editor preview and the
	* published page can never drift on which fields are overridden.
	*/
	function titleWithLabelFieldStyleProperties(typography) {
		const { size, lineHeight, bold, italic } = normalizeTitleWithLabelTypography(typography);
		if (!size && !lineHeight && !bold && !italic) return void 0;
		return {
			...size ? { fontSize: `${titleWithLabelSizePx(size)}px` } : {},
			...lineHeight ? { lineHeight: `${titleWithLabelLineHeightPx(lineHeight)}px` } : {},
			...bold ? { fontWeight: 700 } : {},
			...italic ? { fontStyle: "italic" } : {}
		};
	}
	//#endregion
	//#region src/lib/wp-block-preview-format.ts
	var PREVIEW_PATH = "/wp-block-preview";
	var PREVIEW_RESIZE_MESSAGE_TYPE = "getquick-nomia-block-preview:resize";
	var PREVIEW_DEFAULT_HEIGHT = 320;
	var PREVIEW_MIN_HEIGHT = 160;
	var PREVIEW_MAX_HEIGHT = 4e3;
	function getPreviewOrigin(baseUrl) {
		return new URL(baseUrl).origin;
	}
	function getPreviewParentOrigin(referrer) {
		if (!referrer) return "*";
		try {
			return getPreviewOrigin(referrer);
		} catch {
			return "*";
		}
	}
	function isRecord(value) {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}
	function invalidAttributes(source, error) {
		return {
			ok: false,
			source,
			error,
			attributes: {}
		};
	}
	function parseJsonAttributes(raw, source) {
		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return invalidAttributes(source, "invalid-json");
		}
		return isRecord(parsed) ? {
			ok: true,
			source,
			attributes: parsed
		} : invalidAttributes(source, "invalid-object");
	}
	function decodeBase64UrlJson(raw, source) {
		const match = /^([A-Za-z0-9_-]+)(={0,2})$/u.exec(raw);
		const unpadded = match?.[1] ?? "";
		const padding = match?.[2] ?? "";
		const remainder = unpadded.length % 4;
		const requiresPadding = remainder > 0 ? 4 - remainder : 0;
		if (!match || remainder === 1 || padding.length > 0 && padding.length !== requiresPadding) return invalidAttributes(source, "invalid-base64");
		try {
			const padded = unpadded.replace(/-/g, "+").replace(/_/g, "/").padEnd(unpadded.length + requiresPadding, "=");
			const binary = globalThis.atob(padded);
			const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
			return parseJsonAttributes(new TextDecoder("utf-8", { fatal: true }).decode(bytes), source);
		} catch {
			return invalidAttributes(source, "invalid-base64");
		}
	}
	function buildPreviewUrl({ baseUrl, path = PREVIEW_PATH, blockName, attributes, previewToken }) {
		const url = new URL(path, baseUrl);
		url.searchParams.set("block", blockName);
		url.searchParams.set("attrs64", encodeBase64UrlJson(attributes));
		const token = previewToken?.trim();
		if (token) url.searchParams.set("previewToken", token);
		return url.toString();
	}
	function encodeBase64UrlJson(attributes) {
		const bytes = new TextEncoder().encode(JSON.stringify(attributes));
		let binary = "";
		for (const byte of bytes) binary += String.fromCharCode(byte);
		return globalThis.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
	}
	function parsePreviewRequest(searchParams) {
		const blockName = searchParams.get("block")?.trim() || searchParams.get("name")?.trim() || null;
		const previewToken = searchParams.get("previewToken")?.trim() || searchParams.get("token")?.trim() || null;
		const attrs64 = searchParams.get("attrs64");
		const attrs = searchParams.get("attrs");
		return {
			blockName,
			previewToken,
			attributes: attrs64 !== null ? decodeBase64UrlJson(attrs64, "attrs64") : attrs !== null ? parseJsonAttributes(attrs, "attrs") : {
				ok: true,
				source: "none",
				attributes: {}
			}
		};
	}
	function normalizePreviewHeight(value) {
		if (typeof value !== "number" && typeof value !== "string") return null;
		const height = Number(value);
		if (!Number.isFinite(height) || height <= 0) return null;
		return Math.min(PREVIEW_MAX_HEIGHT, Math.max(160, Math.ceil(height)));
	}
	function buildPreviewResizeMessage(value) {
		const height = normalizePreviewHeight(value);
		return height === null ? null : {
			type: PREVIEW_RESIZE_MESSAGE_TYPE,
			height
		};
	}
	function parsePreviewResizeMessage(data) {
		if (!isRecord(data) || data.type !== "getquick-nomia-block-preview:resize") return null;
		return normalizePreviewHeight(data.height);
	}
	function parsePreviewResizeEvent(event, target) {
		if (!target || !event.source || event.origin !== target.expectedOrigin || event.source !== target.source) return null;
		return parsePreviewResizeMessage(event.data);
	}
	function registerPreviewResizeListener(eventTarget, resolveTarget, onResize) {
		const onMessage = (event) => {
			const target = resolveTarget(event);
			const height = parsePreviewResizeEvent(event, target);
			if (target && height !== null) onResize(height, target);
		};
		eventTarget.addEventListener("message", onMessage);
		return () => eventTarget.removeEventListener("message", onMessage);
	}
	//#endregion
	exports.COLLECTION_KEYS = COLLECTION_KEYS;
	exports.CONTENT_COLLECTIONS = CONTENT_COLLECTIONS;
	exports.LINE_HEIGHT_SLUGS = LINE_HEIGHT_SLUGS;
	exports.LINE_HEIGHT_TOKENS = LINE_HEIGHT_TOKENS;
	exports.LISTING_DISPLAYS = LISTING_DISPLAYS;
	exports.LISTING_PARAMS = LISTING_PARAMS;
	exports.LISTING_PER_PAGE_DEFAULT = LISTING_PER_PAGE_DEFAULT;
	exports.LISTING_PER_PAGE_MAX = LISTING_PER_PAGE_MAX;
	exports.NOMIA_CONTACT_MAP_ALIGNMENTS = NOMIA_CONTACT_MAP_ALIGNMENTS;
	exports.NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT = NOMIA_CONTACT_MAP_ALIGNMENT_DEFAULT;
	exports.PAGE_HERO_FONT_SIZE_BOUNDS = PAGE_HERO_FONT_SIZE_BOUNDS;
	exports.PAGE_HERO_LINE_HEIGHTS = PAGE_HERO_LINE_HEIGHTS;
	exports.PAGE_HERO_LINE_HEIGHT_DEFAULT = PAGE_HERO_LINE_HEIGHT_DEFAULT;
	exports.PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN = PAGE_HERO_SUBTITLE_LINE_HEIGHT_TOKEN;
	exports.PAGE_HERO_TEXT_ALIGNS = PAGE_HERO_TEXT_ALIGNS;
	exports.PAGE_HERO_TEXT_ALIGN_ATTRIBUTE = PAGE_HERO_TEXT_ALIGN_ATTRIBUTE;
	exports.PAGE_HERO_TEXT_ALIGN_DEFAULT = PAGE_HERO_TEXT_ALIGN_DEFAULT;
	exports.PAGE_HERO_TEXT_FIELDS = PAGE_HERO_TEXT_FIELDS;
	exports.PAGE_HERO_TYPOGRAPHY_DEFAULTS = PAGE_HERO_TYPOGRAPHY_DEFAULTS;
	exports.PREVIEW_DEFAULT_HEIGHT = PREVIEW_DEFAULT_HEIGHT;
	exports.PREVIEW_MAX_HEIGHT = PREVIEW_MAX_HEIGHT;
	exports.PREVIEW_MIN_HEIGHT = PREVIEW_MIN_HEIGHT;
	exports.PREVIEW_PATH = PREVIEW_PATH;
	exports.PREVIEW_RESIZE_MESSAGE_TYPE = PREVIEW_RESIZE_MESSAGE_TYPE;
	exports.RUNTIME_COLLECTIONS = RUNTIME_COLLECTIONS;
	exports.TITLE_WITH_LABEL_BOLD_FONT_WEIGHT = TITLE_WITH_LABEL_BOLD_FONT_WEIGHT;
	exports.TITLE_WITH_LABEL_DEFAULT_HEADING_LEVEL = TITLE_WITH_LABEL_DEFAULT_HEADING_LEVEL;
	exports.TITLE_WITH_LABEL_FIELDS = TITLE_WITH_LABEL_FIELDS;
	exports.TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA = TITLE_WITH_LABEL_FIELD_TYPOGRAPHY_SCHEMA;
	exports.TITLE_WITH_LABEL_HEADING_LEVELS = TITLE_WITH_LABEL_HEADING_LEVELS;
	exports.TITLE_WITH_LABEL_LEGACY_ATTRIBUTES = TITLE_WITH_LABEL_LEGACY_ATTRIBUTES;
	exports.TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS = TITLE_WITH_LABEL_LINE_HEIGHT_SLUGS;
	exports.TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS = TITLE_WITH_LABEL_LINE_HEIGHT_TOKENS;
	exports.TITLE_WITH_LABEL_SIZE_SLUGS = TITLE_WITH_LABEL_SIZE_SLUGS;
	exports.TITLE_WITH_LABEL_SIZE_TOKENS = TITLE_WITH_LABEL_SIZE_TOKENS;
	exports.TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS = TITLE_WITH_LABEL_TYPOGRAPHY_DEFAULTS;
	exports.buildPreviewResizeMessage = buildPreviewResizeMessage;
	exports.buildPreviewUrl = buildPreviewUrl;
	exports.contactDetailsLines = contactDetailsLines;
	exports.contactDetailsRichLines = contactDetailsRichLines;
	exports.getPreviewOrigin = getPreviewOrigin;
	exports.getPreviewParentOrigin = getPreviewParentOrigin;
	exports.hasTitleWithLabelLegacyTypography = hasTitleWithLabelLegacyTypography;
	exports.isFilteredByVisitor = isFilteredByVisitor;
	exports.isLineHeightToken = isLineHeightToken;
	exports.lineHeightTokenPx = lineHeightTokenPx;
	exports.listingPageHref = listingPageHref;
	exports.listingPagination = listingPagination;
	exports.listingQuery = listingQuery;
	exports.migrateTitleWithLabelLegacyTypography = migrateTitleWithLabelLegacyTypography;
	exports.normalizePageHeroColor = normalizePageHeroColor;
	exports.normalizePageHeroFontSize = normalizePageHeroFontSize;
	exports.normalizePageHeroLineHeight = normalizePageHeroLineHeight;
	exports.normalizePreviewHeight = normalizePreviewHeight;
	exports.normalizeTitleWithLabelHeadingLevel = normalizeTitleWithLabelHeadingLevel;
	exports.normalizeTitleWithLabelTypography = normalizeTitleWithLabelTypography;
	exports.pageHeroTextColorAttribute = pageHeroTextColorAttribute;
	exports.pageHeroTextFontSizeAttribute = pageHeroTextFontSizeAttribute;
	exports.pageHeroTextLineHeightAttribute = pageHeroTextLineHeightAttribute;
	exports.pageHeroTextStyle = pageHeroTextStyle;
	exports.pageHeroTextStyleProperties = pageHeroTextStyleProperties;
	exports.parsePreviewRequest = parsePreviewRequest;
	exports.parsePreviewResizeEvent = parsePreviewResizeEvent;
	exports.parsePreviewResizeMessage = parsePreviewResizeMessage;
	exports.readCollection = readCollection;
	exports.readListingDisplay = readListingDisplay;
	exports.readNomiaContactMapAlignment = readNomiaContactMapAlignment;
	exports.readPageHeroTextAlign = readPageHeroTextAlign;
	exports.readPageHeroTextTypographies = readPageHeroTextTypographies;
	exports.readPageHeroTextTypography = readPageHeroTextTypography;
	exports.readPerPage = readPerPage;
	exports.readTitleWithLabelTypographies = readTitleWithLabelTypographies;
	exports.registerPreviewResizeListener = registerPreviewResizeListener;
	exports.resolvePageHeroTextAlign = resolvePageHeroTextAlign;
	exports.safeHref = safeHref;
	exports.titleWithLabelFieldStyle = titleWithLabelFieldStyle;
	exports.titleWithLabelFieldStyleProperties = titleWithLabelFieldStyleProperties;
	exports.titleWithLabelLineHeightPx = titleWithLabelLineHeightPx;
	exports.titleWithLabelSizePx = titleWithLabelSizePx;
	exports.toGoogleMapsEmbedUrl = toGoogleMapsEmbedUrl;
	exports.withSafeLinks = withSafeLinks;
	exports.withTitleWithLabelTypography = withTitleWithLabelTypography;
	return exports;
})({});
