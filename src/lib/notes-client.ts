export function initNoteTimelines() {
  document
    .querySelectorAll<HTMLElement>("[data-note-timeline]")
    .forEach((timeline) => {
      if (timeline.dataset.initialized) return;
      timeline.dataset.initialized = "true";
      timeline
        .querySelectorAll<HTMLElement>("[data-note-copy]")
        .forEach((copy) => {
          const button =
            copy.querySelector<HTMLButtonElement>("[data-note-expand]");
          const body = copy.querySelector<HTMLElement>("[data-note-body]");
          const excerpt = copy.querySelector<HTMLElement>(
            "[data-note-excerpt]",
          );
          if (!button || !body || !excerpt) return;
          const expand = (open: boolean) => {
            body.hidden = !open;
            excerpt.hidden = open;
            button.setAttribute("aria-expanded", String(open));
            button.textContent = open
              ? button.dataset.closeLabel!
              : button.dataset.openLabel!;
          };
          button.hidden = false;
          expand(false);
          button.addEventListener("click", () => {
            const opening = body.hidden;
            expand(opening);
            if (!opening) button.scrollIntoView({ block: "nearest" });
          });
        });
      const dialog =
        timeline.querySelector<HTMLDialogElement>("[data-note-viewer]");
      if (!dialog || typeof dialog.showModal !== "function") return;
      const image = document.createElement("img");
      const stage = dialog.querySelector<HTMLElement>(
        "[data-note-photo-stage]",
      )!;
      const caption = dialog.querySelector<HTMLElement>(
        "[data-note-photo-caption]",
      )!;
      const count = dialog.querySelector<HTMLElement>(
        "[data-note-photo-count]",
      )!;
      const previous = dialog.querySelector<HTMLButtonElement>(
        "[data-note-photo-prev]",
      )!;
      const next = dialog.querySelector<HTMLButtonElement>(
        "[data-note-photo-next]",
      )!;
      let photos: HTMLAnchorElement[] = [];
      let position = 0;
      let opener: HTMLAnchorElement | undefined;
      let overflow = "";
      const show = (index: number) => {
        position = index;
        image.src = photos[index].href;
        image.alt = photos[index].querySelector("img")?.alt ?? "";
        stage.replaceChildren(image);
        caption.textContent = image.alt;
        count.textContent = `${index + 1} / ${photos.length}`;
        previous.disabled = index === 0;
        next.disabled = index === photos.length - 1;
        previous.hidden = next.hidden = photos.length === 1;
      };
      timeline.addEventListener("click", (event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link = (event.target as Element).closest<HTMLAnchorElement>(
          "a[data-note-photo]",
        );
        if (!link) return;
        event.preventDefault();
        photos = [
          ...link
            .closest("[data-note-entry]")!
            .querySelectorAll<HTMLAnchorElement>("[data-note-photo]"),
        ];
        opener = link;
        show(photos.indexOf(link));
        overflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
        dialog.showModal();
      });
      previous.addEventListener("click", () => {
        if (position > 0) show(position - 1);
      });
      next.addEventListener("click", () => {
        if (position < photos.length - 1) show(position + 1);
      });
      dialog
        .querySelector("[data-note-photo-close]")!
        .addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft" && position > 0) {
          event.preventDefault();
          show(position - 1);
        }
        if (event.key === "ArrowRight" && position < photos.length - 1) {
          event.preventDefault();
          show(position + 1);
        }
      });
      dialog.addEventListener("close", () => {
        document.documentElement.style.overflow = overflow;
        image.remove();
        opener?.focus({ preventScroll: true });
      });
    });
}
