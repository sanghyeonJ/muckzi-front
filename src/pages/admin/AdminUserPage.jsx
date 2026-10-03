import { useEffect, useState } from "react";
import api from "../../api/axios";
import MuckziSwal from "../../utils/swal";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";

const STATUS_LABELS = {
  ACTIVE: { label: "정상", className: "bg-green-100 text-green-700" },
  BLACK: { label: "차단", className: "bg-red-100 text-red-700" },
  DELETED: { label: "탈퇴", className: "bg-gray-100 text-gray-500" },
};

function AdminUserPage () {

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getUsers = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/admin/users", {
        params: {
          keyword: searchKeyword || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          size: 10
        }
      });

      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: "회원목록을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [currentPage, searchKeyword, statusFilter]);

  // 검색
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchKeyword(keyword.trim());
    setCurrentPage(0);
  };

  // 상태 필터 변경
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  // 차단 / 해제
  const handleStatusChange = async (user, newStatus) => {
    const actionText = newStatus === "BLACK" ? "차단" : "차단 해제";

    const result = await MuckziSwal.fire({
      text: `${user.nickname}(${user.userId}) 회원을 ${actionText}하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: actionText,
      cancelButtonText: "취소"
    });
    if (!result.isConfirmed) return;

    try {
      await api.patch(`/api/admin/users/${user.userId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success(`${actionText}되었습니다.`);
      getUsers();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || `${actionText}에 실패했습니다.` });
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">회원 관리</h1>

      {/** 검색 + 상태 필터 */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input 
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="아이디 또는 닉네임 검색"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >검색</button>
        </form>

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          <option value="">전체</option>
          <option value="ACTIVE">정상</option>
          <option value="BLACK">차단</option>
          <option value="DELETED">탈퇴</option>
        </select>
      </div>

      {/** 회원목록 테이블 */}
      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">
          불러오는 중...
        </p>
      ) : users.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">
          회원이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-3 py-3 font-medium">아이디</th>
                <th className="px-3 py-3 font-medium">닉네임</th>
                <th className="px-3 py-3 font-medium">권한</th>
                <th className="px-3 py-3 font-medium">상태</th>
                <th className="px-3 py-3 font-medium">가입일</th>
                <th className="px-3 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-900">{user.userId}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-700">{user.nickname}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                    {user.role === "ADMIN" ? "관리자" : "일반"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_LABELS[user.status].className}`}>
                      {STATUS_LABELS[user.status].label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                    {user.createdAt?.slice(0, 10)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    {user.role !== "ADMIN" && user.status === "ACTIVE" && (
                      <button 
                        onClick={() => handleStatusChange(user, "BLACK")}
                        className="text-sm text-red-600 hover:underline"
                      >
                        차단
                      </button>
                    )}
                    {user.role !== "ADMIN" && user.status === "BLACK" && (
                      <button
                        onClick={() => handleStatusChange(user, "ACTIVE")}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        차단 해제
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

export default AdminUserPage;