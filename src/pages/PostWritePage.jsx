import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MuckziSwal from '../utils/swal';

function PostWritePage() {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!title.trim()) {
      MuckziSwal.fire({ text: "제목을 입력해주세요." });
      return;
    }

    if (!content.trim()) {
      MuckziSwal.fire({ text: "내용을 입력해주세요." });
      return;
    }

    try {

      setIsSubmitting(true);

      const response = await api.post("/api/posts", { title, content });
      const postId = response.data.postId;

      if(images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("files", image);
        });

        await api.post(`/api/posts/${postId}/images`, formData)
      }

      MuckziSwal.fire({ text: "게시글이 등록되었습니다." });
      navigate(`/posts/${postId}`);

    } catch (error) {

      console.error(error);
      MuckziSwal.fire({
        text: error.response?.data?.message || "게시글 등록에 실패했습니다.",
      });

    } finally {
      setIsSubmitting(false);
    }

  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  }

  const handleImageRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-3xl">

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          글쓰기
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력해주세요"
              rows={10}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              이미지
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              이미지 선택
            </button>

            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt=""
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/posts")}
              className="rounded-lg px-4 py-2 text-sm text-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              등록
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

export default PostWritePage;