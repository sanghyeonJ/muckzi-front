import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

import MuckziSwal from '../utils/swal';

import PasswordChangeModal from '../components/PasswordChangeModal';

function MyPage() {

  const [user, setUser] = useState(null);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'bookmark'
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateNickname = async () => {
    if(!nicknameInput.trim()){
      MuckziSwal.fire({
        text: "닉네임을 입력해주세요."
      });
      return;
    }

    try {
      await api.patch("/api/users/me/nickname", {nickname: nicknameInput});

      setUser({...user, nickname: nicknameInput});
      setIsEditingNickname(false);

      MuckziSwal.fire({
        text: "닉네임이 변경되었습니다."
      })
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({
        text: error.response?.data?.message || "닉네임 변경에 실패했습니다."
      })
    }
  }

  useEffect(() => {

    const getMyInfo = async () => {

      try {

        const response = await api.get("/api/users/me");

        setUser(response.data);

      } catch (error) {

        console.error(error);
        MuckziSwal.fire({
          text: "내 정보를 불러오지 못했습니다."
        });

      }

    };

    getMyInfo();

  }, []);

  useEffect(() => {
    if(activeTab !== "review") return;

    const getMyReviews = async () => {
      setReviewsLoading(true);

      try {
        const response = await api.get("/api/places/reviews/me");
        setMyReviews(response.data);
      } catch (error) {
        console.error(error);
        MuckziSwal.fire({
          text: "리뷰목록을 불러오지 못했습니다."
        });
      } finally {
        setReviewsLoading(false);
      }
    }

    getMyReviews();
  }, [activeTab]);

  // 리뷰 클릭
  const handleReviewClick = (placeId) => {
    navigate('/', { state: { placeId } });
  };

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

              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm"
                  />
                  <button
                    onClick={handleUpdateNickname}
                    className="text-sm font-medium text-blue-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditingNickname(false)}
                    className="text-sm text-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {user.nickname}
                  </span>
                  <button
                    onClick={() => {
                      setNicknameInput(user.nickname);
                      setIsEditingNickname(true);
                    }}
                    className="text-xs text-gray-400 underline"
                  >
                    수정
                  </button>
                </div>
              )}
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

            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-sm text-gray-500">
                비밀번호
              </span>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-xs text-gray-400 underline"
              >
                변경
              </button>
            </div>

          </div>

        </div>


        {/* 탭 */}
        <div className="mt-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'review'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400'
            }`}
          >
            내 리뷰
          </button>
          <button
            onClick={() => setActiveTab('bookmark')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'bookmark'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400'
            }`}
          >
            북마크
          </button>
        </div>

        {/* 탭 내용 */}
        <div className="mt-4">

          {activeTab === 'review' && (
            reviewsLoading ? (
              <p className="py-10 text-center text-sm text-gray-400">
                불러오는 중...
              </p>
            ) : myReviews.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                작성한 리뷰가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review) => (
                  <div
                    key={review.reviewId}
                    onClick={() => handleReviewClick(review.placeId)}
                    className="rounded-2xl bg-white p-5 shadow-sm cursor-pointer"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {review.placeName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {review.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {review.content}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'bookmark' && (
            <p className="py-10 text-center text-sm text-gray-400">
              북마크 기능은 준비 중입니다.
            </p>
          )}

        </div>

      </div>

      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => setShowPasswordModal(false)}
        />
      )}

    </div>
  );
}

export default MyPage;
