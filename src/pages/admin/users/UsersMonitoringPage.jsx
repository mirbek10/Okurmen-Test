import { useEffect, useMemo, useState } from "react";
import { Ban, Check, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from "lucide-react";
import { axiosAdmin } from "@/shared/lib/api/axiosAdmin";
import { AdminEmptyState, AdminMetric, AdminPageHeader } from "@/pages/admin/shared/AdminPanels";

const displayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export default function UsersMonitoringPage() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersResponse, teachersResponse] = await Promise.all([
        axiosAdmin.get("/admin/users"),
        axiosAdmin.get("/teachers/get"),
      ]);
      setUsers(usersResponse.data?.users || []);
      setTeachers(teachersResponse.data?.teachers || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.response?.data?.message || "Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (name, user = null) => {
    setSelected(user);
    setForm({ username: user?.username || user?.name || "", email: user?.email || "", password: "", reason: "" });
    setError("");
    setModal(name);
  };

  const mutate = async (request, message) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request();
      setModal("");
      await load();
      setNotice(message);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.response?.data?.message || "Не удалось выполнить действие");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (modal === "create") return mutate(() => axiosAdmin.post("/admin/users", form), "Пользователь создан.");
    if (modal === "edit") return mutate(() => axiosAdmin.patch(`/admin/users/${selected._id}`, form), "Данные пользователя обновлены.");
    if (modal === "ban") return mutate(() => axiosAdmin.post(`/admin/users/${selected._id}/ban`, { reason: form.reason }), "Пользователь заблокирован.");
    if (modal === "delete") return mutate(() => axiosAdmin.delete(`/admin/users/${selected._id}`), "Пользователь удалён.");
  };

  const unban = (user) => mutate(() => axiosAdmin.post(`/admin/users/${user._id}/unban`), "Пользователь разблокирован.");

  const teacherUserIds = useMemo(() => new Set(teachers.map((teacher) => String(teacher.userId || ""))), [teachers]);
  const teacherEmails = useMemo(() => new Set(teachers.map((teacher) => String(teacher.email || "").toLowerCase())), [teachers]);
  const isTeacher = (user) => teacherUserIds.has(String(user._id)) || teacherEmails.has(String(user.email || "").toLowerCase());
  const assigned = users.filter((user) => Boolean(user.teacherId || user.teacherName)).length;
  const finished = users.reduce((sum, user) => sum + (Number(user.testFinished) || 0), 0);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role === "teacher" && !isTeacher(user)) return false;
      if (role === "student" && isTeacher(user)) return false;
      if (statusFilter === "banned" && !user.bannedAt) return false;
      if (statusFilter === "active" && user.bannedAt) return false;
      if (teacherFilter === "assigned" && !user.teacherId && !user.teacherName) return false;
      if (teacherFilter === "unassigned" && (user.teacherId || user.teacherName)) return false;
      return !needle || `${user.username || ""} ${user.email || ""} ${user.teacherName || ""}`.toLowerCase().includes(needle);
    });
  }, [users, query, role, teacherFilter, statusFilter, teacherUserIds, teacherEmails]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-9">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <AdminPageHeader eyebrow="Администрирование" title="Мониторинг пользователей" description="Управление аккаунтами, доступом и активностью учеников." actions={<div className="flex flex-wrap gap-2"><button type="button" onClick={() => openModal("create")} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"><Plus size={17} /> Создать пользователя</button><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"><RefreshCw size={17} /> Обновить</button></div>} />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Показатели пользователей">
          <AdminMetric label="Всего аккаунтов" value={users.length} />
          <AdminMetric label="Преподаватели" value={users.filter(isTeacher).length} />
          <AdminMetric label="Выбрали учителя" value={assigned} />
          <AdminMetric label="Завершено тестов" value={finished} />
          <AdminMetric label="Заблокированы" value={users.filter((user) => user.bannedAt).length} />
        </section>

        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(230px,1fr)_170px_200px_160px] md:p-5">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, email или учителю" aria-label="Поиск пользователей" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>
            <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Фильтр по роли" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Все роли</option><option value="student">Ученики</option><option value="teacher">Преподаватели</option></select>
            <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} aria-label="Фильтр по выбранному учителю" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Любой преподаватель</option><option value="assigned">Учитель выбран</option><option value="unassigned">Учитель не выбран</option></select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Фильтр по статусу" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Любой статус</option><option value="active">Активные</option><option value="banned">Заблокированные</option></select>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-extrabold text-slate-900">Пользователи</h2><span className="text-xs font-bold text-slate-500">Показано: {filtered.length}</span></div>
          {loading ? <div className="p-10 text-center text-sm text-slate-500">Загрузка пользователей…</div> : error ? <div role="alert" className="p-8 text-sm font-semibold text-red-700">{error}</div> : filtered.length === 0 ? <AdminEmptyState title="Пользователи не найдены" description="Измените поиск или фильтры." /> : (
            <div className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <div key={user._id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(200px,1.3fr)_minmax(130px,1fr)_110px_75px_100px_minmax(180px,auto)] md:items-center">
                  <div className="flex min-w-0 items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black ${user.bannedAt ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}><Users size={18} /></span><div className="min-w-0"><p className="truncate font-bold text-slate-900">{user.username || user.name || "Без имени"}</p><p className="truncate text-xs text-slate-500">{user.email || "Email не указан"}</p>{user.banReason && <p className="truncate text-xs text-red-700" title={user.banReason}>Причина: {user.banReason}</p>}</div></div>
                  <div><p className="text-xs text-slate-400">Преподаватель</p><p className="truncate text-sm font-semibold text-slate-700">{user.teacherName || "Не выбран"}</p></div>
                  <div className="flex flex-wrap gap-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isTeacher(user) ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>{isTeacher(user) ? "Учитель" : "Ученик"}</span>{user.bannedAt && <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Бан</span>}</div>
                  <div><p className="text-xs text-slate-400">Тестов</p><p className="font-mono font-bold text-slate-900">{Number(user.testFinished) || 0}</p></div>
                  <div><p className="text-xs text-slate-400">Регистрация</p><p className="text-sm font-medium text-slate-700">{displayDate(user.createdAt)}</p></div>
                  <div className="flex flex-wrap gap-2"><button type="button" onClick={() => openModal("edit", user)} disabled={busy} title="Редактировать" aria-label={`Редактировать ${user.username || user.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 disabled:opacity-50"><Pencil size={14} /> Изменить</button>{user.bannedAt ? <button type="button" onClick={() => unban(user)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50"><Check size={14} /> Разбан</button> : <button type="button" onClick={() => openModal("ban", user)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-800 disabled:opacity-50"><Ban size={14} /> Бан</button>}<button type="button" onClick={() => openModal("delete", user)} disabled={busy} title="Удалить" aria-label={`Удалить ${user.username || user.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-bold text-red-700 disabled:opacity-50"><Trash2 size={14} /> Удалить</button></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {modal && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={() => !busy && setModal("")}><section role="dialog" aria-modal="true" aria-label={{ create: "Создать пользователя", edit: "Изменить пользователя", ban: "Заблокировать пользователя", delete: "Удалить пользователя" }[modal]} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">{{ create: "Создать пользователя", edit: "Изменить пользователя", ban: "Заблокировать пользователя", delete: "Удалить пользователя?" }[modal]}</h2><p className="mt-1 text-sm text-slate-500">{modal === "delete" ? "Аккаунт будет удалён, а доступ к нему прекращён." : modal === "ban" ? `Пользователь ${selected?.email} не сможет войти.` : "Заполните данные аккаунта."}</p></div><button type="button" onClick={() => setModal("")} aria-label="Закрыть" className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X size={18} /></button></div><form onSubmit={submit} className="mt-6 space-y-4">{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}{(modal === "create" || modal === "edit") && <><label className="grid gap-2 text-sm font-bold text-slate-700">Имя<input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label><label className="grid gap-2 text-sm font-bold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label><label className="grid gap-2 text-sm font-bold text-slate-700">{modal === "create" ? "Пароль" : "Новый пароль (необязательно)"}<input type="password" required={modal === "create"} minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label></>}{modal === "ban" && <label className="grid gap-2 text-sm font-bold text-slate-700">Причина блокировки (необязательно)<textarea rows={3} maxLength={500} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>}{modal === "delete" && <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{selected?.username || selected?.email}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setModal("")} disabled={busy} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button><button type="submit" disabled={busy} className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${modal === "delete" ? "bg-red-600 hover:bg-red-700" : modal === "ban" ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-700 hover:bg-blue-800"}`}>{busy ? "Сохранение…" : modal === "delete" ? "Удалить" : modal === "ban" ? "Заблокировать" : modal === "edit" ? "Сохранить" : "Создать"}</button></div></form></section></div>}
    </main>
  );
}
