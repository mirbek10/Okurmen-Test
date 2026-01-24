import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, 
  Database, 
  Code2, 
  Layers, 
  Braces, 
  Terminal, 
  Flame, 
  Box, 
  Server, 
  Zap, 
  Settings2, 
  Users, 
  Timer, 
  User,
  ArrowRight
} from "lucide-react";
import { useAdminPreviewStore } from "@/app/stores/admin/adminPreview";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";

export function Dashboard() {
  const { res, loading: previewLoading, start, clearRes } = useAdminPreviewStore();
  const { questions, total, fetchQuestions, loading: questionsLoading } = useQuestionStore();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [maxStudents, setMaxStudents] = useState(30);
  const [duration, setDuration] = useState(60);
  const [group, setGroup] = useState("");
  const [teacher, setTeacher] = useState("");
  const [error, setError] = useState("");
  const [tests, setTests] = useState([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const navigate = useNavigate();
  const redirectRef = useRef(false);

  useEffect(() => {
    fetchQuestions();
    return () => { if (redirectRef.current) clearRes(); };
  }, [fetchQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      createTestsFromQuestions();
    }
  }, [questions]);

  const createTestsFromQuestions = useCallback(() => {
    if (questions.length === 0) return;

    const categoryCounts = {
      html: 0, javascript: 0, react: 0, typescript: 0, django: 0, "основа": 0, "продвинутый": 0,
    };

    questions.forEach((q) => {
      const cat = q.category?.toLowerCase().trim();
      if (categoryCounts.hasOwnProperty(cat)) {
        categoryCounts[cat]++;
      }
    });

    const availableTests = [
      { id: "html", name: "HTML / CSS", questionsCount: categoryCounts.html, category: "html", icon: Layout, description: "Верстка и стилизация" },
      { id: "javascript", name: "JavaScript", questionsCount: categoryCounts.javascript, category: "javascript", icon: Braces, description: "Стандарты ES6+ и DOM" },
      { id: "react", name: "React JS", questionsCount: categoryCounts.react, category: "react", icon: Box, description: "Hooks, Props и State" },
      { id: "typescript", name: "TypeScript", questionsCount: categoryCounts.typescript, category: "typescript", icon: Code2, description: "Статическая типизация" },
      { id: "django", name: "Django", questionsCount: 5, category: "Django", icon: Terminal, description: "Python Web Framework" },
      { id: "python_base", name: "Python Base", questionsCount: 5, category: "Основа", icon: Layers, description: "Основы синтаксиса" },
      { id: "python_adv", name: "Python Pro", questionsCount: 5, category: "Продвинутый", icon: Flame, description: "ООП и метаклассы" },
    ];

    const frontCategories = ["html", "javascript", "react", "typescript"];
    const totalFront = frontCategories.reduce((acc, cat) => acc + categoryCounts[cat], 0);

    if (totalFront >= 10) {
      availableTests.push({
        id: "mixed_frontend",
        name: "Mixed Frontend",
        description: "Комплексный Frontend тест",
        questionsCount: Math.min(totalFront, 30),
        category: "frontend",
        icon: Zap,
      });
    }

    const backCategories = ["django", "основа", "продвинутый"];
    const totalBack = backCategories.reduce((acc, cat) => acc + categoryCounts[cat], 0);

    if (totalBack >= 5) {
      availableTests.push({
        id: "mixed_backend",
        name: "Mixed Backend",
        description: "Комплексный Backend тест",
        questionsCount: Math.min(totalBack, 25),
        category: "backend",
        icon: Server,
      });
    }

    setTests(availableTests.filter((test) => test.questionsCount > 0));
  }, [questions]);

  useEffect(() => {
    if (res?.id && isCreatingTest && !redirectRef.current) {
      redirectRef.current = true;
      setTimeout(() => {
        navigate(`/admin/test-monitor/${res.id}`);
        setIsCreatingTest(false);
        setShowSettingsModal(false);
        setSelectedTest(null);
        setGroup("");
        setTeacher("");
        setError("");
        clearRes();
      }, 100);
    }
  }, [res, isCreatingTest, navigate, clearRes]);

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setShowSettingsModal(true);
    setError("");
  };

  const handleStartTest = async () => {
    if (!selectedTest) return;
    if (!group.trim() || !teacher.trim()) {
      setError("Заполните обязательные поля");
      return;
    }
    redirectRef.current = false;
    setIsCreatingTest(true);
    try {
      await start({
        category: selectedTest.category,
        group: group.trim(),
        teacher: teacher.trim(),
        maxStudents: parseInt(maxStudents),
        testDuration: parseInt(duration),
        testName: selectedTest.name,
        totalQuestions: selectedTest.questionsCount,
      });
    } catch (err) {
      setError("Ошибка запуска сессии");
      setIsCreatingTest(false);
    }
  };

  const getThemeColor = (cat) => {
    const colors = {
      html: 'text-orange-500 bg-orange-50',
      javascript: 'text-yellow-600 bg-yellow-50',
      react: 'text-blue-500 bg-blue-50',
      typescript: 'text-indigo-600 bg-indigo-50',
      Django: 'text-emerald-700 bg-emerald-50',
      'Основа': 'text-green-600 bg-green-50',
      frontend: 'text-purple-600 bg-purple-50',
      backend: 'text-slate-700 bg-slate-100',
    };
    return colors[cat] || 'text-slate-500 bg-slate-50';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-indigo-600" />
              Панель управления
            </h1>
            <p className="text-slate-500 text-sm mt-1">Запуск и конфигурация экзаменационных сессий</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 px-4 border-r border-slate-100">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Вопросов в базе</p>
                <p className="text-lg font-bold leading-none">{questionsLoading ? "..." : total}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/admin/questions")}
              className="px-4 py-2 text-xs font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Редактировать базу
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div 
              key={test.id} 
              onClick={() => handleSelectTest(test)}
              className="group bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${getThemeColor(test.category)} transition-transform group-hover:scale-110`}>
                  <test.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{test.category}</span>
              </div>
              
              <h3 className="text-lg font-bold mb-2">{test.name}</h3>
              <p className="text-slate-400 text-sm mb-6 h-10 line-clamp-2 leading-relaxed">
                {test.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-bold">{test.questionsCount}</span>
                </div>
                <div className="flex items-center gap-1 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Выбрать <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setShowSettingsModal(false)} />
            
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl ${getThemeColor(selectedTest?.category)}`}>
                  {selectedTest && <selectedTest.icon className="w-8 h-8" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedTest?.name}</h2>
                  <p className="text-slate-400 text-sm">Настройка параметров сессии</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Users className="w-3 h-3" /> ГРУППА
                    </label>
                    <input 
                      value={group} 
                      onChange={e => setGroup(e.target.value)} 
                      className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-indigo-500/20 font-bold border border-transparent focus:border-indigo-500 transition-all" 
                      placeholder="Напр. P-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <User className="w-3 h-3" /> ПРЕПОДАВАТЕЛЬ
                    </label>
                    <input 
                      value={teacher} 
                      onChange={e => setTeacher(e.target.value)} 
                      className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 ring-indigo-500/20 font-bold border border-transparent focus:border-indigo-500 transition-all" 
                      placeholder="ID" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Users className="w-3 h-3" /> МЕСТА
                    </label>
                    <input 
                      type="number" 
                      value={maxStudents} 
                      onChange={e => setMaxStudents(e.target.value)} 
                      className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 outline-none font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <Timer className="w-3 h-3" /> МИНУТЫ
                    </label>
                    <input 
                      type="number" 
                      value={duration} 
                      onChange={e => setDuration(e.target.value)} 
                      className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 outline-none font-bold" 
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 text-xs font-bold text-rose-500 text-center bg-rose-50 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={handleStartTest} 
                  disabled={previewLoading}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {previewLoading ? "Запуск..." : <>Начать тестирование <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button 
                  onClick={() => setShowSettingsModal(false)} 
                  className="flex-1 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;