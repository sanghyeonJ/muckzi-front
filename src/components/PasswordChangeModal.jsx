import { useState } from "react";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";

function PasswordChangeModal({ onClose, onSuccess }) {

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async () => {
    if(!currentPassword || !newPassword) {
      MuckziSwal.fire({ text: "모든 항목을 입력해주세요." });
      return;
    }

    try {
      await api.patch("/api/users/me/password", {
        currentPassword,
        newPassword
      });

      MuckziSwal.fire({ text: "비밀번호가 변경되었습니다." });
      onSuccess();
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "비밀번호 변경에 실패했습니다." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">

        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          비밀번호 변경
        </h2>

        <div className="space-y-4">

          <div>
            <label className="mb-1 block text-sm text-gray-500">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-500">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-500"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            변경
          </button>
        </div>

      </div>

    </div>
  );

}

export default PasswordChangeModal;