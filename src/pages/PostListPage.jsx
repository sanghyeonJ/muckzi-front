import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function PostListPage () {

  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);

      try {
        const response = await api.get("/api/posts", {
          params: {
            page: currentPage,
            size: 10
          }
        });

        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error(error);
        MuckziSwal.fire({
          text: "게시글 목록을 불러오지 못했습니다."
        })
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  },[currentPage]);

  const handleWriteClick = () => {
    const accessToken = localStorage.getItem("accessToken");

    if(!accessToken) {
      MuckziSwal.fire({text: "로그인이 필요합니다."});
      return;
    }

    navigate("/posts/write");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-3xl">

        {/* 페이지 제목 + 글쓰기 버튼 */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            자유게시판
          </h1>

          <button
            onClick={handleWriteClick}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            글쓰기
          </button>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400">
            불러오는 중...
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              작성된 게시글이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.postId}
                to={`/posts/${post.postId}`}
                className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h2 className="font-bold text-gray-900">
                  {post.title}
                </h2>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.nickname}</span>
                  <span>{post.createdAt.slice(0, 10)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 w-9 rounded-lg text-sm ${
                  page === currentPage
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page + 1}
              </button>
            ))}
          </div>
        )}

      </div>

    </div>
  );

}

export default PostListPage;