import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (token && password !== confirmation) return setError("Пароли не совпадают.");
    if (token && password.length < 8) return setError("Пароль должен содержать минимум 8 символов.");
    setBusy(true);
    try {
      const response = token
        ? await axiosUser.post("/auth/reset-password", { token, newPassword: password })
        : await axiosUser.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSuccess(response.data.message);
      setPassword("");
      setConfirmation("");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Не удалось выполнить запрос. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-page">
    <div className="auth-shell">
      <section className="auth-intro" aria-label="О платформе">
        <div className="auth-brand-badge"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн" /></div>
        <div className="auth-intro-copy"><span className="eyebrow">Безопасный доступ</span><h1>Вернитесь<br />к обучению.<br /><span>Смените пароль.</span></h1><p>Ссылка для восстановления придёт на почту и будет действовать 15 минут.</p></div>
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-top"><img className="auth-seal" src="/okurmen-seal.svg" alt="" /><span className="auth-secure"><ShieldCheck size={16} /> Ваше пространство для учёбы</span></div>
          <h2>{token ? "Новый пароль" : "Забыли пароль?"}</h2>
          <p className="auth-subtitle">{token ? "Придумайте новый пароль для входа в аккаунт." : "Введите email вашего аккаунта. Мы отправим ссылку для смены пароля."}</p>
          <form onSubmit={handleSubmit} className="auth-form password-reset-form">
            {token ? <>
              <label htmlFor="reset-password">Новый пароль</label>
              <input id="reset-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 8 символов" required />
              <label htmlFor="reset-confirmation">Повторите пароль</label>
              <input id="reset-confirmation" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Повторите новый пароль" required />
            </> : <>
              <label htmlFor="reset-email">Электронная почта</label>
              <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
            </>}
            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p className="form-success" role="status">{success}</p>}
            {!success && <button type="submit" className="primary-button auth-submit" disabled={busy}>{busy ? "Подождите..." : token ? "Сохранить пароль" : "Отправить ссылку"}<ArrowRight size={19} /></button>}
          </form>
          <div className="auth-bottom"><Link to="/auth/login"><ArrowLeft size={16} /> Вернуться ко входу</Link></div>
        </div>
      </main>
    </div>
  </div>;
}
