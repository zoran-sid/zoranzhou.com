import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { unpack, references } from "./core.mjs";
// Draft text is filtered at every public consumer. Local images/MDX imports in a
// draft can still be emitted by Astro compilation, so reject them before any build.
export async function privacyCheck(root = "src/content") {
  const failures = [];
  async function scan(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const file = join(dir, item.name);
      if (item.isDirectory()) {
        await scan(file);
        continue;
      }
      if (!/\.mdx?$/.test(item.name)) continue;
      const { data, body } = unpack(await readFile(file, "utf8"));
      const isTicket = relative(root, file).split(/[\\/]/)[0] === "tickets";
      if (
        !data.draft &&
        (data.publication === "approved" ||
          (!isTicket && !data.publication && !data.format)) &&
        data.published !== false
      )
        continue;
      if (
        references(body).some(
          (n) => n.type === "image" || n.type === "definition",
        ) ||
        data.cover ||
        data.gallery?.length ||
        data.photos?.length ||
        data.gpx ||
        /^import\s/m.test(body) ||
        /<img\b/.test(body)
      )
        failures.push(file);
    }
  }
  await scan(root);
  if (failures.length)
    throw new Error(
      `草稿含可能被编译或复制的资源。请先把原稿和专属资源移到仓库外，再构建：\n${failures.join("\n")}`,
    );
}
if (process.argv[1]?.endsWith("/privacy.mjs")) {
  await privacyCheck();
  console.log("草稿资源保护检查完成。");
}
