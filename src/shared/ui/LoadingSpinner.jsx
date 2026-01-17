import React from 'react';

function LoadingSpinner() {
  return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        {/* Стеклянный контейнер для лоадера */}
        <div className="relative p-10 rounded-[3rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center">
          {/* Анимированный градиентный круг */}
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-violet-600 animate-spin"></div>

            {/* Внутренний мягкий блик */}
            <div className="absolute inset-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-full blur-sm opacity-50"></div>
          </div>

          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent animate-pulse">
            Загрузка профиля...
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Синхронизируем данные
          </p>

          {/* Декоративный элемент Soft UI */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>
        </div>
      </div>
  );
}

export default LoadingSpinner;
