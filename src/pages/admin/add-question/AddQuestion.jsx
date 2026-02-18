import React, { useState, useEffect } from 'react';
import { Save, Copy, Check, AlertCircle, Database, Trash2, Eye, FileCode, Tag, Loader2, XCircle } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { useTestCategoryStore } from '@/app/stores/all/getTestCategory';

export function AddQuestion() {
    const { testCategories, fetchTestCategories, loading } = useTestCategoryStore();
    const ALLOWED_CATEGORIES = testCategories.map(tc => tc.category.toLowerCase());
    
    const [jsonInput, setJsonInput] = useState(`[
  {
    "question": "Что такое HTML?",
    "options": ["Текст", "Язык разметки", "Программа", "Стиль"],
    "answer": "Язык разметки",
    "category": "html",
    "difficulty": "средний"
  }
]`);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("");

    const handleProcess = (code) => {
        setJsonInput(code);
        try {
            let parsed = JSON.parse(code);
            if (!Array.isArray(parsed)) parsed = [parsed];

            if (loading) return;

            // Валидация: ищем все ошибки
            const invalidEntries = parsed
                .map((q, idx) => ({ 
                    index: idx + 1, 
                    cat: q.category?.toLowerCase(),
                    originalCat: q.category 
                }))
                .filter(item => !ALLOWED_CATEGORIES.includes(item.cat));

            if (invalidEntries.length > 0) {
                const details = invalidEntries
                    .map(e => `вопрос №${e.index} (значение: "${e.originalCat || ''}")`)
                    .join('; ');
                setError(`Ошибка в категориях: ${details}`);
                setQuestions([]); 
                return;
            }

            setQuestions(parsed);
            setError(null);
        } catch (e) {
            setError("Ошибка синтаксиса JSON. Проверьте структуру данных.");
        }
    };

    useEffect(() => {
        fetchTestCategories();
    }, []);

    useEffect(() => {
        if (!loading && testCategories.length > 0) {
            handleProcess(jsonInput);
        }
    }, [testCategories, loading]);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Database className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-800">Admin Editor</h1>
                            <p className="text-slate-500 text-sm">
                                {loading ? 'Синхронизация с БД...' : `Категорий в базе: ${testCategories.length}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
                                setStatus("Скопировано!");
                                setTimeout(() => setStatus(""), 2000);
                            }}
                            disabled={!!error || loading}
                            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border ${
                                error || loading ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                            }`}
                        >
                            {status ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                            {status || "Копировать"}
                        </button>
                        <button
                            disabled={!!error || loading}
                            className={`px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
                                error || loading ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                            }`}
                        >
                            Сохранить всё
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10">

                    {/* JSON EDITOR SECTION */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4 px-2">
                            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider mr-2">
                                <Tag size={12} /> Допустимые категории:
                            </div>
                            {loading ? (
                                <Loader2 size={14} className="animate-spin text-indigo-500" />
                            ) : (
                                testCategories.map(tc => (
                                    <span key={tc.id} className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 rounded-full text-[10px] font-bold shadow-sm hover:border-indigo-200 transition-colors cursor-default">
                                        {tc.category}
                                    </span>
                                ))
                            )}
                        </div>

                        <div className={`rounded-[2.5rem] bg-white border-2 transition-all overflow-hidden shadow-xl ${error ? 'border-red-200 shadow-red-50' : 'border-slate-200 shadow-slate-200/50'}`}>
                            <div className={`${error ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-100'} px-8 py-4 border-b flex justify-between items-center`}>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    <FileCode size={14} /> JSON Source
                                </div>
                                {error && <span className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                    <XCircle size={12}/> Обнаружена ошибка
                                </span>}
                            </div>

                            <div className="p-4 bg-white min-h-[300px]">
                                <Editor
                                    value={jsonInput}
                                    onValueChange={handleProcess}
                                    highlight={code => highlight(code, languages.json)}
                                    padding={20}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 14,
                                    }}
                                    className="outline-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-600 p-4 flex items-start gap-3 text-white text-xs font-medium leading-relaxed">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PREVIEW SECTION */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Eye size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Визуальный контроль</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {questions.map((q, idx) => (
                                <div key={idx} className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all relative">
                                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-4 border-[#f8fafc]">
                                        {idx + 1}
                                    </div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                                            {q.category}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const newQs = questions.filter((_, i) => i !== idx);
                                                setQuestions(newQs);
                                                setJsonInput(JSON.stringify(newQs, null, 2));
                                            }}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="text-slate-800 font-bold text-lg mb-6 leading-relaxed line-clamp-3">
                                        {q.question}
                                    </div>

                                    <div className="space-y-3">
                                        {q.options?.slice(0, 4).map((opt, i) => (
                                            <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl text-[13px] border transition-all ${opt === q.answer
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                                                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${opt === q.answer ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                <span className="truncate">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(questions.length === 0 && !error) && (
                            <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    {loading ? "Данные загружаются..." : "Пусто или невалидный JSON"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .token.property { color: #4f46e5 !important; font-weight: 600; }
                .token.string { color: #0891b2 !important; }
                .token.punctuation { color: #94a3b8 !important; }
                .token.operator { color: #94a3b8 !important; }
                `
            }} />
        </div>
    );
};