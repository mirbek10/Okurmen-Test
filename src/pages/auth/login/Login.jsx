import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { useAdminLoginStore } from "@/app/stores/admin/adminLogin";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.pathname === "/auth/register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const { user, login, register, loading, error, clearError, fetchUserProfile } = useAuthStore();
  const { login: adminLogin, loading: adminLoading, error: adminError, admin, clearError: clearAdminError } = useAdminLoginStore();

  useEffect(() => {
    setMode(initialMode);
    setFormError("");
    clearError();
  }, [initialMode, clearError]);

  useEffect(() => {
    if (user) {
      navigate("/user/profile", { replace: true });
    } else if (Cookies.get("userToken")) {
      fetchUserProfile().catch((profileError) => {
        if (profileError.response?.status === 401 || profileError.response?.status === 404) Cookies.remove("userToken");
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
    if (nextMode !== "admin") navigate(nextMode === "register" ? "/auth/register" : "/auth/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    clearError();
    if (mode === "register") {
      if (!username.trim() || !email.trim() || !password) return setFormError("Заполните все поля.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setFormError("Проверьте адрес электронной почты.");
      if (password.length < 6) return setFormError("Пароль должен содержать минимум 6 символов.");
      try {
        const newUser = await register(username.trim(), email.trim(), password);
        if (newUser) navigate("/user/profile", { replace: true });
      } catch { /* Ошибку показывает authStore. */ }
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
    } catch { /* Ошибку показывает authStore. */ }
  };

  const busy = loading || adminLoading;
  const visibleError = formError || (mode === "admin" ? adminError : error);

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro" aria-label="О платформе">
          <div className="auth-brand-badge"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн — окуу борбору" /></div>
          <div className="auth-intro-copy">
            <span className="eyebrow">Платформа для обучения</span>
            <h1>Учитесь.<br />Проверяйте знания.<br /><span>Видите прогресс.</span></h1>
            <p>Тренируйтесь в своём темпе, проходите тесты преподавателя и смотрите результаты в одном месте.</p>
          </div>
          <div className="auth-steps" aria-label="Как это работает">
            <span><b>01</b> Создайте аккаунт или войдите</span>
            <span><b>02</b> Выберите тренировку или введите код</span>
            <span><b>03</b> Следите за результатами</span>
          </div>
        </section>
        <main className="auth-main">
          <div className="auth-card">
            <div className="auth-mobile-brand"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн — окуу борбору" /></div>
            <div className="auth-card-top"><img className="auth-seal" src="/okurmen-seal.svg" alt="" /><span className="auth-secure"><ShieldCheck size={15} /> Ваше пространство для учёбы</span></div>
            <h2>{mode === "register" ? "Создать аккаунт" : mode === "admin" ? "Вход администратора" : "С возвращением"}</h2>
            <p className="auth-subtitle">{mode === "register" ? "Займёт меньше минуты. После регистрации вы сразу попадёте в кабинет." : mode === "admin" ? "Введите имя администратора и код доступа." : "Войдите, чтобы продолжить обучение."}</p>
            {mode !== "admin" && <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
              <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>Вход</button>
              <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={() => changeMode("register")}>Регистрация</button>
            </div>}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {mode === "register" ? <>
                <label htmlFor="auth-name">Ваше имя</label>
                <input id="auth-name" autoComplete="name" value={username} onChange={(e) => { setUsername(e.target.value); setFormError(""); clearError(); }} placeholder="Как к вам обращаться" disabled={busy} required />
                <label htmlFor="auth-email">Электронная почта</label>
                <input id="auth-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setFormError(""); clearError(); }} placeholder="name@example.com" disabled={busy} required />
              </> : <>
                <label htmlFor="auth-identifier">{mode === "admin" ? "Имя администратора" : "Имя или электронная почта"}</label>
                <input id="auth-identifier" autoComplete="username" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setFormError(""); if (mode === "admin") clearAdminError(); else clearError(); }} placeholder={mode === "admin" ? "Имя администратора" : "Имя или name@example.com"} disabled={busy} required />
              </>}
              <label htmlFor="auth-password">{mode === "admin" ? "Код доступа" : "Пароль"}</label>
              <div className="password-field"><input id="auth-password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(e) => { setPassword(e.target.value); setFormError(""); if (mode === "admin") clearAdminError(); else clearError(); }} placeholder={mode === "admin" ? "Введите код" : "Минимум 6 символов"} disabled={busy} required /><button type="button" aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
              {mode === "register" && <p className="field-hint">Используйте пароль длиной от 6 символов.</p>}
              {visibleError && <p className="form-error" role="alert">{visibleError}</p>}
              <button className="primary-button auth-submit" type="submit" disabled={busy}>{busy ? "Подождите..." : mode === "register" ? "Создать аккаунт" : "Войти"}<ArrowRight size={19} /></button>
            </form>
            <div className="auth-bottom">{mode === "admin" ? <button type="button" onClick={() => changeMode("login")}>Вернуться ко входу</button> : <><span>{mode === "register" ? "Уже есть аккаунт?" : "Нет аккаунта?"}</span><button type="button" onClick={() => changeMode(mode === "register" ? "login" : "register")}>{mode === "register" ? "Войти" : "Зарегистрироваться"}</button></>}</div>
            {mode !== "admin" && <div className="auth-admin"><button type="button" onClick={() => changeMode("admin")}>Вход для администратора</button></div>}
          </div>
          <p className="auth-footer">Окурмэн · Учиться удобнее, когда всё понятно</p>
        </main>
      </div>
    </div>
  );
}
