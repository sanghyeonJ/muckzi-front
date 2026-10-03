import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_COUNT = 5;

function Pagination ({ currentPage, totalPages, onPageChange }) {

  if (totalPages <= 1) return;

  const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - PAGE_COUNT));
  const endPage = Math.min(totalPages, startPage + PAGE_COUNT);

  const pages = [];
  for (let page = startPage; page < endPage; page++) {
    pages.push(page);
  }

  return (
    <nav aria-label="페이지 이동" className="mt-6 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label="이전 페이지"
        className="h-9 rounded-lg px-3 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`h-9 w-9 rounded-lg text-sm ${
            page === currentPage
              ? "bg-black text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        aria-label="다음 페이지"
        className="h-9 rounded-lg px-3 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );

}

export default Pagination;