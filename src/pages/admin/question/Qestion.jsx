import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileJson,
  FileUp,
  Filter,
  LockKeyhole,
  Layers3,
  Loader2,
  Plus,
  Pencil,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import { useTestCategoryStore } from "@/app/stores/all/getTestCategory";
import { QuestionCard } from "./QuestionCard";

const EMPTY_QUESTION = {
  question: "",
  category: "",
  difficulty: "средний",
  options: ["", "", "", ""],
  answer: "",
};

function ModalShell({ title, description, onClose, children, width = "max-w-2xl" }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92dvh] w-full ${width} overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-[1] flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-5 backdrop-blur md:px-7">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 active:scale-95" aria-label="Закрыть">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function QuestionModal({ initialQuestion, categories, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => initialQuestion
    ? {
        question: initialQuestion.question || "",
        category: initialQuestion.category || "",
        difficulty: initialQuestion.difficulty || "средний",
        options: Array.from({ length: 4 }, (_, index) => initialQuestion.options?.[index] || ""),
        answer: initialQuestion.answer || "",
      }
    : { ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] });
  const [formError, setFormError] = useState("");

  const changeOption = (index, value) => {
    setForm((current) => {
      const options = [...current.options];
      const previousValue = options[index];
      options[index] = value;
      return { ...current, options, answer: current.answer === previousValue ? value : current.answer };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!form.question.trim() || !form.category.trim() || form.options.some((option) => !option.trim())) {
      setFormError("Заполните вопрос, раздел и все четыре варианта ответа.");
      return;
    }
    if (!form.answer || !form.options.includes(form.answer)) {
      setFormError("Отметьте правильный вариант ответа.");
      return;
    }
    try {
      await onSave({ ...form, options: form.options.map((option) => option.trim()) });
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <ModalShell
      title={initialQuestion ? "Изменить вопрос" : "Новый вопрос"}
      description="Заполните данные и отметьте один правильный ответ."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-6 p-5 md:p-7">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Текст вопроса
          <textarea
            value={form.question}
            onChange={(event) => setForm({ ...form, question: event.target.value })}
            className="min-h-28 resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="Введите вопрос"
            autoFocus
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Раздел / категория
            <input
              list="question-categories"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Например, РОП"
            />
            <datalist id="question-categories">
              {categories.map((category) => <option key={category} value={category} />)}
            </datalist>
            <span className="text-xs font-medium text-slate-500">Измените раздел, чтобы перенести только этот вопрос.</span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Сложность
            <select
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="легкий">Лёгкий</option>
              <option value="средний">Средний</option>
              <option value="сложный">Сложный</option>
            </select>
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-bold text-slate-700">Варианты ответа</legend>
          {form.options.map((option, index) => (
            <label key={index} className={`flex items-center gap-3 rounded-2xl border p-3 transition ${form.answer === option && option ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <input
                type="radio"
                name="correct-answer"
                checked={Boolean(option) && form.answer === option}
                onChange={() => setForm({ ...form, answer: option })}
                disabled={!option}
                className="h-5 w-5 accent-emerald-600"
              />
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-black text-slate-500 shadow-sm">
                {String.fromCharCode(65 + index)}
              </span>
              <input
                value={option}
                onChange={(event) => changeOption(index, event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm font-medium outline-none"
                placeholder={`Вариант ${index + 1}`}
              />
              {form.answer === option && option && <Check size={18} className="text-emerald-600" />}
            </label>
          ))}
          <p className="text-xs text-slate-500">Кружок слева отмечает правильный ответ.</p>
        </fieldset>

        {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button>
          <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50">
            {saving && <Loader2 size={18} className="animate-spin" />}
            {initialQuestion ? "Сохранить изменения" : "Добавить вопрос"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RenameCategoryModal({ category, saving, onClose, onSave }) {
  const [name, setName] = useState(category);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const nextName = name.trim();
    if (!nextName) {
      setError("Введите новое название категории.");
      return;
    }
    if (nextName === category) {
      setError("Новое название совпадает с текущим.");
      return;
    }
    try {
      await onSave(nextName);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <ModalShell
      title="Переименовать категорию"
      description={`Название «${category}» изменится у всех вопросов этой категории.`}
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={submit} className="space-y-5 p-5 md:p-7">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Новое название
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoFocus
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="Например, JavaScript"
          />
        </label>
        <p className="text-xs leading-relaxed text-slate-500">
          Вопросы останутся на месте. Если нужно переместить только один вопрос, нажмите «Изменить» у него.
        </p>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button>
          <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">
            {saving && <Loader2 size={18} className="animate-spin" />}
            Сохранить название
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function CategoryParentModal({ category, parentCategory, saving, onClose, onSave }) {
  const [name, setName] = useState(parentCategory || "Другие");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) return setError("Введите название направления.");
    setError("");
    try {
      await onSave(nextName);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return <ModalShell title="Изменить направление" description={`Укажите родительское направление для категории «${category}».`} onClose={onClose} width="max-w-xl">
    <form onSubmit={submit} className="space-y-5 p-5 md:p-7">
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Направление
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoFocus className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Например, Frontend" />
      </label>
      {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Отмена</button>
        <button type="submit" disabled={saving} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Сохранение…" : "Сохранить"}</button>
      </div>
    </form>
  </ModalShell>;
}

function UploadModal({ uploading, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!file) return setUploadError("Выберите файл Excel.");
    try {
      setUploadError("");
      await onUpload(file);
    } catch (error) {
      setUploadError(error.message);
    }
  };

  return (
    <ModalShell title="Загрузить вопросы" description="Выберите Excel-файл с вопросами по разделам." onClose={onClose} width="max-w-lg">
      <form onSubmit={submit} className="space-y-5 p-5 md:p-7">
        <label className={`grid min-h-52 cursor-pointer place-items-center rounded-[24px] border-2 border-dashed p-6 text-center transition ${file ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"}`}>
          <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <span>
            {file ? <FileSpreadsheet className="mx-auto mb-3 text-blue-700" size={40} /> : <FileUp className="mx-auto mb-3 text-slate-400" size={40} />}
            <strong className="block text-sm text-slate-800">{file ? file.name : "Нажмите и выберите Excel-файл"}</strong>
            <small className="mt-2 block text-slate-500">Поддерживаются форматы .xlsx и .xls</small>
          </span>
        </label>
        <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <p>Импорт заменит текущую базу вопросов данными из файла.</p>
        </div>
        {uploadError && <p role="alert" className="text-sm font-semibold text-red-700">{uploadError}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button>
          <button type="submit" disabled={!file || uploading} className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50">
            {uploading && <Loader2 size={18} className="animate-spin" />}
            Загрузить файл
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function JsonImportModal({ uploading, onClose, onImport }) {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const parsed = useMemo(() => {
    if (!source.trim()) return null;
    try {
      const value = JSON.parse(source);
      const questions = Array.isArray(value) ? value : Array.isArray(value?.questions) ? value.questions : [value];
      if (!questions.length || questions.length > 200) throw new Error("В файле должно быть от 1 до 200 вопросов.");
      questions.forEach((question, index) => {
        if (!question || typeof question.question !== "string" || !question.question.trim() || typeof question.category !== "string" || !question.category.trim() || !Array.isArray(question.options) || question.options.length !== 4 || question.options.some((option) => typeof option !== "string" || !option.trim()) || !question.options.includes(question.answer)) {
          throw new Error(`Вопрос №${index + 1}: укажите раздел, текст, четыре варианта и правильный ответ.`);
        }
      });
      return { questions };
    } catch (parseError) {
      return { error: parseError instanceof SyntaxError ? "Проверьте синтаксис JSON." : parseError.message };
    }
  }, [source]);

  const readFile = async (file) => {
    if (!file) return;
    setError("");
    setFileName(file.name);
    try {
      setSource(await file.text());
    } catch {
      setError("Не удалось прочитать файл.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!parsed?.questions) return setError(parsed?.error || "Добавьте JSON с вопросами.");
    setError("");
    try {
      await onImport(parsed.questions);
    } catch (importError) {
      setError(importError.message);
    }
  };

  return (
    <ModalShell title="Импорт вопросов из JSON" description="Добавьте вопросы в существующую базу. Повторяющиеся вопросы будут пропущены." onClose={onClose} width="max-w-3xl">
      <form onSubmit={submit} className="space-y-5 p-5 md:p-7">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-4 text-sm font-bold text-blue-800 transition hover:bg-blue-100">
          <FileJson size={20} /> {fileName || "Выбрать файл .json"}
          <input type="file" accept=".json,application/json" className="sr-only" onChange={(event) => readFile(event.target.files?.[0])} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Или вставьте JSON
          <textarea value={source} onChange={(event) => { setSource(event.target.value); setFileName(""); setError(""); }} rows={11} spellCheck={false} className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder={'[{"question":"Текст вопроса","category":"РОП","options":["A","B","C","D"],"answer":"A","difficulty":"средний"}]'} />
        </label>
        <p className="text-xs leading-relaxed text-slate-500">Формат: массив вопросов или объект с полем questions. Каждый вопрос содержит question, category, options (4 строки) и answer. За один раз — до 200 вопросов.</p>
        {parsed?.questions && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Готово к импорту: {parsed.questions.length} вопросов</p>}
        {(error || parsed?.error) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error || parsed.error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button>
          <button type="submit" disabled={!parsed?.questions || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-50">{uploading && <Loader2 size={18} className="animate-spin" />} Импортировать</button>
        </div>
      </form>
    </ModalShell>
  );
}

function DeleteModal({ question, saving, onClose, onConfirm }) {
  return (
    <ModalShell title="Удалить вопрос?" description="Это действие нельзя отменить." onClose={onClose} width="max-w-md">
      <div className="p-5 md:p-7">
        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-700">{question.question}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Отмена</button>
          <button type="button" disabled={saving} onClick={onConfirm} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50">
            {saving && <Loader2 size={18} className="animate-spin" />}
            Удалить
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export const QuestionsPage = () => {
  const store = useQuestionStore();
  const fetchQuestions = useQuestionStore((state) => state.fetchQuestions);
  const searchQuestions = useQuestionStore((state) => state.searchQuestions);
  const { testCategories, fetchTestCategories } = useTestCategoryStore();
  const [searchValue, setSearchValue] = useState("");
  const [editorQuestion, setEditorQuestion] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameCategoryTarget, setRenameCategoryTarget] = useState(null);
  const [parentCategoryTarget, setParentCategoryTarget] = useState(null);

  useEffect(() => {
    fetchQuestions({ page: 1 });
    fetchTestCategories();
  }, [fetchQuestions, fetchTestCategories]);

  useEffect(() => {
    const timer = setTimeout(() => searchQuestions(searchValue.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchValue, searchQuestions]);

  const categories = useMemo(() => Array.from(new Set([
    ...store.allCategories,
    ...testCategories.map((item) => item.category).filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b, "ru")), [store.allCategories, testCategories]);

  const grandTotal = store.categoryStats.reduce((sum, item) => sum + item.count, 0);
  const openCreate = () => { setEditorQuestion(null); setEditorOpen(true); };
  const openEdit = (question) => { setEditorQuestion(question); setEditorOpen(true); };

  const saveQuestion = async (payload) => {
    if (editorQuestion) await store.updateQuestion(editorQuestion._id, payload);
    else await store.createQuestion(payload);
    toast.success(editorQuestion ? "Вопрос изменён" : "Вопрос добавлен");
    setEditorOpen(false);
  };

  const uploadFile = async (file) => {
    const result = await store.uploadXlsx(file);
    toast.success(`Загружено вопросов: ${result.count || 0}`);
    setSearchValue("");
    setUploadOpen(false);
  };

  const importJson = async (questions) => {
    const result = await store.importJson(questions);
    toast.success(`Добавлено: ${result.insertedCount || 0}. Повторов: ${result.skippedDuplicates || 0}`);
    setSearchValue("");
    setJsonOpen(false);
  };

  const confirmDelete = async () => {
    try {
      await store.deleteQuestion(deleteTarget._id);
      toast.success("Вопрос удалён");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveCategoryName = async (newCategory) => {
    const result = await store.renameCategory(renameCategoryTarget, newCategory);
    await fetchTestCategories();
    toast.success(`Категория переименована. Обновлено вопросов: ${result.modifiedCount}.`);
    setRenameCategoryTarget(null);
  };

  const saveCategoryParent = async (parentCategory) => {
    await store.updateCategoryParent(parentCategoryTarget.category, parentCategory);
    await fetchTestCategories();
    toast.success(`Категория «${parentCategoryTarget.category}» перемещена в «${parentCategory}».`);
    setParentCategoryTarget(null);
  };

  return (
    <main className="min-h-[100dvh] bg-slate-50 px-4 py-6 text-slate-900 md:px-8 md:py-9">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Общий мониторинг</span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">База вопросов</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Просматривайте все разделы, находите вопросы и управляйте каждым вопросом отдельно.</p>
          </div>
          <div className="grid gap-3 sm:flex">
            <button type="button" onClick={() => setUploadOpen(true)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 active:scale-[0.98]">
              <FileUp size={18} /> Импорт Excel
            </button>
            <button type="button" onClick={() => setJsonOpen(true)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700 active:scale-[0.98]">
              <FileJson size={18} /> Импорт JSON
            </button>
            <button type="button" onClick={openCreate} className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.98]">
              <Plus size={18} /> Новый вопрос
            </button>
          </div>
        </header>

        <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white" aria-label="Статистика по разделам">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-900">Разделы</h2>
              <p className="text-xs text-slate-500">Нажмите на раздел, чтобы отфильтровать список</p>
            </div>
            <strong className="font-mono text-2xl text-blue-700">{grandTotal}</strong>
          </div>
          <div className="flex snap-x gap-2 overflow-x-auto p-3 md:p-4">
            <button type="button" onClick={() => store.filterByCategory("")} className={`min-w-36 snap-start rounded-2xl border px-4 py-3 text-left transition ${store.category === "" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}>
              <span className="block text-xs font-bold opacity-70">Все вопросы</span>
              <strong className="mt-1 block font-mono text-xl">{grandTotal}</strong>
            </button>
            {categories.map((category) => {
              const count = store.categoryStats.find((item) => item.category === category)?.count || 0;
              const trainingCategory = testCategories.find((item) => item.category === category);
              const isSelected = store.category === category;
              return (
                <div key={category} className={`relative min-w-40 snap-start rounded-2xl border transition ${isSelected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50"}`}>
                  <button type="button" onClick={() => store.filterByCategory(category)} className="w-full px-4 py-3 pr-11 text-left">
                    <span className="block truncate text-xs font-bold opacity-75">{category}</span>
                    <strong className="mt-1 block font-mono text-xl">{count}</strong>
                  </button>
                  {count > 0 && category.toLocaleUpperCase("ru-RU") === "РОП" ? (
                    <span
                      title="Системная категория специального теста РОП"
                      aria-label="Системная категория специального теста РОП"
                      className={`absolute right-2 top-2 rounded-lg p-1.5 ${isSelected ? "text-white/80" : "text-slate-400"}`}
                    >
                      <LockKeyhole size={15} />
                    </span>
                  ) : count > 0 && (
                    <button
                      type="button"
                      onClick={() => setRenameCategoryTarget(category)}
                      title={`Переименовать категорию ${category}`}
                      aria-label={`Переименовать категорию ${category}`}
                      className={`absolute right-2 top-2 rounded-lg p-1.5 transition ${isSelected ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-slate-400 hover:bg-blue-100 hover:text-blue-700"}`}
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                  {trainingCategory && (
                    <button
                      type="button"
                      onClick={() => setParentCategoryTarget({ category, parentCategory: trainingCategory.parentCategory || "Другие" })}
                      title={`Изменить направление категории ${category}`}
                      aria-label={`Изменить направление категории ${category}`}
                      className={`absolute right-9 top-2 rounded-lg p-1.5 transition ${isSelected ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-slate-400 hover:bg-blue-100 hover:text-blue-700"}`}
                    >
                      <Layers3 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 grid gap-3 rounded-[24px] border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_240px_200px]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Поиск по вопросу или ответу" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select value={store.category} onChange={(event) => store.filterByCategory(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="">Все разделы</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <select value={store.difficulty} onChange={(event) => store.filterByDifficulty(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
            <option value="">Любая сложность</option>
            <option value="легкий">Лёгкие</option>
            <option value="средний">Средние</option>
            <option value="сложный">Сложные</option>
          </select>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3 px-1">
          <p className="text-sm font-semibold text-slate-500">Найдено: <span className="font-mono text-slate-900">{store.total}</span></p>
          <div className="flex items-center gap-2">
            <button disabled={store.page <= 1 || store.loading} onClick={() => store.setPage(store.page - 1)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 disabled:opacity-30"><ChevronLeft size={19} /></button>
            <span className="min-w-20 text-center font-mono text-sm font-bold">{store.page} / {store.totalPages}</span>
            <button disabled={!store.hasMore || store.loading} onClick={() => store.setPage(store.page + 1)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 disabled:opacity-30"><ChevronRight size={19} /></button>
          </div>
        </div>

        <section className="mt-4" aria-label="Список вопросов">
          {store.loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : store.error ? (
            <div className="p-12 text-center"><AlertTriangle className="mx-auto mb-3 text-red-500" /><strong className="block text-slate-900">Не удалось загрузить вопросы</strong><p className="mt-1 text-sm text-red-600">{store.error}</p></div>
          ) : store.questions.length === 0 ? (
            <div className="p-12 text-center"><Search className="mx-auto mb-3 text-slate-300" size={34} /><strong className="block text-slate-900">Вопросы не найдены</strong><p className="mt-1 text-sm text-slate-500">Измените фильтры или добавьте новый вопрос.</p></div>
          ) : (
            <div className="grid gap-4">
              {store.questions.map((question, index) => (
                <QuestionCard key={question._id} question={question} number={(store.page - 1) * 20 + index + 1} onEdit={openEdit} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </section>
      </div>

      {editorOpen && <QuestionModal initialQuestion={editorQuestion} categories={categories} saving={store.saving} onClose={() => setEditorOpen(false)} onSave={saveQuestion} />}
      {renameCategoryTarget && <RenameCategoryModal category={renameCategoryTarget} saving={store.saving} onClose={() => setRenameCategoryTarget(null)} onSave={saveCategoryName} />}
      {parentCategoryTarget && <CategoryParentModal category={parentCategoryTarget.category} parentCategory={parentCategoryTarget.parentCategory} saving={store.saving} onClose={() => setParentCategoryTarget(null)} onSave={saveCategoryParent} />}
      {uploadOpen && <UploadModal uploading={store.uploading} onClose={() => setUploadOpen(false)} onUpload={uploadFile} />}
      {jsonOpen && <JsonImportModal uploading={store.uploading} onClose={() => setJsonOpen(false)} onImport={importJson} />}
      {deleteTarget && <DeleteModal question={deleteTarget} saving={store.saving} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
    </main>
  );
};
