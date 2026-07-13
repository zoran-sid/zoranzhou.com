import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  copyFile,
  link,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  readdir,
  rename,
  rm,
  rmdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
  win32 as win32Path,
} from "node:path";
import { fileURLToPath } from "node:url";

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(TOOL_DIR, "../..");
const CONTENT_ROOT = resolve(REPO_ROOT, "src/content");
const PUBLIC_ROOT = resolve(TOOL_DIR, "public");
const BACKUP_ROOT = resolve(TOOL_DIR, "backups");
const SITE_PUBLIC_ROOT = resolve(REPO_ROOT, "public");
const ROUTES_ROOT = resolve(SITE_PUBLIC_ROOT, "routes");
const ROUTES_CONTENT_ROOT = resolve(CONTENT_ROOT, "routes");
const LOCAL_SETTINGS_FILE = resolve(TOOL_DIR, "local-settings.json");
const TEMP_ROOT = resolve(TOOL_DIR, ".temp");
const PICGO_SERVER = "http://127.0.0.1:36677";
const HOST = "127.0.0.1";
const PORT = parsePort(process.env.EDITOR_PORT);
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_GPX_BYTES = 25 * 1024 * 1024;
const MAX_ASSET_REQUEST_BYTES = 36 * 1024 * 1024;
const TASK_TIMEOUT_MS = testDuration(
  "EDITOR_TASK_TIMEOUT_MS",
  5 * 60 * 1000,
  50,
  10_000,
);
const TASK_TERMINATION_GRACE_MS = testDuration(
  "EDITOR_TASK_TERMINATION_GRACE_MS",
  10_000,
  100,
  10_000,
);
const TASK_OUTPUT_LIMIT = 256 * 1024;
const TASK_RETENTION_MS = 10 * 60 * 1000;
const MAX_RETAINED_TASKS = 8;
const ALLOWED_HOSTS = new Set([`${HOST}:${PORT}`, `localhost:${PORT}`]);
const ALLOWED_ORIGINS = new Set([
  `http://${HOST}:${PORT}`,
  `http://localhost:${PORT}`,
]);
const REQUEST_TOKEN = randomBytes(32).toString("base64url");
const PROJECT_TASKS = Object.freeze({
  // `check` is the legacy UI name. Both it and `lint` execute the same fixed
  // package script; request data is never used as a command or argument.
  check: { task: "lint", script: "lint" },
  lint: { task: "lint", script: "lint" },
  build: { task: "build", script: "build" },
});
const projectTasks = new Map();
let activeProjectTaskId = null;

// This explicit allowlist is the security boundary for content-entry writes.
// Route assets have a separate, equally narrow boundary under public/routes.
const COLLECTIONS = Object.freeze({
  blog: { label: "Blog", directory: "blog" },
  essays: { label: "Essays", directory: "essays" },
  research: { label: "Research", directory: "research" },
  projects: { label: "Projects", directory: "projects" },
  photos: { label: "Photos", directory: "photos" },
  routes: { label: "Routes", directory: "routes", canCreate: false },
});

const MANAGED_FIELDS = [
  "title",
  "date",
  "description",
  "author",
  "lang",
  "translationKey",
  "slug",
  "tags",
  "draft",
  "featured",
];

if (
  process.env.CF_PAGES ||
  process.env.CF_PAGES_BRANCH ||
  isEnabledEnvironmentFlag(process.env.CI)
) {
  throw new Error(
    "The local content editor is disabled in CI and Cloudflare environments.",
  );
}

function isEnabledEnvironmentFlag(value) {
  if (!value) return false;
  return !new Set(["0", "false", "no", "off"]).has(
    String(value).trim().toLowerCase(),
  );
}

function testDuration(name, fallback, minimum, maximum) {
  if (process.env.EDITOR_TEST_MODE !== "1") return fallback;
  const value = process.env[name];
  if (!/^\d+$/u.test(value ?? "")) return fallback;
  const duration = Number(value);
  return Number.isSafeInteger(duration) &&
    duration >= minimum &&
    duration <= maximum
    ? duration
    : fallback;
}

const server = createServer(async (request, response) => {
  try {
    setSecurityHeaders(response);
    validateLocalRequest(request);
    const url = new URL(request.url ?? "/", `http://${HOST}:${PORT}`);

    if (request.method === "GET" && url.pathname === "/api/config") {
      return sendJson(response, 200, {
        collections: Object.entries(COLLECTIONS).map(([id, value]) => ({
          id,
          label: value.label,
          canCreate: value.canCreate !== false,
        })),
        token: REQUEST_TOKEN,
        capabilities: {
          localOnly: true,
          settings: true,
          picgo: {
            upload: true,
            server: PICGO_SERVER,
            maxImageBytes: MAX_IMAGE_BYTES,
          },
          gpx: {
            manage: true,
            maxFileBytes: MAX_GPX_BYTES,
            publicBaseUrl: "/routes/",
          },
          explorer: explorerIntegrationAvailable(),
        },
      });
    }
    if (request.method === "GET" && url.pathname === "/api/settings") {
      return sendJson(response, 200, await getLocalSettings());
    }
    if (request.method === "POST" && url.pathname === "/api/settings") {
      return sendJson(
        response,
        200,
        await saveLocalSettings(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/images/upload") {
      return sendJson(
        response,
        200,
        await uploadImageWithPicGo(
          await readJson(request, MAX_ASSET_REQUEST_BYTES),
        ),
      );
    }
    if (request.method === "GET" && url.pathname === "/api/gpx") {
      return sendJson(response, 200, await listGpxAssets());
    }
    if (request.method === "POST" && url.pathname === "/api/gpx/import") {
      return sendJson(
        response,
        201,
        await importGpxAsset(await readJson(request, MAX_ASSET_REQUEST_BYTES)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/gpx/create-route") {
      return sendJson(
        response,
        200,
        await createRouteContentFromGpx(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/gpx/delete") {
      return sendJson(
        response,
        200,
        await deleteGpxAsset(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/gpx/explorer") {
      return sendJson(response, 200, await openRoutesExplorer());
    }
    if (request.method === "GET" && url.pathname === "/api/entries") {
      return sendJson(
        response,
        200,
        await listEntries(url.searchParams.get("collection")),
      );
    }
    if (request.method === "GET" && url.pathname === "/api/entry") {
      return sendJson(
        response,
        200,
        await readEntry(
          url.searchParams.get("collection"),
          url.searchParams.get("file"),
        ),
      );
    }
    if (request.method === "GET" && url.pathname === "/api/git-status") {
      return sendJson(response, 200, await gitStatus());
    }
    if (request.method === "POST" && url.pathname === "/api/save") {
      return sendJson(response, 200, await saveEntry(await readJson(request)));
    }
    if (request.method === "POST" && url.pathname === "/api/delete") {
      return sendJson(
        response,
        200,
        await deleteEntry(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/explorer") {
      return sendJson(
        response,
        200,
        await openExplorer(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/task") {
      return sendJson(
        response,
        200,
        await runProjectTask(await readJson(request)),
      );
    }
    if (request.method === "POST" && url.pathname === "/api/tasks") {
      return sendJson(
        response,
        202,
        await startProjectTask(await readJson(request)),
      );
    }
    if (request.method === "GET") {
      const match = /^\/api\/tasks\/([a-f0-9]{32})$/u.exec(url.pathname);
      if (match) {
        return sendJson(
          response,
          200,
          projectTaskStatus(match[1], url.searchParams.get("cursor")),
        );
      }
    }
    if (request.method === "GET") {
      return serveStatic(url.pathname, response);
    }
    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    const status = error?.statusCode ?? 500;
    if (status >= 500) console.error(error);
    sendJson(response, status, {
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(
      `[EADDRINUSE] 无法启动本地编辑器：${HOST}:${PORT} 已被占用。请在旧编辑器窗口按 Ctrl+C 停止进程，或设置其他 EDITOR_PORT。\n` +
        `Unable to start the local editor: ${HOST}:${PORT} is already in use. Stop the old process with Ctrl+C, or choose another EDITOR_PORT.`,
    );
  } else {
    console.error("Unable to start the local content editor:", error);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  const editorUrl = `http://${HOST}:${PORT}`;
  console.log(`Local content editor: ${editorUrl}`);
  console.log(
    "Press Ctrl+C to stop it. It can only be reached from this computer.",
  );
  if (process.platform === "win32" && process.env.EDITOR_NO_OPEN !== "1") {
    const child = spawn("cmd.exe", ["/c", "start", "", editorUrl], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  }
});

function parsePort(value) {
  if (!value) return 4322;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("EDITOR_PORT must be an integer between 1024 and 65535.");
  }
  return port;
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function setSecurityHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  );
}

function validateLocalRequest(request) {
  if (!ALLOWED_HOSTS.has(request.headers.host ?? "")) {
    throw httpError(403, "Unexpected Host header.");
  }
  if (request.method === "POST") {
    if (!ALLOWED_ORIGINS.has(request.headers.origin ?? "")) {
      throw httpError(
        403,
        "State-changing requests require the local editor origin.",
      );
    }
    if (request.headers["x-editor-token"] !== REQUEST_TOKEN) {
      throw httpError(403, "Invalid editor session token. Reload the editor.");
    }
    if (
      !String(request.headers["content-type"] ?? "")
        .toLowerCase()
        .startsWith("application/json")
    ) {
      throw httpError(415, "State-changing requests require application/json.");
    }
  }
}

function sendJson(response, status, value) {
  if (response.headersSent) return;
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(value));
}

async function readJson(request, maximumBytes = MAX_BODY_BYTES) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBytes) throw httpError(413, "Request is too large.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw httpError(400, "Invalid JSON request.");
  }
}

function collectionDirectory(collection) {
  const config = COLLECTIONS[collection];
  if (!config) throw httpError(400, "Unknown content collection.");
  const directory = resolve(CONTENT_ROOT, config.directory);
  assertWithin(CONTENT_ROOT, directory);
  return directory;
}

function safeEntryPath(collection, filename) {
  if (typeof filename !== "string" || filename !== basename(filename)) {
    throw httpError(400, "Invalid filename.");
  }
  if (
    !/^[^<>:"/\\|?*\u0000-\u001f]+\.(?:md|mdx)$/iu.test(filename) ||
    filename.startsWith(".")
  ) {
    throw httpError(400, "Filename must be a safe .md or .mdx name.");
  }
  if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(filename)) {
    throw httpError(400, "That filename is reserved by Windows.");
  }
  if (/[. ]$/u.test(filename.slice(0, -extname(filename).length))) {
    throw httpError(400, "The filename stem may not end in a dot or space.");
  }
  const directory = collectionDirectory(collection);
  const target = resolve(directory, filename);
  assertWithin(directory, target);
  return target;
}

function assertWithin(parent, child) {
  const rel = relative(resolve(parent), resolve(child));
  if (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
  )
    return;
  throw httpError(400, "Path is outside the approved directory.");
}

async function getLocalSettings() {
  const settings = await readLocalSettings();
  let picgoAvailable = false;
  let validationError = null;
  if (settings.picgoPath) {
    try {
      await validatePicGoExecutable(settings.picgoPath);
      picgoAvailable = true;
    } catch (error) {
      validationError =
        error instanceof Error ? error.message : "The PicGo path is invalid.";
    }
  }
  return {
    picgoPath: settings.picgoPath,
    picgoConfigured: Boolean(settings.picgoPath),
    picgoAvailable,
    picgoServer: PICGO_SERVER,
    validationError,
  };
}

async function saveLocalSettings(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError(400, "Settings must be a JSON object.");
  }
  if (typeof input.picgoPath !== "string") {
    throw httpError(422, "PicGo path must be a string.");
  }
  const requestedPath = input.picgoPath.trim();
  if (requestedPath.length > 1_024) {
    throw httpError(422, "PicGo path is too long.");
  }
  const picgoPath = requestedPath
    ? await validatePicGoExecutable(requestedPath)
    : "";
  await atomicWriteLocalSettings({ picgoPath });
  return {
    ok: true,
    picgoPath,
    picgoConfigured: Boolean(picgoPath),
    picgoAvailable: Boolean(picgoPath),
    picgoServer: PICGO_SERVER,
    validationError: null,
  };
}

async function readLocalSettings() {
  let info;
  try {
    info = await lstat(LOCAL_SETTINGS_FILE);
  } catch (error) {
    if (error?.code === "ENOENT") return { picgoPath: "" };
    throw error;
  }
  if (info.isSymbolicLink() || !info.isFile()) {
    throw httpError(
      500,
      "The editor settings path must be a regular local file, not a link.",
    );
  }
  const [physicalTool, physicalFile] = await Promise.all([
    realpath(TOOL_DIR),
    realpath(LOCAL_SETTINGS_FILE),
  ]);
  assertWithin(physicalTool, physicalFile);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(physicalFile, "utf8"));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw httpError(
        500,
        "local-settings.json is invalid JSON. Fix or remove it and try again.",
      );
    }
    throw error;
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    (parsed.picgoPath !== undefined && typeof parsed.picgoPath !== "string")
  ) {
    throw httpError(500, "local-settings.json contains invalid settings.");
  }
  return { picgoPath: String(parsed.picgoPath ?? "").trim() };
}

async function validatePicGoExecutable(value) {
  const executable = String(value).trim();
  if (!win32Path.isAbsolute(executable)) {
    throw httpError(422, "PicGo path must be an absolute Windows path.");
  }
  if (win32Path.basename(executable).toLowerCase() !== "picgo.exe") {
    throw httpError(422, "Select the installed PicGo.exe application file.");
  }
  let info;
  try {
    info = await lstat(executable);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw httpError(422, "PicGo.exe was not found at that path.");
    }
    throw error;
  }
  if (info.isSymbolicLink() || !info.isFile()) {
    throw httpError(422, "PicGo.exe must be a regular file, not a link.");
  }
  const physicalPath = await realpath(executable);
  if (win32Path.basename(physicalPath).toLowerCase() !== "picgo.exe") {
    throw httpError(422, "The selected file does not resolve to PicGo.exe.");
  }
  const handle = await open(physicalPath, "r");
  try {
    const signature = Buffer.alloc(2);
    const { bytesRead } = await handle.read(signature, 0, 2, 0);
    if (bytesRead !== 2 || signature.toString("ascii") !== "MZ") {
      throw httpError(
        422,
        "The selected PicGo.exe is not a Windows executable.",
      );
    }
  } finally {
    await handle.close();
  }
  return physicalPath;
}

async function atomicWriteLocalSettings(settings) {
  const existing = await pathKind(LOCAL_SETTINGS_FILE);
  if (existing && existing !== "file") {
    throw httpError(
      500,
      "The editor settings path must be a regular local file, not a link.",
    );
  }
  const suffix = `${process.pid}-${Date.now()}-${randomBytes(5).toString("hex")}`;
  const temporary = resolve(TOOL_DIR, `.local-settings.${suffix}.tmp`);
  const previous = resolve(TOOL_DIR, `.local-settings.${suffix}.previous`);
  assertWithin(TOOL_DIR, temporary);
  assertWithin(TOOL_DIR, previous);
  await writeDurableFile(
    temporary,
    Buffer.from(`${JSON.stringify(settings, null, 2)}\n`, "utf8"),
  );
  let movedPrevious = false;
  try {
    if (existing) {
      await rename(LOCAL_SETTINGS_FILE, previous);
      movedPrevious = true;
    }
    await rename(temporary, LOCAL_SETTINGS_FILE);
  } catch (error) {
    await rm(temporary, { force: true });
    if (movedPrevious && !(await fileExists(LOCAL_SETTINGS_FILE))) {
      await rename(previous, LOCAL_SETTINGS_FILE);
    }
    throw error;
  }
  if (movedPrevious) {
    try {
      await rm(previous, { force: true });
    } catch (error) {
      console.warn(
        `Could not remove the previous settings file: ${error.message}`,
      );
    }
  }
}

async function pathKind(filePath) {
  try {
    const info = await lstat(filePath);
    if (info.isSymbolicLink()) return "link";
    if (info.isFile()) return "file";
    if (info.isDirectory()) return "directory";
    return "other";
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function writeDurableFile(filePath, contents) {
  const handle = await open(filePath, "wx");
  let completed = false;
  try {
    await handle.writeFile(contents);
    await handle.sync();
    completed = true;
  } finally {
    try {
      await handle.close();
    } finally {
      if (!completed) await rm(filePath, { force: true });
    }
  }
}

const IMAGE_TYPES = Object.freeze({
  ".png": new Set(["image/png"]),
  ".jpg": new Set(["image/jpeg", "image/jpg"]),
  ".jpeg": new Set(["image/jpeg", "image/jpg"]),
  ".gif": new Set(["image/gif"]),
  ".webp": new Set(["image/webp"]),
  ".bmp": new Set(["image/bmp", "image/x-ms-bmp"]),
  ".avif": new Set(["image/avif"]),
});

async function uploadImageWithPicGo(input) {
  const filename = safeAssetFilename(
    input?.filename,
    new Set(Object.keys(IMAGE_TYPES)),
    "image",
  );
  const { buffer, mediaType } = decodeBase64Payload(
    input?.dataUrl ?? input?.base64,
    MAX_IMAGE_BYTES,
    "image",
  );
  const extension = extname(filename).toLowerCase();
  if (
    mediaType &&
    mediaType !== "application/octet-stream" &&
    !IMAGE_TYPES[extension].has(mediaType)
  ) {
    throw httpError(
      422,
      `The image MIME type (${mediaType}) does not match ${extension}.`,
    );
  }
  validateImageSignature(buffer, extension);

  const temporaryRoot = await ensureSafeDirectDirectory(TEMP_ROOT, TOOL_DIR);
  const sessionDirectory = resolve(
    temporaryRoot,
    `upload-${process.pid}-${Date.now()}-${randomBytes(6).toString("hex")}`,
  );
  assertWithin(temporaryRoot, sessionDirectory);
  await mkdir(sessionDirectory);
  const temporaryFile = resolve(sessionDirectory, filename);
  assertWithin(sessionDirectory, temporaryFile);

  try {
    await writeDurableFile(temporaryFile, buffer);
    const uploadedUrl = await uploadToPicGoWithStartup(temporaryFile);
    return {
      ok: true,
      filename,
      url: uploadedUrl,
      markdown: `![${markdownImageAlt(filename)}](${uploadedUrl})`,
    };
  } finally {
    await rm(temporaryFile, { force: true });
    try {
      await rmdir(sessionDirectory);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        console.warn(
          `Could not remove PicGo temporary directory: ${error.message}`,
        );
      }
    }
  }
}

function safeAssetFilename(value, allowedExtensions, label) {
  if (typeof value !== "string") {
    throw httpError(422, `${capitalize(label)} filename is required.`);
  }
  const filename = value.trim().normalize("NFC");
  if (
    !filename ||
    filename !== basename(filename) ||
    filename !== win32Path.basename(filename) ||
    /[<>:"/\\|?*\u0000-\u001f]/u.test(filename) ||
    filename.startsWith(".") ||
    filename.length > 180
  ) {
    throw httpError(422, `Use a safe ${label} filename without folders.`);
  }
  if (/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(filename)) {
    throw httpError(422, "That filename is reserved by Windows.");
  }
  const extension = extname(filename).toLowerCase();
  const stem = filename.slice(0, -extension.length);
  if (!allowedExtensions.has(extension) || !stem || /[. ]$/u.test(stem)) {
    throw httpError(
      422,
      `${capitalize(label)} filename must use an allowed extension and may not end in a dot or space.`,
    );
  }
  return filename;
}

function decodeBase64Payload(value, maximumBytes, label) {
  if (typeof value !== "string" || !value) {
    throw httpError(422, `${capitalize(label)} data is required.`);
  }
  let encoded = value;
  let mediaType = "";
  if (value.startsWith("data:")) {
    const match = value.match(/^data:([^;,]*);base64,([A-Za-z0-9+/]*={0,2})$/u);
    if (!match) {
      throw httpError(422, `${capitalize(label)} must be a base64 data URL.`);
    }
    mediaType = match[1].trim().toLowerCase();
    encoded = match[2];
  }
  if (
    !encoded ||
    encoded.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/u.test(encoded) ||
    Math.floor((encoded.length * 3) / 4) > maximumBytes + 2
  ) {
    throw httpError(422, `${capitalize(label)} contains invalid base64 data.`);
  }
  const buffer = Buffer.from(encoded, "base64");
  const canonicalInput = encoded.replace(/=+$/u, "");
  const canonicalOutput = buffer.toString("base64").replace(/=+$/u, "");
  if (!buffer.length || canonicalInput !== canonicalOutput) {
    throw httpError(422, `${capitalize(label)} contains invalid base64 data.`);
  }
  if (buffer.length > maximumBytes) {
    throw httpError(
      413,
      `${capitalize(label)} exceeds the ${formatMegabytes(maximumBytes)} MB limit.`,
    );
  }
  return { buffer, mediaType };
}

function validateImageSignature(buffer, extension) {
  const ascii = (start, end) => buffer.subarray(start, end).toString("ascii");
  const valid = {
    ".png":
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ".jpg":
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
    ".jpeg":
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
    ".gif": ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a",
    ".webp":
      buffer.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP",
    ".bmp": buffer.length >= 2 && ascii(0, 2) === "BM",
    ".avif":
      buffer.length >= 12 &&
      ascii(4, 8) === "ftyp" &&
      new Set(["avif", "avis", "mif1", "msf1"]).has(ascii(8, 12)),
  }[extension];
  if (!valid) {
    throw httpError(
      422,
      `The uploaded file does not contain valid ${extension} image data.`,
    );
  }
}

function markdownImageAlt(filename) {
  return filename
    .replace(/\.[^.]+$/u, "")
    .replace(/[\[\]\\]/gu, "")
    .trim();
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatMegabytes(bytes) {
  return Math.round(bytes / 1024 / 1024);
}

async function ensureSafeDirectDirectory(directory, parent) {
  const parentInfo = await lstat(parent);
  if (parentInfo.isSymbolicLink() || !parentInfo.isDirectory()) {
    throw httpError(500, "An approved local directory is not safe to use.");
  }
  try {
    await mkdir(directory);
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }
  const info = await lstat(directory);
  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw httpError(500, "A local asset directory must not be a link.");
  }
  const [physicalParent, physicalDirectory] = await Promise.all([
    realpath(parent),
    realpath(directory),
  ]);
  assertWithin(physicalParent, physicalDirectory);
  return physicalDirectory;
}

class PicGoConnectionError extends Error {}

async function uploadToPicGoWithStartup(filePath) {
  let httpFailure;
  try {
    return await requestPicGoUpload(filePath);
  } catch (error) {
    httpFailure = error;
  }

  const settings = await readLocalSettings();
  if (!settings.picgoPath) {
    throw httpError(
      503,
      `PicGo HTTP upload failed (${shortError(httpFailure)}). Set the installed PicGo.exe path in Editor settings so the editor can use PicGo's official upload command as a fallback.`,
    );
  }
  const executable = await validatePicGoExecutable(settings.picgoPath);
  try {
    return await uploadWithPicGoCli(executable, filePath);
  } catch (error) {
    throw httpError(
      error?.statusCode === 504 ? 504 : 502,
      `PicGo HTTP upload failed (${shortError(httpFailure)}), and PicGo.exe upload failed (${shortError(error)}).`,
    );
  }
}

function shortError(error) {
  return String(error instanceof Error ? error.message : "unknown error")
    .replace(/\s+/gu, " ")
    .slice(0, 400);
}

async function requestPicGoUpload(filePath) {
  let response;
  try {
    response = await fetchWithTimeout(
      `${PICGO_SERVER}/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list: [filePath] }),
      },
      15_000,
    );
  } catch (error) {
    throw new PicGoConnectionError(
      `Could not connect to the PicGo server: ${error.message}`,
      { cause: error },
    );
  }

  const responseText = (await response.text()).slice(0, 200_000);
  if (!response.ok) {
    throw httpError(
      502,
      `PicGo returned HTTP ${response.status}${responseText ? `: ${responseText.slice(0, 300)}` : ""}`,
    );
  }
  let payload;
  try {
    payload = JSON.parse(responseText);
  } catch {
    throw httpError(502, "PicGo returned an unreadable response.");
  }
  if (payload?.success !== true) {
    const detail = String(payload?.message ?? payload?.error ?? "upload failed")
      .replace(/\s+/gu, " ")
      .slice(0, 300);
    throw httpError(502, `PicGo could not upload the image: ${detail}`);
  }
  const result = Array.isArray(payload.result)
    ? payload.result[0]
    : payload.result;
  const candidate =
    typeof result === "string"
      ? result
      : (result?.imgUrl ?? result?.url ?? payload?.data?.url);
  let uploadedUrl;
  try {
    uploadedUrl = new URL(String(candidate));
  } catch {
    throw httpError(502, "PicGo did not return a valid uploaded image URL.");
  }
  if (!new Set(["http:", "https:"]).has(uploadedUrl.protocol)) {
    throw httpError(502, "PicGo returned an unsupported image URL.");
  }
  return uploadedUrl.href;
}

async function uploadWithPicGoCli(executable, filePath) {
  if (process.platform !== "win32") {
    throw httpError(501, "PicGo.exe upload is available on Windows only.");
  }
  const clipboardBefore = await readWindowsClipboard();
  const child = spawn(executable, ["upload", filePath], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    shell: false,
  });
  let exited = false;
  let exitCode = null;
  child.once("close", (code) => {
    exited = true;
    exitCode = code;
  });
  await new Promise((resolvePromise, rejectPromise) => {
    child.once("spawn", resolvePromise);
    child.once("error", rejectPromise);
  });
  child.unref();

  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    const clipboardNow = await readWindowsClipboard();
    const uploadedUrl = firstHttpUrl(clipboardNow);
    if (uploadedUrl && clipboardNow !== clipboardBefore) {
      return uploadedUrl;
    }
    if (exited && exitCode !== 0) {
      throw httpError(
        502,
        `PicGo.exe upload exited with code ${exitCode ?? "unknown"}. Check PicGo's uploader configuration.`,
      );
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 750));
  }
  throw httpError(
    504,
    "Timed out waiting for PicGo to copy the uploaded image URL to the Windows clipboard. Check PicGo's uploader configuration and try again.",
  );
}

async function readWindowsClipboard() {
  let result;
  try {
    result = await captureProcess(
      "powershell.exe",
      [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Get-Clipboard -Raw",
      ],
      5_000,
    );
  } catch (error) {
    throw httpError(
      502,
      `Unable to read the Windows clipboard: ${error.message}`,
    );
  }
  if (!result.ok) {
    throw httpError(
      502,
      `Unable to read the Windows clipboard${result.output ? `: ${result.output.slice(0, 300)}` : "."}`,
    );
  }
  return result.output;
}

function firstHttpUrl(value) {
  for (const match of String(value ?? "").matchAll(
    /https?:\/\/[^\s<>"']+/giu,
  )) {
    const candidate = match[0].replace(/[\])},;]+$/gu, "");
    try {
      const url = new URL(candidate);
      if (new Set(["http:", "https:"]).has(url.protocol)) return url.href;
    } catch {
      // Keep looking if other clipboard text happens to resemble a URL.
    }
  }
  return null;
}

async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function listGpxAssets() {
  const routesDirectory = await safeRoutesDirectory();
  const names = await readdir(routesDirectory);
  const files = [];
  for (const name of names) {
    if (!/\.gpx$/iu.test(name) || name.startsWith(".")) continue;
    const filename = safeAssetFilename(name, new Set([".gpx"]), "GPX");
    const filePath = resolve(routesDirectory, filename);
    await assertRegularAssetPath(routesDirectory, filePath);
    const info = await stat(filePath);
    if (info.size > MAX_GPX_BYTES) {
      throw httpError(
        422,
        `${filename} exceeds the editor's ${formatMegabytes(MAX_GPX_BYTES)} MB GPX limit.`,
      );
    }
    files.push({
      filename,
      url: routePublicUrl(filename),
      size: info.size,
      modified: info.mtime.toISOString(),
    });
  }
  files.sort(
    (left, right) =>
      right.modified.localeCompare(left.modified) ||
      left.filename.localeCompare(right.filename),
  );
  return { files, directory: relative(REPO_ROOT, routesDirectory) };
}

async function importGpxAsset(input) {
  const filename = safeAssetFilename(input?.filename, new Set([".gpx"]), "GPX");
  const { buffer, mediaType } = decodeGpxInput(input);
  if (
    mediaType &&
    !new Set([
      "application/gpx+xml",
      "application/xml",
      "text/xml",
      "application/octet-stream",
    ]).has(mediaType)
  ) {
    throw httpError(422, `Unsupported GPX MIME type: ${mediaType}.`);
  }
  validateGpxXml(buffer);

  const routesDirectory = await safeRoutesDirectory();
  const target = resolve(routesDirectory, filename);
  assertWithin(routesDirectory, target);
  await assertRegularAssetPath(routesDirectory, target, true);
  const caseConflict = (await readdir(routesDirectory)).find(
    (entry) =>
      entry.toLocaleLowerCase("en-US") === filename.toLocaleLowerCase("en-US"),
  );
  if (caseConflict) {
    throw httpError(409, `A route asset named ${caseConflict} already exists.`);
  }

  const temporary = resolve(
    routesDirectory,
    `.${filename}.${process.pid}-${Date.now()}-${randomBytes(5).toString("hex")}.tmp`,
  );
  assertWithin(routesDirectory, temporary);
  await writeDurableFile(temporary, buffer);
  try {
    // A hard link makes the fully-written temporary file visible atomically and
    // fails if another process created the destination in the meantime.
    await link(temporary, target);
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw httpError(409, `A route asset named ${filename} already exists.`);
    }
    throw error;
  } finally {
    await rm(temporary, { force: true });
  }
  return {
    ok: true,
    filename,
    url: routePublicUrl(filename),
    size: buffer.length,
  };
}

async function createRouteContentFromGpx(input) {
  const filename = safeAssetFilename(input?.filename, new Set([".gpx"]), "GPX");
  const language = input?.lang === "en" ? "en" : "zh-CN";
  if (input?.lang !== undefined && !new Set(["zh-CN", "en"]).has(input.lang)) {
    throw httpError(422, "Route language must be zh-CN or en.");
  }
  if (input?.geocode !== undefined && typeof input.geocode !== "boolean") {
    throw httpError(422, "Route geocode must be a boolean.");
  }
  const routesDirectory = await safeRoutesDirectory();
  const source = resolve(routesDirectory, filename);
  assertWithin(routesDirectory, source);
  try {
    await assertRegularAssetPath(routesDirectory, source);
  } catch (error) {
    if (error?.code === "ENOENT") throw httpError(404, "GPX asset not found.");
    throw error;
  }

  const contentInfo = await lstat(ROUTES_CONTENT_ROOT);
  if (contentInfo.isSymbolicLink() || !contentInfo.isDirectory()) {
    throw httpError(500, "The routes content directory is not safe to use.");
  }
  const physicalRoutesContent = await realpath(ROUTES_CONTENT_ROOT);
  assertWithin(await realpath(CONTENT_ROOT), physicalRoutesContent);
  const backups = [];
  for (const name of await readdir(physicalRoutesContent)) {
    if (!/\.(?:md|mdx)$/iu.test(name) || name.startsWith(".")) continue;
    const entry = safeEntryPath("routes", name);
    await assertPhysicalEntryPath("routes", entry);
    backups.push(relative(REPO_ROOT, await backupFile(entry)));
  }

  const inputPath = relative(REPO_ROOT, source).split(sep).join("/");
  const args = [
    resolve(REPO_ROOT, "node_modules/tsx/dist/cli.mjs"),
    resolve(REPO_ROOT, "scripts/import-route.ts"),
    inputPath,
    `--lang=${language}`,
  ];
  if (input?.geocode === false) args.push("--no-geocode");
  const result = await captureProcess(process.execPath, args, 180_000);
  if (!result.ok) {
    throw httpError(
      502,
      `Route import failed${result.code == null ? "" : ` (exit ${result.code})`}: ${result.output || "no output"}`,
    );
  }
  const files = [
    ...result.output.matchAll(
      /(?:CREATED|UPDATED)\s+src\/content\/routes\/([^\s]+\.mdx?)/giu,
    ),
  ]
    .map((match) => match[1])
    .filter((value, index, values) => values.indexOf(value) === index);
  return {
    ok: true,
    filename,
    lang: language,
    files,
    backups,
    output: result.output,
  };
}

function decodeGpxInput(input) {
  if (
    typeof input?.content === "string" &&
    !input.content.startsWith("data:")
  ) {
    const buffer = Buffer.from(input.content, "utf8");
    if (!buffer.length) throw httpError(422, "GPX data is empty.");
    if (buffer.length > MAX_GPX_BYTES) {
      throw httpError(
        413,
        `GPX exceeds the ${formatMegabytes(MAX_GPX_BYTES)} MB limit.`,
      );
    }
    return { buffer, mediaType: "application/gpx+xml" };
  }
  return decodeBase64Payload(
    input?.dataUrl ?? input?.base64 ?? input?.content,
    MAX_GPX_BYTES,
    "GPX",
  );
}

function validateGpxXml(buffer) {
  let source;
  try {
    source = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    throw httpError(422, "GPX must be valid UTF-8 text.");
  }
  if (/\u0000/u.test(source))
    throw httpError(422, "GPX contains invalid data.");
  if (/<!DOCTYPE|<!ENTITY/iu.test(source)) {
    throw httpError(422, "GPX document types and entities are not allowed.");
  }
  const start =
    /^\uFEFF?\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<(?:[\w.-]+:)?gpx\b[^>]*>/iu;
  const end = /<\/(?:[\w.-]+:)?gpx\s*>\s*(?:<!--[\s\S]*?-->\s*)*$/iu;
  if (!start.test(source) || !end.test(source)) {
    throw httpError(
      422,
      "The selected file is not a complete GPX XML document.",
    );
  }
}

async function deleteGpxAsset(input) {
  const filename = safeAssetFilename(input?.filename, new Set([".gpx"]), "GPX");
  const routesDirectory = await safeRoutesDirectory();
  const target = resolve(routesDirectory, filename);
  assertWithin(routesDirectory, target);
  try {
    await assertRegularAssetPath(routesDirectory, target);
  } catch (error) {
    if (error?.code === "ENOENT") throw httpError(404, "GPX asset not found.");
    throw error;
  }
  const backup = await backupGpxAsset(target, filename);
  await unlink(target);
  return { ok: true, backup: relative(REPO_ROOT, backup) };
}

async function backupGpxAsset(source, filename) {
  const backupRoot = await ensureSafeDirectDirectory(BACKUP_ROOT, TOOL_DIR);
  const stamp = `${new Date().toISOString().replace(/[:.]/gu, "-")}-${randomBytes(4).toString("hex")}`;
  const stampDirectory = await ensureSafeDirectDirectory(
    resolve(backupRoot, stamp),
    backupRoot,
  );
  const routesBackupDirectory = await ensureSafeDirectDirectory(
    resolve(stampDirectory, "routes"),
    stampDirectory,
  );
  const destination = resolve(routesBackupDirectory, filename);
  assertWithin(routesBackupDirectory, destination);
  await copyFile(source, destination, fsConstants.COPYFILE_EXCL);
  return destination;
}

async function openRoutesExplorer() {
  if (!explorerIntegrationAvailable()) {
    throw httpError(501, "Explorer integration is available on Windows only.");
  }
  const routesDirectory = await safeRoutesDirectory();
  await launchWindowsExplorer([routesDirectory]);
  return { ok: true, target: "routes-directory" };
}

async function safeRoutesDirectory() {
  const publicInfo = await lstat(SITE_PUBLIC_ROOT);
  if (publicInfo.isSymbolicLink() || !publicInfo.isDirectory()) {
    throw httpError(500, "The repository public directory must not be a link.");
  }
  const routesDirectory = await ensureSafeDirectDirectory(
    ROUTES_ROOT,
    SITE_PUBLIC_ROOT,
  );
  const [physicalRepository, physicalRoutes] = await Promise.all([
    realpath(REPO_ROOT),
    realpath(routesDirectory),
  ]);
  assertWithin(physicalRepository, physicalRoutes);
  return physicalRoutes;
}

async function assertRegularAssetPath(root, target, allowMissing = false) {
  assertWithin(root, target);
  try {
    const info = await lstat(target);
    if (info.isSymbolicLink() || !info.isFile()) {
      throw httpError(400, "Asset paths must be regular files, not links.");
    }
    const physicalTarget = await realpath(target);
    assertWithin(root, physicalTarget);
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") return;
    throw error;
  }
}

function routePublicUrl(filename) {
  return `/routes/${encodeURIComponent(filename)}`;
}

async function assertPhysicalEntryPath(
  collection,
  target,
  allowMissing = false,
) {
  const directory = collectionDirectory(collection);
  const [physicalContentRoot, physicalDirectory] = await Promise.all([
    realpath(CONTENT_ROOT),
    realpath(directory),
  ]);
  assertWithin(physicalContentRoot, physicalDirectory);
  try {
    const info = await lstat(target);
    if (info.isSymbolicLink() || !info.isFile()) {
      throw httpError(
        400,
        "Content entries must be regular files, not links or directories.",
      );
    }
    const physicalTarget = await realpath(target);
    assertWithin(physicalDirectory, physicalTarget);
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") return;
    throw error;
  }
}

async function listEntries(collection) {
  const directory = collectionDirectory(collection);
  const names = await readdir(directory);
  const entries = [];
  const errors = [];
  for (const filename of names) {
    if (!/\.(?:md|mdx)$/iu.test(filename) || filename.startsWith("_")) continue;
    try {
      const filePath = safeEntryPath(collection, filename);
      await assertPhysicalEntryPath(collection, filePath);
      const source = await readFile(filePath, "utf8");
      const parsed = parseDocument(source);
      const fileStat = await stat(filePath);
      entries.push({
        filename,
        title: parsed.fields.title || filename.replace(/\.(?:md|mdx)$/iu, ""),
        date: parsed.fields.date || "",
        lang: parsed.fields.lang || "zh-CN",
        draft: parsed.fields.draft === true,
        translationKey: parsed.fields.translationKey || "",
        slug: effectiveSlug(filename, parsed.fields),
        modified: fileStat.mtime.toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unreadable file";
      errors.push({ filename, message });
      console.warn(`Skipped unreadable content entry ${filename}: ${message}`);
    }
  }
  entries.sort(
    (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      a.title.localeCompare(b.title),
  );
  return { entries, errors };
}

async function readEntry(collection, filename) {
  const filePath = safeEntryPath(collection, filename);
  await assertPhysicalEntryPath(collection, filePath);
  let source;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") throw httpError(404, "Entry not found.");
    throw error;
  }
  const parsed = parseDocument(source);
  return {
    collection,
    filename,
    fields: parsed.fields,
    frontmatter: parsed.frontmatter,
    body: parsed.body,
    slug: effectiveSlug(filename, parsed.fields),
    version: contentVersion(source),
  };
}

async function saveEntry(input) {
  const collection = input?.collection;
  const filename = String(input?.filename ?? "").trim();
  const originalFile = input?.originalFile ? String(input.originalFile) : null;
  const target = safeEntryPath(collection, filename);
  const original = originalFile
    ? safeEntryPath(collection, originalFile)
    : null;
  await assertPhysicalEntryPath(collection, target, true);
  if (original && !pathsEqual(original, target))
    await assertPhysicalEntryPath(collection, original);
  const fields = normalizeFields(input?.fields);
  validateFields(fields);
  const changedFields = normalizeChangedFields(
    input?.changedFields,
    originalFile === null,
  );

  let frontmatter = String(input?.frontmatter ?? "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (/^---\s*$/m.test(frontmatter)) {
    throw httpError(
      400,
      "Frontmatter must not contain its own --- delimiters.",
    );
  }
  frontmatter = patchFrontmatter(frontmatter, fields, changedFields);
  const body = String(input?.body ?? "").replace(/\r\n?/g, "\n");
  const content = `---\n${frontmatter}\n---\n\n${body.replace(/^\n+/, "")}`;

  const targetExists = await fileExists(target);
  const editingSameFile = original && pathsEqual(original, target);
  if (targetExists && !editingSameFile)
    throw httpError(409, "A file with that name already exists.");
  if (original) await assertUnchanged(original, input?.originalVersion);

  const caseConflict = (await readdir(collectionDirectory(collection))).find(
    (entry) =>
      entry.toLocaleLowerCase("en-US") ===
        filename.toLocaleLowerCase("en-US") && entry !== originalFile,
  );
  if (caseConflict && !editingSameFile) {
    throw httpError(
      409,
      `Filename conflicts with existing file ${caseConflict}.`,
    );
  }

  const slug = effectiveSlug(filename, fields);
  const duplicate = await findDuplicateSlug(collection, slug, originalFile);
  if (duplicate)
    throw httpError(409, `Slug “${slug}” is already used by ${duplicate}.`);

  let backup = null;
  if (editingSameFile && targetExists) backup = await backupFile(target);
  if (original && !editingSameFile) backup = await backupFile(original);

  await atomicCreateOrReplace(
    target,
    content,
    targetExists && editingSameFile,
    backup,
  );
  if (original && !editingSameFile) {
    try {
      await unlink(original);
    } catch (error) {
      await rm(target, { force: true });
      throw new Error(
        `The new file was removed because renaming the original failed: ${error.message}`,
      );
    }
  }
  return {
    ok: true,
    filename,
    slug,
    version: contentVersion(content),
    backup: backup ? relative(REPO_ROOT, backup) : null,
  };
}

async function deleteEntry(input) {
  const target = safeEntryPath(input?.collection, input?.filename);
  await assertPhysicalEntryPath(input?.collection, target);
  if (!(await fileExists(target))) throw httpError(404, "Entry not found.");
  await assertUnchanged(target, input?.originalVersion);
  const backup = await backupFile(target);
  await unlink(target);
  return { ok: true, backup: relative(REPO_ROOT, backup) };
}

async function findDuplicateSlug(collection, slug, excludedFilename) {
  const { entries } = await listEntries(collection);
  const normalized = slug.toLocaleLowerCase("en-US");
  return entries.find(
    (entry) =>
      entry.filename !== excludedFilename &&
      entry.slug.toLocaleLowerCase("en-US") === normalized,
  )?.filename;
}

function parseDocument(source) {
  const normalized = source.replace(/\r\n?/g, "\n");
  const match = normalized.match(
    /^\uFEFF?---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/,
  );
  if (!match)
    throw httpError(
      422,
      "The file does not contain valid frontmatter delimiters.",
    );
  const frontmatter = match[1];
  return {
    frontmatter,
    fields: parseManagedFields(frontmatter),
    body: normalized.slice(match[0].length).replace(/^\n/, ""),
  };
}

function topLevelBlocks(frontmatter) {
  const lines = frontmatter ? frontmatter.split("\n") : [];
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z_][\w-]*):(?:\s*(.*))?$/);
    if (match) starts.push({ key: match[1], index, value: match[2] ?? "" });
  }
  return starts.map((start, position) => ({
    ...start,
    end: starts[position + 1]?.index ?? lines.length,
    lines: lines.slice(
      start.index,
      starts[position + 1]?.index ?? lines.length,
    ),
  }));
}

function parseManagedFields(frontmatter) {
  const result = {};
  for (const block of topLevelBlocks(frontmatter)) {
    if (!MANAGED_FIELDS.includes(block.key)) continue;
    if (block.key === "tags") {
      result.tags = parseYamlList(block);
    } else if (block.key === "draft" || block.key === "featured") {
      result[block.key] = block.value.trim().toLowerCase() === "true";
    } else {
      result[block.key] = parseYamlScalar(block.value);
    }
  }
  return result;
}

function parseYamlList(block) {
  const inline = block.value.trim();
  if (inline.startsWith("[") && inline.endsWith("]")) {
    return inline
      .slice(1, -1)
      .split(",")
      .map((item) => String(parseYamlScalar(item.trim())))
      .filter(Boolean);
  }
  return block.lines
    .slice(1)
    .map((line) => line.match(/^\s+-\s+(.*)$/)?.[1])
    .filter((value) => value !== undefined)
    .map((value) => String(parseYamlScalar(value)))
    .filter(Boolean);
}

function parseYamlScalar(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  const comment = trimmed.search(/\s+#/);
  return comment >= 0 ? trimmed.slice(0, comment).trim() : trimmed;
}

function patchFrontmatter(frontmatter, fields, changedFields) {
  const lines = frontmatter ? frontmatter.split("\n") : [];
  const blocks = topLevelBlocks(frontmatter);
  const blockByIndex = new Map(blocks.map((block) => [block.index, block]));
  const existingKeys = new Set(blocks.map((block) => block.key));
  const output = [];
  for (let index = 0; index < lines.length;) {
    const block = blockByIndex.get(index);
    if (block && MANAGED_FIELDS.includes(block.key)) {
      output.push(
        ...(changedFields.has(block.key)
          ? serializeManagedField(block.key, fields[block.key])
          : block.lines),
      );
      index = block.end;
    } else {
      output.push(lines[index]);
      index += 1;
    }
  }
  const missing = MANAGED_FIELDS.filter(
    (key) => !existingKeys.has(key) && changedFields.has(key),
  ).flatMap((key) => serializeManagedField(key, fields[key]));
  return [...missing, ...output].join("\n").replace(/^\n+|\n+$/g, "");
}

function serializeManagedField(key, value) {
  if (key === "tags") {
    const tags = Array.isArray(value)
      ? value
          .map(String)
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    return tags.length
      ? [`${key}:`, ...tags.map((tag) => `  - ${quoteYaml(tag)}`)]
      : [`${key}: []`];
  }
  if (key === "draft" || key === "featured")
    return [`${key}: ${value === true ? "true" : "false"}`];
  if (value === undefined || value === null || String(value).trim() === "")
    return [];
  return [`${key}: ${quoteYaml(String(value).trim())}`];
}

function quoteYaml(value) {
  return JSON.stringify(value)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function normalizeFields(input) {
  const fields = {};
  for (const key of MANAGED_FIELDS) {
    if (key === "tags") {
      fields.tags = Array.isArray(input?.tags)
        ? input.tags
        : String(input?.tags ?? "").split(",");
    } else if (key === "draft" || key === "featured") {
      fields[key] = input?.[key] === true;
    } else {
      fields[key] = String(input?.[key] ?? "").trim();
    }
  }
  return fields;
}

function normalizeChangedFields(input, isNewEntry) {
  if (isNewEntry || input === undefined) return new Set(MANAGED_FIELDS);
  if (!Array.isArray(input)) {
    throw httpError(422, "Changed fields must be an array.");
  }
  const changed = new Set();
  for (const value of input) {
    if (typeof value !== "string" || !MANAGED_FIELDS.includes(value)) {
      throw httpError(422, "Changed fields contain an unknown field name.");
    }
    changed.add(value);
  }
  return changed;
}

function validateFields(fields) {
  if (!fields.title) throw httpError(422, "Title is required.");
  const date = fields.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsedDate = date
    ? new Date(Date.UTC(Number(date[1]), Number(date[2]) - 1, Number(date[3])))
    : null;
  if (
    !date ||
    parsedDate.getUTCFullYear() !== Number(date[1]) ||
    parsedDate.getUTCMonth() !== Number(date[2]) - 1 ||
    parsedDate.getUTCDate() !== Number(date[3])
  ) {
    throw httpError(422, "Date must be a valid YYYY-MM-DD value.");
  }
  if (!new Set(["zh-CN", "en"]).has(fields.lang))
    throw httpError(422, "Language must be zh-CN or en.");
  if (fields.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(fields.slug)) {
    throw httpError(
      422,
      "Slug may contain only letters, numbers, and single hyphens.",
    );
  }
}

function effectiveSlug(filename, fields) {
  if (fields.slug) return String(fields.slug).trim();
  const stem = filename.replace(/\.(?:md|mdx)$/iu, "");

  // Astro derives content slugs with GitHub-style normalization: lowercase,
  // remove punctuation/symbols, preserve hyphens/underscores, and turn ASCII
  // spaces into hyphens. Keeping this local avoids a second content format or
  // a runtime dependency in the editor.
  return stem
    .toLocaleLowerCase("en-US")
    .replace(/[\p{Cc}\p{Cf}\p{P}\p{S}\p{Z}]/gu, (character) => {
      if (character === " ") return "-";
      if (character === "-" || character === "_") return character;
      return "";
    });
}

function pathsEqual(left, right) {
  return process.platform === "win32"
    ? left.toLocaleLowerCase("en-US") === right.toLocaleLowerCase("en-US")
    : left === right;
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function contentVersion(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

async function assertUnchanged(filePath, expectedVersion) {
  if (!expectedVersion || !/^[a-f0-9]{64}$/u.test(String(expectedVersion))) {
    throw httpError(
      428,
      "Reload this entry before changing it (missing version token).",
    );
  }
  const current = await readFile(filePath, "utf8");
  if (contentVersion(current) !== expectedVersion) {
    throw httpError(
      409,
      "This file changed on disk after it was opened. Reload it before saving.",
    );
  }
}

async function backupFile(filePath) {
  const backupRoot = await ensureSafeDirectDirectory(BACKUP_ROOT, TOOL_DIR);
  const stamp = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomBytes(4).toString("hex")}`;
  const stampDirectory = await ensureSafeDirectDirectory(
    resolve(backupRoot, stamp),
    backupRoot,
  );
  const rel = relative(CONTENT_ROOT, filePath);
  const relativeDirectory = dirname(rel);
  const backupDirectory = await ensureSafeDirectDirectory(
    resolve(stampDirectory, relativeDirectory),
    stampDirectory,
  );
  const destination = resolve(backupDirectory, basename(filePath));
  assertWithin(backupDirectory, destination);
  await copyFile(filePath, destination, fsConstants.COPYFILE_EXCL);
  return destination;
}

async function atomicCreateOrReplace(target, content, replacing, backup) {
  await mkdir(dirname(target), { recursive: true });
  const temp = join(
    dirname(target),
    `.${basename(target)}.${process.pid}-${Date.now()}.tmp`,
  );
  await writeFile(temp, content, { encoding: "utf8", flag: "wx" });
  try {
    if (replacing) await unlink(target);
    await rename(temp, target);
  } catch (error) {
    await rm(temp, { force: true });
    if (replacing && backup && !(await fileExists(target)))
      await copyFile(backup, target);
    throw error;
  }
}

async function openExplorer(input) {
  if (!explorerIntegrationAvailable())
    throw httpError(501, "Explorer integration is available on Windows only.");
  const directory = collectionDirectory(input?.collection);
  const logicalDirectoryInfo = await lstat(directory);
  if (
    logicalDirectoryInfo.isSymbolicLink() ||
    !logicalDirectoryInfo.isDirectory()
  ) {
    throw httpError(
      500,
      "The selected content collection must be a real local directory, not a link.",
    );
  }
  const [physicalContentRoot, physicalDirectory] = await Promise.all([
    realpath(CONTENT_ROOT),
    realpath(directory),
  ]);
  assertWithin(physicalContentRoot, physicalDirectory);
  const directoryInfo = await lstat(physicalDirectory);
  if (!directoryInfo.isDirectory()) {
    throw httpError(500, "The selected content collection is not a directory.");
  }
  let args = [physicalDirectory];
  let target = "content-directory";
  if (input?.filename) {
    const filePath = safeEntryPath(input.collection, input.filename);
    await assertPhysicalEntryPath(input.collection, filePath);
    if (!(await fileExists(filePath))) throw httpError(404, "Entry not found.");
    const physicalFile = await realpath(filePath);
    assertWithin(physicalDirectory, physicalFile);
    args = ["/select,", physicalFile];
    target = "content-file";
  }
  await launchWindowsExplorer(args);
  return { ok: true, target };
}

function explorerIntegrationAvailable() {
  return process.platform === "win32" || explorerTestHookEnabled();
}

function explorerTestHookEnabled() {
  return (
    process.env.EDITOR_TEST_MODE === "1" &&
    typeof process.env.EDITOR_EXPLORER_TEST_LOG === "string" &&
    process.env.EDITOR_EXPLORER_TEST_LOG.length > 0
  );
}

async function windowsExplorerExecutable() {
  const roots = [process.env.SystemRoot, process.env.WINDIR, "C:\\Windows"];
  const attempted = [];
  for (const root of roots) {
    if (typeof root !== "string" || !win32Path.isAbsolute(root)) continue;
    const candidate = win32Path.resolve(root, "explorer.exe");
    if (win32Path.basename(candidate).toLowerCase() !== "explorer.exe")
      continue;
    attempted.push(candidate);
    try {
      const info = await stat(candidate);
      if (!info.isFile()) continue;
      const physicalPath = await realpath(candidate);
      if (win32Path.basename(physicalPath).toLowerCase() === "explorer.exe") {
        return physicalPath;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw httpError(
    500,
    `Unable to locate Windows Explorer at an absolute system path (${attempted.join(", ") || "no Windows directory was available"}).`,
  );
}

async function launchWindowsExplorer(args) {
  if (
    !Array.isArray(args) ||
    args.length === 0 ||
    args.some((argument) => typeof argument !== "string" || !argument)
  ) {
    throw httpError(500, "Invalid Windows Explorer launch arguments.");
  }

  if (explorerTestHookEnabled()) {
    await recordExplorerTestLaunch(args);
    return;
  }

  const executable = await windowsExplorerExecutable();
  await new Promise((resolvePromise, rejectPromise) => {
    let settled = false;
    let child;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    const timer = setTimeout(() => {
      finish(
        rejectPromise,
        httpError(
          504,
          "Windows Explorer did not acknowledge the launch request.",
        ),
      );
    }, 5_000);
    try {
      child = spawn(executable, args, {
        detached: true,
        stdio: "ignore",
        // Explorer is an interactive UI, so do not inherit the hidden-window
        // setting used for background npm/PicGo helper processes.
        windowsHide: false,
        shell: false,
      });
    } catch (error) {
      finish(
        rejectPromise,
        httpError(
          500,
          `Unable to start Windows Explorer: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return;
    }
    child.once("error", (error) => {
      finish(
        rejectPromise,
        httpError(500, `Unable to start Windows Explorer: ${error.message}`),
      );
    });
    child.once("spawn", () => {
      child.unref();
      finish(resolvePromise);
    });
  });
}

async function recordExplorerTestLaunch(args) {
  const testRoot = await ensureSafeDirectDirectory(TEMP_ROOT, TOOL_DIR);
  const logPath = resolve(process.env.EDITOR_EXPLORER_TEST_LOG);
  assertWithin(testRoot, logPath);
  if (dirname(logPath) !== testRoot || extname(logPath) !== ".jsonl") {
    throw httpError(
      500,
      "The Explorer test log must be a direct .jsonl file in .temp.",
    );
  }
  const existing = await pathKind(logPath);
  if (existing && existing !== "file") {
    throw httpError(500, "The Explorer test log must be a regular file.");
  }
  await writeFile(logPath, `${JSON.stringify({ args })}\n`, {
    encoding: "utf8",
    flag: "a",
  });
}

async function gitStatus() {
  const result = await captureProcess(
    "git",
    ["status", "--short", "--", "src/content"],
    15_000,
  );
  return { ...result, output: result.output || "Content files are clean." };
}

async function runProjectTask(input) {
  const started = await startProjectTask(input);
  const record = projectTasks.get(started.id);
  await record.completion;
  const output = record.outputTruncated
    ? `[earlier output truncated]\n${record.output}`
    : record.output;
  return {
    ok: record.status === "succeeded",
    code: record.code,
    output: output.trim(),
    status: record.status,
    elapsedMs: elapsedProjectTask(record),
    outputTruncated: record.outputTruncated,
  };
}

async function startProjectTask(input) {
  pruneProjectTasks();
  const requestedTask = input?.task;
  const definition =
    typeof requestedTask === "string" &&
    Object.hasOwn(PROJECT_TASKS, requestedTask)
      ? PROJECT_TASKS[requestedTask]
      : null;
  if (!definition) {
    throw httpError(400, "Only the lint and build tasks are allowed.");
  }

  // Reserve the single task slot before the first await. Node can serve a
  // second POST while npmInvocation() is resolving filesystem paths; delaying
  // this assignment until afterward would allow two tasks to start.
  if (activeProjectTaskId) {
    const active = projectTasks.get(activeProjectTaskId);
    throw httpError(
      409,
      active?.status === "cleanup_failed"
        ? "The previous task's process tree could not be confirmed stopped. Restart the local editor before running another task."
        : `A ${active?.task ?? "project"} task is already running. Wait for it to finish before starting another task.`,
    );
  }
  const id = randomBytes(16).toString("hex");
  let resolveCompletion;
  const record = {
    id,
    task: definition.task,
    script: definition.script,
    status: "starting",
    startedAt: new Date().toISOString(),
    startedAtMs: Date.now(),
    finishedAt: null,
    finishedAtMs: null,
    code: null,
    output: "",
    outputOffset: 0,
    outputTruncated: false,
    completion: new Promise((resolvePromise) => {
      resolveCompletion = resolvePromise;
    }),
  };
  projectTasks.set(id, record);
  activeProjectTaskId = id;

  let invocation;
  let child;
  try {
    invocation = await npmInvocation(["run", definition.script]);
    assertNativeSpawnCommand(invocation.command);
    child = spawn(invocation.command, invocation.args, {
      cwd: REPO_ROOT,
      windowsHide: true,
      detached: process.platform !== "win32",
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    projectTasks.delete(id);
    if (activeProjectTaskId === id) activeProjectTaskId = null;
    resolveCompletion();
    throw httpError(
      500,
      `Unable to start the ${definition.task} task: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  let finished = false;
  let timedOut = false;
  let childClosed = false;
  let timeout;
  const finish = (status, code, message = "", releaseLock = true) => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    if (message) appendProjectTaskOutput(record, message);
    record.status = status;
    record.code = Number.isInteger(code) ? code : null;
    record.finishedAtMs = Date.now();
    record.finishedAt = new Date(record.finishedAtMs).toISOString();
    if (releaseLock && activeProjectTaskId === id) activeProjectTaskId = null;
    resolveCompletion();
  };

  child.stdout.on("data", (chunk) => appendProjectTaskOutput(record, chunk));
  child.stderr.on("data", (chunk) => appendProjectTaskOutput(record, chunk));
  child.once("spawn", () => {
    record.status = "running";
  });
  child.once("error", (error) => {
    finish(
      "failed",
      null,
      `\nUnable to start the ${definition.task} task: ${error.message}\n`,
    );
  });
  child.once("close", (code) => {
    childClosed = true;
    // During timeout cleanup, taskkill/process-group termination owns the
    // terminal transition. Releasing the lock here could race tree cleanup.
    if (!timedOut) finish(code === 0 ? "succeeded" : "failed", code);
  });

  timeout = setTimeout(() => {
    timedOut = true;
    record.status = "stopping";
    appendProjectTaskOutput(
      record,
      `\n[task timed out after ${Math.round(TASK_TIMEOUT_MS / 1000)} seconds; stopping process]\n`,
    );
    void terminateProjectTaskTree(child, () => childClosed)
      .then((message) => finish("timed_out", child.exitCode, `\n${message}\n`))
      .catch((error) =>
        finish(
          "cleanup_failed",
          child.exitCode,
          `\n[process-tree cleanup failed: ${error instanceof Error ? error.message : String(error)}]\n[The task lock remains engaged. Restart the local editor before running another task.]\n`,
          false,
        ),
      );
  }, TASK_TIMEOUT_MS);

  return projectTaskStatus(id, 0);
}

async function terminateProjectTaskTree(child, isClosed) {
  if (!Number.isInteger(child.pid) || child.pid <= 0) {
    throw new Error("The task process did not expose a valid numeric PID.");
  }
  if (process.platform === "win32") {
    const executable = await windowsTaskkillExecutable();
    const result = await captureNativeProcess(
      executable,
      ["/PID", String(child.pid), "/T", "/F"],
      TASK_TERMINATION_GRACE_MS,
    );
    if (result.code !== 0 && !isClosed()) {
      throw new Error(
        `taskkill.exe exited with code ${result.code}${result.output ? `: ${result.output}` : ""}`,
      );
    }
    const closed = await waitForChildClose(child, TASK_TERMINATION_GRACE_MS);
    if (!closed) {
      throw new Error(
        "taskkill.exe returned but the task process did not report that it closed.",
      );
    }
    if (
      process.env.EDITOR_TEST_MODE === "1" &&
      process.env.EDITOR_TEST_TASK_CLEANUP_FAILURE === "1"
    ) {
      throw new Error(
        "Simulated cleanup reporting failure after taskkill.exe and child close.",
      );
    }
    return result.code === 0
      ? "Windows process tree stopped with taskkill.exe."
      : "Task process exited before taskkill.exe completed.";
  }

  signalProcessGroup(child.pid, "SIGTERM");
  if (!(await waitForChildClose(child, TASK_TERMINATION_GRACE_MS))) {
    signalProcessGroup(child.pid, "SIGKILL");
    if (!(await waitForChildClose(child, TASK_TERMINATION_GRACE_MS))) {
      throw new Error("The task process group did not exit after SIGKILL.");
    }
  }
  if (
    process.env.EDITOR_TEST_MODE === "1" &&
    process.env.EDITOR_TEST_TASK_CLEANUP_FAILURE === "1"
  ) {
    throw new Error(
      "Simulated cleanup reporting failure after process-group and child close.",
    );
  }
  return "POSIX process group stopped.";
}

async function windowsTaskkillExecutable() {
  const roots = [process.env.SystemRoot, process.env.WINDIR, "C:\\Windows"];
  const attempted = [];
  for (const root of roots) {
    if (typeof root !== "string" || !win32Path.isAbsolute(root)) continue;
    const candidate = win32Path.resolve(root, "System32", "taskkill.exe");
    if (win32Path.basename(candidate).toLowerCase() !== "taskkill.exe")
      continue;
    attempted.push(candidate);
    try {
      const info = await stat(candidate);
      if (!info.isFile()) continue;
      const physicalPath = await realpath(candidate);
      if (win32Path.basename(physicalPath).toLowerCase() === "taskkill.exe") {
        return physicalPath;
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw new Error(
    `Unable to locate taskkill.exe at an absolute system path (${attempted.join(", ") || "no Windows directory was available"}).`,
  );
}

function captureNativeProcess(command, args, timeout) {
  assertNativeSpawnCommand(command);
  return new Promise((resolvePromise, rejectPromise) => {
    let child;
    try {
      child = spawn(command, args, {
        cwd: REPO_ROOT,
        windowsHide: true,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      rejectPromise(error);
      return;
    }
    let output = "";
    const append = (chunk) => {
      if (output.length < 16_384) output += chunk.toString("utf8");
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    let settled = false;
    let timer;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    child.once("error", (error) => finish(rejectPromise, error));
    timer = setTimeout(() => {
      child.kill();
      finish(
        rejectPromise,
        new Error(`${basename(command)} did not exit in time.`),
      );
    }, timeout);
    child.once("close", (code) => {
      finish(resolvePromise, { code, output: output.trim() });
    });
  });
}

function waitForChildClose(child, timeout) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve(true);
  }
  return new Promise((resolvePromise) => {
    let settled = false;
    const finish = (closed) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.off("close", onClose);
      resolvePromise(closed);
    };
    const onClose = () => finish(true);
    const timer = setTimeout(() => finish(false), timeout);
    child.once("close", onClose);
  });
}

function signalProcessGroup(pid, signal) {
  try {
    process.kill(-pid, signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

function appendProjectTaskOutput(record, chunk) {
  record.output += Buffer.isBuffer(chunk)
    ? chunk.toString("utf8")
    : String(chunk);
  if (record.output.length <= TASK_OUTPUT_LIMIT) return;
  const dropped = record.output.length - TASK_OUTPUT_LIMIT;
  record.output = record.output.slice(dropped);
  record.outputOffset += dropped;
  record.outputTruncated = true;
}

function projectTaskStatus(id, cursorValue) {
  pruneProjectTasks();
  const record = projectTasks.get(id);
  if (!record) throw httpError(404, "Project task not found or expired.");
  const cursor = parseTaskCursor(cursorValue);
  const effectiveCursor = Math.max(cursor, record.outputOffset);
  const output = record.output.slice(effectiveCursor - record.outputOffset);
  return {
    id: record.id,
    task: record.task,
    status: record.status,
    ok:
      record.status === "succeeded"
        ? true
        : new Set(["failed", "timed_out", "cleanup_failed"]).has(record.status)
          ? false
          : null,
    code: record.code,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    elapsedMs: elapsedProjectTask(record),
    output,
    nextCursor: effectiveCursor + output.length,
    retainedFrom: record.outputOffset,
    outputTruncated: record.outputTruncated,
    cursorReset: cursor < record.outputOffset,
  };
}

function parseTaskCursor(value) {
  if (value === null || value === "") return 0;
  if (!/^\d{1,15}$/u.test(value)) {
    throw httpError(400, "Task output cursor must be a non-negative integer.");
  }
  const cursor = Number(value);
  if (!Number.isSafeInteger(cursor)) {
    throw httpError(400, "Task output cursor is too large.");
  }
  return cursor;
}

function elapsedProjectTask(record) {
  return Math.max(0, (record.finishedAtMs ?? Date.now()) - record.startedAtMs);
}

function pruneProjectTasks() {
  const now = Date.now();
  const finished = [...projectTasks.values()]
    .filter(
      (record) =>
        record.finishedAtMs !== null && record.id !== activeProjectTaskId,
    )
    .sort((left, right) => left.finishedAtMs - right.finishedAtMs);
  for (const record of finished) {
    if (
      now - record.finishedAtMs > TASK_RETENTION_MS ||
      projectTasks.size > MAX_RETAINED_TASKS
    ) {
      projectTasks.delete(record.id);
    }
  }
}

function assertNativeSpawnCommand(command) {
  if (
    process.platform === "win32" &&
    /\.(?:bat|cmd)$/iu.test(String(command))
  ) {
    throw httpError(
      500,
      "Windows batch commands cannot be launched directly. Use a native executable or run a JavaScript CLI with node.exe.",
    );
  }
}

async function npmInvocation(args) {
  if (process.platform !== "win32") return { command: "npm", args };

  // Node 24 rejects direct .cmd/.bat execution with shell:false on Windows.
  // Run npm's JavaScript entry point with the current node.exe instead. This
  // also keeps every argument separate and avoids cmd.exe quoting/injection.
  const candidates = [
    process.env.npm_execpath,
    resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
    resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.cjs"),
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate !== "string" ||
      !isAbsolute(candidate) ||
      !/\.(?:cjs|mjs|js)$/iu.test(candidate)
    ) {
      continue;
    }
    try {
      if ((await stat(candidate)).isFile()) {
        return {
          command: process.execPath,
          args: [await realpath(candidate), ...args],
        };
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw httpError(
    500,
    "Unable to locate npm's JavaScript CLI. Start the editor with `npm run editor`, or repair the local Node.js/npm installation.",
  );
}

function captureProcess(command, args, timeout) {
  assertNativeSpawnCommand(command);
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      windowsHide: true,
      shell: false,
    });
    let output = "";
    let truncated = false;
    const append = (chunk) => {
      if (truncated) return;
      output += chunk.toString("utf8");
      if (output.length > 500_000) {
        output = `${output.slice(0, 500_000)}\n[output truncated]`;
        truncated = true;
      }
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.on("error", rejectPromise);
    const timer = setTimeout(() => child.kill(), timeout);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({ ok: code === 0, code, output: output.trim() });
    });
  });
}

async function serveStatic(pathname, response) {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!new Set(["index.html", "editor.js", "styles.css"]).has(requested)) {
    return sendJson(response, 404, { error: "Not found" });
  }
  const filePath = resolve(PUBLIC_ROOT, requested);
  assertWithin(PUBLIC_ROOT, filePath);
  let handle;
  try {
    handle = await open(filePath, "r");
    const body = await handle.readFile();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
    };
    response.writeHead(200, {
      "Content-Type": types[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch (error) {
    if (error?.code === "ENOENT")
      return sendJson(response, 404, { error: "Not found" });
    throw error;
  } finally {
    await handle?.close();
  }
}
