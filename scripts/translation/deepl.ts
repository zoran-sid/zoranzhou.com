import { validateTranslations } from "./content.js";
import { normalizeEnglish } from "./normalization.js";

export async function translateTexts(
  texts: string[],
  key: string,
  context: string,
  request: typeof fetch = fetch,
): Promise<string[]> {
  const endpoint = key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
  const payload = (text: string[]) =>
    JSON.stringify({
      text,
      source_lang: "ZH",
      target_lang: "EN-US",
      preserve_formatting: true,
      context,
      split_sentences: "nonewlines",
    });
  const batches: string[][] = [];
  let batch: string[] = [];
  for (const text of texts) {
    if (Buffer.byteLength(payload([text])) > 120000)
      throw new Error("单段文字超出接口限制，本篇已记录到报告；原文未修改。");
    if (
      batch.length === 50 ||
      Buffer.byteLength(payload([...batch, text])) > 120000
    ) {
      batches.push(batch);
      batch = [];
    }
    batch.push(text);
  }
  if (batch.length) batches.push(batch);
  const results: string[] = [];
  for (const items of batches) {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await request(endpoint, {
          method: "POST",
          redirect: "error",
          headers: {
            Authorization: `DeepL-Auth-Key ${key}`,
            "Content-Type": "application/json",
          },
          body: payload(items),
          signal: AbortSignal.timeout(30000),
        });
      } catch {
        throw new Error(
          "DeepL 网络请求失败或超时。为避免重复计费，不自动重试网络异常。",
        );
      }
      if (response.status !== 429 || attempt === 2) break;
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
    if (!response?.ok) {
      const status = response?.status;
      const reasons: Record<number, string> = {
        403: "密钥无效或没有访问权限",
        456: "翻译额度已用完",
        429: "请求过于频繁，请稍后手动重试",
      };
      throw new Error(
        `DeepL 请求失败（HTTP ${status ?? "unknown"}）：${reasons[status ?? 0] ?? "请检查服务状态与请求限制"}。`,
      );
    }
    let value: any;
    try {
      value = await response.json();
    } catch {
      throw new Error("DeepL 返回了无效的 JSON。");
    }
    if (!Array.isArray(value?.translations))
      throw new Error("DeepL 返回格式不正确。");
    const translated = value.translations.map((item: any) =>
      typeof item?.text === "string" ? normalizeEnglish(item.text) : item?.text,
    );
    validateTranslations(items, translated);
    results.push(...translated);
  }
  return results;
}
