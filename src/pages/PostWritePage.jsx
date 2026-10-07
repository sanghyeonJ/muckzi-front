import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api/axios';
import MuckziSwal from '../utils/swal';
import { getImageUrl } from '../utils/imageUrl';

import PlaceSearchModal from '../components/PlaceSearchModal';

function PostWritePage() {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showPlaceModal, setShowPlaceModal] = useState(false);

  const { postId } = useParams();
  const [existingImages, setExistingImages] = useState([]);
  const [existingPlaces, setExistingPlaces] = useState([]);
  const isEditMode = !!postId;

  useEffect(() => {
    if (!isEditMode) return;

    const getPostDetail = async () => {
      try {
        const response = await api.get(`/api/posts/${postId}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        setExistingImages(response.data.images);
        setExistingPlaces(response.data.places);
      } catch (error) {
        console.error(error);
        MuckziSwal.fire({ text: "게시글 정보를 불러오지 못했습니다." });
        navigate("/posts");
      }
    };

    getPostDetail();
  }, [postId]);

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

      let currentPostId;

      if (isEditMode) {
        await api.put(`/api/posts/${postId}`, {title, content});
        currentPostId = postId;
      } else {
        const response = await api.post("/api/posts", { title, content });
        currentPostId = response.data.postId;
      }

      if(images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("files", image);
        });

        await api.post(`/api/posts/${currentPostId}/images`, formData)
      }

      if (selectedPlaces.length > 0) {
        await api.post(`/api/posts/${currentPostId}/places`, {
          places: selectedPlaces
        })
      }

      toast.success(isEditMode ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
      navigate(`/posts/${currentPostId}`);

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

  const handleExistingImageRemove = async (postImageId) => {
    try {
      await api.delete(`/api/posts/${postId}/images/${postImageId}`);
      setExistingImages((prev) => 
        prev.filter((image) => image.postImageId != postImageId)
      )
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "이미지 삭제에 실패했습니다." });
    }
  }

  const handlePlaceConfirm = (places) => {
    setSelectedPlaces((prev) => [...prev, ...places]);
  }
  const handlePlaceRemove = (index) => {
    setSelectedPlaces((prev) => prev.filter((_, i) => i !== index));
  }

  const handleExistingPlaceRemove = async (postPlaceLinkId) => {
    try {
      await api.delete(`/api/posts/${postId}/places/${postPlaceLinkId}`);
      setExistingPlaces((prev) => 
        prev.filter((place) => place.postPlaceLinkId != postPlaceLinkId)
      );
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "음식점 링크 삭제에 실패했습니다." });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-3xl">

        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {isEditMode ? "게시글 수정" : "글쓰기"}
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
              maxLength={200}
              placeholder="제목을 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={4000}
              placeholder="내용을 입력해주세요"
              rows={10}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {content.length} / 4000
            </p>
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
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-600"
            >
              이미지 선택
            </button>

            {(existingImages.length > 0 || images.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {/** 기존 이미지 (수정모드) */}
                {existingImages.map((image, index) => (
                  <div key={`existing-${image.postImageId}`} className='relative'>
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt={`기존 이미지 ${index + 1}`}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleExistingImageRemove(image.postImageId)}
                      aria-label={`기존 이미지 ${index + 1} 삭제`}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`새 이미지 ${index + 1} (${image.name})`}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      aria-label={`새 이미지 ${index + 1} 삭제`}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                음식점 링크
              </label>
              <button
                type="button"
                onClick={() => setShowPlaceModal(true)}
                className="text-sm text-brand-600 underline hover:text-brand-700"
              >
                음식점 링크 연결
              </button>
            </div>

            {(existingPlaces.length > 0 || selectedPlaces.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {/* 기존 음식점 링크 (수정) */}
                {existingPlaces.map((place) => (
                  <span
                    key={`existing-${place.postPlaceLinkId}`}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
                  >
                    📍 {place.placeName}
                    <button
                      type="button"
                      onClick={() => handleExistingPlaceRemove(place.postPlaceLinkId)}
                      aria-label={`${place.placeName} 연결 해제`}
                      className="text-gray-400 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {selectedPlaces.map((place, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
                  >
                    📍 {place.placeName}
                    <button
                      type="button"
                      onClick={() => handlePlaceRemove(index)}
                      aria-label={`${place.placeName} 연결 해제`}
                      className="text-gray-400 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {showPlaceModal && (
            <PlaceSearchModal
              onClose={() => setShowPlaceModal(false)}
              onConfirm={handlePlaceConfirm}
              alreadySelected={[...existingPlaces, ...selectedPlaces]}
            />
          )}

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
              className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isEditMode ? "수정" : "등록"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

export default PostWritePage;