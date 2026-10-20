import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { useAdminLoginStore } from "@/app/stores/admin/adminLogin";

const PENDING_KEY = "pending_registration";

function getPendingRegistration() {
  try {
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null");
    return pending?.email && new Date(pending.expiresAt).getTime() > Date.now() ? pending : null;
  } catch {
    return null;
  }
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.pathname === "/auth/register" ? "register" : "login";
  const [mode, setMode] = useState(() => getPendingRegistration() ? "verify" : initialMode);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(getPendingRegistration);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const { user, login, register, verifyRegistration, loading, error, clearError, fetchUserProfile } = useAuthStore();
  const { login: adminLogin, loading: adminLoading, error: adminError, admin, clearError: clearAdminError } = useAdminLoginStore();

  useEffect(() => {
    if (mode !== "verify") setMode(initialMode);
    setFormError("");
    clearError();
  }, [initialMode, clearError]);

  useEffect(() => {
    if (!pending || mode !== "verify") return;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(pending.expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [pending, mode]);

  useEffect(() => {
    if (user) navigate("/user/profile", { replace: true });
    else if (Cookies.get("userToken")) {
      fetchUserProfile().catch((profileError) => {
        if ([401, 404].includes(profileError.response?.status)) Cookies.remove("userToken");
        else setFormError("Не удалось проверить текущий вход. Попробуйте войти снова.");
        clearError();
      });
    }
  }, [user, navigate, fetchUserProfile, clearError]);

  useEffect(() => {
    if (admin) navigate("/admin/dashboard", { replace: true });
  }, [admin, navigate]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setFormError("");
    setPassword("");
    clearError();
    clearAdminError();
    if (nextMode !== "verify") {
      sessionStorage.removeItem(PENDING_KEY);
      setPending(null);
    }
    if (nextMode !== "admin") navigate(nextMode === "register" ? "/auth/register" : "/auth/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    clearError();

    if (mode === "verify") {
      if (!pending || secondsLeft <= 0) return setFormError("Время вышло. Зарегистрируйтесь заново.");
      if (!/^\d{6}$/.test(code.trim())) return setFormError("Введите шестизначный код из письма.");
      try {
        const newUser = await verifyRegistration(pending.email, code.trim());
        if (newUser) {
          sessionStorage.removeItem(PENDING_KEY);
          navigate("/user/profile", { replace: true });
        }
      } catch { /* Ошибка показана под полем. */ }
      return;
    }

    if (mode === "register") {
      if (!username.trim() || !email.trim() || !password) return setFormError("Заполните все поля.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setFormError("Проверьте адрес электронной почты.");
      if (password.length < 6) return setFormError("Пароль должен содержать минимум 6 символов.");
      try {
        const registration = await register(username.trim(), email.trim(), password);
        setPending(registration);
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(registration));
        setPassword("");
        setMode("verify");
      } catch { /* Ошибка показана под полем. */ }
      return;
    }

    if (!identifier.trim() || !password) return setFormError("Введите имя или почту и пароль.");
    if (mode === "admin") {
      await adminLogin(identifier.trim(), password);
      return;
    }
    try {
      const signedInUser = await login(identifier.trim(), password);
      if (signedInUser) navigate("/user/profile", { replace: true });
    } catch { /* Ошибка показана под полем. */ }
  };

  const busy = loading || adminLoading;
  const visibleError = formError || (mode === "admin" ? adminError : error);
  const timeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return <div className="auth-page">
    <div className="auth-shell">
      <section className="auth-intro" aria-label="О платформе">
        <div className="auth-brand-badge"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн" /></div>
        <div className="auth-intro-copy">
          <span className="eyebrow">Платформа для обучения</span>
          <h1>Учитесь.<br />Проверяйте знания.<br /><span>Видите прогресс.</span></h1>
          <p>Тренируйтесь в своём темпе, проходите тесты преподавателя и смотрите результаты в одном месте.</p>
        </div>
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-top"><img className="auth-seal" src="/okurmen-seal.svg" alt="" /><span className="auth-secure"><ShieldCheck size={16} /> Ваше пространство для учёбы</span></div>
          <h2>{mode === "register" ? "Создать аккаунт" : mode === "verify" ? "Подтвердите почту" : mode === "admin" ? "Вход администратора" : "С возвращением"}</h2>
          <p className="auth-subtitle">{mode === "register" ? "После регистрации отправим код на вашу почту." : mode === "verify" ? `Мы отправили код на ${pending?.email || "вашу почту"}. Введите его в течение 15 минут.` : mode === "admin" ? "Введите email администратора и пароль." : "Войдите, чтобы продолжить обучение."}</p>

          {(mode === "login" || mode === "register") && <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Вход</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Регистрация</button>
          </div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === "verify" ? <>
              <label htmlFor="auth-code">Код из письма</label>
              <input id="auth-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "")); setFormError(""); clearError(); }} placeholder="000000" disabled={busy || secondsLeft <= 0} required />
              <p className="field-hint">Код действителен ещё {timeLabel}</p>
            </> : <>
              {mode === "register" ? <>
                <label htmlFor="auth-name">Ваше имя</label>
                <input id="auth-name" autoComplete="name" value={username} onChange={(event) => { setUsername(event.target.value); setFormError(""); clearError(); }} placeholder="Как к вам обращаться" disabled={busy} required />
                <label htmlFor="auth-email">Электронная почта</label>
                <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError(""); clearError(); }} placeholder="name@example.com" disabled={busy} required />
              </> : <>
                <label htmlFor="auth-identifier">{mode === "admin" ? "Email администратора" : "Имя или электронная почта"}</label>
                <input id="auth-identifier" type={mode === "admin" ? "email" : "text"} autoComplete={mode === "admin" ? "email" : "username"} value={identifier} onChange={(event) => { setIdentifier(event.target.value); setFormError(""); if (mode === "admin") clearAdminError(); else clearError(); }} placeholder={mode === "admin" ? "admin@example.com" : "Имя или name@example.com"} disabled={busy} required />
              </>}
              <label htmlFor="auth-password">Пароль</label>
              <div className="password-field"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => { setPassword(event.target.value); setFormError(""); if (mode === "admin") clearAdminError(); else clearError(); }} placeholder={mode === "admin" ? "Введите пароль" : "Минимум 6 символов"} disabled={busy} required /><button type="button" aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
            </>}
            {visibleError && <p className="form-error" role="alert">{visibleError}</p>}
            <button className="primary-button auth-submit" type="submit" disabled={busy || (mode === "verify" && secondsLeft <= 0)}>{busy ? "Подождите..." : mode === "register" ? "Получить код" : mode === "verify" ? "Подтвердить почту" : "Войти"}<ArrowRight size={19} /></button>
          </form>

          <div className="auth-bottom">{mode === "admin" ? <button type="button" onClick={() => changeMode("login")}>Вернуться ко входу</button> : mode === "verify" ? <button type="button" onClick={() => changeMode("register")}>Зарегистрироваться заново</button> : <><span>{mode === "register" ? "Уже есть аккаунт?" : "Нет аккаунта?"}</span><button type="button" onClick={() => changeMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Войти" : "Зарегистрироваться"}</button></>}</div>
          {mode === "login" && <div className="auth-code-entry"><Link to="/rop-code">Пройти тест РОП по коду без регистрации</Link></div>}
          {mode === "login" && <div className="auth-admin"><button type="button" onClick={() => changeMode("admin")}>Вход для администратора</button></div>}
        </div>
      </main>
    </div>
  </div>;
}
