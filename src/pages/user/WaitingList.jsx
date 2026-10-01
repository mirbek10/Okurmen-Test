import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3 } from "lucide-react";
import { useUserGetStatus } from "@/app/stores/user/userGetStatus";
import { useAuthStore } from "@/app/stores/auth/authStore";

function readCredentials() {
  try {
    const participant = JSON.parse(localStorage.getItem("user") || "null");
    const code = localStorage.getItem("code");
    return participant?.studentId && code ? { studentId: participant.studentId, code } : null;
  } catch { return null; }
}

export function WaitingList() {
  const navigate = useNavigate();
  const { user: account } = useAuthStore();
  const { error, user, getStatus } = useUserGetStatus();
  const credentials = readCredentials();
  const studentId = credentials?.studentId;
  const code = credentials?.code;
  const started = user?.student?.status === "active";

  useEffect(() => {
    if (!studentId || !code) {
      navigate("/join-test", { replace: true });
      return;
    }
    getStatus(studentId, code);
    const intervalId = setInterval(() => getStatus(studentId, code), 5000);
    return () => clearInterval(intervalId);
  }, [studentId, code, getStatus, navigate]);

  useEffect(() => {
    if (started && user?.category) navigate(`/student-test/${user.category}`, { replace: true });
  }, [started, user?.category, navigate]);

  useEffect(() => {
    if (error?.includes("404") || error?.toLowerCase().includes("не найден")) {
      localStorage.removeItem("user");
      localStorage.removeItem("code");
      navigate("/join-test", { replace: true });
    }
  }, [error, navigate]);

  const leave = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("code");
    navigate("/user/profile", { replace: true });
  };

  return <div className="waiting-page"><div className="waiting-wrap"><Link className="text-link" to="/user/profile"><ArrowLeft size={17} /> В кабинет</Link><div className="waiting-card"><span className="section-kicker">Тест преподавателя</span><span className="waiting-icon">{started ? <CheckCircle2 size={27} /> : <Clock3 size={27} />}</span><h1>{started ? "Тест начался" : "Вы подключены"}</h1><p>{started ? "Открываем вопросы..." : "Преподаватель запустит тест. Страница обновит статус автоматически."}</p><div className="waiting-details"><div><small>Участник</small><strong>{user?.student?.name || account?.username || account?.name || "Ученик"}</strong></div><div><small>Код теста</small><strong>{credentials?.code || "—"}</strong></div></div>{error && <p className="form-error" role="alert">Не удалось обновить статус: {error}</p>}<div className="waiting-status"><span className="waiting-dot" /> {started ? "Подготовка вопросов" : "Ожидаем преподавателя"}</div><button type="button" className="waiting-leave" onClick={leave}>Покинуть ожидание</button></div></div></div>;
}
