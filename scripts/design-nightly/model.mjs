import { createHash } from "node:crypto";

export const producer = "Quick-Release/gq-design";
export const producers = {
  design: {
    repository: producer,
    manifestAsset: "design-release.json",
    plugin: "getquick/gq-design",
    assetPrefix: "gq-design",
    type: "wordpress-plugin",
    packages: ["@quick-release/design-contract", "@quick-release/design-renderer"],
  },
  content: {
    repository: "Quick-Release/gq-content",
    manifestAsset: "content-release.json",
    plugin: "getquick/gq-content",
    assetPrefix: "content-nightly",
    type: "wordpress-muplugin",
    packages: ["@getquick/content"],
  },
};
export function validateManifest(m, tag, sourceSha, owner = producers.design) {
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
  if (typeof m.migrations?.destructive !== "boolean")
    throw new Error("Missing boolean destructive migration declaration");
  const p = m.plugin;
  if (
    p?.name !== owner.plugin ||
    p.asset !== `${owner.assetPrefix}-${m.version}.zip` ||
    !/^[a-f0-9]{64}$/.test(p.sha256 ?? "") ||
    p.composer?.name !== p.name ||
    p.composer.version !== `dev-nightly-${match[2]}.${m.sequence}.${m.attempt}` ||
    p.composer.type !== owner.type
  )
    throw new Error("Invalid plugin metadata");
  if (
    !Array.isArray(m.packages) ||
    m.packages.length !== owner.packages.length ||
    new Set(m.packages.map((p) => p.name)).size !== owner.packages.length ||
    new Set(m.packages.map((p) => p.asset)).size !== owner.packages.length ||
    m.packages.some((p) => !owner.packages.includes(p.name)) ||
    m.packages.some(
      (p) =>
        p.version !== m.version ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]*\.tgz$/.test(p.asset ?? "") ||
        !/^[a-f0-9]{64}$/.test(p.sha256 ?? "") ||
        typeof p.integrity !== "string" ||
        !p.integrity,
    )
  )
    throw new Error("Incomplete lockstep release");
  return m;
}
export function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
export function compareNightlies(a, b) {
  return a.sequence - b.sequence || a.attempt - b.attempt;
}
export function newest(manifests) {
  return manifests.sort((a, b) => compareNightlies(b, a))[0];
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
export function assertUnchangedDependencies(before, after, allowed = ["getquick/gq-design"]) {
  const other = (lock) =>
    ["packages", "packages-dev"]
      .flatMap((key) =>
        (lock[key] ?? []).filter((p) => !allowed.includes(p.name)).map((p) => JSON.stringify(p)),
      )
      .sort();
  if (JSON.stringify(other(before)) !== JSON.stringify(other(after)))
    throw new Error(
      "Nightly changed dependencies other than selected nightlies; explicit Site adoption required",
    );
}

export function activationDecision(
  candidate,
  history,
  manual = false,
  currentActionsJob,
  snapshot,
) {
  // The Actions environment creates its own deployment before this script runs.
  // Ignore only that authenticated job's empty platform record. Our durable
  // records always carry ownership/manifest payloads and must retain the fence.
  history = history.filter(
    (entry) =>
      !(
        currentActionsJob &&
        entry.payload &&
        typeof entry.payload === "object" &&
        !Array.isArray(entry.payload) &&
        Object.keys(entry.payload).length === 0 &&
        entry.task === "deploy" &&
        entry.environment === currentActionsJob.environment &&
        entry.ref === currentActionsJob.refName &&
        entry.sha === currentActionsJob.headSha &&
        entry.logUrl === currentActionsJob.jobUrl
      ),
  );
  for (const { id, state } of history) {
    if (!["success", "inactive", "failure", "error"].includes(state))
      throw new Error(`Unresolved deployment ${id}; reconcile Ploi before another activation`);
  }
  // History arrives newest first from the deployment ledger. A manual rollback
  // changes the effective successful deployment, even if an older record still
  // has a success status. Historical inactive successes do not pin selection.
  const effective = history.find(({ state }) => state === "success");
  const candidates = snapshot?.manifests ?? { design: candidate };
  const manifestsOf = (entry) =>
    entry?.payload?.manifests ?? (entry?.manifest ? { design: entry.manifest } : {});
  if (!manual) {
    for (const entry of history) {
      for (const [name, previous] of Object.entries(manifestsOf(entry))) {
        if (candidates[name] && compareNightlies(previous, candidates[name]) > 0)
          return "superseded";
      }
    }
    const deployed = manifestsOf(effective);
    if (
      effective &&
      Object.entries(candidates).every(
        ([name, m]) =>
          deployed[name]?.tag === m.tag &&
          deployed[name]?.sourceSha === m.sourceSha &&
          compareNightlies(deployed[name], m) === 0,
      ) &&
      (!snapshot ||
        (effective.payload?.siteSha === snapshot.siteSha &&
          effective.payload?.frontendDeployment === true))
    )
      return "superseded";
  }
  return "activate";
}

// Compare installed dependency graphs, allowing only the frontend Content root
// identity to change. Tooling's stable Content dependency remains untouched.
export function dependencyGraph(projects) {
  const walk = (node, contentRoot = false) => ({
    ...(!contentRoot ? { version: node.version, resolved: node.resolved } : {}),
    ...Object.fromEntries(
      ["dependencies", "devDependencies", "optionalDependencies"].map((kind) => [
        kind,
        Object.fromEntries(
          Object.entries(node[kind] ?? {})
            .sort()
            .map(([name, child]) => [name, walk(child)]),
        ),
      ]),
    ),
  });
  return projects
    .map((project) => {
      const tree = walk(project);
      if (project.name === "@nomia-bnq/frontend" && project.dependencies?.["@getquick/content"])
        tree.dependencies["@getquick/content"] = walk(
          project.dependencies["@getquick/content"],
          true,
        );
      return { name: project.name, ...tree };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
export function verifyPackage(bytes, p) {
  if (hash(bytes) !== p.sha256) throw new Error("Package SHA256 mismatch");
  if (p.integrity !== `sha512-${createHash("sha512").update(bytes).digest("base64")}`)
    throw new Error("Package integrity mismatch");
}
