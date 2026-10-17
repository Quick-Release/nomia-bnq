#!/usr/bin/env python3
"""Prepares a WordPress WXR export for `wp import`.

Two things a source export can ship that break the importer:

  - items of post types the run should not import (wp import has no type
    filter, so the items are stripped instead), and
  - raw C0 control characters in post content (XML does not allow them;
    wp import reports "not well-formed (invalid token)").
    \t (\x09), \n (\x0a) and \r (\x0d) are kept.

usage: filter-wxr.py <input.wxr> <output.wxr> post,attachment,page[,…]

Writes a clean working copy to the output path either way (when nothing
changes, byte-identical to the input) and exits 0 after verifying the
result still parses as XML. Channel metadata, authors, and <wp:term>
definitions survive their posts: terms only referenced by kept posts stay.
"""

import re
import sys
import xml.etree.ElementTree as ET

# XML 1.0 forbids every C0 control except tab, newline and carriage return.
INVALID_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def main() -> int:
    if len(sys.argv) != 4:
        print(__doc__, file=sys.stderr)
        return 2
    src, dst, types_raw = sys.argv[1], sys.argv[2], sys.argv[3]
    allowed = {t.strip() for t in types_raw.split(",") if t.strip()}

    with open(src, encoding="utf-8") as f:
        contents = f.read()

    scrubbed = 0

    def scrub(text: str) -> str:
        nonlocal scrubbed
        clean = INVALID_CONTROL.sub("", text)
        scrubbed += len(text) - len(clean)
        return clean

    contents = scrub(contents)

    head, sep, rest = contents.partition("<item>")
    if not sep:
        print("filter-wxr: no <item> blocks found; writing as-is", file=sys.stderr)
        with open(dst, "w", encoding="utf-8") as f:
            f.write(contents)
        return 0

    items = rest.split("<item>")
    kept, removed = [], []
    for raw_item in items:
        # The trailing chunk after the last </item> closes the document; keep it.
        end = raw_item.find("</item>")
        chunk = raw_item[:end] if end >= 0 else raw_item
        marker = "<wp:post_type>"
        start = chunk.find(marker)
        if start < 0 or not removed_ok(chunk, start, allowed):
            kept.append(raw_item)
            continue
        removed.append(post_type_of(chunk, start))

    removed_count = len(removed)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(head + "<item>" + "<item>".join(kept))

    # Sanity: the working copy must still parse as XML.
    try:
        ET.parse(dst)
    except ET.ParseError as error:
        print(f"filter-wxr: prepared WXR failed to parse: {error}", file=sys.stderr)
        return 1

    if removed_count:
        counts: dict[str, int] = {}
        for value in removed:
            counts[value] = counts.get(value, 0) + 1
        summary = ", ".join(f"{key}: {value}" for key, value in sorted(counts.items()))
        print(f"filter-wxr: removed {removed_count} items ({summary}); keeping {len(kept)}")
    else:
        print(f"filter-wxr: no items removed; all types within {sorted(allowed)}")
    if scrubbed:
        print(f"filter-wxr: scrubbed {scrubbed} raw control characters")
    return 0


def post_type_of(chunk: str, start: int) -> str:
    value = chunk[start + len("<wp:post_type>") :]
    value = value.split("]]>")[0]
    if value.startswith("<![CDATA["):
        value = value[len("<![CDATA[") :]
    return value.strip()


def removed_ok(chunk: str, start: int, allowed: set[str]) -> bool:
    """True when the item at this offset must be dropped (type not allowed)."""
    return post_type_of(chunk, start) not in allowed


if __name__ == "__main__":
    sys.exit(main())