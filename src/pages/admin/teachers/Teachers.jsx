import React, { useEffect, useMemo, useState } from "react";
import { axiosAdmin } from "@/shared/lib/api/axiosAdmin";
import { KeyRound, PencilLine, Trash2, X, UserPlus, Plus } from "lucide-react";
import { AdminEmptyState, AdminMetric, AdminPageHeader } from "@/pages/admin/shared/AdminPanels";

export function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rankingError, setRankingError] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState(null);

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", subjects: "", password: "" });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    subjects: ""
  });

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message || err?.response?.data?.error || fallback;

  const loadTeachers = async () => {
    setTeachersLoading(true);
    setError("");
    setRankingError("");
    try {
      const [teachersResponse, rankingResponse] = await Promise.allSettled([
        axiosAdmin.get("/teachers/get"),
        axiosAdmin.get("/teachers/leaderboard"),
      ]);
      if (teachersResponse.status === "fulfilled") setTeachers(teachersResponse.value.data?.teachers || []);
      else setError(getErrorMessage(teachersResponse.reason, "Не удалось загрузить преподавателей"));
      if (rankingResponse.status === "fulfilled") setRanking(rankingResponse.value.data?.teachers || []);
      else setRankingError(getErrorMessage(rankingResponse.reason, "Не удалось загрузить рейтинг"));
    } finally {
      setTeachersLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setError("");
    try {
      const response = await axiosAdmin.get("/admin/users");
      setUsers(response.data?.users || []);
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить пользователей"));
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const teacherByUserId = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      if (teacher.userId) {
        map.set(String(teacher.userId), teacher);
      }
    });
    return map;
  }, [teachers]);

  const teacherByEmail = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      if (teacher.email) {
        map.set(String(teacher.email).toLowerCase(), teacher);
      }
    });
    return map;
  }, [teachers]);

  const getTeacherForUser = (user) => {
    if (!user) return null;
    return (
      teacherByUserId.get(String(user._id)) ||
      teacherByEmail.get(String(user.email || "").toLowerCase()) ||
      null
    );
  };

  const openUsersModal = async () => {
    setShowUsersModal(true);
    if (users.length === 0) {
      await loadUsers();
    }
  };

  const closeUsersModal = () => {
    setShowUsersModal(false);
    setUserQuery("");
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher?.name || "",
      email: teacher?.email || "",
      subjects: Array.isArray(teacher?.subjects) ? teacher.subjects.join(", ") : "",
      password: ""
    });
    setError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingTeacher(null);
    setEditForm({ name: "", email: "", subjects: "", password: "" });
    setShowEditModal(false);
  };

  const openCreateModal = () => {
    setCreateForm({ name: "", email: "", password: "", subjects: "" });
    setError("");
    setShowCreatePassword(false);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleMakeTeacher = async (user) => {
    if (!user?._id) return;
    setActionId(user._id);
    setError("");
    try {
      const response = await axiosAdmin.post("/teachers/toggle", {
        userId: user._id,
        isTeacher: true,
      });
      await loadTeachers();
      setNotice(response.data?.notificationSent === false ? "Пользователь назначен преподавателем, но письмо не отправлено." : "Пользователь назначен преподавателем. Письмо отправлено.");
    } catch (err) {
      setError(getErrorMessage(err, "Ошибка при добавлении преподавателя"));
    } finally {
      setActionId(null);
    }
  };

  const handleRemoveTeacher = async (teacher) => {
    if (!teacher) return;
    const ok = window.confirm("Убрать преподавателя из списка?");
    if (!ok) return;

    setActionId(teacher._id);
    setError("");
    try {
      if (teacher.userId) {
        await axiosAdmin.post("/teachers/toggle", {
          userId: teacher.userId,
          isTeacher: false,
        });
      } else {
        await axiosAdmin.delete(`/teachers/${teacher._id}`);
      }
      await loadTeachers();
      setNotice("Преподаватель удалён из списка.");
    } catch (err) {
      setError(getErrorMessage(err, "Ошибка при удалении преподавателя"));
    } finally {
      setActionId(null);
    }
  };

  const handleSaveTeacher = async () => {
    if (!editingTeacher?._id) return;
    if (!editForm.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      setError("Укажите имя и корректный email для входа.");
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      setError("Новый пароль должен содержать минимум 8 символов.");
      return;
    }
    setActionId(editingTeacher._id);
    setError("");
    try {
      const subjects = editForm.subjects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await axiosAdmin.patch(`/teachers/${editingTeacher._id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        subjects,
        ...(editForm.password ? { password: editForm.password } : {})
      });
      await loadTeachers();
      closeEditModal();
      setNotice(response.data?.message || "Преподаватель обновлён.");
    } catch (err) {
      setError(getErrorMessage(err, "Ошибка при обновлении преподавателя"));
    } finally {
      setActionId(null);
    }
  };

  const handleSendResetLink = async (teacher) => {
    setActionId(teacher._id);
    setError("");
    setNotice("");
    try {
      const response = await axiosAdmin.post(`/teachers/${teacher._id}/reset-password`);
      setNotice(response.data?.message || "Ссылка отправлена преподавателю.");
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось отправить письмо преподавателю."));
    } finally {
      setActionId(null);
    }
  };

  const handleCreateTeacher = async () => {
    setError("");
    const name = createForm.name.trim();
    const email = createForm.email.trim();
    const password = createForm.password;

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      setError("Укажите имя, email для входа и пароль минимум из 8 символов.");
      return;
    }

    setActionId("create");
    try {
      const subjects = createForm.subjects
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await axiosAdmin.post("/teachers/post", { name, email, password, subjects });

      await loadTeachers();
      closeCreateModal();
      setNotice(response.data?.message || "Преподаватель создан.");
    } catch (err) {
      setError(getErrorMessage(err, "Ошибка при создании преподавателя"));
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const name = String(user.username || user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [users, userQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div>
          <AdminPageHeader eyebrow="Администрирование" title="Мониторинг учителей" description="Результаты учеников, рейтинг и управление преподавателями." actions={
            <>
              <button
                onClick={openUsersModal}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-2xl px-4 py-2 font-bold text-sm hover:bg-emerald-700 transition-all"
              >
                <UserPlus size={16} />
                Добавить преподавателей
              </button>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-2xl px-4 py-2 font-bold text-sm hover:bg-slate-800 transition-all"
              >
                <Plus size={16} />
                Создать преподавателя
              </button>
            </>
          } />
          {error && (
            <div className="mt-4 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl">
              {error}
            </div>
          )}
          {notice && <div className="mt-4 text-sm font-semibold text-emerald-800 bg-emerald-50 px-4 py-3 rounded-xl" role="status">{notice}</div>}
        </div>

        <section className="space-y-4" aria-label="Рейтинг преподавателей">
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminMetric label="Преподаватели" value={teachers.length} />
            <AdminMetric label="Проведено тестов" value={ranking.reduce((sum, teacher) => sum + (Number(teacher.testsCount) || 0), 0)} />
            <AdminMetric label="Участий учеников" value={ranking.reduce((sum, teacher) => sum + (Number(teacher.studentsCount) || 0), 0)} />
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-6 md:px-8"><h2 className="text-lg font-black text-slate-900">Рейтинг учителей</h2><p className="mt-1 text-sm text-slate-500">Средний результат учеников по завершённым тестам</p></div>
            {teachersLoading ? <div className="p-10 text-center text-sm text-slate-500">Загрузка рейтинга…</div> : rankingError ? <p role="alert" className="p-6 text-sm font-semibold text-red-700">{rankingError}</p> : ranking.length === 0 ? <AdminEmptyState title="Пока нет результатов" description="Рейтинг появится после прохождения тестов." /> : (
              <div className="divide-y divide-slate-100">
                {ranking.map((teacher, index) => (
                  <div key={teacher._id || teacher.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[minmax(0,1fr)_120px_130px_110px] sm:items-center md:px-8">
                    <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-mono font-black text-blue-700">{index + 1}</span><div className="min-w-0"><p className="truncate font-bold text-slate-900">{teacher.name || teacher.username || "Без имени"}</p><p className="truncate text-xs text-slate-500">{teacher.email || ""}</p></div></div>
                    <div><p className="text-xs text-slate-400">Тестов</p><p className="font-mono font-bold text-slate-800">{teacher.testsCount || 0}</p></div>
                    <div><p className="text-xs text-slate-400">Учеников</p><p className="font-mono font-bold text-slate-800">{teacher.studentsCount || 0}</p></div>
                    <div><p className="text-xs text-slate-400">Средний балл</p><p className="font-mono text-lg font-black text-blue-700">{(Number(teacher.rating) || 0).toFixed(1).replace(".", ",")}%</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Список преподавателей</h2>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Всего: {teachers.length}
            </div>
          </div>

          {teachersLoading ? (
            <div className="py-10 text-center text-slate-400 font-bold text-sm">
              Загрузка...
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-bold text-sm">
              Пока нет преподавателей
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="font-black text-slate-800">
                        {teacher.name || teacher.username || "Без имени"}
                      </div>
                      <div className="text-xs text-slate-400">{teacher.email}</div>
                      {teacher.subjects?.length > 0 && (
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                          {teacher.subjects.join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
                        onClick={() => handleSendResetLink(teacher)}
                        disabled={actionId === teacher._id}
                        title="Отправить ссылку для смены пароля"
                      ><KeyRound size={14} /> Сброс пароля</button>
                      <button
                        className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                        onClick={() => openEditModal(teacher)}
                        disabled={actionId === teacher._id}
                      >
                        <PencilLine size={14} />
                        Редактировать
                      </button>
                      <button
                        className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                        onClick={() => handleRemoveTeacher(teacher)}
                        disabled={actionId === teacher._id}
                      >
                        <Trash2 size={14} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUsersModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="absolute inset-0" onClick={closeUsersModal} />
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Пользователи</h3>
                <p className="text-sm text-slate-400">
                  Выберите пользователей и сделайте их преподавателями
                </p>
              </div>
              <button
                onClick={closeUsersModal}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Поиск по имени или email"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400"
              />
            </div>

            <div className="mt-6 max-h-[420px] overflow-y-auto">
              {usersLoading ? (
                <div className="py-10 text-center text-slate-400 font-bold text-sm">
                  Загрузка...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold text-sm">
                  Нет пользователей
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const teacher = getTeacherForUser(user);
                    const isTeacher = Boolean(teacher);
                    return (
                      <div
                        key={user._id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.username || user.name || "Без имени"}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                        <button
                          onClick={() => handleMakeTeacher(user)}
                          disabled={isTeacher || actionId === user._id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isTeacher
                              ? "bg-slate-100 text-slate-400"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {isTeacher ? "Уже преподаватель" : "Сделать преподавателем"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="absolute inset-0" onClick={closeCreateModal} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Создать преподавателя</h3>
                <p className="text-sm text-slate-400">
                  Создайте учетную запись и назначьте преподавателем
                </p>
              </div>
              <button
                onClick={closeCreateModal}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="create-teacher-name">Имя преподавателя</label>
              <input
                id="create-teacher-name"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400"
                placeholder="Имя"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
              <label className="block text-sm font-semibold text-slate-700" htmlFor="create-teacher-email">Логин (email)</label>
              <input
                id="create-teacher-email"
                type="email"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
              <label className="block text-sm font-semibold text-slate-700" htmlFor="create-teacher-password">Временный пароль</label>
              <div className="relative">
                <input
                  id="create-teacher-password"
                  type={showCreatePassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400 pl-10"
                  placeholder="Минимум 8 символов"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showCreatePassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showCreatePassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.53 9.53 0 0112 5c5 0 9 4.5 9 7 0 1.23-.7 2.7-1.88 4.03M6.11 6.11C3.82 7.64 2 10.02 2 12c0 2.5 4 7 10 7 1.05 0 2.06-.14 3-.4"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">Логин и временный пароль будут отправлены преподавателю через Resend.</p>
              <label className="block text-sm font-semibold text-slate-700" htmlFor="create-teacher-subjects">Предметы</label>
              <input
                id="create-teacher-subjects"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400"
                placeholder="Предметы через запятую"
                value={createForm.subjects}
                onChange={(e) => setCreateForm({ ...createForm, subjects: e.target.value })}
              />
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleCreateTeacher}
                disabled={actionId === "create"}
                className="flex-1 bg-slate-900 text-white rounded-2xl px-4 py-3 font-bold text-sm hover:bg-slate-800 transition-all"
              >
                {actionId === "create" ? "Создаём..." : "Создать"}
              </button>
              <button
                onClick={closeCreateModal}
                className="px-4 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="absolute inset-0" onClick={closeEditModal} />
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Редактирование</h3>
                <p className="text-sm text-slate-400">
                  Измените имя, логин, предметы или задайте новый пароль.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-slate-700" htmlFor="edit-teacher-name">Имя преподавателя</label>
              <input id="edit-teacher-name" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label className="block text-sm font-semibold text-slate-700" htmlFor="edit-teacher-email">Логин (email)</label>
              <input id="edit-teacher-email" type="email" className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <label className="block text-sm font-semibold text-slate-700" htmlFor="edit-teacher-subjects">Предметы</label>
              <input
                id="edit-teacher-subjects"
                className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400"
                placeholder="Предметы через запятую"
                value={editForm.subjects}
                onChange={(e) => setEditForm({ ...editForm, subjects: e.target.value })}
              />
              <label className="block text-sm font-semibold text-slate-700" htmlFor="edit-teacher-password">Новый пароль (необязательно)</label>
              <input id="edit-teacher-password" type="password" autoComplete="new-password" minLength={8} className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-semibold outline-none border border-transparent focus:border-emerald-400" placeholder="Оставьте пустым, чтобы не менять" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
              <p className="text-xs text-slate-500">При смене логина или пароля преподаватель получит письмо через Resend.</p>
              {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSaveTeacher}
                disabled={actionId === editingTeacher._id}
                className="flex-1 bg-emerald-600 text-white rounded-2xl px-4 py-3 font-bold text-sm hover:bg-emerald-700 transition-all"
              >
                Сохранить
              </button>
              <button
                onClick={closeEditModal}
                className="px-4 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
