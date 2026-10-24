import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual Astro script with DOM/animation doubles; no browser or server.
const source = readFileSync("src/components/Navigation.astro", "utf8").match(
  /<script>([\s\S]*?)<\/script>/,
)![1];
const code = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
}).outputText;

class Element extends EventTarget {
  style = { overflow: "", minHeight: "" };
  dataset = { openLabel: "Open navigation", closeLabel: "Close navigation" };
  attributes = new Map<string, string>();
  selectors = new Map<string, Element>();
  links: Element[] = [];
  parent: Element | undefined;
  children: Element[] = [];
  open = false;
  focused = false;
  animations: ReturnType<Element["animate"]>[] = [];
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  querySelector(name: string) {
    return this.selectors.get(name) ?? null;
  }
  querySelectorAll(name: string) {
    return name === "a" ? this.links : [];
  }
  getBoundingClientRect() {
    return { height: 72 };
  }
  focus() {
    this.focused = true;
  }
  insertBefore(child: Element, reference?: Element) {
    if (child.parent)
      child.parent.children = child.parent.children.filter(
        (item) => item !== child,
      );
    child.parent = this;
    const index = reference
      ? this.children.indexOf(reference)
      : this.children.length;
    this.children.splice(index, 0, child);
  }
  prepend(child: Element) {
    this.insertBefore(child, this.children[0]);
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
    queueMicrotask(() => this.dispatchEvent(new Event("close")));
  }
  animate(frames: Keyframe[], options: KeyframeAnimationOptions) {
    let resolve!: () => void, reject!: (error: Error) => void;
    const finished = new Promise<void>((yes, no) => {
      resolve = yes;
      reject = no;
    });
    const animation = {
      frames,
      options,
      finished,
      resolve,
      cancelled: false,
      cancel() {
        this.cancelled = true;
        reject(new Error("Cancelled"));
      },
    };
    this.animations.push(animation);
    return animation;
  }
}

function setup(reducedMotion = false) {
  const toggle = new Element(),
    menu = new Element(),
    header = new Element();
  const nav = new Element(),
    drawer = new Element(),
    link = new Element();
  header.insertBefore(nav);
  header.insertBefore(menu);
  menu.insertBefore(drawer);
  header.selectors.set(".site-nav", nav);
  menu.selectors.set(".garden-mobile__body", drawer);
  menu.links = [link];
  const reduced = Object.assign(new EventTarget(), { matches: reducedMotion });
  const desktop = Object.assign(new EventTarget(), { matches: false });
  const document = Object.assign(new Element(), {
    body: new Element(),
    documentElement: new Element(),
    getElementById: (id: string) =>
      id === "mobile-menu-toggle" ? toggle : null,
  });
  document.selectors.set("#mobile-menu", menu);
  document.selectors.set("[data-site-header]", header);
  document.body.style.overflow = "scroll";
  document.documentElement.style.overflow = "auto";
  header.style.minHeight = "2rem";
  const window = new EventTarget();
  vm.runInNewContext(code, {
    document,
    window,
    exports: {},
    Node: Element,
    require: (name: string) => {
      assert.equal(name, "../lib/theme");
      return { initTheme: () => {}, toggleTheme: () => {} };
    },
    matchMedia: (query: string) =>
      query.includes("reduced") ? reduced : desktop,
  });
  const click = () => toggle.dispatchEvent(new Event("click"));
  const restored = () => {
    assert.equal(menu.open, false);
    assert.equal(nav.parent, header);
    assert.equal(header.children[0], nav);
    assert.equal(document.body.style.overflow, "scroll");
    assert.equal(document.documentElement.style.overflow, "auto");
    assert.equal(header.style.minHeight, "2rem");
    assert.equal(toggle.attributes.get("aria-expanded"), "false");
  };
  return {
    toggle,
    menu,
    nav,
    header,
    drawer,
    link,
    document,
    window,
    reduced,
    desktop,
    click,
    restored,
  };
}

test("drawer moves the original toolbar and animates only its content", () => {
  const e = setup();
  e.click();
  assert.equal(e.menu.open, true);
  assert.equal(e.nav.parent, e.menu);
  assert.equal(e.header.style.minHeight, "72px");
  assert.equal(e.document.body.style.overflow, "hidden");
  assert.equal(e.toggle.attributes.get("aria-label"), "Close navigation");
  assert.equal(e.nav.animations.length, 0);
  assert.equal(e.drawer.animations[0].frames[0].transform, "translateX(100%)");
});

test("rapid close and repeated close finish once, restoring focus and scrolling", async () => {
  const e = setup();
  e.click();
  e.click();
  e.click();
  assert.equal(e.drawer.animations.length, 2);
  assert.equal(e.drawer.animations[0].cancelled, true);
  e.drawer.animations[1].resolve();
  await Promise.resolve();
  e.restored();
  assert.equal(e.toggle.focused, true);
});

test("Escape uses the exit animation; reduced motion finishes it immediately", () => {
  const e = setup();
  e.click();
  const event = new Event("cancel", { cancelable: true });
  e.menu.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(e.menu.open, true);
  e.reduced.matches = true;
  e.reduced.dispatchEvent(new Event("change"));
  e.restored();
});

test("reduced motion opens and closes without an animation", () => {
  const e = setup(true);
  e.click();
  e.click();
  assert.equal(e.drawer.animations.length, 0);
  e.restored();
});

test("desktop resize and page exit restore synchronously without waiting for close", () => {
  for (const action of ["resize", "pagehide", "link"]) {
    const e = setup();
    e.click();
    if (action === "resize") {
      e.desktop.matches = true;
      e.desktop.dispatchEvent(
        Object.assign(new Event("change"), { matches: true }),
      );
    } else if (action === "pagehide")
      e.window.dispatchEvent(new Event("pagehide"));
    else e.link.dispatchEvent(new Event("click"));
    e.restored();
  }
});

test("a queued close event cannot dismantle a newly reopened drawer", async () => {
  const e = setup(true);
  e.click();
  e.click();
  e.click();
  await Promise.resolve();
  assert.equal(e.menu.open, true);
  assert.equal(e.nav.parent, e.menu);
  assert.equal(e.toggle.attributes.get("aria-expanded"), "true");
});
