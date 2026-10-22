// A stubbed WordPress for the rendered-route tests, answering each GraphQL
// query by name.
import { vi } from "vite-plus/test";
import { RUNTIME_COLLECTIONS } from "../lib/content-collections";

export type Answer = { ok: false; status: number } | { ok: true; json: () => Promise<unknown> };
export type Handler = (variables: Record<string, unknown>) => Answer | Promise<Answer>;

export const tokens = { colors: [], spacingSizes: [] };

export const chrome = {
  generalSettings: {
    siteIcon: null,
    siteLogo: { node: { sourceUrl: "https://media.example/logo.svg", altText: "Acme" } },
  },
  menuItems: {
    nodes: [{ id: "a", parentId: null, label: "About us", url: "/about/", target: null }],
  },
};

/**
 * GETQUICK → Archives and the types WPGraphQL shows, which the runtime reads
 * once it stores collections (gq-content#38): no archive Pages assigned, and
 * every collection's post type and taxonomies shown, as nomia-cpt does.
 */
export function archives(assigned: Array<{ postType: string; uri: string | null }> = []): Answer {
  const collections = Object.values(RUNTIME_COLLECTIONS);
  const name = (value: string) => ({ name: value });
  return data({
    getquickArchives: assigned,
    contentTypes: { nodes: ["page", "post", ...collections.map((c) => c.postType)].map(name) },
    taxonomies: { nodes: [...new Set(collections.flatMap((c) => c.taxonomies))].map(name) },
  });
}

/** WordPress's list of published routes, on one page. */
export function routes(...uris: string[]): Answer {
  return data({
    contentNodes: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: uris.map((uri) => ({ uri })),
    },
  });
}

/** A published entry as WordPress lists it: its URI, and its id and modification time when given. */
export interface ListedNode {
  uri: string;
  id?: string | null;
  modifiedGmt?: string | null;
}

/** WordPress's list of published entries with their ids and modification times, on one page. */
export function listing(...nodes: ListedNode[]): Answer {
  return data({ contentNodes: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } });
}

/** A time as WPGraphQL gives modifiedGmt: GMT, to the second, without a zone. */
export function gmt(ms: number) {
  return new Date(ms).toISOString().slice(0, 19);
}

export function data(value: unknown): Answer {
  return { ok: true, json: async () => ({ data: value }) };
}

export function httpError(status: number): Answer {
  return { ok: false, status };
}

export function timeout(): never {
  throw new DOMException("The operation timed out.", "TimeoutError");
}

// The site chrome and the design presets are fine, and nothing but the front
// page is published, unless a test says otherwise; any other query fails the
// test.
export function stubWordPress(handlers: {
  home?: Handler;
  entry?: Handler;
  chrome?: Handler;
  design?: Handler;
  routes?: Handler;
  consentSettings?: Handler;
  archives?: Handler;
}) {
  const answer = {
    chrome: () => data(chrome),
    // gq-config's consent settings: no Legal Contract assigned, GA4 off.
    consentSettings: () => data({ getquickLegal: null, googleAnalytics: null }),
    design: () => data({ designTokens: tokens }),
    routes: () => routes("/"),
    archives: () => archives(),
    ...handlers,
  };
  const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
    const request = JSON.parse(init.body as string) as {
      query: string;
      variables?: Record<string, unknown>;
    };
    const name = /query (\w+)/.exec(request.query)?.[1];
    const handler = {
      HomePage: answer.home,
      EntryByUri: answer.entry,
      SiteChrome: answer.chrome,
      ConsentSettings: answer.consentSettings,
      DesignPresets: answer.design,
      PublishedRoutes: answer.routes,
      ContentArchives: answer.archives,
    }[name ?? ""];
    if (!handler) throw new Error(`Unexpected query ${name}`);
    const answered = await handler(request.variables ?? {});
    if (!answered.ok || !/node: nodeByUri/.test(request.query)) return answered;
    return { ok: true, json: async () => asNode(await answered.json()) } satisfies Answer;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/**
 * A runtime with collections asks for any entry as the node at its URI,
 * `node: nodeByUri` (gq-content#38). The fixtures answer the runtime without
 * collections (`nodeByUri`, or `pageBy` / `postBy`): the same answer, as it.
 */
function asNode(body: unknown) {
  const { data } = body as { data?: Record<string, unknown> };
  if (!data) return body;
  const { nodeByUri, pageBy, postBy, ...rest } = data;
  const node =
    nodeByUri !== undefined
      ? nodeByUri
      : pageBy
        ? { __typename: "Page", ...(pageBy as object) }
        : postBy
          ? { __typename: "Post", ...(postBy as object) }
          : null;
  return { ...(body as object), data: { ...rest, node } };
}

export function queries(fetchMock: ReturnType<typeof stubWordPress>, name: string) {
  return fetchMock.mock.calls.filter(([, init]) => (init.body as string).includes(`query ${name}`));
}
