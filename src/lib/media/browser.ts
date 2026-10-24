const PAGE_SIZE = 24;

export function initMediaBrowser(root: HTMLElement) {
  const cards = [...root.querySelectorAll<HTMLElement>("[data-media-item]")];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>("[data-cat]")];
  const search = root.querySelector<HTMLInputElement>("#media-search")!;
  const more = root.querySelector<HTMLButtonElement>("[data-media-more]")!;
  const count = root.querySelector<HTMLElement>("[data-media-count]")!;
  const empty = root.querySelector<HTMLElement>("[data-media-empty]")!;
  const url = new URL(window.location.href);
  let category = url.searchParams.get("category") ?? "all";
  if (!tabs.some((tab) => tab.dataset.cat === category)) category = "all";
  let limit = PAGE_SIZE;
  const entries = cards.map((element) => ({
    element,
    search: (element.dataset.search ?? "").toLocaleLowerCase(),
  }));

  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    let total = 0;
    for (const item of entries) {
      const matches =
        (category === "all" || item.element.dataset.category === category) &&
        item.search.includes(query);
      item.element.hidden = !matches || ++total > limit;
    }
    tabs.forEach((tab) =>
      tab.setAttribute("aria-pressed", String(tab.dataset.cat === category)),
    );
    count.textContent = (count.dataset.template ?? "{shown} / {total}")
      .replace("{shown}", String(Math.min(limit, total)))
      .replace("{total}", String(total));
    empty.hidden = total > 0;
    more.hidden = total <= limit;
  }

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      category = tab.dataset.cat!;
      limit = PAGE_SIZE;
      const currentUrl = new URL(window.location.href);
      if (category === "all") currentUrl.searchParams.delete("category");
      else currentUrl.searchParams.set("category", category);
      window.history.replaceState({}, "", currentUrl);
      render();
    }),
  );
  search.addEventListener("input", () => {
    limit = PAGE_SIZE;
    render();
  });
  more.addEventListener("click", () => {
    const previouslyVisible = new Set(cards.filter((card) => !card.hidden));
    limit += PAGE_SIZE;
    render();
    cards
      .find((card) => !card.hidden && !previouslyVisible.has(card))
      ?.querySelector<HTMLAnchorElement>("a")
      ?.focus({ preventScroll: true });
  });
  render();
  root.querySelector<HTMLElement>("[data-media-controls]")!.hidden = false;
}
