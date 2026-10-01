import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/stores/auth/authStore";

export default function ProtectedRoute() {
  const { user, fetchUserProfile, logout } = useAuthStore();
  const [checking, setChecking] = useState(Boolean(Cookies.get("userToken") && !user));
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const token = Cookies.get("userToken");

  useEffect(() => {
    if (!token || user) return;
    let active = true;
    setChecking(true);
    setLoadError(false);
    fetchUserProfile()
      .catch((error) => {
        if (error.response?.status === 401 || error.response?.status === 404) logout();
        else if (active) setLoadError(true);
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [token, user, fetchUserProfile, logout, attempt]);

  if (!token) return <Navigate to="/auth/login" replace />;
  if (checking && !user) return <div className="page-loading" role="status">Загружаем ваш кабинет...</div>;
  if (loadError && !user) return <div className="session-error"><h1>Не удалось загрузить кабинет</h1><p>Проверьте подключение к интернету и попробуйте снова.</p><button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>Повторить</button></div>;
  return <Outlet />;
}
