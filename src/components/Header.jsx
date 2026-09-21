import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Header() {

  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  return (
    <header className="border-b border-grey-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-bold text-grey-900"
        >
          먹지
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isLoggedIn ? (
            <>
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