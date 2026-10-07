import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import MuckziSwal from "../utils/swal";
import { toast } from "sonner";

function WithdrawPage () {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getMyInfo = async () => {
      try {
        const response = await api.get("/api/users/me");

        if (response.data.role === "ADMIN") {
          MuckziSwal.fire({ text: "관리자 계정은 탈퇴할 수 없습니다." });
          navigate("/mypage");
          return;
        }
        setUser(response.data);
      } catch (error) {
        console.error(error);
        MuckziSwal.fire({ text: "내 정보를 불러오지 못했습니다." });
        navigate("/mypage");
      }
    }

    getMyInfo();
  }, []);

  // 탈퇴
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      MuckziSwal.fire({ text: "안내 사항을 확인해주세요." });
      return;
    }
    if (!password) {
      MuckziSwal.fire({ text: "비밀번호를 입력해주세요." });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete("/api/users/me", {
        data: { password }
      });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      toast.success("탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error(error);
      MuckziSwal.fire({ text: error.response?.data?.message || "회원탈퇴에 실패했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-lg">

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          회원 탈퇴
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {user.nickname}(@{user.userId})님, 탈퇴 전에 아래 내용을 꼭 확인해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">

          {/* 안내 사항 */}
          <ul className="space-y-3 rounded-xl bg-gray-50 p-5 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>탈퇴한 아이디(<strong>{user.userId}</strong>)로는 다시 가입할 수 없습니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>작성한 게시글, 리뷰, 댓글은 삭제되지 않고 <strong>'탈퇴한 회원'</strong>으로 표시됩니다. 삭제를 원하시면 탈퇴 전에 직접 삭제해주세요.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>북마크 등 계정에 저장된 정보는 더 이상 확인할 수 없습니다.</span>
            </li>
          </ul>

          {/* 동의 체크 */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4"
            />
            위 내용을 모두 확인했습니다.
          </label>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="withdraw-password" className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="withdraw-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
              placeholder="현재 비밀번호를 입력해주세요"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/mypage")}
              className="rounded-lg px-4 py-2 text-sm text-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!agreed || !password || isSubmitting}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
            >
              탈퇴하기
            </button>
          </div>

        </form>

      </div>

    </div>
  );

}

export default WithdrawPage;