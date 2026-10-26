import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Mail, Pencil, Plus, RefreshCw, RotateCcw, Search, Trash2, X } from "lucide-react";
import { axiosAdmin } from "@/shared/lib/api/axiosAdmin";
import { AdminEmptyState, AdminMetric, AdminPageHeader } from "@/pages/admin/shared/AdminPanels";

const dateTime = (value) => value
  ? new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "—";

function statusOf(item, now) {
  if (new Date(item.expiresAt).getTime() <= now) return { label: "Истёк", color: "bg-slate-100 text-slate-600" };
  if ((item.attempts || 0) >= 5) return { label: "Лимит попыток", color: "bg-amber-50 text-amber-800" };
  return { label: "Ожидает", color: "bg-emerald-50 text-emerald-700" };
}

function ActionModal({ title, description, children, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-xl md:p-7" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div><button type="button" onClick={onClose} aria-label="Закрыть" className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X size={18} /></button></div>
      <div className="mt-6">{children}</div>
    </section>
  </div>;
}

export default function PendingAuthPage() {
  const [registrations, setRegistrations] = useState([]);
  const [resets, setResets] = useState([]);
  const [tab, setTab] = useState("registrations");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mailConfigured, setMailConfigured] = useState(true);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [now, setNow] = useState(Date.now());

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosAdmin.get("/admin/pending-auth");
      setRegistrations(response.data?.registrations || []);
      setResets(response.data?.resets || []);
      setMailConfigured(response.data?.mailConfigured !== false);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.response?.data?.message || "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const rows = tab === "registrations" ? registrations : resets;
  const visible = useMemo(() => rows.filter((item) => {
    const matchesSearch = `${item.username || ""} ${item.email || ""}`.toLowerCase().includes(query.trim().toLowerCase());
    const isExpired = new Date(item.expiresAt).getTime() <= now;
    return matchesSearch && (filter === "all" || (filter === "expired" ? isExpired : !isExpired));
  }), [rows, query, filter, now]);

  const openModal = (name, item = null) => {
    setSelected(item);
    setForm({ username: item?.username || "", email: item?.email || "", password: "" });
    setError("");
    setModal(name);
  };

  const mutate = async (request, message, itemId = "") => {
    setError("");
    setNotice("");
    setBusy(true);
    setActionId(itemId);
    try {
      await request();
      setModal("");
      await load();
      setNotice(message);
    } catch (requestError) {
      setError(requestError?.response?.data?.error || requestError?.response?.data?.message || "Не удалось выполнить действие");
    } finally {
      setBusy(false);
      setActionId("");
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (modal === "create-registration") return mutate(() => axiosAdmin.post("/admin/pending-auth/registrations", form), "Код регистрации отправлен на почту.");
    if (modal === "create-reset") return mutate(() => axiosAdmin.post("/admin/pending-auth/resets", { email: form.email }), "Ссылка для сброса отправлена на почту.");
    if (modal === "edit-registration") return mutate(() => axiosAdmin.patch(`/admin/pending-auth/registrations/${selected._id}`, { username: form.username }), "Имя обновлено.");
    if (modal === "delete-registration") return mutate(() => axiosAdmin.delete(`/admin/pending-auth/registrations/${selected._id}`), "Заявка на регистрацию удалена.");
    if (modal === "delete-reset") return mutate(() => axiosAdmin.delete(`/admin/pending-auth/resets/${selected._id}`), "Запрос на сброс удалён.");
  };

  const resend = (item) => mutate(
    () => tab === "registrations"
      ? axiosAdmin.post(`/admin/pending-auth/registrations/${item._id}/resend`)
      : axiosAdmin.patch(`/admin/pending-auth/resets/${item._id}`),
    tab === "registrations" ? "Новый код отправлен." : "Новая ссылка отправлена.",
    item._id
  );

  const confirmRegistration = (item) => mutate(
    () => axiosAdmin.post(`/admin/pending-auth/registrations/${item._id}/confirm`),
    `Регистрация ${item.email} подтверждена.`,
    item._id
  );

  const activeRegistrations = registrations.filter((item) => new Date(item.expiresAt).getTime() > now).length;
  const activeResets = resets.filter((item) => new Date(item.expiresAt).getTime() > now).length;

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-9">
    <div className="mx-auto max-w-[1400px] space-y-6">
      <AdminPageHeader eyebrow="Администрирование" title="Ожидающие заявки" description="Регистрации с кодом и запросы на сброс пароля. Каждая заявка действует 15 минут." actions={<button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:border-blue-300 disabled:opacity-50"><RefreshCw size={17} /> Обновить</button>} />

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Сводка заявок">
        <AdminMetric label="Ожидают регистрации" value={activeRegistrations} />
        <AdminMetric label="Ожидают сброса" value={activeResets} />
        <AdminMetric label="Истёкшие записи" value={registrations.length + resets.length - activeRegistrations - activeResets} detail="MongoDB удаляет их автоматически" />
      </section>

      {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {!mailConfigured && <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Отправка писем не настроена: проверьте RESEND_API_KEY и RESEND_FROM на сервере.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => { setTab("registrations"); setFilter("all"); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "registrations" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600"}`}>Регистрации ({registrations.length})</button>
            <button type="button" onClick={() => { setTab("resets"); setFilter("all"); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === "resets" ? "bg-white text-blue-800 shadow-sm" : "text-slate-600"}`}>Сбросы ({resets.length})</button>
          </div>
          <button type="button" onClick={() => openModal(tab === "registrations" ? "create-registration" : "create-reset")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><Plus size={17} /> {tab === "registrations" ? "Создать регистрацию" : "Отправить ссылку"}</button>
        </div>

        <div className="grid gap-3 border-b border-slate-100 p-5 md:grid-cols-[minmax(230px,1fr)_190px]">
          <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по имени или email" aria-label="Поиск заявок" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500" /></label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Статус заявки" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"><option value="all">Все статусы</option><option value="active">Действующие</option><option value="expired">Истёкшие</option></select>
        </div>

        {loading ? <div className="p-10 text-center text-sm text-slate-500">Загрузка заявок…</div> : visible.length === 0 ? <AdminEmptyState title="Заявок не найдено" description="Измените поиск или создайте новую заявку." /> : <div className="divide-y divide-slate-100">
          {visible.map((item) => {
            const status = statusOf(item, now);
            const remaining = Math.max(0, Math.ceil((new Date(item.expiresAt).getTime() - now) / 60000));
            return <div key={item._id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(190px,1.2fr)_minmax(130px,.8fr)_minmax(145px,.9fr)_minmax(130px,.8fr)_auto] xl:items-center md:px-6">
              <div className="min-w-0"><p className="truncate font-bold text-slate-900">{tab === "registrations" ? item.username : item.email}</p><p className="truncate text-sm text-slate-500">{tab === "registrations" ? item.email : "Сброс пароля"}</p></div>
              <div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>{status.label}</span>{tab === "registrations" && <p className="mt-1 text-xs text-slate-500">Попыток ввода: {item.attempts || 0} / 5</p>}</div>
              {tab === "registrations" && <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2"><p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">Код из письма</p><p className="font-mono text-lg font-black tracking-[0.2em] text-blue-950">{item.code || "Нет кода — отправьте повторно"}</p></div>}
              <div className="text-xs text-slate-500"><p className="flex items-center gap-1.5"><Clock3 size={14} /> {remaining ? `Ещё ${remaining} мин` : "Время вышло"}</p><p className="mt-1">До {dateTime(item.expiresAt)}</p></div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                {tab === "registrations" && <button type="button" onClick={() => openModal("edit-registration", item)} disabled={busy || remaining === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 disabled:opacity-40"><Pencil size={15} /> Имя</button>}
                {tab === "registrations" && <button type="button" onClick={() => confirmRegistration(item)} disabled={busy || remaining === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"><Check size={15} /> Подтвердить</button>}
                <button type="button" onClick={() => resend(item)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-40">{tab === "registrations" ? <Mail size={15} /> : <RotateCcw size={15} />}{actionId === item._id ? "Отправка…" : "Повторить"}</button>
                <button type="button" onClick={() => openModal(tab === "registrations" ? "delete-registration" : "delete-reset", item)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-40"><Trash2 size={15} /> Удалить</button>
              </div>
            </div>;
          })}
        </div>}
      </section>
    </div>

    {modal && <ActionModal title={{ "create-registration": "Создать регистрацию", "create-reset": "Отправить ссылку для сброса", "edit-registration": "Изменить имя", "delete-registration": "Удалить регистрацию?", "delete-reset": "Удалить запрос на сброс?" }[modal]} description={modal.startsWith("delete") ? "После удаления прежний код или ссылка перестанут действовать." : modal === "create-registration" ? "Код подтверждения поступит на указанную почту и будет действовать 15 минут." : modal === "create-reset" ? "Новая ссылка будет отправлена владельцу аккаунта." : "Измените имя в ожидающей регистрации."} onClose={() => !busy && setModal("")}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        {modal === "create-registration" || modal === "edit-registration" ? <label className="grid gap-2 text-sm font-bold text-slate-700">Имя пользователя<input required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label> : null}
        {modal === "create-registration" || modal === "create-reset" ? <label className="grid gap-2 text-sm font-bold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label> : null}
        {modal === "create-registration" && <label className="grid gap-2 text-sm font-bold text-slate-700">Временный пароль<input required type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /><span className="text-xs font-normal text-slate-500">Передайте пароль пользователю отдельно от письма с кодом.</span></label>}
        {modal.startsWith("delete") && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selected?.email}</p>}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setModal("")} disabled={busy} className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button><button type="submit" disabled={busy} className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${modal.startsWith("delete") ? "bg-red-600 hover:bg-red-700" : "bg-blue-700 hover:bg-blue-800"}`}>{busy ? "Сохранение…" : modal.startsWith("delete") ? "Удалить" : modal === "edit-registration" ? "Сохранить" : "Отправить"}</button></div>
      </form>
    </ActionModal>}
  </main>;
}
