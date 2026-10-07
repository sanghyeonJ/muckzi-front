import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useEffect, useState } from 'react';

import logo from '../assets/muckzi-logo.svg';

function Header() {

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setIsAdmin(false);
      return;
    }

    const checkRole = async () => {
      try {
        const response = await api.get("/api/users/me");
        setIsAdmin(response.data.role === "ADMIN");
      } catch (error) {
        console.error(error);
        setIsAdmin(false);
      }
    }

    checkRole();
  }, [accessToken]);

  const handleLogout = async () => {

    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error(error);
      // 서버 호출이 실패해도 클라이언트 로그아웃은 진행
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  return (
    <header className="border-b border-grey-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          aria-label="홈으로 이동"
        >
          <img src={logo} alt="먹지" className="h-9 w-auto" />
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/posts" className="text-gray-700 hover:text-gray-900">게시판</Link>
          <span className="h-4 w-px bg-gray-200" />
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className='font-semibold text-gray-900 hover:underline'
                >
                  관리자
                </Link>
              )}
              <Link
                to="/mypage"
                className="text-gray-700 hover:text-gray-900"
              >
                마이페이지
              </Link>

              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900"
              >
                로그인
              </Link>

              <Link
                to="/signup"
                className="text-gray-700 hover:text-gray-900"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;