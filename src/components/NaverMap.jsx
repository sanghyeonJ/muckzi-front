import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

function NaverMap() {
  
  const [restaurants, setRestaurants] = useState([]);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  // 음식점 정보
  useEffect(() => {
    const getPlaces = async () => {
      try{
        const response = await api.get("/api/places");
        setRestaurants(response.data);
      }catch(error){
        console.error(error);
        alert("맛집 정보를 불러오지 못했습니다.");
      }
    }
    getPlaces();
  },[]);

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
      
      setMap(map);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  },[]);

  // 마커생성
  useEffect(() => {
    if (!map || restaurants.length === 0) {
      return;
    }

    restaurants.forEach((restaurant) => {
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
    });
    
  },[map, restaurants]);

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full"
    />
  );
}

export default NaverMap;
