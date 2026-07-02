/**
 * Restore original markdown files after enrichment.
 *
 * Run with: npx tsx scripts/restore-media.ts
 *
 * This script restores the original (simplified) markdown files
 * from .cache/media/originals/ back to src/content/.
 */

import { restoreOriginals } from "../src/lib/media/enricher";

async function main() {
  console.log("Restoring original media markdown files...");
  await restoreOriginals();
}

main();
