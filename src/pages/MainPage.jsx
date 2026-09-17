import { useState, useEffect } from "react";

import NaverMap from "../components/NaverMap";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";
import RestaurantDetail from "../components/RestaurantDetail";

function MainPage() {
  // 현재 선택된 음식점 카테고리
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 현재 선택된 음식점
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // 현재 지도 영역에 표시되는 Muckzi 음식점 목록
  const [restaurants, setRestaurants] = useState([]);

  // 현재 선택된 음식점의 리뷰 목록
  const [reviews, setReviews] = useState([]);

  // 네이버 장소 검색 결과
  const [searchResults, setSearchResults] = useState([]);

  // 검색창에 입력된 검색어
  const [searchKeyword, setSearchKeyword] = useState("");

  // 리뷰 등록 진행 여부
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 북마크 여부
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 음식점 카테고리 목록
  const categories = [
    "전체",
    "한식",
    "일식",
    "중식",
    "양식",
    "카페",
    "술집",
  ];

  // 네이버 장소 검색
  const searchPlaces = async (query) => {
    // 검색어가 비어 있으면 API 요청하지 않음
    if (!query.trim()) {
      MuckziSwal.fire({
        text: "검색어를 입력해주세요."
      });

      return;
    }

    try{
      const response = await api.get("/api/naver/places",{
        params: {query}
      });
      setSearchResults(response.data);
    }catch(error) {
      MuckziSwal.fire({
        text: "장소 검색에 실패했습니다."
      });
    }
  };

  // 네이버 검색 결과에서 음식점 선택
  const handleSearchResultClick = (place) => {
    // 네이버 검색 결과의 음식점 이름에서 HTML 태그 제거
    const placeName = place.title.replace(/<[^>]*>/g, "");

    // 네이버 검색 결과에서 사용할 주소
    const address = place.roadAddress || place.address;

    // 현재 지도에 불러온 Muckzi 음식점 중
    // 같은 음식점이 이미 존재하는지 확인
    const existingRestaurant = restaurants.find(
      (restaurant) =>
        restaurant.placeName === placeName &&
        restaurant.address === address
    );

    // 이미 Muckzi에 등록된 음식점이라면
    // 기존 음식점 정보를 사용한다.
    //
    // 기존 placeId를 그대로 사용하기 때문에
    // 선택 직후 해당 음식점의 리뷰를 조회할 수 있다.
    if (existingRestaurant) {
      setSelectedRestaurant(existingRestaurant);
      return;
    }

    // 아직 Muckzi에 등록되지 않은 음식점이라면
    // 네이버 검색 결과를 임시 음식점 정보로 사용한다.
    //
    // placeId가 없기 때문에 현재는 리뷰 조회가 이루어지지 않는다.
    // 이후 리뷰를 등록하면 백엔드에서 Place가 생성되고 placeId를 받는다.
    const restaurant = {
      placeId: null,
      placeName,
      category: place.category,
      address,
      latitude: place.latitude,
      longitude: place.longitude,
      isNaverPlace: true,
    };

    setSelectedRestaurant(restaurant);
  };

  // 선택된 음식점이 변경되면 해당 음식점의 리뷰 조회
  useEffect(() => {
    // 선택된 음식점이 없으면 리뷰도 초기화
    if (!selectedRestaurant) {
      setReviews([]);
      return;
    }

    // 아직 Muckzi에 등록되지 않은 음식점은
    // placeId가 없기 때문에 리뷰를 조회할 수 없음
    if (!selectedRestaurant.placeId) {
      setReviews([]);
      return;
    }

    const getReviews = async () => {
      try {
        const response = await api.get(
          `/api/places/${selectedRestaurant.placeId}/reviews`
        );

        setReviews(response.data);
      } catch (error) {
        console.error(error);

        MuckziSwal.fire({
          text: "리뷰를 찾을 수 없습니다.",
        });
      }
    };

    getReviews();
  }, [selectedRestaurant]);

  // 현재 선택된 카테고리에 맞는 음식점만 필터링
  const filteredRestaurants =
    selectedCategory === "전체"
      ? restaurants
      : restaurants.filter(
          (restaurant) => restaurant.category === selectedCategory
        );

  // 리뷰 작성
  const handleReviewSubmit = async () => {
    if (!selectedRestaurant) {
      return;
    }

    // 로그인 여부 확인
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      MuckziSwal.fire({
        text: "로그인이 필요합니다.",
      });

      return;
    }

    // SweetAlert2에서 리뷰 내용 입력
    const result = await MuckziSwal.fire({
      input: "textarea",
      inputPlaceholder: "이 음식점에 대한 리뷰를 남겨주세요.",
      inputAttributes: {
        maxlength: 1000,
        "aria-label": "리뷰 내용",
      },
      showCancelButton: true,
      confirmButtonText: "등록",
      cancelButtonText: "취소",

      // 빈 리뷰 등록 방지
      inputValidator: (value) => {
        if (!value.trim()) {
          return "리뷰 내용을 입력해주세요.";
        }
      },
    });

    // 사용자가 취소했으면 등록하지 않음
    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsSubmittingReview(true);

      // 리뷰 등록
      //
      // 네이버 검색으로 선택한 음식점이라도
      // 백엔드에서 Place가 없으면 자동으로 생성한다.
      const response = await api.post("/api/places/reviews", {
        placeName: selectedRestaurant.placeName,
        category: selectedRestaurant.category,
        address: selectedRestaurant.address,
        latitude: selectedRestaurant.latitude,
        longitude: selectedRestaurant.longitude,
        content: result.value,
      });

      // 백엔드에서 생성 또는 기존 음식점의 placeId 반환
      const placeId = response.data.placeId;

      // 현재 선택된 음식점에 Muckzi의 placeId 연결
      //
      // 네이버 검색 결과였던 음식점도
      // 이제 Muckzi 음식점으로 연결된다.
      setSelectedRestaurant((prev) => ({
        ...prev,
        placeId,
      }));

      MuckziSwal.fire({
        text: "리뷰가 등록되었습니다.",
      });
    } catch (error) {
      console.error(error);

      MuckziSwal.fire({
        text:
          error.response?.data?.message ||
          "리뷰 등록에 실패했습니다.",
      });
    } finally {
      // 리뷰 등록 완료 후 버튼 활성화
      setIsSubmittingReview(false);
    }
  };

  // 북마크 여부 조회
  useEffect(() => {
    if (!selectedRestaurant) {
      setIsBookmarked(false);
      return;
    }
    if (!selectedRestaurant.placeId) {
      setIsBookmarked(false);
      return;
    }
    const accessToken = localStorage.getItem("accessToken");
    if(!accessToken) {
      return;
    }
    const getBookmark = async () => {
      try {
        const response = await api.get(`/api/places/${selectedRestaurant.placeId}/bookmark`);
        setIsBookmarked(response.data.bookmarked);
      } catch (error) {
        setIsBookmarked(false);
        MuckziSwal.fire({
          text: error.response?.data?.message ||
          "북마크 조회에 실패했습니다."
        })
      }
    }

    getBookmark();
  }, [selectedRestaurant]);

  // 북마크 버튼 이벤트
  const handleBookmark = async () => {
    if (!selectedRestaurant) {
      return;
    }

    // 로그인여부 확인
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      MuckziSwal.fire({
        text: "로그인이 필요합니다."
      });
      return;
    }

    try {
      // 이미 북마크 되어있을 경우
      if (isBookmarked) {
        await api.delete(`/api/places/${selectedRestaurant.placeId}/bookmark`);
        setIsBookmarked(false);

        MuckziSwal.fire({
          text: "북마크가 삭제되었습니다."
        });
        return;
      }

      // 새로운 북마크
      const response = await api.post(`/api/places/bookmark`, {
        placeName: selectedRestaurant.placeName,
        category: selectedRestaurant.category,
        address: selectedRestaurant.address,
        latitude: selectedRestaurant.latitude,
        longitude: selectedRestaurant.longitude,
      });

      const placeId = response.data.placeId;

      setSelectedRestaurant((prev) => ({
        ...prev,
        placeId
      }));
      setIsBookmarked(true);

      MuckziSwal.fire({
        text: "북마크가 등록되었습니다."
      });
    } catch (error) {
      console.error(error);

      MuckziSwal.fire({
        text:
          error.response?.data?.message ||
          "북마크 처리에 실패했습니다.",
      });
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">

      {/* 검색 영역 */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              // Enter 키로도 검색 가능
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

      {/* 카테고리 영역 */}
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

      {/* 지도 + 음식점 목록 영역 */}
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

        {/* 음식점 목록 / 상세 영역 */}
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

          {/* 선택된 음식점이 없을 때 → 목록 화면 */}
          {selectedRestaurant === null ? (
            <>
              {/* 목록 헤더 */}
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

              {/* 네이버 검색 결과 */}
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
                          dangerouslySetInnerHTML={{
                            __html: place.title,
                          }}
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

              {/* 현재 지도 영역의 음식점 목록 */}
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

            /* 선택된 음식점이 있을 때 → 상세 화면 */
            <RestaurantDetail
              selectedRestaurant={selectedRestaurant}
              reviews={reviews}
              handleReviewSubmit={handleReviewSubmit}
              isSubmittingReview={isSubmittingReview}
              setSelectedRestaurant={setSelectedRestaurant}
              isBookmarked={isBookmarked}
              handleBookmark={handleBookmark}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default MainPage;