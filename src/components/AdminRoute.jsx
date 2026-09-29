import { useEffect, useState } from "react";
import MuckziSwal from "../utils/swal";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

function AdminRoute ({ children }) {

  const accessToken = localStorage.getItem("accessToken");

  // loading 확인중 / admin 관리자 / denied 관리자 아님
  const [checkStatus, setCheckStatus] = useState("loading");

  useEffect(() => {
    if (!accessToken) return;

    const checkAdmin = async () => {
      try {
        const response = await api.get("/api/users/me");
        if (response.data.role === "ADMIN") {
          setCheckStatus("admin");
        } else {
          MuckziSwal.fire({ text: "관리자만 접근 가능합니다." });
          setCheckStatus("denied");
        }
      } catch (error) {
        console.error(error);
        setCheckStatus("denied");
      }
    }

    checkAdmin();
  }, []);

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (checkStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">권한 확인중...</p>
      </div>
    );
  }

  // 관리자 아님 → 메인
  if (checkStatus === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;

}

export default AdminRoute;