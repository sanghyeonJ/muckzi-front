import { useEffect, useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function CommentSection ({ postId, currentUserId }) {

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const getComments = async () => {
    try {
      const response = await api.get(`/api/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getComments();
  }, [postId]);

  const totalCount = comments.reduce(
    (sum, comment) => sum + 1 + comment.replies.length, 0
  );

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      MuckziSwal.fire({ text: "로그인이 필요합니다." });
      return;
    }
    if (!content.trim()) {
      MuckziSwal.fire({ text: "댓글 내용을 입력해주세요." });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/posts/${postId}/comments`, { content });
      setContent("");
      getComments();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "댓글 작성에 실패했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReplyToggle = (commentId) => {
    if (!currentUserId) {
      MuckziSwal.fire({ text: "로그인이 필요합니다." });
      return;
    }

    if (replyTargetId === commentId) {
      setReplyTargetId(null);
    } else {
      setReplyTargetId(commentId);
    }
    setReplyContent("");
  }

  // 답글 작성
  const handleReplySubmit = async (e, parentId) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      MuckziSwal.fire({ text: "답글 내용을 입력해주세요." });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/api/posts/${postId}/comments`, {
        content: replyContent,
        parentId
      });
      setReplyContent("");
      setReplyTargetId(null);
      getComments();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "답글 작성에 실패했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        댓글 {totalCount}
      </h3>

      {/** 댓글 작성 */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={currentUserId ? "댓글을 입력해주세요." : "로그인 후 댓글을 작성할 수 있습니다."}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </form>

      {/** 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">첫 댓글을 남겨보세요.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <div key={comment.commentId} className="py-4">
              {comment.deleted ? (
                <p className="text-sm text-gray-400">{comment.content}</p>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">{comment.nickname}</span>
                    <span>{comment.createdAt.slice(0,10)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{comment.content}</p>
                  <button
                    onClick={() => handleReplyToggle(comment.commentId)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-900"
                  >
                    {replyTargetId === comment.commentId ? "답글 취소" : "답글"}
                  </button>
                </div>
              )}

              {/** 답글 */}
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.commentId}>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">{reply.nickname}</span>
                        <span>{reply.createdAt.slice(0, 10)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/** 답글 입력 */}
              {replyTargetId === comment.commentId && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.commentId)}
                  className="mt-3 border-l-2 border-gray-100 pl-4"
                >
                  <textarea 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 입력해주세요."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                    >
                      답글 등록
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default CommentSection;