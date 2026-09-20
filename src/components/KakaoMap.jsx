import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function KakaoMap({ selectedCategory, onRestaurantsChange, onMapBoundsChange, onRestaurantSelect, selectedRestaurant }) {
  const [restaurants, setRestaurants] = useState([]);
  const [map, setMap] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  const markersRef = useRef([]);
  const selectedMarkerRef = useRef(null);
  const mapRef = useRef(null);

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
              r="8"
              fill="white"
              stroke="black"
              stroke-width="3"
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

    map.panTo(position);

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.setMap(null);
    }

    const selectedMarkerImage = new window.kakao.maps.MarkerImage(
      "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 28 28"
          >
            <circle
              cx="14"
              cy="14"
              r="11"
              fill="black"
              stroke="white"
              stroke-width="4"
            />
          </svg>
        `),
      new window.kakao.maps.Size(28, 28),
      {
        offset: new window.kakao.maps.Point(14, 14),
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
          className="absolute left-1/2 top-4 -translate-x-1/2 cursor-pointer rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-md z-1 transition hover:bg-gray-100"
        >
          현재 위치에서 검색
        </button>
      )}  
    </div>
  );
}

export default KakaoMap;