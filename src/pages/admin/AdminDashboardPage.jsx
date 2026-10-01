import { useEffect, useState } from "react";
import api from "../../api/axios";
import MuckziSwal from "../../utils/swal";
import { Link } from "react-router-dom";

function AdminDashboardPage () {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(null);

  const getDashboard = async () => {
    setLoading(true);

    try {
      const response = await api.get("/api/admin/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: "대시보드의 정보를 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDashboard();
  }, []);

  if (!dashboard) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="py-20 text-center text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  };

  // 카드 목록 (숫자는 dashboard에서 꺼냄)
  const cards = [
    {
      title: "회원",
      to: "/admin/users",
      total: dashboard.totalUsers,
      subs: [
        `오늘 가입 +${dashboard.todayUsers}`,
        `차단 ${dashboard.blackUsers}`
      ]
    },
    {
      title: "게시글",
      to: "/admin/posts",
      total: dashboard.totalPosts,
      subs: [`오늘 +${dashboard.todayPosts}`]
    },
    {
      title: "리뷰",
      to: "/admin/reviews",
      total: dashboard.totalReviews,
      subs: [`오늘 +${dashboard.todayReviews}`]
    },
    {
      title: "댓글",
      to: "/admin/comments",
      total: dashboard.totalComments,
      subs: []
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>

        <button
          onClick={getDashboard}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
        >
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-xl border border-gray-100 bg-gray-50 p-5 transition hover:border-gray-300 hover:bg-white"
          >
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{card.total.toLocaleString()}</p>
            {card.subs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                {card.subs.map((sub) => (
                  <span key={sub}>{sub}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

}

export default AdminDashboardPage;