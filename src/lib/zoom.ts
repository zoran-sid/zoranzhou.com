import mediumZoom from "medium-zoom";

export function initMediumZoom() {
  mediumZoom("article img:not(.no-zoom)", {
    margin: 24,
    background: "var(--color-surface)",
    scrollOffset: 0,
  });
}
