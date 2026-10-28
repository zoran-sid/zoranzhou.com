import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  createCommentLikeHandler,
  createLikeTransport,
} from "../src/lib/comment-like";
import { patchWalineLikes } from "./waline-like-plugin.mjs";
const result = (liked = false, count = 2) => ({ objectId: "1", liked, count });
function setup(overrides: Record<string, unknown> = {}) {
  const likes = { value: [] as (string | number)[] };
  const user = { objectId: "alice", token: "token-a" };
  const states: string[] = [];
  const comment = { objectId: 1, like: 2 };
  let writes = 0;
  const handler = createCommentLikeHandler({
    likes,
    getUser: () => user,
    read: async () => [result()],
    save: async () => {
      writes++;
      return result(true, 3);
    },
    report: (_id, state) => states.push(state),
    ...overrides,
  });
  return { handler, likes, user, states, comment, writes: () => writes };
}

test("only signed-in accounts can like; a confirmed like cannot be toggled or repeated", async () => {
  const s = setup();
  s.user.token = "";
  await s.handler(s.comment);
  assert.equal(s.writes(), 0);
  assert.equal(s.comment.like, 2);
  assert.equal(s.states.at(-1), "login");
  s.user.token = "token-a";
  await Promise.all([s.handler(s.comment), s.handler(s.comment)]);
  assert.equal(s.writes(), 1);
  assert.equal(s.comment.like, 3);
  await s.handler(s.comment);
  assert.equal(s.writes(), 1);
  assert.deepEqual(s.likes.value, [1]);
});

test("a lost save response is reconciled against this account, without rolling back or resending", async () => {
  let stored = false,
    writes = 0;
  const s = setup({
    read: async () => [result(stored, stored ? 3 : 2)],
    save: async () => {
      writes++;
      stored = true;
      throw new Error("response lost");
    },
  });
  const pending = s.handler(s.comment);
  assert.equal(s.comment.like, 3);
  assert.equal(s.states[0], "pending");
  await pending;
  assert.equal(s.comment.like, 3);
  assert.equal(s.states.at(-1), "liked");
  assert.equal(writes, 1);
});

test("confirmed failure rolls back while unavailable confirmation stays uncertain", async () => {
  const s = setup({
    save: async () => {
      throw new Error("failed");
    },
  });
  await s.handler(s.comment);
  assert.equal(s.comment.like, 2);
  assert.equal(s.states.at(-1), "error");
  let reads = 0;
  const unknown = setup({
    read: async () => {
      if (reads++) throw new Error("offline");
      return [result()];
    },
    save: async () => {
      throw new Error("offline");
    },
  });
  await unknown.handler(unknown.comment);
  assert.equal(unknown.states.at(-1), "unknown");
  assert.equal(unknown.comment.like, 3);
});

test("server hydration restores likes across devices and switching accounts discards previous identity", async () => {
  const s = setup({
    read: async (_ids: string[], token: string) => [
      result(token === "token-a", 3),
    ],
  });
  await s.handler.sync([s.comment]);
  assert.deepEqual(s.likes.value, [1]);
  assert.equal(s.comment.like, 3);
  s.user.token = "token-b";
  await s.handler.sync([s.comment]);
  assert.deepEqual(s.likes.value, []);
  s.handler.dispose();
  await s.handler(s.comment);
  assert.equal(s.writes(), 0);
});

test("an existing account like discovered on click never sends a write", async () => {
  const s = setup({ read: async () => [result(true, 5)] });
  await s.handler(s.comment);
  assert.equal(s.writes(), 0);
  assert.equal(s.comment.like, 5);
});

test("an in-flight like cannot block or overwrite the next account's state", async () => {
  let finishRead!: (value: ReturnType<typeof result>[]) => void;
  const s = setup({
    read: async (_ids: string[], token: string) =>
      token === "token-a"
        ? new Promise((resolve) => {
            finishRead = resolve;
          })
        : [result(false, 2)],
  });
  const pending = s.handler(s.comment);
  assert.equal(s.comment.like, 3);
  s.user.token = "token-b";
  await s.handler.sync([s.comment]);
  assert.equal(s.comment.like, 2);
  assert.deepEqual(s.likes.value, []);
  finishRead([result(true, 3)]);
  await pending;
  assert.equal(s.comment.like, 2);
  assert.equal(s.writes(), 0);
  assert.equal(s.states.at(-1), "ready");
});

test("late hydration cannot clear a confirmed heart or restore a stale count", async () => {
  let finishHydration!: (value: ReturnType<typeof result>[]) => void;
  let reads = 0;
  const s = setup({
    read: async () =>
      ++reads === 1
        ? new Promise((resolve) => {
            finishHydration = resolve;
          })
        : [result()],
  });
  const hydration = s.handler.sync([s.comment]);
  await s.handler(s.comment);
  finishHydration([result(false, 2)]);
  await hydration;
  assert.equal(s.comment.like, 3);
  assert.deepEqual(s.likes.value, [1]);
  assert.equal(s.states.at(-1), "liked");
});

test("transport rejects old backend, non-JSON and invalid results; never falls back to legacy increment", async () => {
  for (const response of [
    new Response("not JSON"),
    Response.json({ errno: 0, data: {} }),
    Response.json({ errno: 403 }, { status: 403 }),
  ]) {
    const transport = createLikeTransport(
      "https://example.com",
      async () => response,
    );
    await assert.rejects(transport.read(["1"], "token"));
  }
  let request: RequestInit | undefined;
  const transport = createLikeTransport(
    "https://example.com",
    async (_url, options) => {
      request = options;
      return Response.json({
        errno: 0,
        data: { protocol: "account-likes-v1", ...result(true, 3) },
      });
    },
  );
  await transport.save("1", "token");
  assert.equal(request?.body, '{"like":true}');
  assert.equal(request?.cache, "no-store");
});

test("guarded patch matches installed client and refuses version drift", () => {
  const source = readFileSync(
    new URL("../node_modules/@waline/client/dist/slim.js", import.meta.url),
    "utf8",
  );
  const patched = patchWalineLikes(source);
  assert.ok(patched.includes("zoranCreateCommentLikeHandler"));
  assert.ok(patched.includes("like.sync(zoranFlattenComments(p.value))"));
  assert.throws(() =>
    patchWalineLikes(source.replace("Dt=`3.16.1`", "Dt=`4.0.0`")),
  );
  assert.throws(() => patchWalineLikes(patched));
});
