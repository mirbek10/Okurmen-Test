import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { useUserJoinStore } from "@/app/stores/user/userJoin";

export default function JoinTest() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { join, loading, error, clearError } = useUserJoinStore();
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (code.trim().length < 4) return setLocalError("Введите код теста из 4 или более цифр.");
    try {
      const joinedUser = await join(user?.username || user?.name || "Ученик", code.trim(), user?.email || "");
      localStorage.setItem("user", JSON.stringify(joinedUser));
      localStorage.setItem("code", code.trim());
      navigate("/student-waiting-list");
    } catch { /* Ошибку показывает store. */ }
  };

  return <div className="join-page">
    <Link to="/user/profile" className="text-link"><ArrowLeft size={17} /> Назад в кабинет</Link>
    <div className="join-card">
      <span className="section-kicker">Тест преподавателя</span>
      <span className="join-icon"><KeyRound size={26} /></span>
      <h1>Войти по коду</h1>
      <p>Введите код, который дал преподаватель. Ваше имя и почта уже взяты из аккаунта.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="test-code">Код теста</label>
        <input id="test-code" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setLocalError(""); clearError(); }} placeholder="Введите код" disabled={loading} required />
        {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>{loading ? "Подключаем..." : "Продолжить"}<ArrowRight size={18} /></button>
      </form>
    </div>
  </div>;
}
