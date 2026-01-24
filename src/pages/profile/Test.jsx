import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  ArrowRight, 
  Sparkles, 
  Server, 
  GraduationCap, 
  Zap,
  ChevronLeft,
  BookOpen,
  Code2,       // Для HTML/CSS
  Braces,      // Для JavaScript
  Atom,        // Для React
  FileJson,    // Для TypeScript
  Terminal     // Для Python
} from 'lucide-react';

export function PracticeSelection() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState(null);

  // Обновленные данные тестов с иконками Lucide
const availableTests = {
    front: [
      { 
        id: "html", 
        name: "HTML/CSS", 
        icon: <Code2 className="text-blue-500" />, 
        description: "Основы верстки и стилей", 
        category: "html" 
      },
      { 
        id: "javascript", 
        name: "JavaScript", 
        icon: <Braces className="text-yellow-500" />, 
        description: "Core JS & ES6+", 
        category: "javascript" 
      },
      { 
        id: "react", 
        name: "React/Redux", 
        icon: <Atom className="text-cyan-500" />, 
        description: "Modern UI Development", 
        category: "react" 
      },
      { 
        id: "typescript", 
        name: "TypeScript", 
        icon: <FileJson className="text-blue-600" />, 
        description: "Static Typing & Logic", 
        category: "typescript" 
      },
    ],
    back: [
      { 
        id: "django", 
        name: "Django", 
        icon: <Terminal className="text-emerald-500" />, 
        description: "Python Web Framework & ORM", 
        category: "Django" 
      },
      { 
        id: "основа", 
        name: "Основы Python", 
        icon: <Zap className="text-yellow-600" />, 
        description: "Синтаксис, типы данных и циклы", 
        category: "Основа"
      },
      { 
        id: "Продвинутый", 
        name: "Продвинутый Python", 
        icon: <Sparkles className="text-purple-500" />, 
        description: "ООП, декораторы и генераторы", 
        category: "Продвинутый"
      }
    ]
  };
  const modes = [
    {
      id: 'real',
      title: 'Официальный экзамен',
      subtitle: 'Зачетный режим',
      description: 'Финальное тестирование. Результаты будут записаны в вашу постоянную статистику.',
      icon: <GraduationCap className="w-8 h-8 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'hover:border-amber-400 border-amber-100',
      button: 'bg-amber-500',
      action: () => navigate('/'),
      stats: 'Влияет на рейтинг',
    },
    {
      id: 'front',
      title: 'Frontend Developer',
      subtitle: 'Тренировка',
      description: 'HTML5, CSS3, JavaScript, React и TypeScript.',
      icon: <Layout className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'hover:border-blue-400',
      button: 'bg-blue-600',
      action: () => setActiveMode('front'),
      stats: `${availableTests.front.length} темы доступно`
    },
    {
      id: 'back',
      title: 'Backend Developer',
      subtitle: 'Тренировка',
      description: 'Node.js, Python, Базы данных и архитектура.',
      icon: <Server className="w-8 h-8 text-emerald-500" />,
      bg: 'bg-emerald-50',
      border: 'hover:border-emerald-400',
      button: 'bg-emerald-600',
      action: () => setActiveMode('back'),
      stats: `${availableTests.back.length} темы доступно`
    }
  ];

  if (activeMode) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setActiveMode(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all mb-8 font-bold group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Назад к выбору направлений
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen size={24} />
            </span>
            <h2 className="text-3xl font-black text-slate-800">
                Модули {activeMode === 'front' ? 'Frontend' : 'Backend'}
            </h2>
          </div>
          <p className="text-slate-500">Выберите конкретную технологию для начала практики</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTests[activeMode].map((test) => (
            <div
              key={test.id}
              onClick={() => navigate(`/practice-test/${test.id}`)}
              className="group bg-white border border-slate-100 p-6 rounded-3xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 shadow-sm">
                  {/* Рендерим иконку Lucide */}
                  {React.cloneElement(test.icon, { size: 28 })}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {test.name}
                  </h4>
                  <p className="text-slate-500 text-sm font-medium">{test.description}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
          Выберите режим тестирования
        </h2>
        <p className="text-slate-500 text-base max-w-2xl mx-auto">
          Готовы проверить свои знания? Выберите тренировку для самопроверки 
          или пройдите официальный тест для повышения рейтинга.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={mode.action}
            className={`group relative bg-white border-2 border-slate-100 ${mode.border} rounded-3xl p-6 md:p-8 transition-all duration-300 cursor-pointer hover:shadow-2xl flex flex-col h-full`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 md:p-4 ${mode.bg} rounded-2xl`}>
                {mode.icon}
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                mode.id === 'real' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {mode.id === 'real' ? 'Live Exam' : 'Practice'}
              </span>
            </div>

            <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">{mode.title}</h3>
              <p className={`${mode.id === 'real' ? 'text-amber-600' : 'text-indigo-600'} font-medium text-sm mb-4`}>
                {mode.subtitle}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{mode.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                {mode.id === 'real' ? <Zap className="w-4 h-4 text-amber-500" /> : <Sparkles className="w-4 h-4" />}
                {mode.stats}
              </div>
              <div className={`${mode.button} text-white p-2.5 rounded-xl transition-all group-hover:scale-110 shadow-lg`}>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}