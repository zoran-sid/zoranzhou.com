import { useState, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";

interface SearchEntry {
  title: string;
  collection: string;
  slug: string;
  url: string;
  date: string;
}

function getCurrentLocale(): string {
  if (typeof window === "undefined") return "zh-CN";
  const path = window.location.pathname;
  if (path.startsWith("/en/") || path === "/en") return "en";
  return "zh-CN";
}

const COLLECTION_LABELS_ZH: Record<string, string> = {
  blog: "博客",
  research: "研究",
  projects: "项目",
};

const COLLECTION_LABELS_EN: Record<string, string> = {
  blog: "Blog",
  research: "Research",
  projects: "Projects",
};

const UI_ZH = {
  search: "搜索",
  placeholder: "搜索文章...",
  loading: "加载中...",
  noResults: '未找到与 "{query}" 相关的结果',
  typePrompt: "输入标题搜索",
  navigate: "导航",
  open: "打开",
};

const UI_EN = {
  search: "Search",
  placeholder: "Search articles...",
  loading: "Loading...",
  noResults: 'No results for "{query}"',
  typePrompt: "Type to search by title",
  navigate: "Navigate",
  open: "Open",
};

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [allEntries, setAllEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<SearchEntry> | null>(null);

  const locale = getCurrentLocale();
  const ui = locale === "zh-CN" ? UI_ZH : UI_EN;
  const collectionLabels = locale === "zh-CN" ? COLLECTION_LABELS_ZH : COLLECTION_LABELS_EN;

  useEffect(() => {
    if (open && allEntries.length === 0) {
      setLoading(true);
      fetch(`/${locale}/search-index.json`)
        .then((r) => r.json())
        .then((data: SearchEntry[]) => {
          setAllEntries(data);
          fuseRef.current = new Fuse(data, {
            keys: ["title"],
            threshold: 0.4,
            includeScore: true,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIdx(0);
      if (!fuseRef.current || value.trim().length === 0) {
        setResults([]);
        return;
      }
      const fuseResults = fuseRef.current
        .search(value.trim())
        .slice(0, 8)
        .map((r) => r.item);
      setResults(fuseResults);
    },
    [],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIdx]) {
        window.location.href = results[selectedIdx].url;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Search trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 transition-all hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:border-gray-600 dark:hover:text-gray-300"
        aria-label={`${ui.search} (Ctrl+K)`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <span className="hidden sm:inline">{ui.search}</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-300 bg-white px-1.5 py-0.5 font-mono text-xs text-gray-400 group-hover:border-gray-400">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" role="dialog" aria-modal="true">
          {/* Backdrop 鈥?only in dark mode */}
          <div className="absolute inset-0 dark:bg-black/40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
            {/* Input */}
            <div className="flex items-center gap-3 px-4">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={ui.placeholder}
                className="search-modal-input flex-1 bg-transparent py-4 text-base text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus-visible:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
              />
              {query && (
                <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Clear">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-400 sm:inline dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500">esc</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto border-t border-gray-100 dark:border-gray-700">
              {loading && <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">{ui.loading}</p>}

              {!loading && query && results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">{ui.noResults.replace("{query}", query)}</p>
              )}

              {!loading && !query && (
                <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">{ui.typePrompt}</p>
              )}

              {results.map((entry, idx) => (
                <a
                  key={entry.url}
                  href={entry.url}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    idx === selectedIdx ? "bg-gray-50 dark:bg-gray-700" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/50"
                  }`}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                    {collectionLabels[entry.collection] ?? entry.collection}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-200">{entry.title}</span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{entry.date}</span>
                </a>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
              <span className="flex items-center gap-1"><kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-700">↑↓</kbd> {ui.navigate}</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] dark:border-gray-600 dark:bg-gray-700">↵</kbd> {ui.open}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

