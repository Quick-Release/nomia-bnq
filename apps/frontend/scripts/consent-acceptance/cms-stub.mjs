// The acceptance run's CMS: WordPress's public GraphQL as the Frontend reads
// it (by query name), with Nomia-shaped content that exercises every surface
// docs/adr/0001 gates: a YouTube `core/embed` in WordPress HTML, the GETQUICK
// Design video hero, the contact map and the map-list explorer (Nomia
// blocks), the privacy policy, and gq-config 0.4.3's Legal Contract and GA4
// settings. Media are on the Site's media domain, as Nomia's are.
import { createServer } from "node:http";

const MEDIA = "https://nomia-media.bnq.pt/app/uploads/2026/05";
const MODIFIED = "2026-10-01T09:00:00";

/** A block as PHP's parse_blocks() gives it. */
const parsed = (blockName, attrs = {}, innerHTML = "") => ({
  blockName,
  attrs,
  innerBlocks: [],
  innerHTML,
  innerContent: [innerHTML],
});

// What WordPress renders for a YouTube URL in a core/embed block (oEmbed).
const youtubeEmbed =
  '<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">' +
  '<iframe title="Economia circular em 2 minutos" width="500" height="281" src="https://www.youtube.com/embed/QvtfswLaWlg?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
  "</div></figure>";

const mapList = parsed("getquick/map-list", {
  regions: [{ id: "lisboa", label: "Lisboa" }],
  audiences: [{ id: "empresas", label: "Empresas" }],
  items: [
    {
      id: "iniciativa-1",
      title: "Iniciativa de economia circular",
      excerpt: "Uma iniciativa em Lisboa.",
      href: "/multimedia/",
      dateLabel: "2026",
      imageUrl: `${MEDIA}/iniciativa.jpg`,
      imageAlt: "Iniciativa",
      regionId: "lisboa",
      audienceIds: ["empresas"],
    },
  ],
});

/** The published entries, by route. */
export const ENTRIES = {
  "/multimedia/": {
    id: "page-20",
    title: "Multimédia",
    content: `<p>Vídeos da Nomia.</p>${youtubeEmbed}<figure class="wp-block-image"><img src="${MEDIA}/foto.jpg" alt=""></figure>`,
  },
  "/bioeconomia/": {
    id: "page-21",
    title: "Bioeconomia",
    content: "",
    blocks: JSON.stringify([
      {
        name: "getquick-design/video-hero",
        attributes: {
          videoType: "youtube",
          videoUrl: "https://youtu.be/QvtfswLaWlg",
          posterUrl: `${MEDIA}/poster.jpg`,
        },
        htmlContent: '<section class="wp-block-getquick-design-video-hero"></section>',
        innerBlocks: [
          {
            name: "core/heading",
            attributes: {},
            htmlContent: "<h1>Bioeconomia sustentável</h1>",
            innerBlocks: [],
          },
        ],
      },
    ]),
  },
  "/contactos/": {
    id: "page-22",
    title: "Contactos",
    content: "<!-- getquick/nomia-contact-map rendered by Astro -->",
    wpBlocksJson: JSON.stringify([
      parsed("getquick/title-with-label", { label: "Contactos", titleLine1: "Fale connosco" }),
      parsed("getquick/nomia-contact-map", {
        title: "Nomia, Amadora",
        mapUrl: "https://maps.app.goo.gl/abc123",
      }),
    ]),
  },
  "/mapa/": {
    id: "page-23",
    title: "Mapa",
    content: "<!-- getquick/map-list rendered by Astro -->",
    wpBlocksJson: JSON.stringify([mapList]),
  },
  "/politica-de-privacidade/": {
    id: "page-90",
    title: "Política de Privacidade",
    content: "<p>Texto legal da Política de Privacidade.</p>",
  },
};

const home = {
  id: "page-2",
  title: "Início",
  content: `<h1>Nomia</h1>${youtubeEmbed}`,
};

const legal = (origin) => ({
  schemaVersion: 1,
  language: "pt",
  controller: { name: "BNQ", privacyEmail: "privacidade@bnq.pt", dpoContact: null },
  // The one published page is both roles until a cookie policy is written (ADR 0001).
  roles: ["privacy_policy", "cookie_policy"].map((role) => ({
    role,
    url: `${origin}/politica-de-privacidade/`,
    title: "Política de Privacidade",
    revision: "2026-05-14T09:14:55Z",
    isFallback: false,
  })),
  missingRequired: [],
});

const tokens = { colors: [{ slug: "ciano-500", color: "#209e97" }], spacingSizes: [] };

function answer(name, variables, origin) {
  switch (name) {
    case "HomePage":
      return {
        generalSettings: { title: "Nomia", description: "Economia circular e bioeconomia" },
        nodeByUri: { __typename: "Page", isFrontPage: true, ...home },
        designTokens: tokens,
      };
    case "EntryByUri": {
      const entry = ENTRIES[decodeURI(String(variables.uri))];
      return {
        postBy: null,
        pageBy: entry
          ? {
              ...entry,
              uri: String(variables.uri),
              status: "publish",
              isRestricted: false,
              modifiedGmt: MODIFIED,
              featuredImage: null,
            }
          : null,
        designTokens: tokens,
      };
    }
    case "SiteChrome":
      return {
        generalSettings: {
          siteIcon: null,
          siteLogo: { node: { sourceUrl: `${MEDIA}/logo.svg`, altText: "Nomia" } },
        },
        menuItems: {
          nodes: Object.entries(ENTRIES).map(([uri, entry]) => ({
            id: entry.id,
            parentId: null,
            label: entry.title,
            url: uri,
            target: null,
          })),
        },
      };
    case "ConsentSettings":
      return {
        getquickLegal: legal(origin),
        googleAnalytics: { enabled: false, measurementId: null },
      };
    case "DesignPresets":
      return { designTokens: tokens };
    case "PublishedRoutes":
      return {
        contentNodes: {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [
            { uri: "/", id: home.id, modifiedGmt: MODIFIED },
            ...Object.entries(ENTRIES).map(([uri, entry]) => ({
              uri,
              id: entry.id,
              modifiedGmt: MODIFIED,
            })),
          ],
        },
      };
    default:
      return null;
  }
}

/** Starts the stub on a free port; `origin` is the Frontend's, for the Legal Contract's URLs. */
export async function startCms(origin) {
  const queries = [];
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const { query, variables = {} } = JSON.parse(body || "{}");
      const name = /query (\w+)/.exec(query ?? "")?.[1];
      queries.push(name);
      const data = answer(name, variables, origin);
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(data ? { data } : { errors: [{ message: `Unexpected query ${name}` }] }),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    endpoint: `http://127.0.0.1:${port}/wp/graphql`,
    queries,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
