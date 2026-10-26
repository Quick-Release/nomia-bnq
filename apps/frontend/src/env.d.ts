/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WORDPRESS_GRAPHQL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// workerd's module for the Worker's bindings; src/lib/content.ts types them.
declare module "cloudflare:workers" {
  export const env: Record<string, unknown>;
}

declare namespace App {
  interface Locals {
    /** The page's Gravity Forms context, for GravityFormBlock.astro (gq-platform ADR 0009). */
    forms?: {
      forms?: import("@getquick/content/forms/astro").FormDescriptor[];
      language: string;
      legal?: import("@getquick/content/forms/astro").FormsLegal | null;
    };
  }
}
