import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

class Events {
  listeners = new Map<string, Set<() => void>>();
  addEventListener(name: string, handler: () => void) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name)!.add(handler);
  }
  removeEventListener(name: string, handler: () => void) {
    this.listeners.get(name)?.delete(handler);
  }
  emit(name: string) {
    for (const handler of [...(this.listeners.get(name) ?? [])]) handler();
  }
}

let revision = 0;
async function setup(t: TestContext) {
  const classes = new Set<string>();
  const attributes = new Map<string, string>();
  const root = {
    dataset: {} as Record<string, string>,
    classList: {
      contains: (name: string) => classes.has(name),
      toggle: (name: string, on: boolean) =>
        on ? classes.add(name) : classes.delete(name),
      add: (name: string) => classes.add(name),
    },
  };
  const reduced = Object.assign(new Events(), { matches: false });
  const system = Object.assign(new Events(), { matches: false });
  let denied = false;
  const storage = new Map<string, string>();
  const localStorage = {
    getItem(key: string) {
      if (denied) throw new Error("Storage denied");
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (denied) throw new Error("Storage denied");
      storage.set(key, value);
    },
  };
  const animations: {
    options: KeyframeAnimationOptions;
    cancelled: boolean;
    finished: Promise<void>;
    resolve: () => void;
    cancel: () => void;
  }[] = [];
  const element = {
    animate(_frames: Keyframe[], options: KeyframeAnimationOptions) {
      let resolve!: () => void, reject!: (reason: Error) => void;
      const finished = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      const animation = {
        options,
        cancelled: false,
        finished,
        resolve,
        cancel() {
          this.cancelled = true;
          reject(new Error("Cancelled"));
        },
      };
      animations.push(animation);
      return animation;
    },
  };
  let now = 0,
    id = 0;
  const timers = new Map<number, { at: number; run: () => void }>();
  const window = Object.assign(new Events(), {
    matchMedia: (query: string) =>
      query.includes("reduced-motion") ? reduced : system,
    setTimeout: (run: () => void, delay: number) => {
      timers.set(++id, { at: now + delay, run });
      return id;
    },
    clearTimeout: (key: number) => timers.delete(key),
  });
  const document = Object.assign(new Events(), {
    hidden: false,
    documentElement: root,
    querySelector: (): typeof element | null => element,
    getElementById: () => ({
      setAttribute: (name: string, value: string) =>
        attributes.set(name, value),
    }),
  });
  for (const [name, value] of Object.entries({
    window,
    document,
    localStorage,
    matchMedia: window.matchMedia,
  })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, name, descriptor)
        : Reflect.deleteProperty(globalThis, name),
    );
  }
  // A fresh module represents a fresh document, including its in-memory preference.
  const theme = (await import(
    `../src/lib/theme.ts?case=${++revision}`
  )) as typeof import("../src/lib/theme");
  return {
    theme,
    document,
    window,
    root,
    reduced,
    system,
    storage,
    attributes,
    animations,
    timers,
    denyStorage: () => {
      denied = true;
    },
    advance(ms: number) {
      now += ms;
      for (const [key, timer] of [...timers])
        if (timer.at <= now) {
          timers.delete(key);
          timer.run();
        }
    },
    async finish() {
      animations.forEach((animation) => animation.resolve());
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

test("sunset commits the reading theme after daylight and clears the sequence", async (t) => {
  const e = await setup(t);
  assert.equal(e.theme.toggleTheme(), "dark");
  assert.equal(e.root.classList.contains("dark"), false);
  assert.equal(e.root.dataset.themeTransition, "to-dark");
  assert.equal(e.animations.length, 3);
  e.advance(1000);
  assert.equal(e.root.classList.contains("dark"), false);
  e.advance(200);
  assert.equal(e.root.classList.contains("dark"), true);
  await e.finish();
  assert.equal(e.root.dataset.themeTransition, undefined);
  assert.equal(e.attributes.get("aria-pressed"), "true");
  assert.equal(e.timers.size, 0);
  assert.equal(e.document.listeners.get("visibilitychange")?.size, 0);
});

test("dawn reverses the sky and sun and settles in the light theme", async (t) => {
  const e = await setup(t);
  e.theme.applyTheme("dark");
  assert.equal(e.theme.toggleTheme(), "light");
  assert.ok(
    e.animations.every(
      (animation) => animation.options.direction === "reverse",
    ),
  );
  e.advance(700);
  assert.equal(e.root.classList.contains("dark"), false);
  await e.finish();
  assert.equal(e.root.dataset.themeTransition, undefined);
});

test("rapid repeated clicks honor the last choice with no stale commit timer", async (t) => {
  const e = await setup(t);
  e.theme.toggleTheme();
  e.advance(200);
  assert.equal(e.theme.toggleTheme(), "light");
  e.advance(5000);
  assert.equal(e.root.classList.contains("dark"), false);
  assert.equal(e.storage.get("pref-theme"), "light");
  assert.equal(e.root.dataset.themeTransition, undefined);
  assert.ok(e.animations.every((animation) => animation.cancelled));
  assert.equal(e.timers.size, 0);
  e.theme.toggleTheme();
  e.advance(1200);
  assert.equal(e.root.classList.contains("dark"), true);
  await e.finish();
});

test("reduced motion switches immediately and cancels an in-flight sunset", async (t) => {
  const e = await setup(t);
  e.reduced.matches = true;
  e.theme.toggleTheme();
  assert.equal(e.animations.length, 0);
  assert.equal(e.root.classList.contains("dark"), true);
  e.reduced.matches = false;
  e.theme.toggleTheme();
  e.reduced.matches = true;
  e.reduced.emit("change");
  assert.equal(e.root.classList.contains("dark"), false);
  assert.equal(e.root.dataset.themeTransition, undefined);
  assert.equal(e.timers.size, 0);
});

test("hiding or leaving the page settles the target and releases animation work", async (t) => {
  const e = await setup(t);
  e.theme.toggleTheme();
  e.document.hidden = true;
  e.document.emit("visibilitychange");
  assert.equal(e.root.classList.contains("dark"), true);
  assert.equal(e.root.dataset.themeTransition, undefined);
  e.document.hidden = false;
  e.theme.toggleTheme();
  e.window.emit("pagehide");
  assert.equal(e.root.classList.contains("dark"), false);
  assert.equal(e.timers.size, 0);
});

test("invalid or blocked storage falls back to the system and retains this page's choice", async (t) => {
  const e = await setup(t);
  e.storage.set("pref-theme", "invalid");
  assert.equal(e.theme.getStoredTheme(), null);
  e.system.matches = true;
  e.denyStorage();
  e.theme.initTheme();
  e.theme.initTheme();
  assert.equal(e.root.classList.contains("dark"), true);
  assert.equal(e.system.listeners.get("change")?.size, 1);
  e.reduced.matches = true;
  e.theme.toggleTheme();
  assert.equal(e.theme.getStoredTheme(), "light");
  e.system.emit("change");
  assert.equal(e.root.classList.contains("dark"), false);
});

test("the pre-paint theme bootstrap works when storage access throws", () => {
  const source = readFileSync(
    new URL("../src/components/ThemeScript.astro", import.meta.url),
    "utf8",
  ).match(/<script is:inline>([\s\S]*?)<\/script>/)![1];
  const classes = new Set();
  vm.runInNewContext(source, {
    localStorage: {
      getItem() {
        throw new Error("Blocked");
      },
    },
    window: { matchMedia: () => ({ matches: true }) },
    document: {
      documentElement: {
        classList: { add: (value: string) => classes.add(value) },
      },
    },
  });
  assert.ok(classes.has("dark"));
});
