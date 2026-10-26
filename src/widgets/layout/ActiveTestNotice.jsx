import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleCheck, Radio } from "lucide-react";
import { axiosUser } from "@/shared/lib/api/axiosUser";

function readCredentials() {
  try {
    const participant = JSON.parse(localStorage.getItem("user") || "null");
    const code = localStorage.getItem("code");
    return participant?.studentId && code ? { participant, code: String(code) } : null;
  } catch {
    return null;
  }
}

export default function ActiveTestNotice() {
  const [activeJoin, setActiveJoin] = useState(null);

  useEffect(() => {
    let stopped = false;

    const refresh = async () => {
      const credentials = readCredentials();
      if (!credentials) {
        if (!stopped) setActiveJoin(null);
        return;
      }

      try {
        const response = await axiosUser.get(
          `/student/status/${encodeURIComponent(credentials.code)}/${credentials.participant.studentId}`
        );
        const status = response.data?.student?.status;
        if (stopped) return;
        if (status === "waiting" || status === "active") {
          setActiveJoin({ ...credentials, status, name: response.data.student.name });
        } else {
          setActiveJoin(null);
        }
      } catch (error) {
        if (stopped) return;
        if (error.response?.status === 404) setActiveJoin(null);
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 10000);
    window.addEventListener("storage", refresh);
    window.addEventListener("test-participant-updated", refresh);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("test-participant-updated", refresh);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("has-active-test-notice", Boolean(activeJoin));
    return () => document.body.classList.remove("has-active-test-notice");
  }, [activeJoin]);

  if (!activeJoin) return null;

  const isRopTest = activeJoin.participant.category === "РОП";
  const waitingPath = isRopTest ? "/rop-waiting" : "/student-waiting-list";
  const isStarted = activeJoin.status === "active";

  return <aside className="active-test-notice" role="status" aria-live="polite">
    <span className={`active-test-notice-icon ${isStarted ? "is-started" : ""}`}>
      {isStarted ? <CircleCheck size={21} /> : <Radio size={21} />}
    </span>
    <div className="active-test-notice-copy">
      <span className="active-test-notice-kicker">Тест преподавателя · код {activeJoin.code}</span>
      <strong>{isStarted ? "Тест уже начался" : "Вы уже в списке участников"}</strong>
      <span>{isStarted ? "Нажмите, чтобы продолжить" : "Ожидаем запуска — место сохранено"}</span>
    </div>
    <Link className="active-test-notice-action" to={waitingPath} aria-label={isStarted ? "Продолжить тест" : "Вернуться к ожиданию теста"}>
      {isStarted ? "Войти" : "Ожидание"}<ArrowRight size={17} />
    </Link>
  </aside>;
}
