import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { createNote, prepare, check, approve } from "./core.mjs";
if (existsSync(".env.content")) process.loadEnvFile(".env.content");
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    file: { type: "string" },
    title: { type: "string" },
    type: { type: "string" },
    inbox: { type: "string" },
    lang: { type: "string" },
    confirm: { type: "boolean" },
  },
});
try {
  const action = positionals[0];
  const options = {
    file: values.file && resolve(values.file),
    title: values.title,
    format: values.type,
    lang: values.lang,
    inbox: values.inbox || process.env.CONTENT_INBOX,
    repo: process.cwd(),
  };
  if (["new", "prepare"].includes(action) && !options.inbox)
    throw new Error(
      "请用 --inbox 指定仓库外的笔记目录，或在 .env.content 设置 CONTENT_INBOX。",
    );
  if (action === "new") {
    if (!options.title) throw new Error("请提供 --title。");
    console.log(await createNote(options));
  } else {
    if (!options.file) throw new Error("请用 --file 指定一份 Markdown 文件。");
    if (action === "prepare") console.log(await prepare(options));
    else if (action === "check") {
      const result = await check(options);
      console.log(JSON.stringify(result, null, 2));
      if (result.errors.length) process.exitCode = 1;
    } else if (action === "approve") {
      if (!values.confirm)
        throw new Error(
          "请先审核 article.md 和 review.md；确认可公开后加 --confirm。",
        );
      console.log(JSON.stringify(await approve(options), null, 2));
    } else throw new Error("支持 new、prepare、check、approve。");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
