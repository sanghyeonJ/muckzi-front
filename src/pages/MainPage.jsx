import { useState } from "react";
import NaverMap from "../components/NaverMap";

function MainPage() {

  const [selectedCategory, setSelectedCategory] = useState("전체");
  const categories = [
    "전체",
    "한식",
    "일식",
    "중식",
    "양식",
    "카페",
    "술집"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 카테고리 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {categories.map((category) => (
            <button 
              key={category} 
              className={`shrink-0 rounded-full px-4 py-2 text-sm cursor-pointer ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 지도 */}
      <div className="h-[500px] bg-gray-200 flex items-center justify-center">
        <NaverMap selectedCategory={selectedCategory} />
      </div>

      {/* 음식점 목록 */}
      <div className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">주변 음식점</h2>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">음식점 목록이 표시됩니다.</p>
          </div>
      </div>
    </div>
  );
}

export default MainPage;