import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Code, Copy, Check } from 'lucide-react';

export function AddQuestion() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    question: "<strong> теги эмне кылат? Что делает тег <strong>?",
    options: [
      "Курсив кылат / Делает курсив",
      "Астын сызат / Подчёркивает",
      "Текстти маанилүү кылат (жирный) / Делает текст важным (жирным)",
      "Тексттин түсүн өзгөртөт / Меняет цвет"
    ],
    answer: "Текстти маанилүү кылат (жирный) / Делает текст важным (жирным)",
    category: "html",
    difficulty: "средний"
  });

  const [jsonOutput, setJsonOutput] = useState({});

  // Генерация JSON в формате MongoDB
  useEffect(() => {
    const newJson = {
      "_id": {
        "$oid": Math.random().toString(16).substring(2, 26).padStart(24, '0') // Имитация ObjectId
      },
      "question": formData.question,
      "options": formData.options,
      "answer": formData.answer,
      "category": formData.category,
      "difficulty": formData.difficulty,
      "createdAt": {
        "$date": new Date().toISOString()
      }
    };
    setJsonOutput(newJson);
  }, [formData]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ЛЕВАЯ ЧАСТЬ: ФОРМА */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <Plus size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Добавить вопрос</h2>
          </div>

          <div className="space-y-6">
            {/* Вопрос */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Текст вопроса (можно с HTML)</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                placeholder="Например: <strong> теги эмне кылат? ..."
              />
            </div>

            {/* Категория и Сложность */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Категория</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Сложность</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none"
                >
                  <option value="легкий">Легкий</option>
                  <option value="средний">Средний</option>
                  <option value="сложный">Сложный</option>
                </select>
              </div>
            </div>

            {/* Варианты ответов */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">Варианты ответов</label>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all"
                    placeholder={`Вариант ${idx + 1}`}
                  />
                  <button 
                    onClick={() => setFormData({ ...formData, answer: opt })}
                    className={`px-4 rounded-xl border transition-all ${formData.answer === opt ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    title="Выбрать как правильный ответ"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200">
              <Save size={20} />
              Сохранить в базу
            </button>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: JSON ПРОСМОТР */}
        <div className="sticky top-8">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl h-fit border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Code size={20} />
                <span className="font-mono text-sm font-bold uppercase tracking-widest">JSON Output</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all border border-slate-700"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            
            <div className="overflow-hidden rounded-xl bg-slate-950 p-4">
              <pre className="text-blue-300 font-mono text-sm overflow-x-auto leading-relaxed">
                {JSON.stringify(jsonOutput, null, 2)}
              </pre>
            </div>

            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <p className="text-indigo-300 text-xs leading-relaxed">
                Этот объект полностью готов для импорта в <strong>MongoDB</strong>. 
                Поля <code>$oid</code> и <code>$date</code> сгенерированы автоматически.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}