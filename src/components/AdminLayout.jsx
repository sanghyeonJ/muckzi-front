import { NavLink, Outlet } from "react-router-dom";

const menus = [
  { to: "/admin", label: "대시보드", end: true },
  { to: "/admin/users", label: "회원 관리" },
  { to: "/admin/posts", label: "게시글 관리" },
  { to: "/admin/comments", label: "댓글 관리" },
  { to: "/admin/reviews", label: "리뷰 관리" }
]

function AdminLayout () {

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row">

        {/** 사이드 메뉴 */}
        <aside className="shrink-0 rounded-2xl bg-white p-4 shadow-sm md:w-48 md:self-start">
          <h2 className="mb-3 px-3 text-xs font-semibold text-gray-400">관리자</h2>

          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {menus.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => 
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-600 font-semibold text-white"
                      : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/** 메인 영역 */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );

}

export default AdminLayout;