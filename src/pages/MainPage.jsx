import { useState } from "react";
import NaverMap from "../components/NaverMap";

function MainPage() {

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  const categories = [
    "전체",
    "한식",
    "일식",
    "중식",
    "양식",
    "카페",
    "술집"
  ];

  const filteredRestaurants = 
    selectedCategory === "전체" 
    ? restaurants
    : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

  return (
  <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">

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
                ← 주변 음식점
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
                <h3 className="mb-2 font-bold text-gray-900">
                  리뷰
                </h3>
                <div className="rounded-xl bg-gray-50 p-5 text-center">
                  <p className="text-sm text-gray-500">
                    아직 리뷰가 없습니다.
                  </p>
                </div>
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