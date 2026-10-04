import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import KakaoMap from "../components/KakaoMap";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";
import RestaurantDetail from "../components/RestaurantDetail";

// 모바일 바텀시트 높이 단계 (지도 영역 대비 %)
const SHEET_SNAP_POINTS = [15, 50, 90];

function MainPage() {
  // 현재 선택된 음식점 카테고리
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 현재 선택된 음식점
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // 현재 지도 영역에 표시되는 Muckzi 음식점 목록
  const [restaurants, setRestaurants] = useState([]);

  // 현재 선택된 음식점의 리뷰 목록
  const [reviews, setReviews] = useState([]);

  // 카카오 장소 검색 결과
  const [searchResults, setSearchResults] = useState([]);

  // 검색창에 입력된 검색어
  const [searchKeyword, setSearchKeyword] = useState("");

  // 검색상태 여부
  const [isSearched, setIsSearched] = useState(false);

  // 현재 지도 영역
  const [mapBounds, setMapBounds] = useState(null);

  // 리뷰 등록 진행 여부
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 현재 로그인한 사용자의 userId (내 리뷰 판단용)
  const [currentUserId, setCurrentUserId] = useState(null);

  // 북마크 여부
  const [isBookmarked, setIsBookmarked] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 모바일 바텀시트 높이 / 드래그 상태
  const [sheetHeight, setSheetHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startY: 0, startHeight: 0, containerHeight: 0 });

  // 바텀시트 스크롤 영역 (검색 시 맨 위로 올리기용)
  const sheetContentRef = useRef(null);

  // 음식점 카테고리 목록
  const categories = [
    "전체",
    "한식",
    "일식",
    "중식",
    "양식",
    "카페",
    "술집",
    "치킨",
    "분식",
    "패스트푸드",
    "기타",
  ];

  // 카카오 장소 검색
  const searchPlaces = async (query) => {
    // 검색어가 비어 있으면 API 요청하지 않음
    if (!query.trim()) {
      setIsSearched(false);
      setSearchResults([]);
      return;
    }
    if (!mapBounds) {
      MuckziSwal.fire({
        text: "지도 정보를 불러오는 중입니다.",
      });
      return;
    }


    try{
      const response = await api.get("/api/kakao/places", {
        params: {
          query,
          swLat: mapBounds.swLat,
          swLng: mapBounds.swLng,
          neLat: mapBounds.neLat,
          neLng: mapBounds.neLng,
        },
      });
      setIsSearched(true);
      setSearchResults(response.data);

      // 검색 결과가 있으면 바텀시트 최대로, 없으면 중간
      setSheetHeight(response.data.length > 0 ? 90 : 50);

      // 결과가 보이도록 시트 내용을 맨 위로
      sheetContentRef.current?.scrollTo({ top: 0 });

      // 모바일 키보드 내리기
      document.activeElement?.blur();
    }catch(error) {
      setIsSearched(false);
      console.error(error);
      MuckziSwal.fire({
        text: "장소 검색에 실패했습니다."
      });
    }
  };

  // 카카오 검색 결과에서 음식점 선택
  const handleSearchResultClick = (place) => {

    // 현재 지도에 불러온 Muckzi 음식점 중
    // 같은 음식점이 이미 존재하는지 확인
    const existingRestaurant = restaurants.find(
      (restaurant) =>
        restaurant.placeName === place.placeName &&
        restaurant.address === place.address
    );

    // 이미 Muckzi에 등록된 음식점이라면
    // 기존 음식점 정보를 사용한다.
    if (existingRestaurant) {
      setSelectedRestaurant(existingRestaurant);
      return;
    }

    // 아직 Muckzi에 등록되지 않은 음식점이라면
    // 카카오 검색 결과를 임시 음식점 정보로 사용한다.
    const restaurant = {
      placeId: null,
      kakaoPlaceId: place.kakaoPlaceId,
      placeName: place.placeName,
      category: place.category,
      filterCategory: place.filterCategory,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
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
          (restaurant) =>
            restaurant.filterCategory === selectedCategory
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
        filterCategory: selectedRestaurant.filterCategory,
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

      toast.success("리뷰가 등록되었습니다.");
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

  // 리뷰 수정
  const handleReviewUpdate = async (review) => {
    const result = await MuckziSwal.fire({
      input: "textarea",
      inputValue: review.content,
      inputPlaceholder: "리뷰내용을 입력해주세요.",
      inputAttributes: {
        maxlength: 1000,
        "aria-label": "리뷰 내용"
      },
      showCancelButton: true,
      confirmButtonText: "수정",
      cancelButtonText: "취소",
      inputValidator: (value) => {
        if (!value.trim()) {
          return "리뷰 내용을 입력해주세요.";
        }
      },
    });

    if(!result.isConfirmed) {
      return;
    }

    try {
      await api.put(`/api/places/reviews/${review.reviewId}`, {
        placeName: selectedRestaurant.placeName,
        category: selectedRestaurant.category,
        filterCategory: selectedRestaurant.filterCategory,
        address: selectedRestaurant.address,
        latitude: selectedRestaurant.latitude,
        longitude: selectedRestaurant.longitude,
        content: result.value,
      });

      // 수정된 리뷰 목록 다시 조회
      const response = await api.get(
        `/api/places/${selectedRestaurant.placeId}/reviews`
      );
      setReviews(response.data);

      toast.success("리뷰가 수정되었습니다.");
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({
        text:
          error.response?.data?.message ||
          "리뷰 수정에 실패했습니다.",
      });
    }
  };

  // 리뷰 삭제
  const handleReviewDelete = async (review) => {
    const result = await MuckziSwal.fire({
      text: "리뷰를 삭제하시겠습니까?",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/api/places/reviews/${review.reviewId}`);

      // 목록에서 바로 제거
      setReviews((prev) =>
        prev.filter((r) => r.reviewId !== review.reviewId)
      );

      toast.success("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({
        text:
          error.response?.data?.message ||
          "리뷰 삭제에 실패했습니다.",
      });
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

        toast.success("북마크가 삭제되었습니다.");
        return;
      }

      // 새로운 북마크
      const response = await api.post(`/api/places/bookmark`, {
        placeName: selectedRestaurant.placeName,
        category: selectedRestaurant.category,
        filterCategory: selectedRestaurant.filterCategory,
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

      toast.success("북마크가 등록되었습니다.");
    } catch (error) {
      console.error(error);

      MuckziSwal.fire({
        text:
          error.response?.data?.message ||
          "북마크 처리에 실패했습니다.",
      });
    }
  }

  // 현재 사용자 정보 조회
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if(!accessToken) {
      setCurrentUserId(null);
      return;
    }

    const getMe = async () => {
      try {
        const response = await api.get("/api/users/me");
        setCurrentUserId(response.data.userId);
      } catch (error) {
        console.error(error);
        setCurrentUserId(null);
      }
    }

    getMe();
  }, []);

  // 리뷰선택
  useEffect(() => {

    const placeId = location.state?.placeId;

    if (!placeId) {
      return;
    }

    const getPlace = async () => {
      try {

        const response = await api.get(`/api/places/${placeId}`);
        setSelectedRestaurant(response.data);

      } catch (error) {

        console.error(error);
        MuckziSwal.fire({
          text: "음식점 정보를 불러오지 못했습니다.",
        });

      } finally {
        // state를 한 번 쓰고 지워서, 뒤로가기/새로고침 시 재실행 방지
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    getPlace();

  }, [location.state]);

  // 모바일 바텀 시트 //
  // 가까운 단계 찾기
  const getNearestSnap = (height) => {
    return SHEET_SNAP_POINTS.reduce((nearest, point) => 
      Math.abs(point - height) < Math.abs(nearest - height) ? point : nearest
    );
  }

  // 다음단계
  const goToNextSnap = () => {
    const currentIndex = SHEET_SNAP_POINTS.indexOf(getNearestSnap(sheetHeight));
    const nextIndex = (currentIndex + 1) % SHEET_SNAP_POINTS.length;
    setSheetHeight(SHEET_SNAP_POINTS[nextIndex]);
  }

  // 누르기 시작
  const handleSheetPointerDown = (e) => {
    dragRef.current = {
      startY: e.clientY,
      startHeight: sheetHeight,
      containerHeight: e.currentTarget.closest("aside").parentElement.clientHeight
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  // 핸들 드래그 중
  const handleSheetPointerMove = (e) => {
    if (!isDragging) return;

    const {startY, startHeight, containerHeight} = dragRef.current;
    const movedPercent = ((startY - e.clientY) / containerHeight) * 100;
    const nextHeight = Math.min(90, Math.max(15, startHeight + movedPercent));

    setSheetHeight(nextHeight)
  }

  // 핸들 놓기
  const handleSheetPointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    // 거의 안 움직였으면 탭으로 보고 다음 단계로
    if (Math.abs(dragRef.current.startY - e.clientY) < 5) {
      goToNextSnap();
      return;
    }

    setSheetHeight((prev) => getNearestSnap(prev));
  }

  // 접힌 상태에서 음식점을 선택하면 중간까지 올리기
  useEffect(() => {
    if (selectedRestaurant) {
      setSheetHeight((prev) => (prev < 50 ? 50 : prev));
    }
  }, [selectedRestaurant]);


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
          <KakaoMap 
            selectedCategory={selectedCategory}
            onRestaurantsChange={setRestaurants}
            onMapBoundsChange={setMapBounds}
            onRestaurantSelect={setSelectedRestaurant}
            selectedRestaurant={selectedRestaurant}
            sheetHeight={sheetHeight}
          />
        </div>

                {/* 음식점 목록 / 상세 영역 */}
        <aside
          style={{ "--sheet-h": `${sheetHeight}%` }}
          className={`
            absolute
            bottom-0
            left-0
            right-0
            z-20
            flex
            h-[var(--sheet-h)]
            flex-col
            rounded-t-3xl
            bg-white
            shadow-[0_-4px_20px_rgba(0,0,0,0.12)]
            ${isDragging ? "" : "transition-[height] duration-300"}
            lg:inset-y-0
            lg:left-0
            lg:right-auto
            lg:bottom-auto
            lg:z-10
            lg:h-full
            lg:w-80
            lg:rounded-none
            lg:rounded-r-2xl
            lg:border-r
            lg:border-gray-200
            lg:shadow-none
            lg:transition-none
          `}
        >

          {/* 모바일 Bottom Sheet 핸들 (드래그 / 탭) */}
          <div
            role="button"
            tabIndex={0}
            aria-label="목록 크기 조절"
            onPointerDown={handleSheetPointerDown}
            onPointerMove={handleSheetPointerMove}
            onPointerUp={handleSheetPointerUp}
            onPointerCancel={handleSheetPointerUp}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToNextSnap();
              }
            }}
            className="shrink-0 cursor-grab touch-none py-3 active:cursor-grabbing lg:hidden"
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
          </div>

          {/* 스크롤되는 내용 영역 */}
          <div ref={sheetContentRef} className="min-h-0 flex-1 overflow-y-auto">

            {/* 선택된 음식점이 없을 때 → 목록 화면 */}
            {selectedRestaurant === null ? (
              <>
                {/* 검색 결과 */}
                {isSearched && (
                  <>
                  {searchResults.length > 0 ? (
                    <div className="border-b border-gray-200 px-4 pb-4 pt-1 lg:px-5 lg:pt-4">
                      <h3 className="mb-3 font-bold text-gray-900">
                        검색 결과
                      </h3>

                      <div className="space-y-2">
                        {searchResults.map((place) => (
                        <div
                          key={place.kakaoPlaceId}
                          onClick={() => handleSearchResultClick(place)}
                          className="cursor-pointer rounded-xl bg-gray-50 p-4 transition hover:shadow-md"
                        >
                          <h4 className="font-bold text-gray-900">
                            {place.placeName}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {place.filterCategory}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {place.address}
                          </p>
                        </div>
                      ))}
                      </div>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-gray-500">
                      검색 결과가 없습니다.
                    </p>
                  )}
                  </>
                )}

                {/* 목록 헤더 */}
                <div className="sticky top-0 z-10 bg-white px-4 pb-3 pt-1 lg:px-5 lg:py-4 lg:pb-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">
                      주변 음식점
                    </h2>

                    <span className="text-sm text-gray-500">
                      {filteredRestaurants.length}곳
                    </span>
                  </div>
                </div>

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
                        className="cursor-pointer rounded-xl bg-gray-50 p-4 transition hover:shadow-md"
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
                currentUserId={currentUserId}
                handleReviewUpdate={handleReviewUpdate}
                handleReviewDelete={handleReviewDelete}
              />
            )}

          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainPage;