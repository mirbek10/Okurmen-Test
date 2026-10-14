import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { useUserJoinStore } from "@/app/stores/user/userJoin";

export default function JoinTest({ requiredCategory } = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { join, loading, error, clearError } = useUserJoinStore();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [fullName, setFullName] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (code.trim().length < 4) return setLocalError("Введите код теста из 4 или более цифр.");
    try {
      if (requiredCategory && fullName.trim().split(/\s+/).filter(Boolean).length < 2) return setLocalError("Введите полное имя: имя и фамилию.");
      const joinedUser = await join(requiredCategory ? fullName.trim().replace(/\s+/g, " ") : user?.username || user?.name || "", code.trim(), requiredCategory ? "" : user?.email || "", requiredCategory);
      localStorage.setItem("user", JSON.stringify(joinedUser));
      localStorage.setItem("code", code.trim());
      navigate(requiredCategory ? "/rop-waiting" : "/student-waiting-list");
    } catch { /* Ошибку показывает store. */ }
  };

  return <div className="join-page">
    <Link to={requiredCategory ? "/" : "/user/profile"} className="text-link"><ArrowLeft size={17} /> {requiredCategory ? "На главную" : "Назад в кабинет"}</Link>
    <div className="join-card">
      <span className="section-kicker">Тест преподавателя</span>
      <span className="join-icon"><KeyRound size={26} /></span>
      <h1>Войти по коду</h1>
      <p>{requiredCategory ? "Введите код теста РОП. Регистрация не нужна." : "Введите код, который дал преподаватель. Ваше имя и почта уже взяты из аккаунта."}</p>
      <form onSubmit={handleSubmit} className="auth-form">
        {requiredCategory && <><label htmlFor="student-full-name">Полное имя</label><input id="student-full-name" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setLocalError(""); clearError(); }} placeholder="Имя Фамилия" disabled={loading} required /></>}
        <label htmlFor="test-code">Код теста</label>
        <input id="test-code" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setLocalError(""); clearError(); }} placeholder="Введите код" disabled={loading} required />
        {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>{loading ? "Подключаем..." : "Продолжить"}<ArrowRight size={18} /></button>
      </form>
    </div>
  </div>;
}
