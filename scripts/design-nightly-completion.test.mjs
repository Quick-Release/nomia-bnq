import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import https from "node:https";
import test from "node:test";
import { completeDeployment, statusRequest } from "./design-nightly/completion.mjs";

const record = {
  deploymentId: 7316074723,
  runUrl: "https://github.com/Quick-Release/nomia-bnq/actions/runs/40213061178",
};
const success = {
  state: "success",
  log_url: record.runUrl,
  environment_url: "https://nomia-cms.bnq.pt",
};
const brokenPipe = () => Object.assign(new TypeError("fetch failed"), { cause: { code: "EPIPE" } });

test("completion uses a fresh bounded HTTPS connection instead of the idle fetch pool", async (t) => {
  let calls = 0;
  t.mock.method(https, "request", (url, options, onResponse) => {
    calls++;
    assert.equal(
      url,
      `https://api.github.com/repos/Quick-Release/nomia-bnq/deployments/${record.deploymentId}/statuses`,
    );
    assert.equal(options.agent, false);
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.method, "POST");
    const request = new EventEmitter();
    request.end = (body) => {
      assert.deepEqual(JSON.parse(body), { ...success, auto_inactive: true });
      const response = new EventEmitter();
      response.statusCode = 201;
      response.setEncoding = () => {};
      onResponse(response);
      response.emit("data", JSON.stringify(success));
      response.emit("end");
    };
    return request;
  });
  await completeDeployment(record);
  assert.equal(calls, 1);
});

test("lost committed success response is reconciled without a second POST", async () => {
  const calls = [];
  await completeDeployment(record, async (method) => {
    calls.push(method);
    if (method === "POST") throw brokenPipe();
    return [success];
  });
  assert.deepEqual(calls, ["POST", "GET"]);
});

test("EPIPE before commit retries only the same completion status", async () => {
  const calls = [];
  await completeDeployment(record, async (method, path, body) => {
    calls.push({ method, path, body });
    if (calls.length === 1) throw brokenPipe();
    return method === "GET" ? [{ state: "in_progress", log_url: record.runUrl }] : success;
  });
  assert.deepEqual(
    calls.map((c) => c.method),
    ["POST", "GET", "POST"],
  );
  assert.deepEqual(calls[0], calls[2]);
});

test("exhausted transport, conflicting status and denied access stay failed", async () => {
  let posts = 0;
  await assert.rejects(
    completeDeployment(record, async (method) => {
      if (method === "GET") return [{ state: "in_progress", log_url: record.runUrl }];
      posts++;
      throw brokenPipe();
    }),
    /fetch failed/,
  );
  assert.equal(posts, 3);
  await assert.rejects(
    completeDeployment(record, async (method) => {
      if (method === "GET") return [{ ...success, log_url: "another run" }];
      throw brokenPipe();
    }),
    /Conflicting/,
  );
  let requests = 0;
  await assert.rejects(
    completeDeployment(record, async () => {
      requests++;
      throw new Error("GitHub completion HTTP 403");
    }),
    /403/,
  );
  assert.equal(requests, 1);
});

test("completion transport rejects HTTP failures without leaking response bodies", async (t) => {
  t.mock.method(https, "request", (_url, _options, onResponse) => {
    const request = new EventEmitter();
    request.end = () => {
      const response = new EventEmitter();
      response.statusCode = 503;
      response.setEncoding = () => {};
      onResponse(response);
      response.emit("data", "private response");
      response.emit("end");
    };
    return request;
  });
  await assert.rejects(
    statusRequest("POST", "unused", {}),
    (error) => error.retryable && error.message === "GitHub completion HTTP 503",
  );
});
