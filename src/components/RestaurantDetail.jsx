import { Star } from "lucide-react";

function RestaurantDetail({
  selectedRestaurant,
  reviews,
  handleReviewSubmit,
  isSubmittingReview,
  setSelectedRestaurant,
  isBookmarked,
  handleBookmark
}){
  return (
    <div className="h-full">

      {/* 음식점 상세 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 lg:px-5">

        {/* 목록으로 돌아가기 */}
        <button
          onClick={() => setSelectedRestaurant(null)}
          className="mb-3 text-sm text-gray-500 cursor-pointer hover:text-gray-900"
        >
          ← 목록
        </button>

        <div className="flex gap-4 items-start">
          <h2 className="text-xl font-bold text-gray-900 basis-full">
            {selectedRestaurant.placeName}
          </h2>
          <button
            className="flex-none flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-100 active:scale-95 transition"
            onClick={handleBookmark}
          >
            <Star
              size={20}
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          {selectedRestaurant.category}
        </p>
      </div>

      <div className="space-y-5 p-4 lg:p-5">

        {/* 주소 */}
        <div>
          <h3 className="mb-2 font-bold text-gray-900">
            주소
          </h3>

          <p className="text-sm text-gray-600">
            {selectedRestaurant.address}
          </p>
        </div>

        {/* 리뷰 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">
                리뷰
              </h3>

              <span className="text-sm text-gray-500">
                {reviews.length}개
              </span>
            </div>

            {/* 리뷰 작성 버튼 */}
            <button
              onClick={handleReviewSubmit}
              disabled={isSubmittingReview}
              className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white cursor-pointer transition hover:bg-gray-800 disabled:opacity-50"
            >
              리뷰 작성
            </button>
          </div>

          {/* 리뷰가 없는 경우 */}
          {reviews.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">
                아직 리뷰가 없습니다.
              </p>
            </div>
          ) : (

            /* 리뷰 목록 */
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="rounded-xl bg-gray-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {review.nickname}
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* pre-line으로 리뷰의 줄바꿈 유지 */}
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;