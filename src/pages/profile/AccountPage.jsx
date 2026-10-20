import { useEffect, useState } from "react";
import { Camera, Check, GraduationCap, Loader2, UserRound } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export function AccountPage() {
  const { user, updateAvatar, updateTeacher } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teacherError, setTeacherError] = useState("");
  const [savingTeacherId, setSavingTeacherId] = useState(null);

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
      .finally(() => { if (active) setTeachersLoading(false); });
    return () => { active = false; };
  }, [user?.role]);

  const saveAvatar = async (event) => {
    event.preventDefault();
    setAvatarError("");
    if (!avatarUrl.trim()) return setAvatarError("Вставьте ссылку на изображение.");
    setSavingAvatar(true);
    try {
      await updateAvatar(avatarUrl.trim());
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
    } catch (error) {
      setTeacherError(error.response?.data?.error || "Не удалось сохранить преподавателя.");
    } finally {
      setSavingTeacherId(null);
    }
  };

  return <div className="dashboard account-page">
    <section className="dashboard-heading">
      <div><span className="section-kicker">Аккаунт</span><h1>Мой профиль</h1><p>Здесь можно изменить фото и выбрать преподавателя.</p></div>
    </section>

    <section className="dashboard-account">
      <div className="section-heading"><div><span className="section-kicker">Личные данные</span><h2>Ваш аккаунт</h2></div></div>
      <div className="profile-summary">
        <span className="profile-avatar">{user?.avatar ? <img src={user.avatar} alt="Фото профиля" /> : <UserRound size={30} />}</span>
        <span className="profile-summary-copy"><strong>{user?.username || user?.name || "Ученик"}</strong><small>{user?.email || "Почта не указана"}</small></span>
      </div>
      <form onSubmit={saveAvatar} className="auth-form account-avatar-form">
        <label htmlFor="avatar-url">Ссылка на новое фото</label>
        <div className="account-avatar-row"><input id="avatar-url" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/photo.jpg" required /><button type="submit" className="primary-button" disabled={savingAvatar}><Camera size={17} /> {savingAvatar ? "Сохраняем..." : "Сохранить фото"}</button></div>
        {avatarError && <p className="form-error" role="alert">{avatarError}</p>}
      </form>
    </section>

    {user?.role === "user" && <section className="dashboard-account teacher-choice-section">
      <div className="section-heading"><div><span className="section-kicker">Обучение</span><h2>Ваш преподаватель</h2></div></div>
      <p className="account-section-note">Выберите преподавателя. Изменение сохранится в вашем профиле.</p>
      {teachersLoading ? <div className="teacher-choice-loading"><Loader2 size={22} className="spin-icon" /> Загружаем список...</div> : teachers.length ? <div className="teacher-choice-list">
        {teachers.map((teacher) => {
          const selected = user?.teacherId === String(teacher.id);
          return <button key={teacher.id} type="button" className={`teacher-choice-item ${selected ? "is-selected" : ""}`} onClick={() => selectTeacher(String(teacher.id))} disabled={Boolean(savingTeacherId)}>
            <span className="teacher-choice-avatar small">{teacher.avatar ? <img src={teacher.avatar} alt="" /> : <GraduationCap size={20} />}</span>
            <span><strong>{teacher.name}</strong><small>{teacher.subjects?.length ? teacher.subjects.join(", ") : "Преподаватель"}</small></span>
            {savingTeacherId === String(teacher.id) ? <Loader2 size={19} className="spin-icon" /> : selected ? <Check size={19} /> : null}
          </button>;
        })}
        {user?.teacherId && <button type="button" className="teacher-choice-clear" onClick={() => selectTeacher("")} disabled={Boolean(savingTeacherId)}>Снять выбор преподавателя</button>}
      </div> : <div className="teacher-choice-empty"><GraduationCap size={26} /><strong>Преподавателей пока нет</strong><span>Они появятся здесь после добавления администратором.</span></div>}
      {teacherError && <p className="form-error" role="alert">{teacherError}</p>}
    </section>}
  </div>;
}
