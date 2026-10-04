import { useEffect, useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";
import { toast } from "sonner";

function CommentSection ({ postId, currentUserId }) {

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 답글 입력창이 열린 댓글
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // 수정중인 댓글
  const [editTargetId, setEditTargetId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // 댓글 목록 조회
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

  // 댓글 수
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

  // 답글 버튼
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

  // 수정
  const handleEditStart = (item) => {
    setEditTargetId(item.commentId);
    setEditContent(item.content);
    setReplyTargetId(null);
  }
  const handleEditCancel = () => {
    setEditTargetId(null);
    setEditContent("");
  }

  // 수정 저장
  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();

    if (!editContent.trim()) {
      MuckziSwal.fire({ text: "내용을 입력해주세요." });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.put(`/api/comments/${commentId}`, { content: editContent });
      handleEditCancel();
      getComments();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "댓글 수정에 실패했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // 삭제
  const handleDelete = async (commentId) => {
    const result = await MuckziSwal.fire({
      text: "댓글을 삭제하시겠습니까?",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소"
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/comments/${commentId}`);
      toast.success("댓글이 삭제되었습니다.");
      getComments();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "댓글 삭제에 실패했습니다." });
    }
  }

  // 댓글/답글 한 개 그리기 (isReply가 true면 답글)
  const renderItem = (item, isReply) => {
    const isMine = item.userId === currentUserId;
    const isEditing = editTargetId === item.commentId;

    return (
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{item.nickname}</span>
          <span>{item.createdAt.slice(0, 10)}</span>
        </div>

        {isEditing ? (
          // 수정 모드: 내용 자리에 입력창
          <form onSubmit={(e) => handleEditSubmit(e, item.commentId)} className="mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {editContent.length} / 1000
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleEditCancel}
                className="rounded-lg px-4 py-2 text-sm text-gray-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
              {item.content}
            </p>

            <div className="mt-2 flex gap-3 text-xs text-gray-500">
              {!isReply && (
                <button
                  onClick={() => handleReplyToggle(item.commentId)}
                  className="hover:text-gray-900"
                >
                  {replyTargetId === item.commentId ? "답글 취소" : "답글"}
                </button>
              )}
              {isMine && (
                <>
                  <button
                    onClick={() => handleEditStart(item)}
                    className="hover:text-gray-900"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(item.commentId)}
                    className="hover:text-red-600"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

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
          maxLength={1000}
          placeholder={currentUserId ? "댓글을 입력해주세요." : "로그인 후 댓글을 작성할 수 있습니다."}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {content.length} / 1000
        </p>
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
                renderItem(comment, false)
              )}

              {/** 답글 */}
              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.commentId}>
                      {renderItem(reply, true)}
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
                    maxLength={1000}
                    placeholder="답글을 입력해주세요."
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">
                    {replyContent.length} / 1000
                  </p>
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