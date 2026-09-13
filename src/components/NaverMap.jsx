import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

function NaverMap({ selectedCategory, onRestaurantsChange }) {
  
  const [restaurants, setRestaurants] = useState([]);
  const [map, setMap] = useState(null);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // 음식점 정보
  const getPlaces = async (swLat, swLng, neLat, neLng) => {

    try{
      const response = await api.get("/api/places", {
        params: {
          swLat,
          swLng,
          neLat,
          neLng
        }
      });
      setRestaurants(response.data);
      onRestaurantsChange(response.data);
    }catch(error){
      console.error(error);
      alert("맛집 정보를 불러오지 못했습니다.");
    }
  };

  // 지도생성
  useEffect(() => {
    const script = document.createElement('script');

    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_KEY_ID}`;
    script.async = true;

    script.onload = () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(36.3504, 127.3845),
        zoom: 14,
      });

      const bounds = map.getBounds();

      const southWest = bounds.getSW();
      const northEast = bounds.getNE();

      getPlaces(
        southWest.lat(),
        southWest.lng(),
        northEast.lat(),
        northEast.lng()
      )

      window.naver.maps.Event.addListener(
        map,
        "idle",
        () => {
          setShowSearchButton(true);
        }
      );
      
      setMap(map);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  },[]);

  // 마커생성
  useEffect(() => {
    if (!map) {
      return;
    }

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // 새로운 마커 생성
    const filteredRestaurants = 
      selectedCategory === "전체"
        ? restaurants
        : restaurants.filter((restaurant) => restaurant.category === selectedCategory);

    filteredRestaurants.forEach((restaurant) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(restaurant.latitude, restaurant.longitude),
        map: map
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <strong>${restaurant.placeName}</strong>
          </div>
        `,
      });

      window.naver.maps.Event.addListener(
        marker,
        "click",
        () => {
          infoWindow.open(map, marker);
        }
      );

      markersRef.current.push(marker);
    });
    
  },[map, restaurants, selectedCategory]);

  const handleSearch = () => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();

    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    getPlaces(
      southWest.lat(),
      southWest.lng(),
      northEast.lat(),
      northEast.lng()
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
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-semibold shadow-md cursor-pointer transition hover:bg-gray-100"
        >
          현재 위치에서 검색
        </button>
      )}
    </div>
  );
}

export default NaverMap;
