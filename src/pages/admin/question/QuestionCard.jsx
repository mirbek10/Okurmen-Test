import { Check, Pencil, Trash2 } from "lucide-react";

export function QuestionCard({ question, number, onEdit, onDelete }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="mr-1 font-mono text-slate-400">#{number}</span>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-800">{question.category}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{question.difficulty || "средний"}</span>
      </div>

      <h3 className="mt-4 max-w-5xl text-lg font-extrabold leading-snug text-slate-950 md:text-xl">{question.question}</h3>

      <div className="mt-5 grid gap-2.5 md:grid-cols-2">
        {(question.options || []).map((option, index) => {
          const correct = option === question.answer;
          return (
            <div key={`${question._id || number}-${index}`} className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50/70 text-slate-700"}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${correct ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>{String.fromCharCode(65 + index)}</span>
              <span className={`min-w-0 flex-1 break-words ${correct ? "font-bold" : "font-medium"}`}>{option}</span>
              {correct && <Check size={18} className="shrink-0 text-emerald-700" aria-label="Правильный ответ" />}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">Правильный ответ выделен зелёным</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEdit(question)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700" aria-label={`Изменить вопрос ${number}`}><Pencil size={16} /> Изменить</button>
          <button type="button" onClick={() => onDelete(question)} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100" aria-label={`Удалить вопрос ${number}`}><Trash2 size={16} /> Удалить</button>
        </div>
      </div>
    </article>
  );
}
