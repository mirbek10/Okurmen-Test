import React, { useState, useEffect } from 'react';
import { Save, Copy, Check, AlertCircle, Database, Trash2, Eye, FileCode } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css'; 

export function AddQuestion() {
  const [jsonInput, setJsonInput] = useState(`[
  {
    "question": "<strong>HTML</strong> деген эмне?",
    "options": ["Текст", "Маркировкалоо тили", "Программалоо тили"],
    "answer": "Маркировкалоо тили",
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
      setQuestions(parsed);
      setError(null);
    } catch (e) {
      setError("Ошибка синтаксиса JSON");
    }
  };

  useEffect(() => {
    handleProcess(jsonInput);
  }, []);

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
              <p className="text-slate-500 text-sm">Теги отображаются как текст (без рендеринга)</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
                setStatus("Скопировано!");
                setTimeout(() => setStatus(""), 2000);
              }}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-200"
            >
              {status ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              {status || "Копировать"}
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all">
              Сохранить данные
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          
          {/* JSON EDITOR */}
          <div className="rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                <FileCode size={14} /> Source Code
              </div>
            </div>
            
            <div className="p-4 bg-white min-h-[250px]">
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
              <div className="bg-red-50 p-4 border-t border-red-100 flex items-center gap-2 text-red-600 text-xs font-bold">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          {/* PREVIEW SECTION */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Eye size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Карточки вопросов</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {questions.map((q, idx) => (
                <div key={idx} className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                      {q.category || 'general'}
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

                  {/* ТЕГИ ВЫВОДЯТСЯ КАК ТЕКСТ (Обычный div вместо dangerouslySetInnerHTML) */}
                  <div className="text-slate-800 font-bold text-lg mb-6 leading-relaxed">
                    {q.question}
                  </div>

                  <div className="space-y-3">
                    {q.options?.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl text-[13px] border transition-all ${
                        opt === q.answer 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 text-slate-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${opt === q.answer ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Нет данных для отображения</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .token.property { color: #4f46e5 !important; font-weight: 600; }
        .token.string { color: #0891b2 !important; }
        .token.punctuation { color: #94a3b8 !important; }
        .token.operator { color: #94a3b8 !important; }
      `}} />
    </div>
  );
}