import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function NaverMap({
  selectedCategory,
  onRestaurantsChange,
  selectedRestaurant,
  onRestaurantSelect,
  onMapBoundsChange
}) {
  // 현재 지도 영역에 표시할 음식점 목록
  const [restaurants, setRestaurants] = useState([]);

  // 네이버 지도 객체
  const [map, setMap] = useState(null);

  // "현재 위치에서 검색" 버튼 표시 여부
  const [showSearchButton, setShowSearchButton] = useState(false);

  // 네이버 지도를 연결할 DOM 요소
  const mapRef = useRef(null);

  // 일반 음식점 마커들을 저장하는 배열
  const markersRef = useRef([]);

  // 현재 선택된 음식점의 강조 마커
  const selectedMarkerRef = useRef(null);

  // 지도 영역에 해당하는 음식점 조회
  const getPlaces = async (swLat, swLng, neLat, neLng) => {
    try {
      const response = await api.get("/api/places", {
        params: {
          swLat,
          swLng,
          neLat,
          neLng,
        },
      });

      setRestaurants(response.data);
      onRestaurantsChange(response.data);
    } catch (error) {
      console.error(error);

      MuckziSwal.fire({
        text: "맛집 정보를 불러오지 못했습니다.",
      });
    }
  };

  // 현재 지도 영역을 MainPage에 전달
  const updateMapBounds = (map) => {
    const bounds = map.getBounds();

    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    onMapBoundsChange({
      swLat: southWest.lat(),
      swLng: southWest.lng(),
      neLat: northEast.lat(),
      neLng: northEast.lng(),
    });
  };

  // 네이버 지도 생성
  useEffect(() => {
    const script = document.createElement("script");

    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_KEY_ID}`;
    script.async = true;

    script.onload = () => {
      // 네이버 지도 객체 생성
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(36.3504, 127.3845),
        zoom: 14,
      });

      // 처음 지도가 보여주는 영역 가져오기
      const bounds = map.getBounds();
      const southWest = bounds.getSW();
      const northEast = bounds.getNE();

      // 현재 지도 영역을 MainPage에 전달
      updateMapBounds(map);

      // 처음 지도 영역의 음식점 조회
      getPlaces(
        southWest.lat(),
        southWest.lng(),
        northEast.lat(),
        northEast.lng()
      );

      // 지도가 움직임을 멈출 때마다
      // "현재 위치에서 검색" 버튼 표시
      window.naver.maps.Event.addListener(map, "idle", () => {
        updateMapBounds(map);
        setShowSearchButton(true);
      });

      setMap(map);
    };

    document.head.appendChild(script);

    // 컴포넌트가 제거될 때 네이버 지도 스크립트 제거
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 음식점 일반 마커 생성
  useEffect(() => {
    if (!map) {
      return;
    }

    // 기존 일반 마커 모두 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    markersRef.current = [];

    // 선택된 카테고리에 맞는 음식점만 필터링
    const filteredRestaurants =
      selectedCategory === "전체"
        ? restaurants
        : restaurants.filter(
            (restaurant) =>
              restaurant.filterCategory === selectedCategory
          );

    // 음식점마다 일반 마커 생성
    filteredRestaurants.forEach((restaurant) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(
          restaurant.latitude,
          restaurant.longitude
        ),
        map,
        icon: {
          content: `
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #ffffff;
              border: 3px solid #000000;
              box-sizing: border-box;
            "></div>
          `,
          anchor: new window.naver.maps.Point(10, 10),
        },
      });

      // 마커 클릭 시 해당 음식점을 선택
      window.naver.maps.Event.addListener(marker, "click", () => {
        onRestaurantSelect(restaurant);
      });

      // 나중에 기존 마커를 제거할 수 있도록 저장
      markersRef.current.push(marker);
    });
  }, [
    map,
    restaurants,
    selectedCategory,
    onRestaurantSelect,
  ]);

  // 선택된 음식점의 강조 마커 관리
  useEffect(() => {
    if (!map) {
      return;
    }

    // 선택된 음식점이 없으면 기존 강조 마커 제거
    if (!selectedRestaurant) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setMap(null);
        selectedMarkerRef.current = null;
      }

      return;
    }

    // 선택된 음식점 위치
    const position = new window.naver.maps.LatLng(
      selectedRestaurant.latitude,
      selectedRestaurant.longitude
    );

    // 선택된 음식점 위치로 지도 이동
    map.panTo(position);

    // 기존 강조 마커 제거
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }

    // 선택된 음식점을 표시하는 강조 마커 생성
    selectedMarkerRef.current = new window.naver.maps.Marker({
      position,
      map,
      icon: {
        content: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #000000;
            border: 4px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        anchor: new window.naver.maps.Point(14, 14),
      },
    });
  }, [map, selectedRestaurant]);

  // 현재 지도 영역의 음식점 다시 검색
  const handleSearch = () => {
    if (!map) {
      return;
    }

    // 현재 지도 영역 가져오기
    const bounds = map.getBounds();
    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    // 현재 선택된 음식점 초기화
    // → 상세 화면과 선택 강조 마커도 함께 초기화됨
    onRestaurantSelect(null);

    // 현재 지도 영역의 음식점 다시 조회
    getPlaces(
      southWest.lat(),
      southWest.lng(),
      northEast.lat(),
      northEast.lng()
    );

    // 검색 버튼 숨기기
    setShowSearchButton(false);
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapRef}
        className="h-full w-full"
      />

      {showSearchButton && (
        <button
          onClick={handleSearch}
          className="absolute left-1/2 top-4 -translate-x-1/2 cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-md transition hover:bg-gray-100"
        >
          현재 위치에서 검색
        </button>
      )}
    </div>
  );
}

export default NaverMap;