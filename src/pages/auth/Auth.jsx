import React, { useState } from 'react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center  p-4">
      {/* Основной контейнер с эффектом Glassmorphism */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 border border-white/20 shadow-2xl overflow-hidden">
        
        {/* Декоративные мягкие элементы (Soft UI блики) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-400/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/30 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-indigo-100 text-sm ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-indigo-100 text-sm ml-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="hello@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-indigo-100 text-sm ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all pl-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-100 hover:text-white"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
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
                        d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.53 9.53 0 0112 5c5 0 9 4.5 9 7 0 1.23-.7 2.7-1.88 4.03M6.11 6.11C3.82 7.64 2 10.02 2 12c0 2.5 4 7 10 7 1.05 0 2.06-.14 3-.4"
                      />
                    </svg>
                  ) : (
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
                        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Кнопка в стиле Soft UI */}
            <button className="w-full mt-4 py-3 px-6 rounded-xl bg-white text-indigo-700 font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-100 hover:text-white underline-offset-4 hover:underline transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

