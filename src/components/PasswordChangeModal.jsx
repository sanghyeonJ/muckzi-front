import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function PasswordChangeModal({ onClose, onSuccess }) {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Esc 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!currentPassword || !newPassword) {
      MuckziSwal.fire({ text: "모든 항목을 입력해주세요." });
      return;
    }

    try {
      await api.patch("/api/users/me/password", {
        currentPassword,
        newPassword
      });

      toast.success("비밀번호가 변경되었습니다.");
      onSuccess();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "비밀번호 변경에 실패했습니다." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
      >

        <h2 id="password-modal-title" className="mb-5 text-lg font-semibold text-gray-900">
          비밀번호 변경
        </h2>

        <div className="space-y-4">

          <div>
            <label htmlFor="current-password" className="mb-1 block text-sm text-gray-500">
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              maxLength={20}
              autoComplete="current-password"
              autoFocus
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm text-gray-500">
              새 비밀번호
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              maxLength={20}
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            변경
          </button>
        </div>

      </form>

    </div>
  );

}

export default PasswordChangeModal;