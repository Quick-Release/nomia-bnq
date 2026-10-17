export type CptArchiveGraphqlField =
  | "infografias"
  | "videos"
  | "podcasts"
  | "galerias"
  | "plataformas"
  | "basesDeDados"
  | "bibliotecas"
  | "oportunidades"
  | "recursosEducativos"
  | "glossarios"
  | "indicadores";

export type CptArchiveId =
  | "infografias"
  | "videos"
  | "podcasts"
  | "galeria"
  | "plataformas"
  | "basesDeDados"
  | "biblioteca"
  | "oportunidades"
  | "recursosEducativos"
  | "glossario"
  | "indicadores";

export type CptArchivePageLocator =
  | { kind: "uri"; value: string }
  | { kind: "databaseId"; value: number | string };

export type CptArchivePageBlocksPlacement = "beforeMain" | "intro" | "heroBeforeMain";

export type CptArchivePresentation =
  | {
      kind: "cpt-shell";
      display: "list" | "thumbnail-grid";
      showEyebrow: boolean;
    }
  | {
      kind: "multimedia";
      /**
       * `thumbnail-grid`: three columns, title over the image.
       * `titled-thumbnail-grid`: two larger columns, title above the image.
       */
      display: "list" | "thumbnail-grid" | "titled-thumbnail-grid";
      heading: "fallback" | "never";
      /** The listing's band: the dark ciano default, or the page background. */
      surface?: "ciano" | "light";
    }
  | {
      kind: "custom";
      key: "podcasts" | "galeria" | "plataformas";
    };

export type CptArchiveSource =
  | {
      kind: "wp-cpt-connection";
      graphqlField: CptArchiveGraphqlField;
      includeFeaturedImage?: boolean;
    }
  | {
      kind: "custom";
      key: "podcasts" | "galeria" | "plataformas";
      graphqlField: CptArchiveGraphqlField;
    };

export type CptSingleRouteOptions = {
  showPublishedDate: boolean;
  contentWide?: boolean;
  enableImageLightbox?: boolean;
  enablePdfButtons?: boolean;
};

export type CptArchiveRouteDefinition = {
  path: string;
  canonical?: boolean;
  page?: CptArchivePageLocator;
  presentation: CptArchivePresentation;
  pageBlocksPlacement?: CptArchivePageBlocksPlacement;
};

export type CptArchiveDefinition = {
  id: CptArchiveId;
  title: string;
  source: CptArchiveSource;
  entryFolder: string;
  routes: readonly CptArchiveRouteDefinition[];
  single: CptSingleRouteOptions;
};

const cptShellList = (showEyebrow = true): CptArchivePresentation => ({
  kind: "cpt-shell",
  display: "list",
  showEyebrow,
});

const cptShellThumbnails = (showEyebrow = true): CptArchivePresentation => ({
  kind: "cpt-shell",
  display: "thumbnail-grid",
  showEyebrow,
});

const customSource = (
  key: "podcasts" | "galeria" | "plataformas",
  graphqlField: CptArchiveGraphqlField,
): CptArchiveSource => ({ kind: "custom", key, graphqlField });

/** Canonical identity and public route registry for WordPress archives. */
export const CPT_ARCHIVE_DEFINITIONS = [
  {
    id: "infografias",
    title: "Infografias",
    source: {
      kind: "wp-cpt-connection",
      graphqlField: "infografias",
      includeFeaturedImage: true,
    },
    entryFolder: "infografias",
    routes: [
      {
        path: "/infografias/",
        canonical: true,
        page: { kind: "uri", value: "/infografias/" },
        presentation: cptShellThumbnails(),
        pageBlocksPlacement: "beforeMain",
      },
      {
        path: "/multimedia/infografias/",
        page: { kind: "uri", value: "/multimedia/infografias/" },
        presentation: { kind: "multimedia", display: "thumbnail-grid", heading: "fallback" },
      },
    ],
    single: {
      showPublishedDate: true,
      enableImageLightbox: true,
      enablePdfButtons: true,
    },
  },
  {
    id: "videos",
    title: "Vídeos",
    source: { kind: "wp-cpt-connection", graphqlField: "videos", includeFeaturedImage: true },
    entryFolder: "videos",
    routes: [
      {
        path: "/multimedia/videos/",
        canonical: true,
        page: { kind: "uri", value: "/multimedia/videos/" },
        presentation: {
          kind: "multimedia",
          display: "titled-thumbnail-grid",
          heading: "never",
          surface: "light",
        },
      },
    ],
    single: { showPublishedDate: false, contentWide: true },
  },
  {
    id: "podcasts",
    title: "Podcasts",
    source: customSource("podcasts", "podcasts"),
    entryFolder: "podcasts",
    routes: [
      {
        path: "/podcasts/",
        canonical: true,
        page: { kind: "uri", value: "/podcasts/" },
        presentation: { kind: "custom", key: "podcasts" },
      },
      {
        path: "/multimedia/podcasts/",
        page: { kind: "uri", value: "/multimedia/podcasts/" },
        presentation: { kind: "custom", key: "podcasts" },
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "galeria",
    title: "Galeria",
    source: customSource("galeria", "galerias"),
    entryFolder: "galeria",
    routes: [
      {
        path: "/galeria/",
        canonical: true,
        presentation: { kind: "custom", key: "galeria" },
      },
      {
        path: "/multimedia/galeria/",
        presentation: { kind: "custom", key: "galeria" },
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "plataformas",
    title: "Plataformas",
    source: customSource("plataformas", "plataformas"),
    entryFolder: "plataformas",
    routes: [
      {
        path: "/ferramentas/plataformas",
        canonical: true,
        page: { kind: "databaseId", value: 800 },
        presentation: { kind: "custom", key: "plataformas" },
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "basesDeDados",
    title: "Bases de Dados",
    source: { kind: "wp-cpt-connection", graphqlField: "basesDeDados" },
    entryFolder: "bases-de-dados",
    routes: [
      {
        path: "/ferramentas/bases-de-dados",
        canonical: true,
        page: { kind: "databaseId", value: 802 },
        presentation: cptShellList(),
        pageBlocksPlacement: "heroBeforeMain",
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "biblioteca",
    title: "Biblioteca",
    source: { kind: "wp-cpt-connection", graphqlField: "bibliotecas" },
    entryFolder: "biblioteca",
    routes: [
      {
        path: "/biblioteca/",
        canonical: true,
        page: { kind: "uri", value: "/biblioteca/" },
        presentation: cptShellList(),
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "oportunidades",
    title: "Oportunidades",
    source: { kind: "wp-cpt-connection", graphqlField: "oportunidades" },
    entryFolder: "oportunidades",
    routes: [
      {
        path: "/oportunidades/",
        canonical: true,
        page: { kind: "uri", value: "/oportunidades/" },
        presentation: cptShellList(),
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "recursosEducativos",
    title: "Recursos Educativos",
    source: {
      kind: "wp-cpt-connection",
      graphqlField: "recursosEducativos",
      includeFeaturedImage: true,
    },
    entryFolder: "recursos-educativos",
    routes: [
      {
        path: "/recursos-educativos/",
        canonical: true,
        page: { kind: "databaseId", value: 918 },
        presentation: cptShellThumbnails(false),
        pageBlocksPlacement: "heroBeforeMain",
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "glossario",
    title: "Glossário",
    source: { kind: "wp-cpt-connection", graphqlField: "glossarios" },
    entryFolder: "glossario",
    routes: [
      {
        path: "/glossario/",
        canonical: true,
        page: { kind: "databaseId", value: 1199 },
        presentation: cptShellList(),
        pageBlocksPlacement: "heroBeforeMain",
      },
    ],
    single: { showPublishedDate: true },
  },
  {
    id: "indicadores",
    title: "Indicadores",
    source: { kind: "wp-cpt-connection", graphqlField: "indicadores" },
    entryFolder: "indicadores",
    routes: [
      {
        path: "/indicadores/",
        canonical: true,
        page: { kind: "uri", value: "/indicadores/" },
        presentation: cptShellList(),
      },
    ],
    single: { showPublishedDate: true },
  },
] as const satisfies readonly CptArchiveDefinition[];

function normalizePublicPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

export function getCptArchiveDefinition(id: CptArchiveId): CptArchiveDefinition {
  const definition = CPT_ARCHIVE_DEFINITIONS.find((item) => item.id === id);
  if (!definition) throw new Error(`Unknown CPT archive identity: ${id}`);
  return definition;
}

export function getCptArchiveRoute(path: string): {
  definition: CptArchiveDefinition;
  route: CptArchiveRouteDefinition;
} | null {
  const normalized = normalizePublicPath(path);
  for (const definition of CPT_ARCHIVE_DEFINITIONS) {
    const route = definition.routes.find(
      (candidate) => normalizePublicPath(candidate.path) === normalized,
    );
    if (route) return { definition, route };
  }
  return null;
}

export function getCanonicalArchivePath(id: CptArchiveId): string {
  const definition = getCptArchiveDefinition(id);
  return definition.routes.find((route) => route.canonical)?.path ?? definition.routes[0]!.path;
}

export function getCanonicalEntryPath(id: CptArchiveId, slug: string): string {
  const definition = getCptArchiveDefinition(id);
  const folder = definition.entryFolder.replace(/^\/+|\/+$/g, "");
  return `/${folder}/${encodeURIComponent(slug.trim())}/`;
}

export function getCptArchiveByEntryFolder(folder: string): CptArchiveDefinition | null {
  return CPT_ARCHIVE_DEFINITIONS.find((definition) => definition.entryFolder === folder) ?? null;
}
