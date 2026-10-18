import assert from "node:assert/strict";
import test from "node:test";

import { pageHeroLegacyAttributePatch } from "../../cms/web/app/plugins/nomia-blocks/src/lib/page-hero-legacy-attributes.mjs";

test("a hero with no legacy keys is left alone", () => {
  assert.deepEqual(
    pageHeroLegacyAttributePatch({ title: "Bioeconomia", ctaHref: "/sobre/", showCta: true }),
    {},
  );
  assert.deepEqual(pageHeroLegacyAttributePatch(), {});
});

test("legacy keys move to their canonical names and are dropped", () => {
  const patch = pageHeroLegacyAttributePatch({
    imageUrl: "/images/hero.jpg",
    ctaUrl: "/bioeconomia-sustentavel/",
    hideCta: true,
  });

  assert.deepEqual(patch, {
    imageSrc: "/images/hero.jpg",
    imageUrl: undefined,
    ctaHref: "/bioeconomia-sustentavel/",
    ctaUrl: undefined,
    showCta: false,
    hideCta: undefined,
  });
});

test("a canonical value already stored is never overwritten", () => {
  const patch = pageHeroLegacyAttributePatch({
    imageSrc: "/images/current.jpg",
    imageUrl: "/images/old.jpg",
    ctaHref: "/atual/",
    ctaUrl: "/antigo/",
  });

  assert.deepEqual(patch, {
    imageUrl: undefined,
    ctaUrl: undefined,
  });
});

test("hideCta: false clears the key without forcing the CTA on", () => {
  // `showCta` defaults to false, so writing `showCta: false` here would be a
  // no-op; writing `true` would turn on a CTA the editor never asked for.
  assert.deepEqual(pageHeroLegacyAttributePatch({ hideCta: false }), { hideCta: undefined });
});

test("the cta object is flattened into label and href", () => {
  assert.deepEqual(
    pageHeroLegacyAttributePatch({ cta: { label: "Saber Mais", href: "/sobre/" } }),
    {
      ctaLabel: "Saber Mais",
      ctaHref: "/sobre/",
      cta: undefined,
    },
  );

  // The object's own legacy `url` spelling is read too.
  assert.deepEqual(pageHeroLegacyAttributePatch({ cta: { label: "Ver", url: "/ver/" } }), {
    ctaLabel: "Ver",
    ctaHref: "/ver/",
    cta: undefined,
  });
});

test("a flat ctaUrl wins over the cta object's href", () => {
  const patch = pageHeroLegacyAttributePatch({
    ctaUrl: "/plano/",
    cta: { label: "Saber Mais", href: "/objeto/" },
  });

  assert.equal(patch.ctaHref, "/plano/");
  assert.equal(patch.ctaLabel, "Saber Mais");
  assert.equal(patch.cta, undefined);
  assert.equal(patch.ctaUrl, undefined);
});
