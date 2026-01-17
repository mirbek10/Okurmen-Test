import React, { useState } from 'react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);

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
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                placeholder="••••••••"
              />
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