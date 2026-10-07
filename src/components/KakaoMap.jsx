import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

// 지도 마커 색 (SVG 안에서는 Tailwind 클래스를 못 쓰므로 직접 지정, index.css의 색과 맞춤)
const MARKER_COLOR = "#1A2733";        // ink (일반 마커 테두리, 선택 마커 바깥 테두리)
const MARKER_SELECTED = "#1EA7F2";     // brand-500 (선택 마커 채우기)

function KakaoMap({ selectedCategory, onRestaurantsChange, onMapBoundsChange, onRestaurantSelect, selectedRestaurant, sheetHeight }) {
  const [restaurants, setRestaurants] = useState([]);
  const [map, setMap] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const mapRef = useRef(null);
  const sheetHeightRef = useRef(sheetHeight);

  useEffect(() => {
    sheetHeightRef.current = sheetHeight;
  }, [sheetHeight]);

  // 음식점 조회
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

  useEffect(() => {
    const script = document.createElement("script");

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;

        const options = {
          center: new window.kakao.maps.LatLng(
            36.3504,
            127.3845
          ),
          level: 5,
        };

        const kakaoMap = new window.kakao.maps.Map(
          container,
          options
        );

        setMap(kakaoMap);

        const updateMapBounds = () => {
          const bounds = kakaoMap.getBounds();

          const swLatLng = bounds.getSouthWest();
          const neLatLng = bounds.getNorthEast();

          onMapBoundsChange({
            swLat: swLatLng.getLat(),
            swLng: swLatLng.getLng(),
            neLat: neLatLng.getLat(),
            neLng: neLatLng.getLng(),
          });

          setShowSearchButton(true);
        };

        const bounds = kakaoMap.getBounds();

        const swLatLng = bounds.getSouthWest();
        const neLatLng = bounds.getNorthEast();

        onMapBoundsChange({
          swLat: swLatLng.getLat(),
          swLng: swLatLng.getLng(),
          neLat: neLatLng.getLat(),
          neLng: neLatLng.getLng(),
        });

        getPlaces(
          kakaoMap.getBounds().getSouthWest().getLat(),
          kakaoMap.getBounds().getSouthWest().getLng(),
          kakaoMap.getBounds().getNorthEast().getLat(),
          kakaoMap.getBounds().getNorthEast().getLng()
        );

        window.kakao.maps.event.addListener(
          kakaoMap,
          "idle",
          updateMapBounds
        );
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 마커 생성
  useEffect(() => {
    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    markersRef.current = [];

    const markerImage = new window.kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <circle
              cx="10"
              cy="10"
              r="7.5"
              fill="white"
              stroke="${MARKER_COLOR}"
              stroke-width="3.5"
            />
          </svg>
        `),
      new window.kakao.maps.Size(20, 20),
      {
        offset: new window.kakao.maps.Point(10, 10),
      }
    );

    const filteredRestaurants =
      selectedCategory === "전체"
        ? restaurants
        : restaurants.filter(
            (restaurant) =>
              restaurant.filterCategory === selectedCategory
          );

    filteredRestaurants.forEach((restaurant) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(
          restaurant.latitude,
          restaurant.longitude
        ),
        map,
        image: markerImage,
      });

      window.kakao.maps.event.addListener(
        marker,
        "click",
        () => {
          onRestaurantSelect(restaurant);
        }
      );

      markersRef.current.push(marker);
    });
  }, [
    map,
    restaurants,
    selectedCategory,
    onRestaurantSelect,
  ]);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!selectedRestaurant) {
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setMap(null);
        selectedMarkerRef.current = null;
      }

      return;
    }

    const position = new window.kakao.maps.LatLng(
      selectedRestaurant.latitude,
      selectedRestaurant.longitude
    );

    const isMobile = window.innerWidth < 1024;
    if (isMobile && mapRef.current) {
      const sheetPercent = Math.max(sheetHeightRef.current, 50);
      const offsetY = (mapRef.current.clientHeight * sheetPercent) / 100 / 2;

      const projection = map.getProjection();
      const markerPoint = projection.pointFromCoords(position);
      const centerPoint = new window.kakao.maps.Point(
        markerPoint.x,
        markerPoint.y + offsetY
      );

      map.panTo(projection.coordsFromPoint(centerPoint));
    } else {
      map.panTo(position);
    }

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }

    const selectedMarkerImage = new window.kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="16" r="14.5" fill="none" stroke="${MARKER_COLOR}" stroke-width="1.5" />
            <circle cx="16" cy="16" r="11" fill="${MARKER_SELECTED}" stroke="white" stroke-width="4" />
          </svg>
        `),
      new window.kakao.maps.Size(32, 32),
      {
        offset: new window.kakao.maps.Point(16, 16),
      }
    );

    selectedMarkerRef.current =new window.kakao.maps.Marker({
      position,
      map,
      image: selectedMarkerImage,
    });
  }, [map, selectedRestaurant]);

  // 검색버튼
  const handleSearch = () => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    const swLatLng = bounds.getSouthWest();
    const neLatLng = bounds.getNorthEast();

    onRestaurantSelect(null);

    getPlaces(
      swLatLng.getLat(),
      swLatLng.getLng(),
      neLatLng.getLat(),
      neLatLng.getLng()
    );

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
          className="absolute left-1/2 top-4 z-1 -translate-x-1/2 cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-600 shadow-md transition hover:bg-brand-50"
        >
          현재 위치에서 검색
        </button>
      )}  
    </div>
  );
}

export default KakaoMap;