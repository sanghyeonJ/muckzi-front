import { useEffect, useState } from "react";
import api from "../../api/axios";
import MuckziSwal from "../../utils/swal";
import { Link, useNavigate } from "react-router-dom";

// 최근 활동 패널 공통 틀 (제목 + 전체 보기 + 목록)
function RecentPanel({ title, to, isEmpty, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <Link to={to} className="text-xs text-gray-400 hover:text-gray-900">
          전체 보기 →
        </Link>
      </div>

      {isEmpty ? (
        <p className="py-8 text-center text-xs text-gray-400">아직 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {children}
        </ul>
      )}
    </div>
  );
}

function AdminDashboardPage () {

  const [dashboard, setDashboard] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(null);

  const navigate = useNavigate();

  // 음식점 클릭 → 지도에서 해당 음식점 열기
  const handlePlaceClick = (placeId) => {
    navigate("/", { state: { placeId } });
  };

  const getDashboard = async () => {
    setLoading(true);

    try {
      const [dashboardRes, usersRes, postsRes, reviewsRes] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/users", { params: { page: 0, size: 5 } }),
        api.get("/api/admin/posts", { params: { page: 0, size: 5 } }),
        api.get("/api/admin/reviews", { params: { page: 0, size: 5 } }),
      ]);

      setDashboard(dashboardRes.data);
      setRecentUsers(usersRes.data.content);
      setRecentPosts(postsRes.data.content);
      setRecentReviews(reviewsRes.data.content);
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
    <div className="space-y-6">
      {/** 카드 영역 */}
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

      {/** 최근 활동 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/** 가입 */}
        <RecentPanel title="최근 가입 회원" to="/admin/users" isEmpty={recentUsers === 0}>
          {recentUsers.map((user) => (
            <li key={user.userId} className="flex items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-900">{user.nickname}</p>
                <p className="truncate text-xs text-gray-400">{user.userId}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{user.createdAt?.slice(0, 10)}</span>
            </li>
          ))}
        </RecentPanel>

        {/** 게시글 */}
        <RecentPanel title="최근 게시글" to="/admin/posts" isEmpty={recentPosts === 0}>
          {recentPosts.map((post) => (
            <li key={post.postId} className="flex items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                {post.status === "ACTIVE" ? (
                  <Link
                    to={`/posts/${post.postId}`}
                    target="_black"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-gray-900 hover:underline"
                  >
                    {post.title}
                  </Link>
                ) : (
                  <p className="truncate text-sm text-gray-400 line-through">{post.title}</p>
                )}
                <p className="truncate text-xs text-gray-400">{post.nickname}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{post.createdAt?.slice(0, 10)}</span>
            </li>
          ))}
        </RecentPanel>

        {/** 리뷰 */}
        <RecentPanel title="최근 리뷰" to="/admin/reviews" isEmpty={recentReviews.length === 0}>
          {recentReviews.map((review) => (
            <li key={review.reviewId} className="flex items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className={`truncate text-sm ${
                  review.status === "DELETED" ? "text-gray-400 line-through" : "text-gray-900"
                }`}>
                  {review.content}
                </p>
                <p className="truncate text-xs text-gray-400">
                  📍 {review.placeName} · {review.nickname}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{review.createdAt?.slice(0, 10)}</span>
            </li>
          ))}
        </RecentPanel>

        {/** 인기 음식점 TOP 5 */}
        <RecentPanel
          title="인기 음식점 TOP 5"
          to="/admin/reviews"
          isEmpty={dashboard.popularPlaces.length === 0}
        >
          {dashboard.popularPlaces.map((place, index) => {
            const maxCount = dashboard.popularPlaces[0].reviewCount;
            const percent = (place.reviewCount / maxCount) * 100;

            return (
              <li key={place.placeId} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`w-5 shrink-0 text-center text-sm font-bold ${
                      index === 0 ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {index + 1}
                    </span>
                    <button
                      onClick={() => handlePlaceClick(place.placeId)}
                      className="truncate text-sm text-gray-900 hover:underline"
                    >
                      {place.placeName}
                    </button>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    리뷰 {place.reviewCount}
                  </span>
                </div>

                {/* 리뷰 수 막대 */}
                <div className="ml-8 mt-2 h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-gray-900"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </RecentPanel>
      </div>
    </div>
  );

}

export default AdminDashboardPage;