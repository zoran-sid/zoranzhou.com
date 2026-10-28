type CommentId = string | number;
export type LikeState =
  "pending" | "liked" | "ready" | "login" | "error" | "unknown";
export interface LikeComment {
  objectId: CommentId;
  like?: number;
  children?: LikeComment[];
}
interface LikeResult {
  objectId: string;
  liked: boolean;
  count: number;
}
interface LikeUser {
  objectId?: CommentId;
  token?: string;
}

/** Server state is authoritative; WALINE_LIKE is only the widget's reactive view. */
export function createCommentLikeHandler({
  likes,
  getUser,
  read,
  save,
  report,
}: {
  likes: { value: CommentId[] };
  getUser: () => LikeUser;
  read: (ids: string[], token: string) => Promise<LikeResult[]>;
  save: (id: string, token: string) => Promise<LikeResult>;
  report: (id: CommentId, state: LikeState, liked: boolean) => void;
}) {
  const pending = new Set<string>();
  let session = "";
  let revision = 0;
  let disposed = false;
  function current(token: string) {
    return !disposed && getUser().token === token;
  }
  function setLiked(id: CommentId, liked: boolean) {
    likes.value = likes.value.filter((value) => String(value) !== String(id));
    if (liked) likes.value = [...likes.value, id];
  }
  function apply(comment: LikeComment, result: LikeResult) {
    comment.like = result.count;
    setLiked(comment.objectId, result.liked);
    report(comment.objectId, result.liked ? "liked" : "ready", result.liked);
  }
  const like = async (comment: LikeComment) => {
    if (disposed) return;
    const { token, objectId: userId } = getUser();
    const id = String(comment.objectId);
    if (!token || !userId) {
      report(comment.objectId, "login", false);
      return;
    }
    const pendingKey = `${token}:${id}`;
    if (pending.has(pendingKey)) return;
    if (likes.value.some((value) => String(value) === id)) {
      report(comment.objectId, "liked", true);
      return;
    }
    pending.add(pendingKey);
    const before = Number(comment.like) || 0;
    comment.like = before + 1;
    setLiked(comment.objectId, true);
    report(comment.objectId, "pending", true);
    let sent = false;
    try {
      // Verify protocol and account state before any mutation (also safe during rollout).
      const [existing] = await read([id], token);
      if (!existing) throw new Error("Comment unavailable");
      if (!current(token)) return;
      if (existing.liked) {
        apply(comment, existing);
        return;
      }
      sent = true;
      const saved = await save(id, token);
      if (current(token)) apply(comment, saved);
    } catch {
      if (!current(token)) return;
      if (sent) {
        try {
          const [confirmed] = await read([id], token);
          if (!current(token)) return;
          if (confirmed) {
            apply(comment, confirmed);
            if (!confirmed.liked) report(comment.objectId, "error", false);
            return;
          }
        } catch {
          /* A lost response is not proof that the write failed. */
        }
        if (!current(token)) return;
        // Keep pending appearance until an authoritative refresh; never re-increment.
        report(comment.objectId, "unknown", true);
      } else {
        comment.like = before;
        setLiked(comment.objectId, false);
        report(comment.objectId, "error", false);
      }
    } finally {
      pending.delete(pendingKey);
    }
  };
  like.sync = async (comments: LikeComment[]) => {
    const token = getUser().token || "";
    const version = ++revision;
    if (session !== token) {
      session = token;
      likes.value = [];
    }
    if (!token) {
      for (const comment of comments) report(comment.objectId, "ready", false);
      return;
    }
    if (!comments.length) return;
    try {
      const items: LikeResult[] = [];
      for (let i = 0; i < comments.length; i += 100) {
        items.push(
          ...(await read(
            comments.slice(i, i + 100).map((c) => String(c.objectId)),
            token,
          )),
        );
      }
      if (!current(token) || revision !== version) return;
      for (const comment of comments) {
        const result = items.find(
          (item) => item.objectId === String(comment.objectId),
        );
        if (result && !pending.has(`${token}:${comment.objectId}`))
          apply(comment, result);
      }
    } catch {
      /* Keep reading comments available when like status cannot be loaded. */
    }
  };
  like.dispose = () => {
    disposed = true;
    revision++;
  };
  // Old anonymous/browser-only records cannot be assigned to a signed-in account.
  likes.value = [];
  return like;
}

export function flattenComments(comments: LikeComment[]): LikeComment[] {
  return comments.flatMap((comment) => [
    comment,
    ...flattenComments(comment.children || []),
  ]);
}

export function createLikeTransport(
  serverURL: string,
  fetcher: typeof fetch = fetch,
) {
  const base = `${serverURL.replace(/\/$/, "")}/api/comment`;
  async function request(url: string, token: string, write = false) {
    const response = await fetcher(url, {
      method: write ? "PUT" : "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(write ? { "Content-Type": "application/json" } : {}),
      },
      ...(write ? { body: JSON.stringify({ like: true }) } : {}),
      signal: AbortSignal.timeout(20000),
    });
    const body = await response.json();
    if (
      !response.ok ||
      body.errno !== 0 ||
      body.data?.protocol !== "account-likes-v1"
    ) {
      throw new Error("Account like service unavailable");
    }
    return body.data;
  }
  function validate(value: LikeResult): LikeResult {
    if (
      !value ||
      typeof value.objectId !== "string" ||
      typeof value.liked !== "boolean" ||
      !Number.isSafeInteger(value.count) ||
      value.count < 0
    )
      throw new Error("Invalid like state");
    return value;
  }
  return {
    read: async (ids: string[], token: string): Promise<LikeResult[]> => {
      const data = await request(
        `${base}?type=likes&ids=${encodeURIComponent(ids.join(","))}`,
        token,
      );
      if (!Array.isArray(data.items)) throw new Error("Invalid like states");
      return data.items.map(validate);
    },
    save: async (id: string, token: string): Promise<LikeResult> => {
      const result = validate(
        await request(`${base}/${encodeURIComponent(id)}`, token, true),
      );
      if (result.objectId !== id || !result.liked)
        throw new Error("Unconfirmed like");
      return result;
    },
  };
}
