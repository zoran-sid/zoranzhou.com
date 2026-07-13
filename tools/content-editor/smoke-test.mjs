import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  mkdir,
  readFile,
  realpath,
  rm,
  rmdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TOOL_ROOT = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(TOOL_ROOT, "../..");
const BLOG_ROOT = resolve(REPO_ROOT, "src/content/blog");
const GPX_ROOT = resolve(REPO_ROOT, "public/routes");
const BACKUP_ROOT = resolve(TOOL_ROOT, "backups");
const TEMP_ROOT = resolve(TOOL_ROOT, ".temp");
const suffix = `${process.pid}-${randomBytes(5).toString("hex")}`;
const contentName = `editor-smoke-${suffix}.md`;
const badName = `editor-smoke-bad-${suffix}.md`;
const gpxName = `editor-smoke-${suffix}.gpx`;
const contentPath = resolve(BLOG_ROOT, contentName);
const badPath = resolve(BLOG_ROOT, badName);
const gpxPath = resolve(GPX_ROOT, gpxName);
const explorerLogPath = resolve(TEMP_ROOT, `explorer-${suffix}.jsonl`);
const backupFiles = [];
const generatedRouteFiles = [];

const fixture = `---
title: "Editor smoke test"
date: "2026-05-26T19:42:00+08:00"
tags: ["one,two", "three"]
draft: true
author: "Zoran"
lang: "zh-CN"
featured: false
custom:
  nested: "preserve me"
---

Original body.
`;

async function freePort() {
  const probe = createServer();
  await new Promise((resolvePromise, rejectPromise) => {
    probe.once("error", rejectPromise);
    probe.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = probe.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolvePromise) => probe.close(resolvePromise));
  return port;
}

async function waitForConfig(origin, child) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Editor server exited before becoming ready (${child.exitCode}).`,
      );
    }
    try {
      const response = await fetch(`${origin}/api/config`);
      if (response.ok) return response.json();
    } catch {
      // Server is still starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error("Timed out waiting for the local editor server.");
}

async function request(origin, token, path, options = {}) {
  const response = await fetch(`${origin}${path}`, {
    method: options.method || "GET",
    headers: options.body
      ? {
          "Content-Type": "application/json",
          "X-Editor-Token": token,
          Origin: origin,
        }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (options.expectStatus) {
    assert.equal(response.status, options.expectStatus, JSON.stringify(data));
  } else {
    assert.equal(response.ok, true, JSON.stringify(data));
  }
  return data;
}

async function waitForTask(origin, token, id) {
  const deadline = Date.now() + 180_000;
  let cursor = 0;
  let output = "";
  let previousElapsed = 0;
  while (Date.now() < deadline) {
    const status = await request(
      origin,
      token,
      `/api/tasks/${id}?cursor=${cursor}`,
    );
    assert.ok(status.elapsedMs >= previousElapsed);
    previousElapsed = status.elapsedMs;
    output += status.output;
    cursor = status.nextCursor;
    if (
      new Set(["succeeded", "failed", "timed_out", "cleanup_failed"]).has(
        status.status,
      )
    ) {
      return { ...status, output };
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out polling project task ${id}.`);
}

async function startTaskAttempt(origin, token, task) {
  const response = await fetch(`${origin}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Editor-Token": token,
      Origin: origin,
    },
    body: JSON.stringify({ task }),
  });
  return { status: response.status, data: await response.json() };
}

async function verifyTaskTimeoutCleanup(simulateReportingFailure = false) {
  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["tools/content-editor/server.mjs"], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      EDITOR_PORT: String(port),
      EDITOR_NO_OPEN: "1",
      EDITOR_TEST_MODE: "1",
      EDITOR_TASK_TIMEOUT_MS: "250",
      EDITOR_TASK_TERMINATION_GRACE_MS: "5000",
      EDITOR_TEST_TASK_CLEANUP_FAILURE: simulateReportingFailure ? "1" : "",
      CI: "",
      CF_PAGES: "",
      CF_PAGES_BRANCH: "",
      ASTRO_TELEMETRY_DISABLED: "1",
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  child.stdout.on("data", (chunk) => (serverOutput += chunk.toString("utf8")));
  child.stderr.on("data", (chunk) => (serverOutput += chunk.toString("utf8")));
  try {
    const config = await waitForConfig(origin, child);
    const started = await request(origin, config.token, "/api/tasks", {
      method: "POST",
      body: { task: "lint" },
    });
    const finished = await waitForTask(origin, config.token, started.id);
    assert.equal(
      finished.status,
      simulateReportingFailure ? "cleanup_failed" : "timed_out",
      finished.output,
    );
    assert.equal(finished.ok, false, finished.output);
    if (simulateReportingFailure) {
      assert.match(finished.output, /Simulated cleanup reporting failure/u);
      assert.match(finished.output, /Restart the local editor/u);
      const locked = await request(origin, config.token, "/api/tasks", {
        method: "POST",
        body: { task: "lint" },
        expectStatus: 409,
      });
      assert.match(locked.error, /Restart the local editor/u);
    } else {
      assert.match(
        finished.output,
        process.platform === "win32"
          ? /Windows process tree stopped with taskkill\.exe/u
          : /POSIX process group stopped/u,
      );
    }
  } catch (error) {
    console.error(serverOutput);
    throw error;
  } finally {
    child.kill();
    await Promise.race([
      new Promise((resolvePromise) => child.once("exit", resolvePromise)),
      new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000)),
    ]);
  }
}

async function removeBackup(file) {
  const absolute = resolve(REPO_ROOT, file);
  const rel = relative(BACKUP_ROOT, absolute);
  assert.ok(rel && !rel.startsWith(".."), `Unsafe backup path: ${absolute}`);
  await rm(absolute, { force: true });
  let directory = dirname(absolute);
  while (directory !== BACKUP_ROOT) {
    try {
      await rmdir(directory);
    } catch (error) {
      if (new Set(["ENOENT", "ENOTEMPTY", "EEXIST"]).has(error?.code)) break;
      throw error;
    }
    directory = dirname(directory);
  }
}

async function main() {
  await mkdir(BLOG_ROOT, { recursive: true });
  await mkdir(GPX_ROOT, { recursive: true });
  await writeFile(contentPath, fixture, { encoding: "utf8", flag: "wx" });
  await writeFile(badPath, "This fixture intentionally has no frontmatter.\n", {
    encoding: "utf8",
    flag: "wx",
  });

  const port = await freePort();
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["tools/content-editor/server.mjs"], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      EDITOR_PORT: String(port),
      EDITOR_NO_OPEN: "1",
      CI: "",
      CF_PAGES: "",
      CF_PAGES_BRANCH: "",
      ASTRO_TELEMETRY_DISABLED: "1",
      EDITOR_TEST_MODE: "1",
      EDITOR_EXPLORER_TEST_LOG: explorerLogPath,
    },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  child.stdout.on("data", (chunk) => (serverOutput += chunk.toString("utf8")));
  child.stderr.on("data", (chunk) => (serverOutput += chunk.toString("utf8")));

  try {
    const config = await waitForConfig(origin, child);
    assert.equal(typeof config.token, "string");
    assert.deepEqual(
      config.collections.map((item) => item.id),
      ["blog", "essays", "research", "projects", "photos", "routes"],
      "The editor must expose only the current content collections.",
    );
    assert.equal(
      config.collections.find((item) => item.id === "routes")?.canCreate,
      false,
    );
    assert.equal(config.capabilities.explorer, true);

    const html = await (await fetch(origin)).text();
    const javascript = await (await fetch(`${origin}/editor.js`)).text();
    assert.match(html, /id="new-button"/u);
    assert.match(html, /id="visual-editor"/u);
    assert.match(html, /class="task-explanation"/u);
    assert.match(javascript, /newButton:\s*requiredElement\("new-button"\)/u);
    assert.match(javascript, /api\("\/api\/tasks"/u);
    assert.match(javascript, /api\(`\/api\/tasks\/\$\{result\.id\}/u);
    assert.doesNotMatch(javascript, /api\(["']\/api\/task["']/u);

    const entries = await request(
      origin,
      config.token,
      "/api/entries?collection=blog",
    );
    assert.ok(entries.entries.some((entry) => entry.filename === contentName));
    assert.ok(entries.errors.some((entry) => entry.filename === badName));

    const entry = await request(
      origin,
      config.token,
      `/api/entry?collection=blog&file=${encodeURIComponent(contentName)}`,
    );
    assert.equal(entry.fields.date, "2026-05-26T19:42:00+08:00");
    // Keep malformed-entry isolation covered without poisoning the real Astro
    // check used to verify the Windows npm subprocess path below.
    await unlink(badPath);

    const saved = await request(origin, config.token, "/api/save", {
      method: "POST",
      body: {
        collection: "blog",
        originalFile: contentName,
        originalVersion: entry.version,
        filename: contentName,
        fields: {
          ...entry.fields,
          date: "2026-05-26",
          description: "Changed safely",
        },
        changedFields: ["description"],
        frontmatter: entry.frontmatter,
        body: entry.body,
      },
    });
    if (saved.backup) backupFiles.push(saved.backup);
    const source = await readFile(contentPath, "utf8");
    assert.match(source, /date: "2026-05-26T19:42:00\+08:00"/u);
    assert.match(source, /tags: \["one,two", "three"\]/u);
    assert.match(source, /nested: "preserve me"/u);
    assert.match(source, /description: "Changed safely"/u);

    const selected = await request(origin, config.token, "/api/explorer", {
      method: "POST",
      body: { collection: "blog", filename: contentName },
    });
    assert.equal(selected.target, "content-file");
    const openedDirectory = await request(
      origin,
      config.token,
      "/api/explorer",
      {
        method: "POST",
        body: { collection: "blog" },
      },
    );
    assert.equal(openedDirectory.target, "content-directory");
    const openedRoutes = await request(
      origin,
      config.token,
      "/api/gpx/explorer",
      { method: "POST", body: {} },
    );
    assert.equal(openedRoutes.target, "routes-directory");
    const explorerLaunches = (await readFile(explorerLogPath, "utf8"))
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line));
    assert.deepEqual(explorerLaunches, [
      { args: ["/select,", await realpath(contentPath)] },
      { args: [await realpath(BLOG_ROOT)] },
      { args: [await realpath(GPX_ROOT)] },
    ]);

    const deleted = await request(origin, config.token, "/api/delete", {
      method: "POST",
      body: {
        collection: "blog",
        filename: contentName,
        originalVersion: saved.version,
      },
    });
    if (deleted.backup) backupFiles.push(deleted.backup);

    const taskAttempts = await Promise.all([
      startTaskAttempt(origin, config.token, "lint"),
      startTaskAttempt(origin, config.token, "lint"),
    ]);
    assert.deepEqual(
      taskAttempts.map((attempt) => attempt.status).sort((a, b) => a - b),
      [202, 409],
      JSON.stringify(taskAttempts),
    );
    const taskStarted = taskAttempts.find(
      (attempt) => attempt.status === 202,
    ).data;
    assert.match(
      taskAttempts.find((attempt) => attempt.status === 409).data.error,
      /already running/iu,
    );
    const legacyBusy = await request(origin, config.token, "/api/task", {
      method: "POST",
      body: { task: "check" },
      expectStatus: 409,
    });
    assert.match(legacyBusy.error, /already running/iu);
    assert.match(taskStarted.id, /^[a-f0-9]{32}$/u);
    assert.equal(taskStarted.task, "lint");
    assert.ok(new Set(["starting", "running"]).has(taskStarted.status));
    const taskFinished = await waitForTask(
      origin,
      config.token,
      taskStarted.id,
    );
    assert.equal(taskFinished.status, "succeeded", taskFinished.output);
    assert.equal(taskFinished.ok, true, taskFinished.output);
    assert.equal(taskFinished.code, 0, taskFinished.output);
    assert.match(taskFinished.output, /> astro check/u);
    assert.equal(taskFinished.outputTruncated, false);
    assert.doesNotMatch(taskFinished.output, /spawn EINVAL/iu);
    await request(origin, config.token, "/api/tasks", {
      method: "POST",
      body: { task: "constructor" },
      expectStatus: 400,
    });
    await verifyTaskTimeoutCleanup();
    await verifyTaskTimeoutCleanup(true);

    const gpx = `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="editor-smoke"><trk><trkseg><trkpt lat="31" lon="117"></trkpt><trkpt lat="31.001" lon="117.001"></trkpt></trkseg></trk></gpx>`;
    const imported = await request(origin, config.token, "/api/gpx/import", {
      method: "POST",
      body: {
        filename: gpxName,
        dataUrl: `data:application/gpx+xml;base64,${Buffer.from(gpx).toString("base64")}`,
      },
    });
    assert.equal(imported.filename, gpxName);
    const gpxList = await request(origin, config.token, "/api/gpx");
    assert.ok(gpxList.files.some((file) => file.filename === gpxName));

    const routeResult = await request(
      origin,
      config.token,
      "/api/gpx/create-route",
      {
        method: "POST",
        body: { filename: gpxName, lang: "zh-CN", geocode: false },
      },
    );
    assert.equal(routeResult.files.length, 1, routeResult.output);
    for (const file of routeResult.files) {
      generatedRouteFiles.push(resolve(REPO_ROOT, "src/content/routes", file));
    }
    backupFiles.push(...routeResult.backups);

    await request(origin, config.token, "/api/gpx/create-route", {
      method: "POST",
      body: { filename: `missing-${suffix}.gpx`, lang: "zh-CN" },
      expectStatus: 404,
    });
    const removedGpx = await request(origin, config.token, "/api/gpx/delete", {
      method: "POST",
      body: { filename: gpxName },
    });
    if (removedGpx.backup) backupFiles.push(removedGpx.backup);

    console.log(
      "Editor smoke test passed: boot, visual UI wiring, resilient listing, ISO preservation, CRUD, Explorer hooks, atomic polling/legacy npm tasks, timeout tree cleanup/failure lock, GPX APIs.",
    );
  } catch (error) {
    console.error(serverOutput);
    throw error;
  } finally {
    child.kill();
    await Promise.race([
      new Promise((resolvePromise) => child.once("exit", resolvePromise)),
      new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000)),
    ]);
    await unlink(contentPath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    await unlink(badPath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    await unlink(gpxPath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    await unlink(explorerLogPath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
    for (const file of generatedRouteFiles) {
      await unlink(file).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      });
    }
    for (const backup of backupFiles) await removeBackup(backup);
  }
}

await main();
