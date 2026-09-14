import { useState, useEffect } from "react";
import NaverMap from "../components/NaverMap";

import api from "../api/axios";

import MuckziSwal from '../utils/swal';

function MainPage() {

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const categories = [
    "전체",
    "한식",
    "일식",
    "중식",
    "양식",
    "카페",
    "술집"
  ];

  const searchPlaces = async (query) => {
    if (!query.trim()) {
      MuckziSwal.fire({
        text: "검색어를 입력해주세요."
      });
      return;
    }

    try{
      const response = await api.get("api/naver/places",{
        params: {query}
      });
      setSearchResults(response.data);
    }catch(error) {
      MuckziSwal.fire({
        text: "장소 검색에 실패했습니다."
      });
    }
  }

  const handleSearchResultClick = (place) => {
    const restaurant = {
      placeId: null,
      placeName: place.title.replace(/<[^>]*>/g, ""),
      category: place.category,
      address: place.roadAddress || place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      isNaverPlace: true,
    };

    setSelectedRestaurant(restaurant);
  };

  useEffect(() => {
    if(!selectedRestaurant){
      setReviews([]);
      return;
    }

    if (!selectedRestaurant.placeId) {
      setReviews([]);
      return;
    }

    const getReviews = async () => {
      try{
        const response = await api.get(`/api/places/${selectedRestaurant.placeId}/reviews`);
        setReviews(response.data);
      }catch(error) {
        Muckzi.fire({
          message: "리뷰를 찾을 수 없습니다."
        });
      }
    }

    getReviews();
  }, [selectedRestaurant]);

  const filteredRestaurants = 
    selectedCategory === "전체" 
    ? restaurants
    : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  return (
  <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
    {/* 검색 */}
    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchPlaces(searchKeyword);
            }
          }}
          placeholder="음식점을 검색해보세요."
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400"
        />

        <button
          onClick={() => searchPlaces(searchKeyword)}
          className="shrink-0 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          검색
        </button>
      </div>
    </div>
    {/* 카테고리 */}
    <div className="shrink-0 border-b border-gray-200 bg-white">
      <div className="flex gap-2 overflow-x-auto px-4 py-3">

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${
              selectedCategory === category
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}

      </div>
    </div>

    {/* 지도 + 음식점 목록 */}
    <div className="relative min-h-0 flex-1">

      {/* 지도 */}
      <div className="h-full lg:ml-80">
        <NaverMap
          selectedCategory={selectedCategory}
          onRestaurantsChange={setRestaurants}
          selectedRestaurant={selectedRestaurant}
          onRestaurantSelect={setSelectedRestaurant}
        />
      </div>

      {/* 음식점 목록 */}
      <aside
        className="
          absolute
          bottom-0
          left-0
          right-0
          z-20
          max-h-[45%]
          overflow-y-auto
          rounded-t-3xl
          bg-white
          shadow-[0_-4px_20px_rgba(0,0,0,0.12)]

          lg:inset-y-0
          lg:left-0
          lg:right-auto
          lg:bottom-auto
          lg:z-10
          lg:h-full
          lg:max-h-none
          lg:w-80
          lg:overflow-y-auto
          lg:rounded-none
          lg:rounded-r-2xl
          lg:border-r
          lg:border-gray-200
          lg:shadow-none
        "
      >

        {selectedRestaurant === null ? (
          /* 목록 헤더 */
          <>
          <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-3 lg:px-5 lg:py-4">

            {/* 모바일 Bottom Sheet 핸들 */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 lg:hidden" />

            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">
                주변 음식점
              </h2>
              <span className="text-sm text-gray-500">
                {filteredRestaurants.length}곳
              </span>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="border-b border-gray-200 px-4 pb-4 lg:px-5">
              <h3 className="mb-3 font-bold text-gray-900">
                검색 결과
              </h3>

              <div className="space-y-2">
                {searchResults.map((place, index) => (
                  <div
                    key={`${place.title}-${index}`}
                    onClick={() => handleSearchResultClick(place)}
                    className="cursor-pointer rounded-xl bg-gray-50 p-4 transition hover:shadow-md"
                  >
                    <h4
                      className="font-bold text-gray-900"
                      dangerouslySetInnerHTML={{ __html: place.title }}
                    />

                    <p className="mt-1 text-sm text-gray-500">
                      {place.category}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {place.roadAddress || place.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 음식점 목록 */}
          <div className="space-y-3 px-4 pb-5 lg:p-3">

            {filteredRestaurants.length === 0 ? (

              <div className="rounded-xl bg-gray-50 p-5 text-center">
                <p className="text-sm text-gray-500">
                  주변에 음식점이 없습니다.
                </p>
              </div>

            ) : (

              filteredRestaurants.map((restaurant) => (

                <div
                  key={restaurant.placeId}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="
                    cursor-pointer
                    rounded-xl
                    bg-gray-50
                    p-4
                    transition
                    hover:shadow-md
                  "
                >
                  <h3 className="font-bold text-gray-900">
                    {restaurant.placeName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {restaurant.category}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {restaurant.address}
                  </p>
                </div>

              ))
            )}
          </div>
          </>
        ) : (
          <div className="h-full">
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 lg:px-5">

              <button
                onClick={() => setSelectedRestaurant(null)}
                className="mb-3 text-sm text-gray-500 hover:text-gray-900"
              >
                ← 목록
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                {selectedRestaurant.placeName}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {selectedRestaurant.category}
              </p>

            </div>

            <div className="space-y-5 p-4 lg:p-5">

              <div>
                <h3 className="mb-2 font-bold text-gray-900">
                  주소
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedRestaurant.address}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">
                    리뷰
                  </h3>

                  <span className="text-sm text-gray-500">
                    {reviews.length}개
                  </span>
                </div>

                {reviews.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-5 text-center">
                    <p className="text-sm text-gray-500">
                      아직 리뷰가 없습니다.
                    </p>
                  </div>
                ) : (
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
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-gray-700">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
        
      </aside>
    </div>
  </div>
);
}

export default MainPage;