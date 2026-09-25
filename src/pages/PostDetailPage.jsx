import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function PostDetailPage() {

  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 게시글 상세 조회
  useEffect(() => {
    const getPostDetail = async () => {
      try {
        const response = await api.get(`/api/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error(error);
        MuckziSwal.fire({
          text: error.response?.data?.message || "게시글을 불러오지 못했습니다."
        });
        navigate("/posts");
      }
    };

    getPostDetail();
  },[postId]);

  // 현재 로그인한 사용자 정보 조회
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if(!accessToken) {
      setCurrentUserId(null);
      return;
    }

    const getMe = async () => {
      try {
        const response = await api.get("/api/users/me");
        setCurrentUserId(response.data.userId)
      } catch (error) {
        console.error(error);
        setCurrentUserId(null);
      }
    };

    getMe();
  }, []);

  // 음식점 링크 클릭
  const handlePlaceClick = (placeId) => {
    navigate('/', { state: { placeId } });
  }

  if (!post) {
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

      <div className="mx-auto w-full max-w-3xl">

        {/* 목록으로 이동 */}
        <button
          onClick={() => navigate("/posts")}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          ← 목록
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          {/* 제목 + 작성자/날짜 */}
          <h1 className="text-2xl font-bold text-gray-900">
            {post.title}
          </h1>

          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>{post.nickname}</span>
            <span>{post.createdAt.slice(0, 10)}</span>
          </div>

          {/* 이미지 갤러리 */}
          {post.images.length > 0 && (
            <div className="mt-5 flex gap-3 overflow-x-auto">
              {post.images.map((image) => (
                <img
                  key={image.postImageId}
                  src={`http://localhost:8080${image.imageUrl}`}
                  alt=""
                  className="h-48 w-48 shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {/* 본문 */}
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-gray-700">
            {post.content}
          </p>

          {/* 연결된 음식점 링크 */}
          {post.places.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                연결된 음식점
              </h3>

              <div className="flex flex-wrap gap-2">
                {post.places.map((place) => (
                  <button
                    key={place.postPlaceLinkId}
                    onClick={() => handlePlaceClick(place.placeId)}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
                  >
                    📍 {place.placeName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 본인 글일 때만 수정/삭제 버튼 */}
          {post.userId === currentUserId && (
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                수정
              </button>
              <button
                className="text-sm text-gray-500 hover:text-red-600"
              >
                삭제
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );

}

export default PostDetailPage;