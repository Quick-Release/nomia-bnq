// The Site's own media: a block's video plays only from the Site's hosts
// (CONSENT-1 CN-R3), as no catalog service covers a video file elsewhere.
import { expect, test } from "vite-plus/test";
import { firstPartyMedia } from "./consent";

test("relative URLs and the Site's media and CMS hosts are first party", () => {
  for (const url of [
    "/videos/hero.mp4",
    "https://nomia-media.bnq.pt/app/uploads/2026/05/hero.mp4",
    "https://nomia-cms.bnq.pt/app/uploads/hero.mp4",
  ]) {
    expect(firstPartyMedia(url), url).toBe(url);
  }
});

test("any other host, or anything not a plain URL, is left out", () => {
  for (const url of [
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "//nomia-media.bnq.pt.evil.example/x.mp4",
    "https://nomia-media.bnq.pt.evil.example/x.mp4",
    "javascript:alert(1)",
    "data:video/mp4;base64,AAAA",
    "",
  ]) {
    expect(firstPartyMedia(url), url).toBeUndefined();
  }
  expect(firstPartyMedia(undefined)).toBeUndefined();
});
