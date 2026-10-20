import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  History,
  KeyRound,
  Trophy,
} from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";

function getHistory() {
  try {
    const value = JSON.parse(localStorage.getItem("practice_history") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function UserDashboard() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState(getHistory);

  const firstName = (user?.username || user?.name || "Ученик").split(" ")[0];
  const latest = [...history].reverse().slice(0, 3);
  const completed = user?.testsCompleted ?? user?.testFinished ?? 0;

  useEffect(() => setHistory(getHistory()), []);

  return (
    <div className="dashboard">
      <section className="dashboard-heading">
        <div>
          <span className="section-kicker">Личный кабинет</span>
          <h1>Здравствуйте, {firstName}</h1>
          <p>Выберите, что хотите сделать сегодня. Всё необходимое находится здесь.</p>
        </div>
        <Link className="text-link" to="/user/account">Мой профиль <ArrowRight size={17} /></Link>
      </section>

      <section className="dashboard-actions" aria-label="Быстрые действия">
        <Link className="action-panel action-panel-main" to="/user/tests">
          <span className="action-icon"><BookOpen size={25} /></span>
          <span className="action-panel-copy"><small>Практика</small><strong>Начать тренировку</strong><span>Выберите направление и тему, чтобы проверить знания.</span></span>
          <ArrowRight className="action-arrow" size={22} />
        </Link>
        <Link className="action-panel action-panel-code" to="/join-test">
          <span className="action-icon"><KeyRound size={24} /></span>
          <span className="action-panel-copy"><small>Тест преподавателя</small><strong>Войти по коду</strong><span>Код можно получить у вашего преподавателя.</span></span>
          <ArrowRight className="action-arrow" size={22} />
        </Link>
      </section>

      <section className="dashboard-overview" aria-label="Краткая статистика">
        <div className="overview-item"><span><BookOpen size={18} /> Пройдено тестов</span><strong>{completed}</strong></div>
        <div className="overview-item"><span><Trophy size={18} /> Баллы рейтинга</span><strong>{user?.rating ?? 0}</strong></div>
        <div className="overview-item"><span><Clock3 size={18} /> Тренировок</span><strong>{history.length}</strong></div>
      </section>

      <section className="dashboard-history">
        <div className="section-heading">
          <div><span className="section-kicker">Ваши результаты</span><h2>Последние тренировки</h2></div>
          <Link className="text-link" to="/user/history">Вся история <ArrowRight size={17} /></Link>
        </div>
        {latest.length ? (
          <div className="recent-list">
            {latest.map((item, index) => (
              <div className="recent-row" key={`${item.date || "test"}-${index}`}>
                <span className="recent-icon"><History size={20} /></span>
                <div className="recent-info"><strong>{item.category || item.type || "Тренировка"}</strong><span>{item.date ? new Date(item.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Недавно"}</span></div>
                <span className="recent-result">{item.percent ?? 0}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <span className="empty-icon"><History size={24} /></span>
            <div><strong>Пока нет тренировок</strong><p>После первой тренировки здесь появится ваш результат.</p></div>
            <Link to="/user/tests" className="text-link">Выбрать тему <ArrowRight size={17} /></Link>
          </div>
        )}
      </section>

    </div>
  );
}
