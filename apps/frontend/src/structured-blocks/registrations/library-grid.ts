import {
  arrayAttribute,
  defineStructuredBlock,
  numberAttribute,
  stringAttribute,
} from "../define.ts";

export const LIBRARY_GRID_CARD_FIELDS = {
  title: stringAttribute(),
  tag: stringAttribute(),
  imageId: numberAttribute(),
  imageSrc: stringAttribute("", {
    legacyReads: ["imageUrl"],
    ui: { kind: "media" },
  }),
  imageAlt: stringAttribute(),
  href: stringAttribute("", { ui: { kind: "url" } }),
  tagKind: stringAttribute("economia", { enum: ["bioeconomia", "economia"] }),
};

export const LIBRARY_GRID_CARD_REQUIRED_FIELDS = ["title", "tag", "imageSrc", "href"] as const;

export type LibraryGridCard = {
  title: string;
  tag: string;
  imageSrc: string;
  href: string;
  tagKind: "bioeconomia" | "economia";
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function textOr(...values: unknown[]): string {
  for (const value of values) {
    const next = text(value);
    if (next) return next;
  }
  return "";
}

export function normalizeLibraryGridCard(raw: unknown): LibraryGridCard | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const item = raw as Record<string, unknown>;
  const title = text(item.title);
  const tag = text(item.tag);
  const imageSrc = textOr(item.imageSrc, item.imageUrl);
  const href = text(item.href);
  if (!title || !tag || !imageSrc || !href) return null;
  return {
    title,
    tag,
    imageSrc,
    href,
    tagKind: item.tagKind === "bioeconomia" ? "bioeconomia" : "economia",
  };
}

export function readLibraryGridCards(attrs: object): LibraryGridCard[] {
  const source = attrs as Record<string, unknown>;
  const rows = Array.isArray(source.cards)
    ? source.cards
    : Array.isArray(source.items)
      ? source.items
      : [];
  return rows
    .map(normalizeLibraryGridCard)
    .filter((card): card is LibraryGridCard => card !== null);
}

export default defineStructuredBlock({
  identity: {
    blockName: "getquick/library-grid",
    catalogId: "library-grid",
    schemaVersion: 1,
    order: 25,
  },
  lifecycle: {
    status: "active",
    inserter: true,
  },
  attributes: {
    schemaVersion: numberAttribute(1),
    blockId: stringAttribute("library-grid"),
    eyebrow: stringAttribute(),
    heading: stringAttribute(),
    body: stringAttribute(),
    ctaHref: stringAttribute("", { ui: { kind: "url" } }),
    ctaLabel: stringAttribute(),
    cards: arrayAttribute(LIBRARY_GRID_CARD_FIELDS, {
      required: LIBRARY_GRID_CARD_REQUIRED_FIELDS,
    }),
  },
  compatibility: {
    legacyReads: {
      ctaUrl: "string",
      items: "array",
    },
    legacyLinks: ["ctaUrl"],
  },
  renderer: {
    module: "BibliotecaBlock.astro",
    preview: {
      label: "Biblioteca",
      attributes: {
        eyebrow: "Biblioteca",
        heading: "Conteúdos para compreender a economia circular",
        body: "Consulte documentos, publicações e recursos de apoio.",
        ctaHref: "/biblioteca/",
        ctaLabel: "Ver biblioteca",
        cards: [
          {
            title: "Legislação",
            tag: "Economia",
            imageSrc: "/images/biblioteca/legislacao.jpg",
            imageAlt: "Documentos de legislação",
            href: "/biblioteca/legislacao/",
            tagKind: "economia",
          },
          {
            title: "Publicações",
            tag: "Bioeconomia",
            imageSrc: "/images/biblioteca/publicacoes.jpg",
            imageAlt: "Publicações",
            href: "/biblioteca/publicacoes/",
            tagKind: "bioeconomia",
          },
          {
            title: "Boas práticas",
            tag: "Economia",
            imageSrc: "/images/biblioteca/boas-praticas.jpg",
            imageAlt: "Boas práticas",
            href: "/biblioteca/boas-praticas/",
            tagKind: "economia",
          },
        ],
      },
    },
  },
  editor: {
    title: "Grelha da biblioteca",
    description:
      "Grelha de ligações para a biblioteca com cabeçalho, texto, botão e cartões com imagem e etiqueta.",
    icon: "book",
    experience: "inline-fields",
  },
  documentation: {
    path: "sections/landing/biblioteca.md",
  },
});
