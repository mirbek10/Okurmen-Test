import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { useUserJoinStore } from "@/app/stores/user/userJoin";
import { axiosUser } from "@/shared/lib/api/axiosUser";

function readSavedJoin(requiredCategory) {
  try {
    const participant = JSON.parse(localStorage.getItem("user") || "null");
    const code = localStorage.getItem("code");
    if (!participant?.studentId || !code) return null;
    if (requiredCategory && participant.category !== requiredCategory) return null;
    return { participant, code: String(code) };
  } catch {
    return null;
  }
}

function getParticipantKey(code) {
  const storageKey = `test-participant:${code}`;
  let participantKey = localStorage.getItem(storageKey);
  if (!participantKey) {
    participantKey = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, participantKey);
  }
  return participantKey;
}

export default function JoinTest({ requiredCategory } = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { join, loading, error, clearError } = useUserJoinStore();
  const [savedJoin] = useState(() => readSavedJoin(requiredCategory));
  const [code, setCode] = useState(searchParams.get("code") || savedJoin?.code || "");
  const [fullName, setFullName] = useState("");
  const [localError, setLocalError] = useState("");
  const [checkingExisting, setCheckingExisting] = useState(Boolean(savedJoin));
  const [existingParticipant, setExistingParticipant] = useState(null);

  useEffect(() => {
    if (!savedJoin) return;
    let cancelled = false;
    axiosUser.get(`/student/status/${encodeURIComponent(savedJoin.code)}/${savedJoin.participant.studentId}`)
      .then((response) => {
        if (cancelled) return;
        const status = response.data?.student?.status;
        if (status === "waiting" || status === "active") {
          setExistingParticipant({ ...savedJoin, status });
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("code");
        }
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("user");
        localStorage.removeItem("code");
      })
      .finally(() => { if (!cancelled) setCheckingExisting(false); });
    return () => { cancelled = true; };
  }, [savedJoin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (code.trim().length < 4) return setLocalError("Введите код теста из 4 или более цифр.");
    try {
      if (requiredCategory && fullName.trim().split(/\s+/).filter(Boolean).length < 2) return setLocalError("Введите полное имя: имя и фамилию.");
      const normalizedCode = code.trim();
      const joinedUser = await join(requiredCategory ? fullName.trim().replace(/\s+/g, " ") : user?.username || user?.name || "", normalizedCode, requiredCategory ? "" : user?.email || "", requiredCategory, getParticipantKey(normalizedCode));
      localStorage.setItem("user", JSON.stringify(joinedUser));
      localStorage.setItem("code", normalizedCode);
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
      {checkingExisting ? <p className="field-hint" role="status">Проверяем, подключались ли вы к тесту…</p> : existingParticipant ? <div className="auth-form">
        <p className="field-hint">Вы уже подключены к тесту «{existingParticipant.participant.testTitle || existingParticipant.participant.category}» как {existingParticipant.participant.name}. Новая запись не создаётся.</p>
        <button type="button" className="primary-button" onClick={() => navigate(requiredCategory ? "/rop-waiting" : "/student-waiting-list")}>Вернуться к ожиданию<ArrowRight size={18} /></button>
      </div> : <form onSubmit={handleSubmit} className="auth-form">
        {requiredCategory && <><label htmlFor="student-full-name">Полное имя</label><input id="student-full-name" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setLocalError(""); clearError(); }} placeholder="Имя Фамилия" disabled={loading} required /></>}
        <label htmlFor="test-code">Код теста</label>
        <input id="test-code" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setLocalError(""); clearError(); }} placeholder="Введите код" disabled={loading} required />
        {(localError || error) && <p className="form-error" role="alert">{localError || error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>{loading ? "Подключаем..." : "Продолжить"}<ArrowRight size={18} /></button>
      </form>}
    </div>
  </div>;
}
