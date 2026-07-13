const state = {
  collection: "blog",
  collectionConfig: new Map(),
  entries: [],
  current: null,
  dirty: false,
  loading: false,
  assetBusy: false,
  token: "",
  autoFilename: false,
  touchedFields: new Set(),
  view: "visual",
  previewFrame: 0,
  visualDirty: false,
  visualBaseSource: "",
  visualSelection: null,
  visualSafetyMessage: "",
};

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`页面缺少必要控件 #${id}，请重新启动编辑器。`);
  return element;
}

// Keep JavaScript names independent from dashed HTML IDs. This explicit map also
// makes a missing control fail with a useful message before events are attached.
const elements = {
  collection: requiredElement("collection"),
  search: requiredElement("search"),
  entryCount: requiredElement("entry-count"),
  entryList: requiredElement("entry-list"),
  newButton: requiredElement("new-button"),
  emptyState: requiredElement("empty-state"),
  editorForm: requiredElement("editor-form"),
  editingLabel: requiredElement("editing-label"),
  message: requiredElement("message"),
  deleteButton: requiredElement("delete-button"),
  saveButton: requiredElement("save-button"),
  saveState: requiredElement("save-state"),
  explorerButton: requiredElement("explorer-button"),
  gitButton: requiredElement("git-button"),
  settingsButton: requiredElement("settings-button"),
  assetsButton: requiredElement("assets-button"),
  utilityDialog: requiredElement("utility-dialog"),
  dialogTitle: requiredElement("dialog-title"),
  dialogActions: requiredElement("dialog-actions"),
  dialogOutput: requiredElement("dialog-output"),
  checkButton: requiredElement("check-button"),
  buildButton: requiredElement("build-button"),
  suggestFilename: requiredElement("suggest-filename"),
  frontmatter: requiredElement("frontmatter"),
  body: requiredElement("body"),
  visualEditor: requiredElement("visual-editor"),
  visualWarning: requiredElement("visual-warning"),
  visualWarningText: requiredElement("visual-warning-text"),
  bodyPane: requiredElement("body-pane"),
  writingPanes: requiredElement("writing-panes"),
  headingSelect: requiredElement("heading-select"),
  writeTab: requiredElement("write-tab"),
  splitTab: requiredElement("split-tab"),
  previewTab: requiredElement("preview-tab"),
  preview: requiredElement("preview"),
  wordCount: requiredElement("word-count"),
  imageButton: requiredElement("image-button"),
  gpxButton: requiredElement("gpx-button"),
  imageInput: requiredElement("image-input"),
  gpxInput: requiredElement("gpx-input"),
  dropHint: requiredElement("drop-hint"),
  settingsDialog: requiredElement("settings-dialog"),
  settingsForm: requiredElement("settings-form"),
  picgoPath: requiredElement("picgo-path"),
  settingsStatus: requiredElement("settings-status"),
  settingsSave: requiredElement("settings-save"),
  assetsDialog: requiredElement("assets-dialog"),
  picgoSummary: requiredElement("picgo-summary"),
  assetImageButton: requiredElement("asset-image-button"),
  assetGpxButton: requiredElement("asset-gpx-button"),
  gpxExplorerButton: requiredElement("gpx-explorer-button"),
  gpxList: requiredElement("gpx-list"),
  routeLanguage: requiredElement("route-language"),
  toastRegion: requiredElement("toast-region"),
};

const fieldNames = [
  "title",
  "date",
  "description",
  "author",
  "lang",
  "translationKey",
  "slug",
  "tags",
  "draft",
  "featured",
  "filename",
];
const fields = Object.fromEntries(
  fieldNames.map((name) => [name, requiredElement(`field-${name}`)]),
);

boot().catch(showFatal);

async function boot() {
  const config = await api("/api/config");
  state.token = config.token;
  const labels = {
    blog: "博客 Blog",
    essays: "随笔 Essays",
    research: "研究 Research",
    projects: "项目 Projects",
    photos: "相册 Photos",
    routes: "路线 Routes",
  };
  for (const collection of config.collections) {
    state.collectionConfig.set(collection.id, collection);
    const option = document.createElement("option");
    option.value = collection.id;
    option.textContent = labels[collection.id] || collection.label;
    elements.collection.append(option);
  }
  if (!config.collections.some((item) => item.id === state.collection)) {
    state.collection = config.collections[0]?.id || "";
  }
  elements.collection.value = state.collection;
  bindEvents();
  applyCollectionCapabilities();
  setView(state.view);
  await refreshEntries();
}

function bindEvents() {
  elements.collection.addEventListener("change", async () => {
    if (!confirmDiscard()) {
      elements.collection.value = state.collection;
      return;
    }
    state.collection = elements.collection.value;
    applyCollectionCapabilities();
    closeEditor();
    await refreshEntries();
  });
  elements.search.addEventListener("input", renderEntries);
  elements.newButton.addEventListener("click", () => {
    if (state.collectionConfig.get(state.collection)?.canCreate === false) {
      void openAssets();
      return;
    }
    if (confirmDiscard()) newEntry();
  });
  elements.editorForm.addEventListener("input", (event) => {
    if (event.target === elements.body) schedulePreview();
    if (event.target === elements.visualEditor) {
      state.visualDirty = true;
      updateWordCount();
    }
    markDirty();
  });
  elements.editorForm.addEventListener("change", markDirty);
  elements.editorForm.addEventListener("submit", saveCurrent);
  elements.deleteButton.addEventListener("click", deleteCurrent);
  elements.suggestFilename.addEventListener("click", () => {
    fields.filename.value = suggestFilename(
      fields.title.value,
      fields.lang.value,
    );
    state.autoFilename = true;
    markDirty();
  });
  fields.title.addEventListener("input", updateAutomaticFilename);
  fields.lang.addEventListener("change", updateAutomaticFilename);
  fields.filename.addEventListener("input", () => {
    state.autoFilename = false;
  });
  for (const name of fieldNames.filter((name) => name !== "filename")) {
    const rememberChange = () => state.touchedFields.add(name);
    fields[name].addEventListener("input", rememberChange);
    fields[name].addEventListener("change", rememberChange);
  }
  elements.explorerButton.addEventListener("click", openExplorer);
  elements.gitButton.addEventListener("click", showGitStatus);
  elements.settingsButton.addEventListener("click", openSettings);
  elements.assetsButton.addEventListener("click", openAssets);
  elements.checkButton.addEventListener("click", () => runTask("check"));
  elements.buildButton.addEventListener("click", () => runTask("build"));
  elements.writeTab.addEventListener("click", () => setView("visual"));
  elements.splitTab.addEventListener("click", () => setView("source"));
  elements.previewTab.addEventListener("click", () => setView("preview"));
  elements.headingSelect.addEventListener("change", () => {
    applyHeading(
      elements.headingSelect.value === "p" ? "" : elements.headingSelect.value,
    );
    elements.headingSelect.value = "";
  });
  document.querySelectorAll("[data-format]").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      if (state.view === "visual") event.preventDefault();
    });
    button.addEventListener("click", () => applyFormat(button.dataset.format));
  });
  elements.imageButton.addEventListener("click", chooseImage);
  elements.assetImageButton.addEventListener("click", chooseImage);
  elements.gpxButton.addEventListener("click", chooseGpx);
  elements.assetGpxButton.addEventListener("click", chooseGpx);
  elements.imageInput.addEventListener("change", async () => {
    const file = elements.imageInput.files?.[0];
    elements.imageInput.value = "";
    if (file) await uploadImage(file);
  });
  elements.gpxInput.addEventListener("change", async () => {
    const file = elements.gpxInput.files?.[0];
    elements.gpxInput.value = "";
    if (file) await importGpx(file);
  });
  elements.settingsForm.addEventListener("submit", saveSettings);
  elements.gpxExplorerButton.addEventListener("click", openGpxExplorer);
  document.querySelectorAll(".dialog-close").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  for (const dialog of document.querySelectorAll("dialog")) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }
  elements.body.addEventListener("paste", handleBodyPaste);
  elements.visualEditor.addEventListener("paste", handleVisualPaste);
  elements.visualEditor.addEventListener("mouseup", rememberVisualSelection);
  elements.visualEditor.addEventListener("keyup", rememberVisualSelection);
  elements.visualEditor.addEventListener("focus", rememberVisualSelection);
  elements.visualEditor.addEventListener("click", (event) => {
    if (event.target.closest("a")) event.preventDefault();
  });
  elements.bodyPane.addEventListener("dragenter", handleDragEnter);
  elements.bodyPane.addEventListener("dragover", handleDragOver);
  elements.bodyPane.addEventListener("dragleave", handleDragLeave);
  elements.bodyPane.addEventListener("drop", handleDrop);
  document.addEventListener("selectionchange", rememberVisualSelection);
  document.addEventListener("keydown", handleShortcut);
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

async function refreshEntries(selectFilename) {
  elements.entryCount.textContent = "正在读取…";
  const data = await api(
    `/api/entries?collection=${encodeURIComponent(state.collection)}`,
  );
  state.entries = data.entries;
  renderEntries();
  if (data.errors?.length) {
    toast(
      `${data.errors.length} 个内容文件无法读取，已跳过；请查看终端中的详细提示。`,
      true,
      7000,
    );
  }
  if (selectFilename) {
    const match = state.entries.find(
      (entry) => entry.filename === selectFilename,
    );
    if (match) await loadEntry(match.filename);
  }
}

function renderEntries() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const visible = state.entries.filter((entry) =>
    [
      entry.title,
      entry.filename,
      entry.lang,
      entry.translationKey,
      entry.slug,
    ].some((value) => String(value).toLocaleLowerCase().includes(query)),
  );
  elements.entryCount.textContent = `显示 ${visible.length} 篇，共 ${state.entries.length} 篇`;
  elements.entryList.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "empty-list";
    empty.textContent = query ? "没有匹配的文章。" : "这个分类还没有文章。";
    elements.entryList.append(empty);
    return;
  }
  for (const entry of visible) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `entry-item${state.current?.filename === entry.filename ? " active" : ""}`;
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const meta = document.createElement("span");
    meta.className = "entry-meta";
    const language = document.createElement("span");
    language.className = "language";
    language.textContent = entry.lang === "en" ? "EN" : "中文";
    const date = document.createElement("span");
    date.textContent = String(entry.date || "无日期").slice(0, 10);
    meta.append(language, date);
    if (entry.draft) {
      const draft = document.createElement("span");
      draft.className = "draft-label";
      draft.textContent = "草稿";
      meta.append(draft);
    }
    button.append(title, meta);
    button.addEventListener("click", async () => {
      if (confirmDiscard()) await loadEntry(entry.filename);
    });
    elements.entryList.append(button);
  }
}

async function loadEntry(filename) {
  setLoading(true);
  try {
    const entry = await api(
      `/api/entry?collection=${encodeURIComponent(state.collection)}&file=${encodeURIComponent(filename)}`,
    );
    state.current = {
      filename: entry.filename,
      version: entry.version,
      isNew: false,
    };
    populate(entry);
    showEditor();
    setDirty(false);
    renderEntries();
  } catch (error) {
    toast(error.message, true);
  } finally {
    setLoading(false);
  }
}

function newEntry() {
  const today = new Date().toISOString().slice(0, 10);
  state.current = { filename: null, version: null, isNew: true };
  populate({
    filename: `new-entry-${today}.md`,
    fields: {
      date: today,
      lang: "zh-CN",
      author: "Zoran",
      tags: [],
      draft: true,
      featured: false,
    },
    frontmatter: "",
    body: "",
  });
  showEditor();
  setView(state.view);
  setDirty(true);
  renderEntries();
  fields.title.focus();
}

function applyCollectionCapabilities() {
  const canCreate =
    state.collectionConfig.get(state.collection)?.canCreate !== false;
  elements.newButton.textContent = canCreate ? "新建" : "由 GPX 生成";
  elements.newButton.title = canCreate
    ? "新建内容"
    : "请在素材库中选择 GPX 并生成路线内容";
  updateControlLock();
}

function populate(entry) {
  state.autoFilename = state.current?.isNew === true;
  state.touchedFields.clear();
  for (const name of fieldNames) {
    const input = fields[name];
    if (name === "filename") input.value = entry.filename || "";
    else if (name === "date") {
      input.value =
        String(entry.fields.date || "").match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";
    } else if (name === "tags")
      input.value = (entry.fields.tags || []).join(", ");
    else if (input.type === "checkbox")
      input.checked = entry.fields[name] === true;
    else input.value = entry.fields[name] || "";
  }
  elements.frontmatter.value = entry.frontmatter || "";
  elements.body.value = entry.body || "";
  state.visualBaseSource = elements.body.value;
  state.visualDirty = false;
  state.visualSelection = null;
  const visual = prepareVisualEditor(elements.body.value);
  state.view = visual.ok ? "visual" : "source";
  showVisualSafety(visual.reason || "");
  elements.editingLabel.textContent = entry.filename || "新文章";
  elements.deleteButton.hidden = state.current.isNew;
  hideMessage();
  setView(state.view, { initial: true });
}

function updateAutomaticFilename() {
  if (!state.autoFilename) return;
  fields.filename.value = suggestFilename(
    fields.title.value,
    fields.lang.value,
  );
  elements.editingLabel.textContent = fields.filename.value;
}

function showEditor() {
  elements.emptyState.hidden = true;
  elements.editorForm.hidden = false;
}

function closeEditor() {
  state.current = null;
  elements.emptyState.hidden = false;
  elements.editorForm.hidden = true;
  setDirty(false);
}

function markDirty() {
  if (!state.current) return;
  elements.editingLabel.textContent = fields.filename.value || "新文章";
  setDirty(true);
}

function setDirty(value) {
  state.dirty = value;
  elements.saveState.textContent = state.current
    ? value
      ? "有未保存的修改"
      : "已保存"
    : "尚未选择文章";
  elements.saveState.classList.toggle("dirty", value);
}

function confirmDiscard() {
  if (state.loading || state.assetBusy) {
    toast("当前操作尚未完成，请稍候。", true);
    return false;
  }
  return !state.dirty || window.confirm("当前修改尚未保存，确定放弃吗？");
}

async function saveCurrent(event) {
  event?.preventDefault();
  if (state.view === "visual" && !syncVisualToSource()) return;
  if (
    !state.current ||
    state.loading ||
    state.assetBusy ||
    !elements.editorForm.reportValidity()
  )
    return;
  setLoading(true);
  hideMessage();
  try {
    const filename = fields.filename.value.trim();
    const result = await api("/api/save", {
      method: "POST",
      body: {
        collection: state.collection,
        originalFile: state.current.filename,
        originalVersion: state.current.version,
        filename,
        fields: collectFields(),
        changedFields: [...state.touchedFields],
        frontmatter: elements.frontmatter.value,
        body: elements.body.value,
      },
    });
    state.current = {
      filename: result.filename,
      version: result.version,
      isNew: false,
    };
    setDirty(false);
    await refreshEntries(result.filename);
    showMessage(
      result.backup ? `保存成功；已备份到 ${result.backup}` : "保存成功。",
    );
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

function collectFields() {
  return {
    title: fields.title.value,
    date: fields.date.value,
    description: fields.description.value,
    author: fields.author.value,
    lang: fields.lang.value,
    translationKey: fields.translationKey.value,
    slug: fields.slug.value,
    tags: fields.tags.value
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    draft: fields.draft.checked,
    featured: fields.featured.checked,
  };
}

async function deleteCurrent() {
  if (!state.current?.filename) return;
  if (
    !window.confirm(`确定删除 ${state.current.filename} 吗？系统会先创建备份。`)
  )
    return;
  setLoading(true);
  try {
    const result = await api("/api/delete", {
      method: "POST",
      body: {
        collection: state.collection,
        filename: state.current.filename,
        originalVersion: state.current.version,
      },
    });
    closeEditor();
    await refreshEntries();
    toast(`已删除，备份位于 ${result.backup}`);
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    setLoading(false);
  }
}

async function openExplorer() {
  try {
    const result = await api("/api/explorer", {
      method: "POST",
      body: {
        collection: state.collection,
        filename: state.current?.filename || null,
      },
    });
    toast(
      result.target === "content-file"
        ? "已在 Windows 资源管理器中选中当前文件。"
        : "已打开内容目录。",
    );
  } catch (error) {
    toast(error.message, true);
  }
}

async function showGitStatus() {
  elements.utilityDialog.showModal();
  elements.dialogTitle.textContent = "内容文件 Git 状态";
  elements.dialogOutput.textContent = "正在读取…";
  elements.dialogActions.hidden = false;
  try {
    const result = await api("/api/git-status");
    elements.dialogOutput.textContent = result.output;
  } catch (error) {
    elements.dialogOutput.textContent = error.message;
  }
}

async function runTask(task) {
  const isCheck = task === "check";
  const requestedTask = isCheck ? "lint" : "build";
  const purpose = isCheck
    ? "检查 Astro 内容、schema 和 TypeScript，不生成或修改 GPX 内容。"
    : "编译完整静态网站到 dist/，供 Cloudflare 部署；不会把 GPX 转成 Markdown。远程图片处理时可能暂时没有新日志。";
  for (const button of [elements.checkButton, elements.buildButton]) {
    button.disabled = true;
  }
  elements.dialogTitle.textContent = isCheck ? "快速检查" : "部署前生产构建";
  elements.dialogOutput.textContent = `${purpose}\n\n状态：正在启动…`;
  try {
    let result = await api("/api/tasks", {
      method: "POST",
      body: { task: requestedTask },
    });
    let cursor = 0;
    let output = "";
    while (true) {
      if (result.cursorReset && cursor < result.retainedFrom) {
        output += "[部分早期输出已被服务器截断]\n";
      }
      output += result.output || "";
      cursor = result.nextCursor;
      renderTaskProgress(result, output, purpose);
      if (
        new Set(["succeeded", "failed", "timed_out", "cleanup_failed"]).has(
          result.status,
        )
      ) {
        break;
      }
      await wait(500);
      result = await api(`/api/tasks/${result.id}?cursor=${cursor}`);
    }
  } catch (error) {
    elements.dialogOutput.textContent = `${purpose}\n\n无法运行：${error.message}`;
  } finally {
    for (const button of [elements.checkButton, elements.buildButton]) {
      button.disabled = false;
    }
  }
}

function renderTaskProgress(result, output, purpose) {
  const labels = {
    starting: "正在启动",
    running: "正在运行",
    stopping: "正在停止超时任务",
    succeeded: "运行成功",
    failed: "运行失败",
    timed_out: "运行超时",
    cleanup_failed: "停止任务失败，请重启编辑器",
  };
  const status = labels[result.status] || result.status;
  const code = Number.isInteger(result.code) ? ` · 退出码 ${result.code}` : "";
  const shouldFollow =
    elements.dialogOutput.scrollHeight -
      elements.dialogOutput.scrollTop -
      elements.dialogOutput.clientHeight <
    48;
  elements.dialogOutput.textContent = `${purpose}\n\n状态：${status} · 已用时 ${formatElapsed(result.elapsedMs)}${code}\n\n${output || "等待命令输出…"}`;
  if (shouldFollow)
    elements.dialogOutput.scrollTop = elements.dialogOutput.scrollHeight;
}

function formatElapsed(milliseconds) {
  const seconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes
    ? `${minutes}分${String(seconds % 60).padStart(2, "0")}秒`
    : `${seconds}秒`;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function setView(view, options = {}) {
  if (!state.current && !options.initial) return false;
  const previous = state.view;
  if (
    previous === "visual" &&
    view !== "visual" &&
    !syncVisualToSource({ allowDiscard: view === "source" })
  ) {
    return false;
  }
  if (view === "visual" && previous !== "visual") {
    const visual = prepareVisualEditor(elements.body.value);
    if (!visual.ok) {
      showVisualSafety(visual.reason);
      state.view = "source";
      paintView("source");
      elements.body.focus();
      toast(
        "为避免损坏高级语法，此文章只能在源码 / MDX 模式中编辑。",
        true,
        6500,
      );
      return false;
    }
    showVisualSafety("");
  }
  state.view = view;
  paintView(view);
  if (view === "preview") updatePreview();
  else updateWordCount();
  if (view === "visual") elements.visualEditor.focus();
  if (view === "source") elements.body.focus();
  return true;
}

function paintView(view) {
  elements.writingPanes.className = `writing-panes ${view}`;
  const tabs = {
    visual: elements.writeTab,
    source: elements.splitTab,
    preview: elements.previewTab,
  };
  for (const [name, button] of Object.entries(tabs)) {
    const active = name === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  }
}

function schedulePreview() {
  updateWordCount();
  if (state.view !== "preview" || state.previewFrame) return;
  state.previewFrame = window.requestAnimationFrame(() => {
    state.previewFrame = 0;
    updatePreview();
  });
}

function updatePreview() {
  const body = elements.body.value;
  elements.preview.innerHTML = body.trim()
    ? renderMarkdown(body)
    : '<p class="preview-placeholder">预览会显示在这里。</p>';
  updateWordCount();
}

function updateWordCount() {
  const value =
    state.view === "visual"
      ? elements.visualEditor.textContent.trim()
      : elements.body.value.trim();
  const han =
    value.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
    )?.length || 0;
  const words =
    value
      .replace(
        /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
        " ",
      )
      .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length || 0;
  elements.wordCount.textContent = `${han + words} 字`;
}

function showVisualSafety(reason) {
  state.visualSafetyMessage = reason || "";
  elements.visualWarning.hidden = !reason;
  elements.visualWarningText.textContent = reason || "";
}

function prepareVisualEditor(source) {
  const reason = visualEditingRisk(source);
  if (reason) return { ok: false, reason };
  const html = source.trim() ? renderMarkdown(source) : "<p><br></p>";
  elements.visualEditor.innerHTML = html;
  try {
    // A dry serialization catches structures the renderer produced but the
    // Markdown writer cannot represent. The source itself is not changed here.
    visualEditorToMarkdown(elements.visualEditor);
  } catch (error) {
    elements.visualEditor.replaceChildren();
    return {
      ok: false,
      reason: `可视化往返检查未通过（${error.message}）；请使用源码模式以原样保留。`,
    };
  }
  state.visualBaseSource = source;
  state.visualDirty = false;
  state.visualSelection = null;
  return { ok: true };
}

function visualEditingRisk(source) {
  let fenceOpen = false;
  for (const line of String(source).replace(/\r\n?/g, "\n").split("\n")) {
    if (line.indexOf("```") > 0) {
      return "正文包含行内三反引号或缩进代码围栏；请使用源码模式以原样保留。";
    }
    if (!line.startsWith("```")) continue;
    if (!fenceOpen && !/^```[A-Za-z0-9_+-]*\s*$/.test(line)) {
      return "正文包含带高级属性或四重反引号的代码块；请使用源码模式以原样保留。";
    }
    if (fenceOpen && !/^```\s*$/.test(line)) {
      return "代码块结束标记不标准；请使用源码模式以原样保留。";
    }
    fenceOpen = !fenceOpen;
  }
  if (fenceOpen) return "正文包含未闭合的代码块；请使用源码模式以原样保留。";
  const withoutFences = String(source).replace(/```[\s\S]*?```/g, "");
  if (withoutFences.includes("``")) {
    return "正文包含双反引号或行内代码围栏；请使用源码模式以原样保留。";
  }
  const withoutCode = withoutFences.replace(/`[^`\n]*`/g, "");
  if (withoutCode.includes("`")) {
    return "正文包含未闭合或复杂的行内代码；请使用源码模式以原样保留。";
  }
  let expectedOrderedItem = 1;
  let inOrderedList = false;
  for (const line of withoutCode.split(/\r?\n/)) {
    const item = line.match(/^\s*(\d+)\.\s+/);
    if (!item) {
      inOrderedList = false;
      expectedOrderedItem = 1;
      continue;
    }
    const number = Number(item[1]);
    if (!inOrderedList) expectedOrderedItem = 1;
    if (number !== expectedOrderedItem) {
      return "正文包含自定义起始值或非连续有序列表；请使用源码模式以保留编号。";
    }
    inOrderedList = true;
    expectedOrderedItem += 1;
  }
  const risks = [
    [
      /^\s*(?:import|export)\s/m,
      "正文包含 MDX import/export；请使用源码模式以原样保留。",
    ],
    [
      /<\/?[A-Za-z][^>]*>/,
      "正文包含 HTML 或 JSX 组件；请使用源码模式以原样保留。",
    ],
    [
      /<!--|<>|<\/>/,
      "正文包含 HTML 注释或 JSX Fragment；请使用源码模式以原样保留。",
    ],
    [
      /(?:^|[^\\])[{}]/,
      "正文包含 MDX 表达式或花括号；请使用源码模式以原样保留。",
    ],
    [/^\s*:::/m, "正文包含 Markdown 指令块；请使用源码模式以原样保留。"],
    [/^\s*~~~/m, "正文包含波浪线代码块；请使用源码模式以原样保留。"],
    [/^\s+```/m, "正文包含缩进的代码围栏；请使用源码模式以原样保留。"],
    [/^ {4}\S/m, "正文包含缩进代码块；请使用源码模式以原样保留。"],
    [
      /^\s*(?:===+|___+)\s*$/m,
      "正文包含可视化编辑器不支持的分隔或 Setext 标题；请使用源码模式。",
    ],
    [
      /(?:^|\n)\s*[-*+]\s+\[[ xX]\]\s/m,
      "正文包含任务列表；请使用源码模式以避免改变任务状态。",
    ],
    [/^\s*>\s*\[!/m, "正文包含提示框引用；请使用源码模式以原样保留。"],
    [
      /\[\^[^\]]+\]|^\[\^[^\]]+\]:/m,
      "正文包含脚注；请使用源码模式以原样保留。",
    ],
    [/^\[[^\]]+\]:\s*\S+/m, "正文包含引用式链接；请使用源码模式以原样保留。"],
    [/^[ \t]{2,}\S/m, "正文包含缩进续行或嵌套列表；请使用源码模式以保留层级。"],
    [
      /^\s*(?:&gt;|>\s*>)/m,
      "正文包含嵌套或转义引用；请使用源码模式以保留层级。",
    ],
    [
      /\\[|*_\[\]`]/,
      "正文包含 Markdown 转义字符；请使用源码模式以避免改变转义。",
    ],
    [
      /(?:^|[^*])__(?!_).+?__(?!_)/m,
      "正文使用下划线强调语法；请使用源码模式以原样保留。",
    ],
    [
      /(?:^|[\s(])_[^_\n]+_(?=$|[\s).,!?:;])/m,
      "正文使用下划线强调语法；请使用源码模式以原样保留。",
    ],
    [/\[!\[/, "正文包含带链接的图片；请使用源码模式以保留嵌套结构。"],
    [
      /^\s*\|?.*\\\|.*\|/m,
      "正文表格包含转义竖线；请使用源码模式以保留单元格。",
    ],
    [
      /^(?=[^\n]*:)\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/m,
      "正文表格包含对齐规则；请使用源码模式以保留表格对齐。",
    ],
    [
      /(?:^|\s)\$\$?|\$\$?(?:\s|$)/m,
      "正文可能包含数学公式；请使用源码模式以原样保留。",
    ],
  ];
  const matched = risks.find(([pattern]) => pattern.test(withoutCode));
  if (matched) return matched[1];
  for (const token of withoutCode.matchAll(/!?\[[^\]\n]*\]\(([^)\n]*)\)/g)) {
    if (!/^(?:https?:\/\/|\/)[^\s()]*$/.test(token[1])) {
      return "正文包含相对地址、锚点、邮件链接或带标题链接；请使用源码模式以原样保留。";
    }
  }
  return "";
}

function syncVisualToSource(options = {}) {
  if (!state.visualDirty) return true;
  try {
    if (elements.body.value !== state.visualBaseSource) {
      throw new Error("源码在可视化编辑期间发生了变化");
    }
    const markdown = visualEditorToMarkdown();
    elements.body.value = markdown;
    state.visualBaseSource = markdown;
    state.visualDirty = false;
    showVisualSafety("");
    schedulePreview();
    return true;
  } catch (error) {
    const reason = `可视化内容无法安全转换为 Markdown：${error.message}`;
    showVisualSafety(reason);
    if (
      options.allowDiscard &&
      window.confirm(`${reason}\n\n是否放弃本次可视化修改并返回未修改的源码？`)
    ) {
      elements.body.value = state.visualBaseSource;
      prepareVisualEditor(state.visualBaseSource);
      return true;
    }
    showMessage(
      `${reason}。内容尚未保存，请撤销异常格式或切换源码时选择放弃。`,
      true,
    );
    return false;
  }
}

function visualEditorToMarkdown(root = elements.visualEditor) {
  const blocks = [];
  for (const node of root.childNodes) {
    const value = serializeVisualBlock(node).trimEnd();
    if (value.trim()) blocks.push(value);
  }
  return `${blocks.join("\n\n").trim()}${blocks.length ? "\n" : ""}`;
}

function serializeVisualBlock(node) {
  if (node.nodeType === Node.TEXT_NODE)
    return escapeMarkdownText(node.nodeValue || "");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) {
    return `${"#".repeat(Number(tag[1]))} ${serializeVisualInline(node)}`;
  }
  if (tag === "p" || (tag === "div" && !node.querySelector("table"))) {
    return serializeVisualInline(node);
  }
  if (tag === "blockquote") {
    const content = [...node.childNodes]
      .map((child) =>
        child.nodeType === Node.ELEMENT_NODE &&
        /^(p|div)$/.test(child.tagName.toLowerCase())
          ? serializeVisualInline(child)
          : serializeVisualInlineNode(child),
      )
      .join("\n");
    return content
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }
  if (tag === "ul" || tag === "ol") {
    const ordered = tag === "ol";
    return [...node.children]
      .map((item, index) => {
        if (
          item.tagName.toLowerCase() !== "li" ||
          item.querySelector("ul, ol")
        ) {
          throw new Error("检测到无法可靠转换的嵌套列表");
        }
        return `${ordered ? `${index + 1}.` : "-"} ${serializeVisualInline(item)}`;
      })
      .join("\n");
  }
  if (tag === "pre") {
    const code = node.querySelector(":scope > code") || node;
    const language = code.dataset.language || "";
    const content = code.textContent;
    const fence = content.includes("```") ? "````" : "```";
    return `${fence}${language}\n${content}\n${fence}`;
  }
  if (tag === "hr") return "---";
  if (tag === "table") return serializeVisualTable(node);
  if (tag === "div" && node.querySelector(":scope > table")) {
    return serializeVisualTable(node.querySelector(":scope > table"));
  }
  if (tag === "br") return "";
  throw new Error(`检测到不支持的 <${tag}> 元素`);
}

function serializeVisualInline(element) {
  return [...element.childNodes].map(serializeVisualInlineNode).join("");
}

function serializeVisualInlineNode(node) {
  if (node.nodeType === Node.TEXT_NODE)
    return escapeMarkdownText(node.nodeValue || "");
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  const inner = () => serializeVisualInline(node);
  if (tag === "strong" || tag === "b") return `**${inner()}**`;
  if (tag === "em" || tag === "i") return `*${inner()}*`;
  if (tag === "s" || tag === "strike" || tag === "del") return `~~${inner()}~~`;
  if (tag === "code") {
    if (node.textContent.includes("`") || node.textContent.includes("\n")) {
      throw new Error("行内代码不能包含反引号或换行");
    }
    return `\`${node.textContent}\``;
  }
  if (tag === "br") return "  \n";
  if (tag === "span") return inner();
  if (tag === "a") {
    const href = node.getAttribute("href");
    if (!href) throw new Error("链接缺少地址");
    return `[${inner()}](${safeMarkdownDestination(href)})`;
  }
  if (tag === "img") {
    const src = node.getAttribute("src");
    if (!src) throw new Error("图片缺少地址");
    return `![${escapeMarkdownLabel(node.getAttribute("alt") || "")}](${safeMarkdownDestination(src)})`;
  }
  throw new Error(`行内存在不支持的 <${tag}> 元素`);
}

function serializeVisualTable(table) {
  const rows = [...table.rows];
  if (!rows.length) throw new Error("表格没有内容");
  const cells = rows.map((row) =>
    [...row.cells].map((cell) => {
      const value = serializeVisualInline(cell).trim();
      if (value.includes("|") || value.includes("\n")) {
        throw new Error("表格单元格不能包含竖线或换行");
      }
      return value;
    }),
  );
  const width = Math.max(...cells.map((row) => row.length));
  const normalized = cells.map((row) => [
    ...row,
    ...Array(Math.max(0, width - row.length)).fill(""),
  ]);
  const line = (row) => `| ${row.join(" | ")} |`;
  return [
    line(normalized[0]),
    line(Array(width).fill("---")),
    ...normalized.slice(1).map(line),
  ].join("\n");
}

function escapeMarkdownText(value) {
  return String(value).replace(/[\\`*_[\]<>]/g, "\\$&");
}

function rememberVisualSelection() {
  if (state.view !== "visual") return;
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (!elements.visualEditor.contains(range.commonAncestorContainer)) return;
  state.visualSelection = range.cloneRange();
}

function restoreVisualSelection() {
  elements.visualEditor.focus();
  if (!state.visualSelection) return;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(state.visualSelection);
}

function visualCommand(command, value = null) {
  restoreVisualSelection();
  document.execCommand(command, false, value);
  state.visualDirty = true;
  markDirty();
  rememberVisualSelection();
  updateWordCount();
}

function applyFormat(format) {
  if (!state.current) return toast("请先选择或新建一篇文章。", true);
  if (state.view === "preview") {
    if (!setView("visual")) return;
  }
  if (state.view === "visual") {
    const actions = {
      bold: () => visualCommand("bold"),
      italic: () => visualCommand("italic"),
      strike: () => visualCommand("strikeThrough"),
      code: applyVisualCode,
      quote: () => visualCommand("formatBlock", "blockquote"),
      bullet: () => visualCommand("insertUnorderedList"),
      number: () => visualCommand("insertOrderedList"),
      link: insertVisualLink,
      table: insertVisualTable,
    };
    actions[format]?.();
    return;
  }
  const actions = {
    bold: () => wrapSelection("**", "**", "粗体文字"),
    italic: () => wrapSelection("*", "*", "斜体文字"),
    strike: () => wrapSelection("~~", "~~", "删除线文字"),
    code: () => wrapSelection("`", "`", "代码"),
    quote: () => prefixSelectedLines("> ", "引用内容"),
    bullet: () => prefixSelectedLines("- ", "列表项目"),
    number: () => prefixSelectedLines("1. ", "列表项目", true),
    link: insertLink,
    table: insertTable,
  };
  actions[format]?.();
}

function wrapSelection(before, after, placeholder) {
  const start = elements.body.selectionStart;
  const end = elements.body.selectionEnd;
  const selected = elements.body.value.slice(start, end) || placeholder;
  replaceBodyRange(
    start,
    end,
    `${before}${selected}${after}`,
    start + before.length,
    start + before.length + selected.length,
  );
}

function prefixSelectedLines(prefix, placeholder, numbered = false) {
  const start = elements.body.selectionStart;
  const end = elements.body.selectionEnd;
  const lineStart = elements.body.value.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd =
    end > start && elements.body.value[end - 1] === "\n" ? end - 1 : end;
  const nextBreak = elements.body.value.indexOf("\n", effectiveEnd);
  const lineEnd = nextBreak === -1 ? elements.body.value.length : nextBreak;
  const selected = elements.body.value.slice(lineStart, lineEnd) || placeholder;
  const replacement = selected
    .split("\n")
    .map(
      (line, index) =>
        `${numbered ? `${index + 1}. ` : prefix}${line.replace(/^(?:>\s+|[-*+]\s+|\d+\.\s+)/, "")}`,
    )
    .join("\n");
  replaceBodyRange(
    lineStart,
    lineEnd,
    replacement,
    lineStart,
    lineStart + replacement.length,
  );
}

function applyHeading(prefix) {
  if (!state.current) return;
  if (state.view === "preview" && !setView("visual")) return;
  if (state.view === "visual") {
    visualCommand("formatBlock", prefix ? `h${prefix.trim().length}` : "p");
    return;
  }
  const start = elements.body.selectionStart;
  const lineStart = elements.body.value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = elements.body.value.indexOf("\n", start);
  const end = lineEnd === -1 ? elements.body.value.length : lineEnd;
  const line = elements.body.value
    .slice(lineStart, end)
    .replace(/^#{1,6}\s+/, "");
  replaceBodyRange(
    lineStart,
    end,
    `${prefix}${line || "标题"}`,
    lineStart + prefix.length,
    lineStart + prefix.length + (line || "标题").length,
  );
}

function insertLink() {
  const selected = elements.body.value.slice(
    elements.body.selectionStart,
    elements.body.selectionEnd,
  );
  const url = window.prompt("请输入链接地址（https://…）：", "https://");
  if (!url) return;
  const label =
    selected || window.prompt("请输入链接文字：", "链接文字") || "链接";
  const start = elements.body.selectionStart;
  const markdown = `[${escapeMarkdownLabel(label)}](${safeMarkdownDestination(url)})`;
  replaceBodyRange(
    start,
    elements.body.selectionEnd,
    markdown,
    start,
    start + markdown.length,
  );
}

function insertVisualLink() {
  restoreVisualSelection();
  const selection = window.getSelection();
  const selected = selection?.toString() || "";
  const url = window.prompt("请输入链接地址（https://…）：", "https://");
  if (!url) return;
  const destination = url.trim();
  if (!/^(?:https?:\/\/|\/)[^\s()]+$/.test(destination)) {
    return toast(
      "可视化模式仅支持 http(s) 或站内 / 路径；相对地址、锚点和邮件链接请在源码模式编辑。",
      true,
      6500,
    );
  }
  if (selected) visualCommand("createLink", destination);
  else {
    const label = window.prompt("请输入链接文字：", "链接文字") || "链接";
    insertVisualNode(createSafeLink(destination, label));
  }
}

function applyVisualCode() {
  restoreVisualSelection();
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (range.toString().includes("\n")) {
    return toast("行内代码只能应用到同一行文字。", true);
  }
  const code = document.createElement("code");
  code.textContent = range.toString() || "代码";
  range.deleteContents();
  range.insertNode(code);
  range.selectNodeContents(code);
  selection.removeAllRanges();
  selection.addRange(range);
  state.visualDirty = true;
  markDirty();
  rememberVisualSelection();
}

function createSafeLink(url, label) {
  const link = document.createElement("a");
  link.href = safeMarkdownDestination(url);
  link.textContent = label;
  return link;
}

function escapeMarkdownLabel(value) {
  return String(value).replace(/[\\\[\]]/g, "\\$&");
}

function safeMarkdownDestination(value) {
  return String(value)
    .trim()
    .replace(/\\/g, "%5C")
    .replace(/\s/g, "%20")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
}

function insertTable() {
  insertAtCursor(
    "\n| 列 1 | 列 2 | 列 3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n",
  );
}

function insertVisualTable() {
  const table = document.createElement("table");
  const head = table.createTHead().insertRow();
  const body = table.createTBody();
  for (const label of ["列 1", "列 2", "列 3"]) {
    const cell = document.createElement("th");
    cell.textContent = label;
    head.append(cell);
  }
  const row = body.insertRow();
  for (let index = 0; index < 3; index += 1)
    row.insertCell().textContent = "内容";
  insertVisualBlock(table);
}

function insertAtCursor(text) {
  if (!state.current) return toast("请先选择或新建一篇文章。", true);
  if (state.view === "preview" && !setView("visual")) return;
  if (state.view === "visual") {
    insertMarkdownVisually(text);
    return;
  }
  const start = elements.body.selectionStart;
  const end = elements.body.selectionEnd;
  replaceBodyRange(start, end, text, start + text.length, start + text.length);
}

function insertMarkdownVisually(markdown) {
  const trimmed = String(markdown).trim();
  const image = trimmed.match(/^!\[([^\]]*)\]\(([^\s)]+)\)$/);
  if (image) {
    const element = document.createElement("img");
    element.alt = image[1];
    element.src = image[2];
    insertVisualNode(element);
    return;
  }
  const link = trimmed.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
  if (link) {
    insertVisualNode(createSafeLink(link[2], link[1]));
    return;
  }
  if (trimmed.startsWith("|") && trimmed.includes("\n| ---")) {
    insertVisualTable();
    return;
  }
  const template = document.createElement("template");
  template.innerHTML = renderMarkdown(trimmed);
  for (const node of [...template.content.childNodes]) insertVisualBlock(node);
}

function insertVisualNode(node) {
  restoreVisualSelection();
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  if (range && elements.visualEditor.contains(range.commonAncestorContainer)) {
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    elements.visualEditor.append(node);
  }
  state.visualDirty = true;
  markDirty();
  rememberVisualSelection();
  updateWordCount();
}

function insertVisualBlock(node) {
  restoreVisualSelection();
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
  let anchor = range?.commonAncestorContainer;
  if (anchor?.nodeType === Node.TEXT_NODE) anchor = anchor.parentElement;
  const block = anchor?.closest?.(
    "p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol, pre, table, div",
  );
  if (block && elements.visualEditor.contains(block)) block.after(node);
  else elements.visualEditor.append(node);
  const tail = document.createElement("p");
  tail.append(document.createElement("br"));
  node.after(tail);
  const nextRange = document.createRange();
  nextRange.setStart(tail, 0);
  nextRange.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(nextRange);
  state.visualDirty = true;
  markDirty();
  rememberVisualSelection();
  updateWordCount();
}

function replaceBodyRange(
  start,
  end,
  replacement,
  selectionStart,
  selectionEnd,
) {
  elements.body.setRangeText(replacement, start, end, "end");
  elements.body.focus();
  elements.body.setSelectionRange(selectionStart, selectionEnd);
  markDirty();
  schedulePreview();
}

function chooseImage() {
  if (!state.current)
    return toast("请先选择或新建一篇文章，再插入图片。", true);
  if (state.view === "visual") rememberVisualSelection();
  elements.imageInput.click();
}

function chooseGpx() {
  if (state.view === "visual") rememberVisualSelection();
  elements.gpxInput.click();
}

async function uploadImage(file) {
  if (!file.type.startsWith("image/")) return toast("请选择图片文件。", true);
  if (state.assetBusy) return;
  setAssetBusy(true);
  toast(`正在通过 PicGo 上传 ${file.name}…`);
  try {
    const dataUrl = await fileToDataUrl(file);
    const result = await api("/api/images/upload", {
      method: "POST",
      body: { filename: file.name, dataUrl },
    });
    const markdown =
      result.markdown ||
      `![${escapeMarkdownLabel(file.name.replace(/\.[^.]+$/, ""))}](${safeMarkdownDestination(result.url)})`;
    insertAtCursor(`\n${markdown}\n`);
    if (elements.assetsDialog.open) elements.assetsDialog.close();
    toast("图片上传成功，已插入正文。可继续填写图片说明。");
  } catch (error) {
    toast(error.message, true, 7000);
  } finally {
    setAssetBusy(false);
  }
}

async function importGpx(file) {
  if (!/\.gpx$/i.test(file.name)) return toast("请选择 .gpx 路线文件。", true);
  if (state.assetBusy) return;
  setAssetBusy(true);
  toast(`正在导入 ${file.name}…`);
  try {
    const dataUrl = await fileToDataUrl(file);
    const result = await api("/api/gpx/import", {
      method: "POST",
      body: { filename: file.name, dataUrl },
    });
    const filename = result.filename || result.name || file.name;
    const url = result.url || `/routes/${encodeURIComponent(filename)}`;
    if (state.current) insertAtCursor(`\n[下载 GPX 路线文件](${url})\n`);
    if (elements.assetsDialog.open) await loadGpxAssets();
    toast(
      state.current
        ? "GPX 已保存并插入正文；也可在素材库中生成网站路线。"
        : "GPX 已保存到 public/routes/；可在素材库中生成网站路线。",
    );
  } catch (error) {
    toast(error.message, true, 7000);
  } finally {
    setAssetBusy(false);
  }
}

function handleBodyPaste(event) {
  const image = [...(event.clipboardData?.files || [])].find((file) =>
    file.type.startsWith("image/"),
  );
  if (!image) return;
  event.preventDefault();
  void uploadImage(image);
}

function handleVisualPaste(event) {
  const image = [...(event.clipboardData?.files || [])].find((file) =>
    file.type.startsWith("image/"),
  );
  event.preventDefault();
  if (image) {
    rememberVisualSelection();
    void uploadImage(image);
    return;
  }
  const text = event.clipboardData?.getData("text/plain") || "";
  document.execCommand("insertText", false, text);
  state.visualDirty = true;
  markDirty();
}

function hasDraggedImage(event) {
  return [...(event.dataTransfer?.items || [])].some(
    (item) => item.kind === "file" && item.type.startsWith("image/"),
  );
}

function handleDragEnter(event) {
  if (!hasDraggedImage(event)) return;
  event.preventDefault();
  elements.dropHint.hidden = false;
}

function handleDragOver(event) {
  if (!hasDraggedImage(event)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}

function handleDragLeave(event) {
  if (!elements.bodyPane.contains(event.relatedTarget))
    elements.dropHint.hidden = true;
}

function handleDrop(event) {
  elements.dropHint.hidden = true;
  const image = [...(event.dataTransfer?.files || [])].find((file) =>
    file.type.startsWith("image/"),
  );
  if (!image) return;
  event.preventDefault();
  void uploadImage(image);
}

async function openSettings() {
  elements.settingsStatus.textContent = "正在读取设置…";
  elements.settingsStatus.classList.remove("error", "success");
  elements.settingsDialog.showModal();
  try {
    const settings = await api("/api/settings");
    elements.picgoPath.value = settings.picgoPath || "";
    if (settings.picgoAvailable) {
      elements.settingsStatus.textContent =
        "已配置。现在可以从编辑器选择、粘贴或拖入图片。";
      elements.settingsStatus.classList.add("success");
    } else if (settings.picgoConfigured) {
      elements.settingsStatus.textContent =
        settings.validationError || "保存的 PicGo 路径当前不可用。";
      elements.settingsStatus.classList.add("error");
    } else {
      elements.settingsStatus.textContent = "尚未配置 PicGo。";
    }
  } catch (error) {
    elements.settingsStatus.textContent = error.message;
    elements.settingsStatus.classList.add("error");
  }
}

async function saveSettings(event) {
  event.preventDefault();
  elements.settingsSave.disabled = true;
  elements.settingsStatus.textContent = "正在验证并保存…";
  elements.settingsStatus.classList.remove("error", "success");
  try {
    const result = await api("/api/settings", {
      method: "POST",
      body: { picgoPath: elements.picgoPath.value.trim() },
    });
    elements.picgoPath.value =
      result.picgoPath || elements.picgoPath.value.trim();
    elements.settingsStatus.textContent = "PicGo 路径已保存。";
    elements.settingsStatus.classList.add("success");
    toast("PicGo 设置已保存。");
  } catch (error) {
    elements.settingsStatus.textContent = error.message;
    elements.settingsStatus.classList.add("error");
  } finally {
    elements.settingsSave.disabled = false;
  }
}

async function openAssets() {
  elements.assetsDialog.showModal();
  elements.gpxList.textContent = "正在读取 GPX 文件…";
  elements.picgoSummary.textContent = "正在读取 PicGo 设置…";
  await Promise.allSettled([loadGpxAssets(), loadPicgoSummary()]);
}

async function loadPicgoSummary() {
  try {
    const settings = await api("/api/settings");
    elements.picgoSummary.textContent = settings.picgoAvailable
      ? `已连接本机 PicGo：${settings.picgoPath}`
      : settings.picgoConfigured
        ? settings.validationError || "保存的 PicGo 路径当前不可用。"
        : "尚未设置 PicGo 路径；请先点击右上角“设置”。";
  } catch (error) {
    elements.picgoSummary.textContent = error.message;
  }
}

async function loadGpxAssets() {
  try {
    const data = await api("/api/gpx");
    const files = data.files || data.entries || [];
    elements.gpxList.replaceChildren();
    if (!files.length) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "还没有 GPX 文件。点击“导入 GPX”即可添加。";
      elements.gpxList.append(empty);
      return;
    }
    for (const file of files) elements.gpxList.append(createGpxRow(file));
  } catch (error) {
    elements.gpxList.textContent = error.message;
  }
}

function createGpxRow(file) {
  const filename = file.filename || file.name;
  const url = file.url || `/routes/${encodeURIComponent(filename)}`;
  const row = document.createElement("div");
  row.className = "asset-row";
  const details = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = filename;
  const meta = document.createElement("span");
  meta.textContent = [
    formatBytes(file.size),
    formatDate(file.modified || file.mtime),
  ]
    .filter(Boolean)
    .join(" · ");
  details.append(name, meta);
  const actions = document.createElement("div");
  actions.className = "asset-row-actions";
  const insert = document.createElement("button");
  insert.type = "button";
  insert.className = "button secondary";
  insert.textContent = "插入正文";
  insert.disabled = !state.current;
  insert.title = state.current ? "插入当前文章" : "请先打开一篇文章";
  insert.addEventListener("click", () => {
    insertAtCursor(`\n[下载 GPX 路线文件](${url})\n`);
    elements.assetsDialog.close();
  });
  const createRoute = document.createElement("button");
  createRoute.type = "button";
  createRoute.className = "button primary";
  createRoute.textContent = "生成/更新路线";
  createRoute.addEventListener("click", () => createRouteFromGpx(filename));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "button danger";
  remove.textContent = "删除";
  remove.addEventListener("click", async () => {
    if (
      !window.confirm(
        `确定删除 ${filename} 吗？系统会先创建备份，但引用它的页面可能无法显示路线。`,
      )
    )
      return;
    remove.disabled = true;
    try {
      const result = await api("/api/gpx/delete", {
        method: "POST",
        body: { filename },
      });
      toast(
        result.backup ? `已删除；备份位于 ${result.backup}` : "GPX 已删除。",
      );
      await loadGpxAssets();
    } catch (error) {
      toast(error.message, true);
      remove.disabled = false;
    }
  });
  actions.append(insert, createRoute, remove);
  row.append(details, actions);
  return row;
}

async function createRouteFromGpx(filename) {
  if (state.assetBusy || state.loading) return;
  const language = elements.routeLanguage.value === "en" ? "en" : "zh-CN";
  if (
    !window.confirm(
      `将根据 ${filename} ${language === "en" ? "生成英文" : "生成中文"}路线内容。已有同路线内容只更新 GPX 统计字段，不覆盖正文。继续吗？`,
    )
  )
    return;
  setAssetBusy(true);
  toast(
    "正在解析 GPX 并生成路线内容，首次地理位置识别可能需要几秒…",
    false,
    7000,
  );
  try {
    const result = await api("/api/gpx/create-route", {
      method: "POST",
      body: { filename, lang: language, geocode: true },
    });
    if (state.collection === "routes") {
      await refreshEntries(result.files?.[0]);
    }
    toast(
      result.files?.length
        ? `路线内容已生成/更新：${result.files.join(", ")}`
        : "路线数据已经是最新状态。",
      false,
      7000,
    );
  } catch (error) {
    toast(error.message, true, 9000);
  } finally {
    setAssetBusy(false);
  }
}

async function openGpxExplorer() {
  try {
    await api("/api/gpx/explorer", { method: "POST", body: {} });
    toast("已打开 GPX 素材目录。", false, 4000);
  } catch (error) {
    toast(error.message, true);
  }
}

function setAssetBusy(value) {
  state.assetBusy = value;
  updateControlLock();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () =>
      reject(new Error(`无法读取 ${file.name}。`)),
    );
    reader.readAsDataURL(file);
  });
}

function renderMarkdown(markdown) {
  const lines = escapeHtml(markdown).replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
    paragraph = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("```")) {
      flushParagraph();
      const language = line.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      output.push(
        `<pre><code data-language="${language}">${code.join("\n")}</code></pre>`,
      );
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }
    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      flushParagraph();
      output.push("<hr>");
      continue;
    }
    if (/^&gt;\s?/.test(line)) {
      flushParagraph();
      const quote = [];
      while (index < lines.length && /^&gt;\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^&gt;\s?/, ""));
        index += 1;
      }
      index -= 1;
      output.push(
        `<blockquote>${quote.map(renderInline).join("<br>")}</blockquote>`,
      );
      continue;
    }
    const list = line.match(/^\s*([-*+] |\d+\. )(.+)$/);
    if (list) {
      flushParagraph();
      const ordered = /^\d/.test(list[1]);
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+] |\d+\. )(.+)$/);
        if (!item || /^\d/.test(item[1]) !== ordered) break;
        items.push(`<li>${renderInline(item[2])}</li>`);
        index += 1;
      }
      index -= 1;
      output.push(
        `<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`,
      );
      continue;
    }
    if (
      line.includes("|") &&
      /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || "")
    ) {
      flushParagraph();
      const headers = tableCells(line);
      index += 2;
      const rows = [];
      while (
        index < lines.length &&
        lines[index].includes("|") &&
        lines[index].trim()
      ) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;
      output.push(
        `<div class="preview-table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
      );
      continue;
    }
    if (!line.trim()) flushParagraph();
    else paragraph.push(line);
  }
  flushParagraph();
  return output.join("\n");
}

function renderInline(value) {
  const code = [];
  let text = value.replace(/`([^`]+)`/g, (_, content) => {
    const token = `\u0000INLINE${code.length}\u0000`;
    code.push(`<code>${content}</code>`);
    return token;
  });
  text = text
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
      '<img alt="$1" src="$2" loading="lazy">',
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return text.replace(
    /\u0000INLINE(\d+)\u0000/g,
    (_, index) => code[Number(index)],
  );
}

function tableCells(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function suggestFilename(title, language) {
  const slug =
    String(title)
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `entry-${new Date().toISOString().slice(0, 10)}`;
  return `${slug}${language === "en" ? ".en" : ""}.md`;
}

function setLoading(value) {
  state.loading = value;
  updateControlLock();
}

function updateControlLock() {
  const locked = state.loading || state.assetBusy;
  elements.collection.disabled = locked;
  elements.newButton.disabled = locked;
  for (const control of elements.editorForm.querySelectorAll(
    "button, input, select, textarea",
  )) {
    control.disabled = locked;
  }
  elements.visualEditor.contentEditable = String(!locked);
  elements.visualEditor.setAttribute("aria-disabled", String(locked));
  for (const button of [elements.assetImageButton, elements.assetGpxButton]) {
    button.disabled = locked;
  }
}

function showMessage(text, isError = false) {
  elements.message.hidden = false;
  elements.message.textContent = text;
  elements.message.classList.toggle("error", isError);
}

function hideMessage() {
  elements.message.hidden = true;
  elements.message.textContent = "";
}

function toast(message, isError = false, duration = 4200) {
  const item = document.createElement("div");
  item.className = `toast${isError ? " error" : ""}`;
  item.textContent = message;
  elements.toastRegion.append(item);
  window.setTimeout(() => item.remove(), duration);
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? ""
    : date.toLocaleString("zh-CN", { dateStyle: "medium", timeStyle: "short" });
}

function handleShortcut(event) {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLocaleLowerCase();
  if (key === "s" && state.current) {
    event.preventDefault();
    elements.editorForm.requestSubmit();
  } else if (
    (document.activeElement === elements.body ||
      elements.visualEditor.contains(document.activeElement)) &&
    (key === "b" || key === "i")
  ) {
    event.preventDefault();
    applyFormat(key === "b" ? "bold" : "italic");
  }
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.body
      ? { "Content-Type": "application/json", "X-Editor-Token": state.token }
      : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`编辑器服务器返回了无效响应（HTTP ${response.status}）。`);
  }
  if (!response.ok)
    throw new Error(data.error || `请求失败（HTTP ${response.status}）。`);
  return data;
}

function showFatal(error) {
  document.body.innerHTML = "";
  const fatal = document.createElement("main");
  fatal.className = "fatal-error";
  const title = document.createElement("h1");
  title.textContent = "本地内容管理台无法启动";
  const message = document.createElement("p");
  message.textContent = error instanceof Error ? error.message : String(error);
  const hint = document.createElement("p");
  hint.textContent =
    "请关闭此页面，在终端按 Ctrl+C 停止服务，再运行 npm run editor 后刷新。";
  fatal.append(title, message, hint);
  document.body.append(fatal);
}
