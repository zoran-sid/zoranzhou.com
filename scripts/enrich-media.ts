/**
 * Prebuild script: enrich media metadata before Astro build.
 *
 * Run with: npx tsx scripts/enrich-media.ts
 *
 * This script:
 * 1. Scans all media markdown files (content/movies, tv, books, games)
 * 2. For each file with minimal frontmatter, fetches metadata from APIs
 * 3. Caches API results in .cache/media/
 * 4. Downloads poster images to public/media/posters/
 * 5. Writes enriched frontmatter back into the source .md files
 * 6. Backs up originals to .cache/media/originals/
 *
 * After build, run `npx tsx scripts/restore-media.ts` to restore originals.
 */

import { enrichAllMedia } from "../src/lib/media/enricher";

async function main() {
  console.log("=".repeat(60));
  console.log("Media Enrichment — Prebuild Script");
  console.log("=".repeat(60));

  const startTime = Date.now();

  try {
    await enrichAllMedia();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Enrichment complete in ${elapsed}s`);
    console.log("Run `npx tsx scripts/restore-media.ts` after build to restore originals.");
  } catch (err) {
    console.error("\n❌ Enrichment failed:", err);
    process.exit(1);
  }
}

main();
