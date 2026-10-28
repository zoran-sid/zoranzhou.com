type CommentId = string | number;
export type LikeState = "pending" | "liked" | "unliked" | "error";
interface LikeComment {
  objectId: CommentId;
  like?: number;
}

/** Keep Waline's reactive state and storage in sync while the request is pending. */
export function createCommentLikeHandler({
  likes,
  save,
  report,
}: {
  likes: { value: CommentId[] };
  save: (comment: LikeComment, liked: boolean) => Promise<unknown>;
  report: (id: CommentId, state: LikeState, liked: boolean) => void;
}) {
  const pending = new Set<CommentId>();
  return async (comment: LikeComment) => {
    const id = comment.objectId;
    if (pending.has(id)) return;
    pending.add(id);
    const wasLiked = likes.value.includes(id);
    const before = Number(comment.like) || 0;
    const setLiked = (liked: boolean) => {
      likes.value = likes.value.filter((value) => value !== id);
      if (liked) likes.value = [...likes.value, id];
    };
    setLiked(!wasLiked);
    comment.like = Math.max(0, before + (wasLiked ? -1 : 1));
    report(id, "pending", !wasLiked);
    try {
      await save(comment, !wasLiked);
      likes.value = likes.value.slice(-50);
      report(id, wasLiked ? "unliked" : "liked", !wasLiked);
    } catch {
      // Roll back this comment only; other comments may finish concurrently.
      setLiked(wasLiked);
      comment.like = before;
      report(id, "error", wasLiked);
    } finally {
      pending.delete(id);
    }
  };
}
