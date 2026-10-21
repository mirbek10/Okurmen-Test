import { useEffect, useMemo, useState } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
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
      if (teacherFilter === "assigned" && !user.teacherId && !user.teacherName) return false;
      if (teacherFilter === "unassigned" && (user.teacherId || user.teacherName)) return false;
      return !needle || `${user.username || ""} ${user.email || ""} ${user.teacherName || ""}`.toLowerCase().includes(needle);
    });
  }, [users, query, role, teacherFilter, teacherUserIds, teacherEmails]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-9">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <AdminPageHeader eyebrow="Администрирование" title="Мониторинг пользователей" description="Аккаунты, выбранные преподаватели и активность учеников в одном месте." actions={<button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"><RefreshCw size={17} /> Обновить</button>} />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Показатели пользователей">
          <AdminMetric label="Всего аккаунтов" value={users.length} />
          <AdminMetric label="Преподаватели" value={users.filter(isTeacher).length} />
          <AdminMetric label="Выбрали учителя" value={assigned} />
          <AdminMetric label="Завершено тестов" value={finished} />
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
          <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[minmax(230px,1fr)_190px_220px] md:p-5">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени, email или учителю" aria-label="Поиск пользователей" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </label>
            <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="Фильтр по роли" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Все роли</option><option value="student">Ученики</option><option value="teacher">Преподаватели</option></select>
            <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} aria-label="Фильтр по выбранному учителю" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Любой преподаватель</option><option value="assigned">Учитель выбран</option><option value="unassigned">Учитель не выбран</option></select>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-extrabold text-slate-900">Пользователи</h2><span className="text-xs font-bold text-slate-500">Показано: {filtered.length}</span></div>
          {loading ? <div className="p-10 text-center text-sm text-slate-500">Загрузка пользователей…</div> : error ? <div role="alert" className="p-8 text-sm font-semibold text-red-700">{error}</div> : filtered.length === 0 ? <AdminEmptyState title="Пользователи не найдены" description="Измените поиск или фильтры." /> : (
            <div className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <div key={user._id} className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(220px,1.4fr)_minmax(150px,1fr)_100px_100px_115px] md:items-center">
                  <div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-black text-blue-700"><Users size={18} /></span><div className="min-w-0"><p className="truncate font-bold text-slate-900">{user.username || user.name || "Без имени"}</p><p className="truncate text-xs text-slate-500">{user.email || "Email не указан"}</p></div></div>
                  <div><p className="text-xs text-slate-400">Преподаватель</p><p className="truncate text-sm font-semibold text-slate-700">{user.teacherName || "Не выбран"}</p></div>
                  <div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isTeacher(user) ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>{isTeacher(user) ? "Учитель" : "Ученик"}</span></div>
                  <div><p className="text-xs text-slate-400">Тестов</p><p className="font-mono font-bold text-slate-900">{Number(user.testFinished) || 0}</p></div>
                  <div><p className="text-xs text-slate-400">Регистрация</p><p className="text-sm font-medium text-slate-700">{displayDate(user.createdAt)}</p></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
