import { Link, useNavigate } from "react-router-dom";

function NotFoundPage () {

  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">

      <div className="text-center">
        <p className="text-6xl font-bold text-gray-900">404</p>

        <h1 className="mt-4 text-lg font-semibold text-gray-900">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          주소가 잘못되었거나 삭제된 페이지입니다.
        </p>

        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            이전 페이지
          </button>
          <Link
            to="/"
            className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            메인으로
          </Link>
        </div>
      </div>

    </div>
  );

}

export default NotFoundPage;