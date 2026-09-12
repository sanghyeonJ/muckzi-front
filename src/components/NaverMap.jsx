import { useEffect, useRef } from 'react';

function NaverMap() {
  
  const mapRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');

    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_KEY_ID}`;
    script.async = true;

    script.onload = () => {
      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(36.3504, 127.3845),
        zoom: 14,
      });

      const restaurants = [
        {
          name: "대전시청 맛집",
          lat: 36.3504,
          lng: 127.3845,
        },
        {
          name: "둔산동 맛집",
          lat: 36.3515,
          lng: 127.3900,
        },
        {
          name: "은행동 맛집",
          lat: 36.3270,
          lng: 127.4270,
        },
      ];
      
      restaurants.forEach((restaurant) => {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(restaurant.lat, restaurant.lng),
          map: map
        });

        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="padding: 10px;">
              <strong>${restaurant.name}</strong>
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

      console.log("Naver Map 생성 완료", map);
      console.log("마커 생성 완료", marker);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  },[])

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full"
    />
  );
}

export default NaverMap;
