import { inferRemoteSize } from "astro:assets";

const ratios = new Map<string, Promise<number | undefined>>();
const PROBE_TIMEOUT_MS = 10_000;

/**
 * Reads a remote photo's proportions at build time so the gallery can show the
 * whole frame. Only the image header is downloaded. A slow or failing host never
 * blocks the build: the photo then keeps an uncropped fallback frame.
 */
export function remotePhotoRatio(src: string): Promise<number | undefined> {
  let ratio = ratios.get(src);
  if (!ratio) {
    const timeout = new Promise<undefined>((resolve) => {
      const timer = setTimeout(resolve, PROBE_TIMEOUT_MS, undefined);
      (timer as { unref?: () => void }).unref?.();
    });
    ratio = Promise.race([
      inferRemoteSize(src).then(({ width, height }) =>
        width > 0 && height > 0 ? width / height : undefined,
      ),
      timeout,
    ]).catch(() => undefined);
    ratios.set(src, ratio);
  }
  return ratio;
}
