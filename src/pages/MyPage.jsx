import { useEffect, useState } from 'react';
import api from '../api/axios';

function MyPage() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const getMyInfo = async () => {

      try {

        const response = await api.get("/api/users/me");

        setUser(response.data);

      } catch (error) {

        console.error(error);
        alert("내 정보를 불러오지 못했습니다.");

      }

    };

    getMyInfo();

  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-2xl">

        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            마이페이지
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            내 회원 정보를 확인할 수 있습니다.
          </p>
        </div>

        {/* 프로필 */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-xl font-bold text-white">
              {user.nickname.charAt(0)}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.nickname}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                @{user.userId}
              </p>
            </div>

          </div>

        </div>

        {/* 회원 정보 */}
        <div className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="font-semibold text-gray-900">
              회원 정보
            </h2>
          </div>

          <div className="divide-y divide-gray-100">

            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-sm text-gray-500">
                아이디
              </span>

              <span className="text-sm font-medium text-gray-900">
                {user.userId}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-sm text-gray-500">
                닉네임
              </span>

              <span className="text-sm font-medium text-gray-900">
                {user.nickname}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-sm text-gray-500">
                권한
              </span>

              <span className="text-sm font-medium text-gray-900">
                {user.role}
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-sm text-gray-500">
                계정 상태
              </span>

              <span className="text-sm font-medium text-gray-900">
                {user.status}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MyPage;
