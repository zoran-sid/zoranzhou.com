import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createCommentLikeHandler } from "../src/lib/comment-like";
import { patchWalineLikes } from "./waline-like-plugin.mjs";

function deferred() {
  let resolve!: (value?: unknown) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("a like updates before the server responds and repeated taps send only once", async () => {
  const request = deferred();
  const likes = { value: [] as string[] };
  const comment = { objectId: "a", like: 2 };
  const states: string[] = [];
  let sent = 0;
  const toggle = createCommentLikeHandler({
    likes,
    save: async (_comment, liked) => {
      sent++;
      assert.equal(liked, true);
      return request.promise;
    },
    report: (_id, state) => states.push(state),
  });
  const pending = toggle(comment);
  assert.equal(comment.like, 3);
  assert.deepEqual(likes.value, ["a"]);
  assert.deepEqual(states, ["pending"]);
  await toggle(comment);
  assert.equal(sent, 1);
  request.resolve();
  await pending;
  assert.deepEqual(states, ["pending", "liked"]);
  assert.equal(comment.like, 3, "successful response must not increment twice");
});

test("failure rolls back only its own comment and a retry can succeed", async () => {
  const requests = [deferred(), deferred(), deferred()];
  const likes = { value: [] as string[] };
  const a = { objectId: "a", like: 0 };
  const b = { objectId: "b", like: 4 };
  const states: string[] = [];
  let sent = 0;
  const toggle = createCommentLikeHandler({
    likes,
    save: () => requests[sent++].promise,
    report: (id, state) => states.push(`${id}:${state}`),
  });
  const first = toggle(a);
  const second = toggle(b);
  requests[1].resolve();
  await second;
  requests[0].reject(new Error("offline"));
  await first;
  assert.equal(a.like, 0);
  assert.equal(b.like, 5);
  assert.deepEqual(likes.value, ["b"]);
  assert.ok(states.includes("a:error"));
  const retry = toggle(a);
  assert.equal(a.like, 1);
  requests[2].resolve();
  await retry;
  assert.deepEqual(likes.value, ["b", "a"]);
});

test("unlike updates immediately, never goes negative, and restores a failed removal", async () => {
  const request = deferred();
  const likes = { value: [12] };
  const comment = { objectId: 12, like: 0 };
  const toggle = createCommentLikeHandler({
    likes,
    save: async (_comment, liked) => {
      assert.equal(liked, false);
      return request.promise;
    },
    report: () => {},
  });
  const pending = toggle(comment);
  assert.equal(comment.like, 0);
  assert.deepEqual(likes.value, []);
  request.reject(new Error("server rejected"));
  await pending;
  assert.deepEqual(likes.value, [12]);
  assert.equal(comment.like, 0);
});

test("guarded patch matches the installed client and refuses silent version drift", () => {
  const source = readFileSync(
    new URL("../node_modules/@waline/client/dist/slim.js", import.meta.url),
    "utf8",
  );
  const patched = patchWalineLikes(source);
  assert.ok(patched.includes("le=zoranCreateCommentLikeHandler"));
  assert.ok(patched.includes('new CustomEvent("waline:like-feedback"'));
  assert.throws(() =>
    patchWalineLikes(source.replace("Dt=`3.16.1`", "Dt=`4.0.0`")),
  );
  assert.throws(() => patchWalineLikes(patched));
});
