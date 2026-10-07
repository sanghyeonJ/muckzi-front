import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import MuckziSwal from "../../utils/swal";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";

// 상태별 표시 이름과 뱃지 색
const STATUS_LABELS = {
  ACTIVE: { label: "정상", className: "bg-green-100 text-green-700" },
  DELETED: { label: "삭제", className: "bg-gray-100 text-gray-500" },
};

function AdminReviewPage () {

  const [reviews, setReviews] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getReviews = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/admin/reviews", {
        params: {
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          size: 10
        }
      });

      setReviews(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: "리뷰 목록을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getReviews();
  }, [currentPage, searchKeyword, statusFilter]);

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(keyword.trim());
    setCurrentPage(0);
  }

  // 상태 필터 변경
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  }

  // 상태 변경
  const handleStatusChange = async (review, newStatus) => {
    const actionText = newStatus === "DELETED" ? "삭제" : "복구";
    const preview = review.content.length > 20 ? 
      review.content.slice(0, 20) + "..." :
      review.content;

    const result = await MuckziSwal.fire({
      text: `"${preview}" 리뷰를 ${actionText}하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: actionText,
      cancelButtonText: "취소"
    });
    if (!result.isConfirmed) return;

    try {
      await api.patch(`/api/admin/reviews/${review.reviewId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success(`${actionText}되었습니다.`);
      getReviews();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({
        text: error.response?.data?.message || `${actionText}에 실패했습니다.`
      });
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">리뷰 관리</h1>

      {/** 검색 상태 필터 */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input 
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="내용, 음식점, 아이디, 닉네임 검색"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            검색
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">전체</option>
          <option value="ACTIVE">정상</option>
          <option value="DELETED">삭제</option>
        </select>
      </div>

      {/** 리뷰 목록 */}
      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">리뷰가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-3 py-3 font-medium">번호</th>
                <th className="px-3 py-3 font-medium">음식점</th>
                <th className="px-3 py-3 font-medium">내용</th>
                <th className="px-3 py-3 font-medium">작성자</th>
                <th className="px-3 py-3 font-medium">상태</th>
                <th className="px-3 py-3 font-medium">작성일</th>
                <th className="px-3 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.reviewId}>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">{review.reviewId}</td>
                  <td className="max-w-[10rem] truncate px-3 py-3">
                    <Link
                      to={`/?placeId=${review.placeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-brand-600 hover:underline"
                    >
                      📍 {review.placeName}
                    </Link>
                  </td>
                  <td className={`max-w-xs truncate px-3 py-3 ${
                    review.status === "DELETED" ? "text-gray-400 line-through" : "text-gray-900"
                  }`}>
                    {review.content}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                    {review.nickname}
                    <span className="ml-1 text-xs text-gray-400">({review.userId})</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_LABELS[review.status].className}`}>
                      {STATUS_LABELS[review.status].label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                    {review.createdAt?.slice(0, 10)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    {review.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleStatusChange(review, "DELETED")}
                        className="text-sm text-red-600 hover:underline"
                      >
                        삭제
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(review, "ACTIVE")}
                        className="text-sm text-brand-600 hover:underline"
                      >
                        복구
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) }

      {/* 페이지네이션 */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );

}

export default AdminReviewPage;