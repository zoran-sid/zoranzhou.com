/**
 * Media API clients for fetching metadata from public APIs.
 *
 * Supported providers:
 * - TMDb (movies, TV) — requires API key
 * - Google Books (books) — works without key for basic queries
 * - RAWG (games) — requires API key
 * - Jikan / MyAnimeList (anime) — free, no key needed
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface MediaMetadata {
  title: string;
  originalTitle?: string;
  year?: number;
  poster?: string;
  cover?: string;
  summary?: string;
  genres: string[];
  country?: string;
  director?: string;
  author?: string;
  developer?: string;
  publisher?: string;
  runtime?: string;
  language?: string;
  rating?: number;
  /** TMDb popularity score (0-1000+) */
  popularity?: number;
}

// ── TMDb (movies & TV) ─────────────────────────────────────────────────────

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getTmdbKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY environment variable is not set. " +
        "Get a free key at https://www.themoviedb.org/settings/api",
    );
  }
  return key;
}

interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  genre_ids?: number[];
  original_language?: string;
  popularity?: number;
  vote_average?: number;
}

interface TmdbMovieDetails extends TmdbSearchResult {
  runtime?: number;
  production_countries?: { name: string; iso_3166_1: string }[];
  credits?: {
    crew?: { job: string; name: string }[];
  };
  genres?: { id: number; name: string }[];
}

interface TmdbTvDetails extends TmdbSearchResult {
  episode_run_time?: number[];
  number_of_seasons?: number;
  production_countries?: { name: string; iso_3166_1: string }[];
  created_by?: { name: string }[];
  genres?: { id: number; name: string }[];
}

// Genre ID → name map (English), loaded lazily
let genreMap: Map<number, string> | null = null;

async function getTmdbGenres(): Promise<Map<number, string>> {
  if (genreMap) return genreMap;
  const key = getTmdbKey();

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE}/genre/movie/list?language=en`, {
      headers: { Authorization: `Bearer ${key}` },
    }),
    fetch(`${TMDB_BASE}/genre/tv/list?language=en`, {
      headers: { Authorization: `Bearer ${key}` },
    }),
  ]);

  genreMap = new Map();
  if (movieRes.ok) {
    const data = (await movieRes.json()) as {
      genres: { id: number; name: string }[];
    };
    for (const g of data.genres) genreMap.set(g.id, g.name);
  }
  if (tvRes.ok) {
    const data = (await tvRes.json()) as {
      genres: { id: number; name: string }[];
    };
    for (const g of data.genres) genreMap.set(g.id, g.name);
  }
  return genreMap;
}

function resolveGenres(
  genreIds: number[] | undefined,
  genreObjects: { id: number; name: string }[] | undefined,
  map: Map<number, string>,
): string[] {
  if (genreObjects && genreObjects.length > 0) {
    return genreObjects.map((g) => g.name);
  }
  if (genreIds && genreIds.length > 0) {
    return genreIds.map((id) => map.get(id) ?? String(id)).filter(Boolean);
  }
  return [];
}

/**
 * Search TMDb for a movie by title. Returns the best match.
 */
export async function searchTmdbMovie(
  title: string,
  year?: number,
): Promise<MediaMetadata | null> {
  const key = getTmdbKey();
  const params = new URLSearchParams({ query: title, language: "en-US" });
  if (year) params.set("year", String(year));

  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    console.warn(`[TMDb] Movie search failed for "${title}": ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { results: TmdbSearchResult[] };
  if (data.results.length === 0) return null;

  // Get details for best match
  const best = data.results[0];
  const detailRes = await fetch(
    `${TMDB_BASE}/movie/${best.id}?language=en-US&append_to_response=credits`,
    { headers: { Authorization: `Bearer ${key}` } },
  );

  if (!detailRes.ok) return null;
  const detail = (await detailRes.json()) as TmdbMovieDetails;

  const genreMap = await getTmdbGenres();

  return {
    title: detail.title ?? best.title ?? title,
    originalTitle: detail.original_title || undefined,
    year: detail.release_date
      ? new Date(detail.release_date).getFullYear()
      : undefined,
    poster: detail.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${detail.poster_path}`
      : undefined,
    cover: detail.backdrop_path
      ? `${TMDB_IMAGE_BASE}/original${detail.backdrop_path}`
      : undefined,
    summary: detail.overview || undefined,
    genres: resolveGenres(undefined, detail.genres, genreMap),
    country:
      detail.production_countries?.[0]?.iso_3166_1 ?? undefined,
    director: detail.credits?.crew?.find((c) => c.job === "Director")
      ?.name,
    runtime: detail.runtime ? `${detail.runtime} min` : undefined,
    language:
      detail.original_language === "en"
        ? "English"
        : detail.original_language || undefined,
    rating: detail.vote_average
      ? Math.round((detail.vote_average / 2) * 10) / 10
      : undefined,
    popularity: detail.popularity,
  };
}

/**
 * Search TMDb for a TV show by title.
 */
export async function searchTmdbTV(
  title: string,
  year?: number,
): Promise<MediaMetadata | null> {
  const key = getTmdbKey();
  const params = new URLSearchParams({ query: title, language: "en-US" });
  if (year) params.set("first_air_date_year", String(year));

  const res = await fetch(`${TMDB_BASE}/search/tv?${params}`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    console.warn(`[TMDb] TV search failed for "${title}": ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { results: TmdbSearchResult[] };
  if (data.results.length === 0) return null;

  const best = data.results[0];
  const detailRes = await fetch(
    `${TMDB_BASE}/tv/${best.id}?language=en-US&append_to_response=credits`,
    { headers: { Authorization: `Bearer ${key}` } },
  );

  if (!detailRes.ok) return null;
  const detail = (await detailRes.json()) as TmdbTvDetails;

  const genreMap = await getTmdbGenres();

  const avgRuntime =
    detail.episode_run_time && detail.episode_run_time.length > 0
      ? `${detail.episode_run_time[0]} min/ep`
      : undefined;

  return {
    title: detail.name ?? best.name ?? title,
    originalTitle: detail.original_name || undefined,
    year: detail.first_air_date
      ? new Date(detail.first_air_date).getFullYear()
      : undefined,
    poster: detail.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${detail.poster_path}`
      : undefined,
    cover: detail.backdrop_path
      ? `${TMDB_IMAGE_BASE}/original${detail.backdrop_path}`
      : undefined,
    summary: detail.overview || undefined,
    genres: resolveGenres(undefined, detail.genres, genreMap),
    country:
      detail.production_countries?.[0]?.iso_3166_1 ?? undefined,
    director: detail.created_by?.[0]?.name,
    runtime: avgRuntime,
    language:
      detail.original_language === "en"
        ? "English"
        : detail.original_language || undefined,
    rating: detail.vote_average
      ? Math.round((detail.vote_average / 2) * 10) / 10
      : undefined,
    popularity: detail.popularity,
  };
}

// ── Google Books ────────────────────────────────────────────────────────────

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
  };
}

/**
 * Search Google Books by title.
 */
export async function searchGoogleBooks(
  title: string,
): Promise<MediaMetadata | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const params = new URLSearchParams({ q: `intitle:"${title}"` });
  if (apiKey) params.set("key", apiKey);
  // Without a key, Google Books still works but may be rate-limited

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params}`,
  );

  if (!res.ok) {
    console.warn(
      `[Google Books] Search failed for "${title}": ${res.status}`,
    );
    return null;
  }

  const data = (await res.json()) as { items?: GoogleBooksVolume[] };
  if (!data.items || data.items.length === 0) return null;

  const best = data.items[0].volumeInfo;
  const fullTitle = best.subtitle
    ? `${best.title}: ${best.subtitle}`
    : (best.title ?? title);

  // Get higher-res cover by modifying the URL
  let coverUrl = best.imageLinks?.thumbnail?.replace(
    "http://",
    "https://",
  );
  if (coverUrl) {
    // Google Books thumbnail URLs have a zoom parameter; use higher quality
    coverUrl = coverUrl.replace(/&zoom=\d/, "&zoom=2");
  }

  return {
    title: fullTitle,
    year: best.publishedDate
      ? new Date(best.publishedDate).getFullYear()
      : undefined,
    poster: coverUrl,
    cover: coverUrl,
    summary: best.description?.replace(/<[^>]*>/g, "") || undefined,
    genres: best.categories ?? [],
    author: best.authors?.[0],
    publisher: best.publisher,
    language: best.language,
    rating: best.averageRating,
  };
}

// ── OpenLibrary (books fallback) ────────────────────────────────────────────

interface OpenLibraryDoc {
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  subject?: string[];
  language?: string[];
  publisher?: string[];
  cover_i?: number;
}

/**
 * Search OpenLibrary by title.
 */
export async function searchOpenLibrary(
  title: string,
): Promise<MediaMetadata | null> {
  const params = new URLSearchParams({
    q: title,
    limit: "3",
  });

  const res = await fetch(
    `https://openlibrary.org/search.json?${params}`,
  );

  if (!res.ok) {
    console.warn(
      `[OpenLibrary] Search failed for "${title}": ${res.status}`,
    );
    return null;
  }

  const data = (await res.json()) as { docs: OpenLibraryDoc[] };
  if (!data.docs || data.docs.length === 0) return null;

  const best = data.docs[0];
  const coverId = best.cover_i;

  return {
    title: best.title ?? title,
    year: best.first_publish_year,
    poster: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : undefined,
    cover: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : undefined,
    genres: best.subject?.slice(0, 5) ?? [],
    author: best.author_name?.[0],
    publisher: best.publisher?.[0],
    language: best.language?.[0],
  };
}

// ── RAWG (games) ────────────────────────────────────────────────────────────

interface RawgGameResult {
  id: number;
  name: string;
  released?: string;
  background_image?: string;
  genres?: { name: string }[];
  platforms?: { platform: { name: string } }[];
  developers?: { name: string }[];
  publishers?: { name: string }[];
  rating?: number;
  metacritic?: number;
}

/**
 * Search RAWG for a game by title.
 */
export async function searchRawg(
  title: string,
): Promise<MediaMetadata | null> {
  const key = process.env.RAWG_API_KEY;
  if (!key) {
    console.warn("[RAWG] RAWG_API_KEY not set, skipping game search");
    return null;
  }

  const params = new URLSearchParams({
    key,
    search: title,
    page_size: "3",
  });

  const res = await fetch(`https://api.rawg.io/api/games?${params}`);

  if (!res.ok) {
    console.warn(`[RAWG] Search failed for "${title}": ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { results: RawgGameResult[] };
  if (!data.results || data.results.length === 0) return null;

  const best = data.results[0];

  return {
    title: best.name ?? title,
    year: best.released
      ? new Date(best.released).getFullYear()
      : undefined,
    poster: best.background_image || undefined,
    cover: best.background_image || undefined,
    genres: best.genres?.map((g) => g.name) ?? [],
    developer: best.developers?.[0]?.name,
    publisher: best.publishers?.[0]?.name,
    rating: best.rating
      ? Math.round((best.rating / 5) * 10) / 10 // RAWG uses 0-5 scale
      : undefined,
  };
}

// ── Jikan / MyAnimeList (anime) ─────────────────────────────────────────────

interface JikanAnimeResult {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  type?: string;
  episodes?: number;
  status?: string;
  score?: number;
  year?: number;
  synopsis?: string;
  images: {
    jpg: {
      image_url?: string;
      large_image_url?: string;
    };
  };
  genres?: { name: string }[];
  studios?: { name: string }[];
  rating?: string;
}

/**
 * Search Jikan (MyAnimeList) for anime by title.
 * Rate-limited to ~3 req/s, no API key needed.
 */
export async function searchJikan(
  title: string,
): Promise<MediaMetadata | null> {
  const params = new URLSearchParams({
    q: title,
    limit: "3",
    sfw: "true",
  });

  const res = await fetch(
    `https://api.jikan.moe/v4/anime?${params}`,
  );

  if (!res.ok) {
    console.warn(`[Jikan] Search failed for "${title}": ${res.status}`);
    return null;
  }

  const data = (await res.json()) as { data: JikanAnimeResult[] };
  if (!data.data || data.data.length === 0) return null;

  const best = data.data[0];
  const episodes = best.episodes ? `${best.episodes} eps` : undefined;

  return {
    title: best.title_english ?? best.title,
    originalTitle: best.title_japanese || best.title,
    year: best.year,
    poster: best.images.jpg.large_image_url ?? best.images.jpg.image_url,
    cover: best.images.jpg.large_image_url ?? best.images.jpg.image_url,
    summary: best.synopsis?.replace(/\[.*?\]/g, "").trim() || undefined,
    genres: best.genres?.map((g) => g.name) ?? [],
    director: best.studios?.[0]?.name,
    runtime: episodes,
    rating: best.score
      ? Math.round((best.score / 10) * 10) / 10
      : undefined,
  };
}

// ── Unified Search ──────────────────────────────────────────────────────────

export type MediaType = "movie" | "tv" | "book" | "game" | "anime";

/**
 * Search for media metadata using the appropriate API based on type.
 */
export async function searchMedia(
  type: MediaType,
  title: string,
  year?: number,
): Promise<MediaMetadata | null> {
  switch (type) {
    case "movie":
      return searchTmdbMovie(title, year);
    case "tv":
      return searchTmdbTV(title, year);
    case "book":
      // Try Google Books first, fall back to OpenLibrary
      const gb = await searchGoogleBooks(title);
      if (gb) return gb;
      return searchOpenLibrary(title);
    case "game":
      return searchRawg(title);
    case "anime":
      return searchJikan(title);
    default:
      return null;
  }
}
