import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { hasSession } from "@/shared/lib/api/session";

export default function ProtectedRoute() {
  const { user, fetchUserProfile, logout } = useAuthStore();
  const location = useLocation();
  const signedIn = hasSession("user");
  const [checking, setChecking] = useState(Boolean(signedIn && !user));
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!signedIn || user) return;
    let active = true;
    setChecking(true);
    setLoadError(false);
    fetchUserProfile()
      .catch((error) => {
        // 401 приходит только если токен не удалось обновить, 403 — аккаунт заблокирован.
        // Ошибки сети и «сервер просыпается» сессию не сбрасывают.
        if ([401, 403].includes(error.response?.status) || error.name === "SessionExpiredError") logout();
        else if (active) setLoadError(true);
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [signedIn, user, fetchUserProfile, logout, attempt]);

  if (!signedIn) return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  if (checking && !user) return <div className="page-loading" role="status">Загружаем ваш кабинет...</div>;
  if (loadError && !user) return <div className="session-error"><h1>Не удалось загрузить кабинет</h1><p>Сервер не отвечает или пропал интернет. Вы по-прежнему в аккаунте — просто попробуйте ещё раз.</p><button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>Повторить</button></div>;
  return <Outlet />;
}
