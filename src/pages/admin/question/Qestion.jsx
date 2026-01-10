"use client";
import React, { useState, useEffect } from "react";
import {
  FileUp,
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import { toast } from "react-toastify";

export const QuestionsPage = () => {
  const { 
    questions, 
    loading, 
    uploading, 
    fetchQuestions, 
    uploadXlsx,
    total,
    limit,
    offset,
    hasMore,
    searchQuestions,
    filterByCategory,
    sortQuestions,
    nextPage,
    prevPage,
    clearError
  } = useQuestionStore();
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  
  useEffect(() => {
    fetchQuestions();
    return () => clearError();
  }, [fetchQuestions, clearError]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const success = await uploadXlsx(file);
    if (success) {
      toast.success("Вопросы успешно загружены!");
      setFile(null);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    searchQuestions(value);
  };

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    filterByCategory(category);
  };

  const handleSortChange = (field) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
    sortQuestions(field, newOrder);
  };

  const handlePageChange = (direction) => {
    if (direction === "next") {
      nextPage();
    } else {
      prevPage();
    }
  };

  const categories = [
    { id: "", name: "Все категории" },
    { id: "html", name: "HTML/CSS" },
    { id: "javascript", name: "JavaScript" },
    { id: "react", name: "React/Redux" },
    { id: "typescript", name: "TypeScript" }
  ];

  const sortOptions = [
    { id: "id", name: "По ID" },
    { id: "question", name: "По вопросу" },
    { id: "created", name: "По дате" }
  ];

  

  // Функция для получения названия категории
  const getCategoryName = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Database className="text-indigo-600" /> База вопросов
          </h1>
          <p className="text-slate-500 mt-2">
            Загружайте новые тесты через XLSX или просматривайте существующие
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка: Загрузка */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileUp size={20} className="text-indigo-500" /> Загрузить XLSX
              </h2>

              <label
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-400"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <FileText
                  className={`w-12 h-12 mb-3 ${
                    file ? "text-indigo-600" : "text-slate-300"
                  }`}
                />
                <p className="text-sm font-medium text-slate-600 text-center">
                  {file ? file.name : "Нажмите или перетащите файл"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">
                  Форматы: .xlsx, .xls
                </p>
              </label>

              <button
                disabled={!file || uploading}
                onClick={handleUpload}
                className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-400 hover:bg-indigo-700 transition-all"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {uploading ? "Загрузка..." : "Отправить на сервер"}
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <div className="flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <strong>Новый формат файла:</strong>
                  <br />
                  <ul className="mt-1 space-y-1 list-disc pl-4">
                    <li>Строки — разные вопросы</li>
                    <li>Колонки A-D: HTML/CSS, JavaScript, React/Redux, TypeScript</li>
                    <li>В ячейках — вопрос с вариантами ответов</li>
                    <li>Правильный ответ помечается ✔ или (+)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Статистика */}
            {questions.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  Статистика
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Всего вопросов:</span>
                    <span className="font-bold">{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">На странице:</span>
                    <span className="font-bold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Страница:</span>
                    <span className="font-bold">{Math.floor(offset / limit) + 1}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка: Список вопросов */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
              {/* Панель управления */}
              <div className="p-6 border-b border-slate-100 space-y-4">
                {/* Поиск */}
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Поиск по вопросам..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 border-none"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {/* Фильтры и сортировка */}
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-all"
                  >
                    <Filter size={16} />
                    Фильтры
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div className="flex gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSortChange(option.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          sortField === option.id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {option.name}
                        {sortField === option.id && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Выпадающие фильтры */}
                {showFilters && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            categoryFilter === cat.id
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Пагинация */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-slate-500">
                    Показано {questions.length} из {total}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange("prev")}
                      disabled={offset === 0}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
                      {Math.floor(offset / limit) + 1}
                    </div>
                    <button
                      onClick={() => handlePageChange("next")}
                      disabled={!hasMore}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Список вопросов */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Загрузка базы вопросов...</p>
                  </div>
                ) : questions.length > 0 ? (
                  questions.reverse().map((q, index) => (
                    <div
                      key={q.id || index}
                      className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                              Вопрос #{q.id}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              q.category === 'html' ? 'bg-blue-100 text-blue-800' :
                              q.category === 'javascript' ? 'bg-yellow-100 text-yellow-800' :
                              q.category === 'react' ? 'bg-cyan-100 text-cyan-800' :
                              q.category === 'typescript' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getCategoryName(q.category)}
                            </span>
                          </div>
                          
                          <h3 className="text-slate-800 font-semibold mt-1 leading-snug">
                            {q.question}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {q.options?.map((opt, i) => (
                              <span
                                key={i}
                                className={`text-xs px-3 py-1 rounded-lg border ${
                                  opt === q.answer
                                    ? "bg-green-100 border-green-200 text-green-700 font-bold"
                                    : "bg-white border-slate-200 text-slate-500"
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400 font-medium">
                    {searchTerm || categoryFilter 
                      ? "По вашему запросу ничего не найдено"
                      : "Вопросы не найдены"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};