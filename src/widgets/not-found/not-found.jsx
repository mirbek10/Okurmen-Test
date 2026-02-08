import React from "react";
import { Link } from "react-router-dom";

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes spinSlow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
  }
  
  .animate-fade-in-delay {
    animation: fadeIn 0.8s ease-out 0.3s forwards;
    opacity: 0;
  }
  
  .animate-spin-slow {
    animation: spinSlow 20s linear infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

export function NotFound() {
  return (
    <>
      <style>{styles}</style>
      
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#235ee7] via-[#3b7efc] to-[#1b4dcc] text-white">
        
        <div 
          className="absolute -top-32 -left-32 w-72 h-72 bg-[#235ee7]/40 rounded-full blur-3xl"
          style={{
            animation: "pulse 3s ease-in-out infinite"
          }}
        />
        
        <div 
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-blue-500/30 rounded-full blur-2xl"
          style={{
            animation: "bounce 3s ease-in-out infinite"
          }}
        />
        
        <div 
          className="absolute top-1/3 right-1/3 w-40 h-40 bg-indigo-400/20 rounded-full blur-xl"
          style={{
            animation: "spinSlow 20s linear infinite"
          }}
        />

        <div className="relative z-10 text-center px-4 sm:px-6">
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold drop-shadow-lg animate-fade-in">
            404
          </h1>
          
          <p className="mt-4 text-lg sm:text-xl md:text-2xl font-medium opacity-90 animate-fade-in-delay max-w-md mx-auto">
            Упс! Кажется, эта страница отправилась в космическое путешествие...
          </p>
          
          <p className="mt-2 text-base sm:text-lg opacity-80 animate-fade-in-delay max-w-lg mx-auto">
            Страница, которую вы ищете, не существует или была перемещена.
          </p>

          <Link
            to="/"
            className="mt-8 inline-block px-6 sm:px-8 py-3 rounded-xl bg-white text-[#235ee7] font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
          >
            <span className="flex items-center justify-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Вернуться на главную
            </span>
          </Link>
          
          <div className="mt-12 animate-fade-in-delay">
            <p className="text-sm opacity-70 mb-4">
              Попробуйте одну из этих страниц:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Панель управления
              </Link>
              <Link
                to="/tests"
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Тесты
              </Link>
              <Link
                to="/help"
                className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Помощь
              </Link>
            </div>
          </div>
        </div>

        <div 
          className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{
            animation: "glow 2s ease-in-out infinite"
          }}
        />
        
        <div className="absolute top-10 left-10 w-8 h-8 border-2 border-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-6 h-6 border-2 border-white/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/4 right-20 w-4 h-4 border-2 border-white/10 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      </div>
    </>
  );
}

export default NotFound;