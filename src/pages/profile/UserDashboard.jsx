import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Clock3,
  GraduationCap,
  History,
  KeyRound,
  Loader2,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { axiosUser } from "@/shared/lib/api/axiosUser";

function getHistory() {
  try {
    const value = JSON.parse(localStorage.getItem("practice_history") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function UserDashboard() {
  const { user, updateAvatar, updateTeacher } = useAuthStore();
  const [history, setHistory] = useState(getHistory);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teacherError, setTeacherError] = useState("");
  const [savingTeacherId, setSavingTeacherId] = useState(null);

  const firstName = (user?.username || user?.name || "Ученик").split(" ")[0];
  const latest = [...history].reverse().slice(0, 3);
  const completed = user?.testsCompleted ?? user?.testFinished ?? 0;

  useEffect(() => setHistory(getHistory()), []);

  useEffect(() => {
    if (user?.role !== "user") return;
    let active = true;
    setTeachersLoading(true);
    axiosUser.get("/teachers/available")
      .then((response) => {
        if (active) setTeachers(Array.isArray(response.data.teachers) ? response.data.teachers : []);
      })
      .catch((error) => {
        if (active) setTeacherError(error.response?.data?.error || "Не удалось загрузить преподавателей.");
      })
      .finally(() => active && setTeachersLoading(false));
    return () => { active = false; };
  }, [user?.role]);

  const saveAvatar = async (event) => {
    event.preventDefault();
    setAvatarError("");
    if (!avatarUrl.trim()) return setAvatarError("Вставьте ссылку на изображение.");
    setSavingAvatar(true);
    try {
      await updateAvatar(avatarUrl.trim());
      setAvatarDialogOpen(false);
      setAvatarUrl("");
    } catch {
      setAvatarError("Не удалось сохранить фото. Проверьте ссылку и попробуйте снова.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const selectTeacher = async (teacherId) => {
    setTeacherError("");
    setSavingTeacherId(teacherId || "none");
    try {
      await updateTeacher(teacherId);
      setTeacherDialogOpen(false);
    } catch (error) {
      setTeacherError(error.response?.data?.error || "Не удалось сохранить преподавателя.");
    } finally {
      setSavingTeacherId(null);
    }
  };

  return (
    <div className="dashboard">
      <section className="dashboard-heading">
        <div>
          <span className="section-kicker">Личный кабинет</span>
          <h1>Здравствуйте, {firstName}</h1>
          <p>Выберите, что хотите сделать сегодня. Всё необходимое находится здесь.</p>
        </div>
        <span className="dashboard-date">Ваш учебный прогресс</span>
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

      {user?.role === "user" && (
        <section className="dashboard-account teacher-choice-section">
          <div className="section-heading">
            <div><span className="section-kicker">Обучение</span><h2>Ваш преподаватель</h2></div>
          </div>
          <div className="teacher-choice-summary">
            <span className="teacher-choice-avatar">
              {user?.teacherAvatar ? <img src={user.teacherAvatar} alt="Фото преподавателя" /> : <GraduationCap size={24} />}
            </span>
            <span className="profile-summary-copy">
              <strong>{user?.teacherName || "Преподаватель не выбран"}</strong>
              <small>{user?.teacherName ? "Закреплён за вашим профилем" : "Выберите преподавателя из списка"}</small>
            </span>
            <button type="button" className="profile-photo-button" onClick={() => setTeacherDialogOpen(true)}>
              <UserRound size={17} /> {user?.teacherName ? "Изменить" : "Выбрать"}
            </button>
          </div>
        </section>
      )}

      <section className="dashboard-account">
        <div className="section-heading"><div><span className="section-kicker">Аккаунт</span><h2>Ваш профиль</h2></div></div>
        <div className="profile-summary">
          <span className="profile-avatar">{user?.avatar ? <img src={user.avatar} alt="Фото профиля" /> : firstName.slice(0, 1).toUpperCase()}</span>
          <span className="profile-summary-copy"><strong>{user?.username || user?.name || "Ученик"}</strong><small>{user?.email || "Почта не указана"}</small></span>
          <button type="button" className="profile-photo-button" onClick={() => setAvatarDialogOpen(true)}><Camera size={17} /> Изменить фото</button>
        </div>
      </section>

      {avatarDialogOpen && (
        <div className="profile-modal-backdrop" onClick={() => setAvatarDialogOpen(false)}>
          <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-dialog-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="profile-modal-close" aria-label="Закрыть" onClick={() => setAvatarDialogOpen(false)}><X size={20} /></button>
            <h2 id="avatar-dialog-title">Изменить фото</h2>
            <p>Вставьте прямую ссылку на изображение.</p>
            <form onSubmit={saveAvatar} className="auth-form">
              <label htmlFor="avatar-url">Ссылка на фото</label>
              <input id="avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/photo.jpg" required />
              {avatarError && <p className="form-error" role="alert">{avatarError}</p>}
              <button type="submit" className="primary-button" disabled={savingAvatar}>{savingAvatar ? "Сохраняем..." : "Сохранить"}</button>
            </form>
          </div>
        </div>
      )}

      {teacherDialogOpen && (
        <div className="profile-modal-backdrop" onClick={() => setTeacherDialogOpen(false)}>
          <div className="profile-modal teacher-choice-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-dialog-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="profile-modal-close" aria-label="Закрыть" onClick={() => setTeacherDialogOpen(false)}><X size={20} /></button>
            <h2 id="teacher-dialog-title">Выберите преподавателя</h2>
            <p>Выбор сохранится в вашем профиле.</p>
            {teachersLoading ? (
              <div className="teacher-choice-loading"><Loader2 size={24} className="spin-icon" /> Загружаем список...</div>
            ) : teachers.length ? (
              <div className="teacher-choice-list">
                {teachers.map((teacher) => {
                  const selected = user?.teacherId === String(teacher.id);
                  return (
                    <button key={teacher.id} type="button" className={`teacher-choice-item ${selected ? "is-selected" : ""}`} onClick={() => selectTeacher(String(teacher.id))} disabled={Boolean(savingTeacherId)}>
                      <span className="teacher-choice-avatar small">{teacher.avatar ? <img src={teacher.avatar} alt="" /> : <GraduationCap size={20} />}</span>
                      <span><strong>{teacher.name}</strong><small>{teacher.subjects?.length ? teacher.subjects.join(", ") : "Преподаватель"}</small></span>
                      {savingTeacherId === String(teacher.id) ? <Loader2 size={19} className="spin-icon" /> : selected ? <Check size={19} /> : <ArrowRight size={18} />}
                    </button>
                  );
                })}
                {user?.teacherId && <button type="button" className="teacher-choice-clear" onClick={() => selectTeacher("")} disabled={Boolean(savingTeacherId)}>Снять выбор преподавателя</button>}
              </div>
            ) : (
              <div className="teacher-choice-empty"><GraduationCap size={26} /><strong>Преподавателей пока нет</strong><span>Они появятся здесь после добавления администратором.</span></div>
            )}
            {teacherError && <p className="form-error" role="alert">{teacherError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
