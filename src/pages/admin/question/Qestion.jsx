"use client";
import React, { useState, useEffect } from "react";
import { 
  FileUp, Database, FileText, CheckCircle2, Loader2, 
  Search, ChevronLeft, ChevronRight, Layers, LayoutGrid, Sparkles
} from "lucide-react";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import { toast } from "react-toastify";

export const QuestionsPage = () => {
  const { 
    questions, loading, uploading, fetchQuestions, uploadXlsx,
    total, totalPages, page, hasMore,
    searchQuestions, filterByCategory, setPage 
  } = useQuestionStore();

  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const success = await uploadXlsx(file);
    if (success) {
      toast.success("База знаний обновлена!");
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Декоративный фон */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] rounded-full bg-violet-200/40 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 bg-indigo-600 rounded-lg text-white">
                <Database size={20} />
              </span>
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Управление <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Вопросами</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white shadow-sm">
             <div className="px-4 py-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Всего записей</p>
                <p className="text-xl font-black text-slate-800">{total.toLocaleString()}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Левая колонка - Инструменты */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileUp className="text-indigo-600" size={20}/> Загрузить данные
              </h3>
              
              <div className="group relative">
                <input 
                  type="file" 
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all
                    ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <FileText className="w-10 h-10 mb-3 text-indigo-600 animate-bounce" />
                    ) : (
                      <Layers className="w-10 h-10 mb-3 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    )}
                    <p className="text-sm font-medium text-slate-600 px-4 text-center">
                      {file ? file.name : "Перетащите Excel или кликните"}
                    </p>
                  </div>
                </label>
              </div>

              <button
                disabled={!file || uploading}
                onClick={handleUpload}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] disabled:opacity-40 disabled:scale-100 transition-all flex justify-center items-center gap-2"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {uploading ? "Импорт..." : "Обновить базу данных"}
              </button>
            </section>
          </div>

          {/* Правая колонка - Контент */}
          <div className="lg:col-span-8 space-y-6">
            {/* Toolbar */}
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] border border-white shadow-lg shadow-slate-200/50 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  className="w-full pl-14 pr-6 py-4 bg-slate-100/50 border border-transparent focus:border-indigo-300 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-slate-400"
                  placeholder="Найти вопрос..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      searchQuestions(e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-4 px-2">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['', 'html', 'javascript', 'react', 'python'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategoryFilter(cat); filterByCategory(cat); }}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                        ${categoryFilter === cat 
                          ? 'bg-slate-900 text-white shadow-lg' 
                          : 'bg-white text-slate-500 hover:bg-indigo-50 border border-slate-100'}`}
                    >
                      {cat || 'Все'}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(page - 1)} 
                    className="p-2 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20}/>
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-600">{page} / {totalPages}</span>
                  <button 
                    disabled={!hasMore} 
                    onClick={() => setPage(page + 1)} 
                    className="p-2 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                  >
                    <ChevronRight size={20}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Список вопросов */}
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                   <div className="relative">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <LayoutGrid className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
                   </div>
                   <p className="font-bold text-slate-400 animate-pulse">Загрузка базы...</p>
                </div>
              ) : questions.length > 0 ? (
                questions.map((q, idx) => (
                  <div key={q._id} className="group bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                        #{q._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                        {q.category}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-800 mb-6 leading-snug">
                      {q.question}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.answer;
                        const label = String.fromCharCode(65 + i); // A, B, C, D
                        
                        return (
                          <div 
                            key={i} 
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all
                              ${isCorrect 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-1 ring-emerald-200' 
                                : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                          >
                            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
                              ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                              {label}
                            </span>
                            <span className="text-sm font-medium">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[2rem] py-20 text-center">
                   <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                      <Search size={32} />
                   </div>
                   <p className="text-slate-500 font-bold text-lg">Вопросы не найдены</p>
                   <p className="text-slate-400 text-sm">Попробуйте изменить параметры поиска</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};