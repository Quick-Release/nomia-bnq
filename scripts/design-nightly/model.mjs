import { createHash } from "node:crypto";

export const producer = "Quick-Release/gq-design";
export function validateManifest(m, tag, sourceSha) {
  const match = /^(\d+\.\d+\.\d+)-nightly\.(\d{8})\.(\d+)\.(\d+)$/.exec(m.version ?? "");
  if (
    !match ||
    m.schemaVersion !== 1 ||
    m.channel !== "nightly" ||
    m.tag !== tag ||
    tag !== `v${m.version}` ||
    !/^[a-f0-9]{40}$/.test(m.sourceSha) ||
    m.sourceSha !== sourceSha ||
    !Number.isSafeInteger(m.sequence) ||
    m.sequence < 1 ||
    !Number.isSafeInteger(m.attempt) ||
    m.attempt < 1 ||
    Number(match[3]) !== m.sequence ||
    Number(match[4]) !== m.attempt
  )
    throw new Error("Invalid nightly identity or tag source");
  const p = m.plugin;
  if (
    p?.name !== "getquick/gq-design" ||
    p.asset !== `gq-design-${m.version}.zip` ||
    !/^[a-f0-9]{64}$/.test(p.sha256 ?? "") ||
    p.composer?.name !== p.name ||
    p.composer.version !== `dev-nightly-${match[2]}.${m.sequence}.${m.attempt}` ||
    p.composer.type !== "wordpress-plugin"
  )
    throw new Error("Invalid plugin metadata");
  if (
    !Array.isArray(m.packages) ||
    m.packages.length !== 2 ||
    new Set(m.packages.map((p) => p.name)).size !== 2 ||
    m.packages.some(
      (p) => !["@quick-release/design-contract", "@quick-release/design-renderer"].includes(p.name),
    ) ||
    m.packages.some(
      (p) =>
        p.version !== m.version ||
        !/^[a-f0-9]{64}$/.test(p.sha256 ?? "") ||
        typeof p.integrity !== "string",
    )
  )
    throw new Error("Incomplete lockstep release");
  return m;
}
export function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
export function newest(manifests) {
  return manifests.sort((a, b) => b.sequence - a.sequence || b.attempt - a.attempt)[0];
}
export function snapshotComposer(original, m, zipSha1) {
  const result = structuredClone(original);
  result.require[m.plugin.name] = m.plugin.composer.version;
  result.repositories.unshift({
    type: "package",
    package: {
      ...Object.fromEntries(
        Object.entries(m.plugin.composer).filter(([key]) =>
          [
            "name",
            "version",
            "type",
            "require",
            "conflict",
            "replace",
            "provide",
            "autoload",
            "extra",
            "description",
            "license",
          ].includes(key),
        ),
      ),
      // The installed theme requires a numeric Design range. Give Composer a
      // numeric dev alias while keeping the exact nightly branch requirement.
      extra: {
        ...m.plugin.composer.extra,
        "branch-alias": {
          [m.plugin.composer.version]: `${m.version.split("-nightly.")[0]}.x-dev`,
        },
      },
      dist: {
        type: "zip",
        url: `./nightly/${m.plugin.asset}`,
        reference: m.sourceSha,
        shasum: zipSha1,
      },
    },
  });
  return result;
}
export function assertUnchangedDependencies(before, after) {
  const other = (lock) =>
    ["packages", "packages-dev"]
      .flatMap((key) =>
        (lock[key] ?? [])
          .filter((p) => p.name !== "getquick/gq-design")
          .map((p) => JSON.stringify(p)),
      )
      .sort();
  if (JSON.stringify(other(before)) !== JSON.stringify(other(after)))
    throw new Error(
      "Nightly changed dependencies other than gq-design; explicit Site adoption required",
    );
}

export function activationDecision(candidate, history, manual = false) {
  const compare = (a, b) => a.sequence - b.sequence || a.attempt - b.attempt;
  for (const { id, state } of history) {
    if (!state || ["queued", "pending", "in_progress"].includes(state))
      throw new Error(`Unresolved deployment ${id}; reconcile Ploi before another activation`);
  }
  for (const { state, manifest } of history) {
    if (
      !manual &&
      manifest &&
      (compare(manifest, candidate) > 0 ||
        (compare(manifest, candidate) === 0 && ["success", "inactive"].includes(state)))
    )
      return "superseded";
  }
  return "activate";
}
