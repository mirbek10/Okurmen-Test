import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Server, 
  GraduationCap, 
  Zap 
} from 'lucide-react';

export function PracticeSelection() {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'real',
      title: 'Официальный экзамен',
      subtitle: 'Зачетный режим',
      description: 'Финальное тестирование. Результаты будут записаны в вашу постоянную статистику и видны преподавателю.',
      icon: <GraduationCap className="w-8 h-8 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'hover:border-amber-400 border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600',
      path: '/', // Отправляет на главную
      stats: 'Влияет на рейтинг',
      isHot: true
    },
    {
      id: 'front',
      title: 'Frontend Developer',
      subtitle: 'Тренировка',
      description: 'HTML5, CSS3, JavaScript (ES6+), React, Redux и TypeScript.',
      icon: <Layout className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'hover:border-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      path: '/practice-test/front',
      stats: '20 вопросов • 20 мин'
    },
    {
      id: 'back',
      title: 'Backend Developer',
      subtitle: 'Тренировка',
      description: 'Node.js, Express, Базы данных (SQL/NoSQL), API и архитектура.',
      icon: <Server className="w-8 h-8 text-emerald-500" />,
      bg: 'bg-emerald-50',
      border: 'hover:border-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      path: '/practice-test/back',
      stats: '20 вопросов • 20 мин'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
          Выберите режим тестирования
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Готовы проверить свои знания? Выберите тренировку для самопроверки 
          или пройдите официальный тест для повышения рейтинга.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => navigate(mode.path)}
            className={`group relative bg-white border-2 border-slate-100 ${mode.border} rounded-[2.5rem] p-8 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col h-full`}
          >
            {/* Иконка и бейдж */}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 ${mode.bg} rounded-2xl`}>
                {mode.icon}
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                mode.id === 'real' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {mode.id === 'real' ? 'Live Exam' : 'Practice'}
              </span>
            </div>

            {/* Контент */}
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-slate-800 mb-1">
                {mode.title}
              </h3>
              <p className={`${mode.id === 'real' ? 'text-amber-600' : 'text-indigo-600'} font-medium text-sm mb-4`}>
                {mode.subtitle}
              </p>
              <p className="text-slate-500 leading-relaxed mb-6">
                {mode.description}
              </p>
            </div>

            {/* Футер карточки */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                {mode.id === 'real' ? <Zap className="w-4 h-4 text-amber-500" /> : <Sparkles className="w-4 h-4" />}
                {mode.stats}
              </div>
              <div className={`${mode.button} text-white p-3 rounded-xl transition-transform group-hover:scale-110 active:scale-95 shadow-lg`}>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Декоративный эффект для важной карточки */}
            {mode.id === 'real' && (
              <div className="absolute inset-0 border-2 border-amber-400/20 rounded-[2.5rem] pointer-events-none animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Инфо-блок внизу */}
      <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
            ?
          </div>
          <p className="text-sm text-slate-600 font-medium">
            Не уверены в силах? Пройдите <span className="text-indigo-600 font-bold">Frontend тренировку</span>, чтобы разогреться.
          </p>
        </div>
        <button 
          onClick={() => navigate('/user/history')}
          className="text-indigo-600 text-sm font-bold hover:underline bg-indigo-50 px-6 py-3 rounded-xl transition-colors hover:bg-indigo-100"
        >
          История моих результатов →
        </button>
      </div>
    </div>
  );
}