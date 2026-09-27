import { useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function PlaceSearchModal ({ onClose, onConfirm, alreadySelected }) {

  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isEnd, setIsEnd] = useState(false);

  const handleSearch = async (targetPage = 1) => {
    if (!keyword.trim()) {
      MuckziSwal.fire({ text: "검색어를 입력해주세요." });
      return;
    };

    setLoading(true);

    try {
      const response = await api.get("/api/kakao/places/search", {
        params: { query: keyword, page: targetPage }
      });
      setResults(response.data.places);
      setIsEnd(response.data.end);
      setPage(targetPage);
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: "검색에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  }

  const isAlreadyAdded = (place) => {
    return alreadySelected.some((p) => p.placeName === place.placeName && p.address === place.address);
  }

  const isSelected = (place) => {
    return selected.some((p) => p.placeName === place.placeName && p.address === place.address);
  }

  const toggleSelect = (place) => {
    if (isSelected(place)) {
      setSelected((prev) => 
        prev.filter((p) => !(p.placeName === place.placeName && p.address === place.address))
      )
    } else {
      setSelected((prev) => [...prev, place]);
    }
  }

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex h-[70vh] w-full max-w-lg flex-col rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          음식점 검색
        </h2>

        <div className="flex gap-2">
          <input 
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSearch(1);
              }
            }}
            placeholder="음식점 이름을 검색해 보세요."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
          />
          <button
            type="button"
            onClick={() => handleSearch(1)}
            className="shrink-0 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >검색</button>
        </div>

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">
              검색 중...
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              검색 결과가 없습니다.
            </p>
          ) : (
            results.map((place, index) => {
              const added = isAlreadyAdded(place);
              const picked = isSelected(place);

              return (
                <div
                  key={index}
                  onClick={() => !added && toggleSelect(place)}
                  className={`rounded-xl p-4 transition ${
                    added
                      ? "cursor-not-allowed bg-gray-100 opacity-50"
                      : picked
                      ? "cursor-pointer bg-gray-900 text-white"
                      : "cursor-pointer bg-gray-50 hover:shadow-md"
                  }`}
                >
                  <h4 className="font-bold">{place.placeName}</h4>
                  <p className={`mt-1 text-sm ${picked ? "text-gray-300" : "text-gray-500"}`}>{place.filterCategory}</p>
                  <p className={`mt-1 text-sm ${picked ? "text-gray-300" : "text-gray-500"}`}>{added ? "이미 추가됨" : place.address}</p>
                </div>
              );
            })
          )}
        </div>
        {results.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSearch(page - 1)}
              disabled={page === 1}
              className="text-sm text-gray-500 disabled:opacity-30"
            >
              이전
            </button>

            <span className="text-sm text-gray-400">{page}</span>

            <button
              type="button"
              onClick={() => handleSearch(page + 1)}
              disabled={isEnd}
              className="text-sm text-gray-500 disabled:opacity-30"
            >
              다음
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">{selected.length}개 선택됨</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceSearchModal;