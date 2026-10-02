import { useEffect, useState } from "react";
import api from "../../api/axios";
import MuckziSwal from "../../utils/swal";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// 상태별 표시 이름과 뱃지 색
const STATUS_LABELS = {
  ACTIVE: { label: "정상", className: "bg-green-100 text-green-700" },
  DELETED: { label: "삭제됨", className: "bg-gray-100 text-gray-500" },
};

function AdminCommentPage () {

  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getComments = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/admin/comments", {
        params: {
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          size: 10
        }
      });

      setComments(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: "댓글 목록을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getComments();
  }, [currentPage, searchKeyword, statusFilter]);

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(e.target.value);
    setCurrentPage(0);
  }

  // 상태 필터 변경
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  }

  // 삭제
  const handleDelete = async (comment) => {
    const preview = comment.content.length > 20 ? 
      comment.content.slice(0, 20) + "..." :
      comment.content;

    const result = await MuckziSwal.fire({
      text: `"${preview}" ${comment.parentId ? "답글" : "댓글"}을 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소"
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/admin/comments/${comment.commentId}`);
      toast.success("삭제되었습니다.");
      getComments();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "삭제에 실패했습니다." });
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">댓글 관리</h1>

      {/** 검색 상태 필터 */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input 
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="내용, 아이디, 닉네임 검색"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
          />
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
            검색
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          <option value="">전체</option>
          <option value="ACTIVE">정상</option>
          <option value="DELETED">삭제됨</option>
        </select>
      </div>

      {/** 댓글 목록 테이블 */}
      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">댓글이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-3 py-3 font-medium">번호</th>
                <th className="px-3 py-3 font-medium">구분</th>
                <th className="px-3 py-3 font-medium">내용</th>
                <th className="px-3 py-3 font-medium">게시글</th>
                <th className="px-3 py-3 font-medium">작성자</th>
                <th className="px-3 py-3 font-medium">상태</th>
                <th className="px-3 py-3 font-medium">작성일</th>
                <th className="px-3 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <tr key={comment.commentId}>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">{comment.commentId}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                    {comment.parentId ? "답글" : "댓글"}
                  </td>
                  <td className={`max-w-xs truncate px-3 py-3 ${comment.status === "DELETED" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {comment.content}
                  </td>
                  <td className="max-w-[10rem] truncate px-3 py-3">
                    {comment.postStatus === "ACTIVE" ? (
                      <Link
                        to={`/posts/${comment.postId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:underline"
                      >
                        {comment.postTitle}
                      </Link>
                    ) : (
                      <span
                        className="text-gray-400 line-through"
                        title="삭제된 게시글"
                      >
                        {comment.postTitle}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                    {comment.nickname}
                    <span className="ml-1 text-xs text-gray-400">({comment.userId})</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_LABELS[comment.status].className}`}>
                      {STATUS_LABELS[comment.status].label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">{comment.createdAt?.slice(0, 10)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    {comment.status === "ACTIVE" && (
                      <button
                        onClick={() => handleDelete(comment)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/** 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 rounded-lg text-sm ${
                page === currentPage ?
                  "bg-black text-white" :
                  "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );

}

export default AdminCommentPage;