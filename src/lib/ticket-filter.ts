export function initTicketFilters() {
  document
    .querySelectorAll<HTMLElement>("[data-ticket-browser]")
    .forEach((root) => {
      const controls = root.querySelector<HTMLElement>(".ticket-filters");
      const buttons = root.querySelectorAll<HTMLButtonElement>(
        "[data-ticket-filter]",
      );
      const items = root.querySelectorAll<HTMLElement>("[data-ticket-item]");
      const count = root.querySelector<HTMLElement>("[data-ticket-count]");
      if (!controls || !count) return;
      controls.hidden = false;
      buttons.forEach((button) =>
        button.addEventListener("click", () => {
          const selected = button.dataset.ticketFilter;
          let visible = 0;
          items.forEach((item) => {
            item.hidden =
              selected !== "all" && item.dataset.ticketItem !== selected;
            if (!item.hidden) visible++;
          });
          buttons.forEach((control) =>
            control.setAttribute("aria-pressed", String(control === button)),
          );
          count.textContent =
            root.dataset.locale === "zh-CN"
              ? `${visible} 张票根 · 按日期由近到远`
              : `${visible} ${visible === 1 ? "ticket" : "tickets"} · newest first`;
        }),
      );
    });
}
