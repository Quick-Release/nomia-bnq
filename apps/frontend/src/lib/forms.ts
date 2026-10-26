// Nomia's adoption of headless Gravity Forms (gq-platform ADR 0009). The
// content runtime delivers each page's form descriptors (src/lib/content.ts
// `forms`), the managed route src/pages/gq/forms/[...rest].ts receives the
// posts, and @getquick/content renders the form. This file only gathers what
// a page's `gravityforms/form` blocks need, once per page: the page's
// descriptors, its path and language, its Legal Contract and the outcome of a
// post the visitor was just sent back from.
import {
  blockFormId,
  clearFormStateCookie,
  findForm,
  readFormState,
  renderGravityForm,
  type FormDescriptor,
  type FormState,
} from "@getquick/content/forms/astro";
import { content } from "./content";

type Legal = Parameters<typeof renderGravityForm>[0]["legal"];

/** A page's forms, as its `gravityforms/form` blocks render them. */
export interface PageForms {
  descriptors: readonly FormDescriptor[];
  /** The page's path: the handler sends the visitor back to it. */
  source: string;
  /** The page's BCP 47 language. */
  language: string;
  /** The page language's Legal Contract (LEGAL-1): the consent links to its privacy policy. */
  legal: Legal;
  /** Each form's outcome on the redirect back after a post to it. */
  states: ReadonlyMap<number, FormState>;
}

/**
 * The page's forms, and the Set-Cookie headers that clear the outcomes it
 * shows. The page's own frontmatter appends them: a nested component renders
 * after the response's headers are sent.
 */
export function pageForms(input: {
  descriptors: readonly FormDescriptor[] | null | undefined;
  url: URL;
  cookie: string | null;
  language: string;
  legal: Legal;
}): { forms: PageForms; setCookies: string[] } {
  const descriptors = input.descriptors ?? [];
  const states = new Map<number, FormState>();
  const setCookies: string[] = [];
  for (const { id } of descriptors) {
    const state = readFormState({ url: input.url, cookie: input.cookie }, id);
    if (!state) continue;
    states.set(id, state);
    setCookies.push(clearFormStateCookie(id, { secure: input.url.protocol === "https:" }));
  }
  return {
    forms: {
      descriptors,
      source: input.url.pathname,
      language: input.language,
      legal: input.legal,
      states,
    },
    setCookies,
  };
}

/**
 * A `gravityforms/form` block's HTML: a plain form that posts to the Site
 * and works without JavaScript. Without the page's forms or the form's
 * descriptor, the renderer's status message instead.
 */
export function gravityFormHtml(
  attributes: Record<string, unknown> | null | undefined,
  forms: PageForms | null | undefined,
): string {
  const formId = blockFormId(attributes);
  const descriptor = formId === null ? null : findForm(forms?.descriptors, formId);
  return renderGravityForm({
    descriptor,
    source: forms?.source ?? "/",
    language: forms?.language ?? content().defaultLanguage.lang,
    legal: forms?.legal ?? null,
    state: descriptor ? (forms?.states.get(descriptor.id) ?? null) : null,
    showTitle: attributes?.title !== false,
    showDescription: attributes?.description !== false,
  });
}
