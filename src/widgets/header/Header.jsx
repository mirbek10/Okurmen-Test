import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Можно использовать react-icons вместо lucide-react
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import Cookies from "js-cookie";

const navItems = [
  { path: "/admin/dashboard", label: "Главная" },
  { path: "/admin/questions", label: "Вопросы" },
  { path: "/admin/resalt", label: "Результаты" },
  { path: "/admin/leaderboard", label: "Рейтинг" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation(); // Используем useLocation вместо usePathname

  // Функция для объединения классов
  const getNavLinkClass = (itemPath) => {
    const baseClass = "text-sm font-medium transition-colors relative py-2";
    if (location.pathname === itemPath) {
      return `${baseClass} text-blue-600`;
    }
    return `${baseClass} text-slate-600 hover:text-blue-600`;
  };

  const getMobileNavLinkClass = (itemPath) => {
    const baseClass = "block px-4 py-2 rounded-lg text-sm font-medium transition-colors";
    if (location.pathname === itemPath) {
      return `${baseClass} bg-blue-50 text-blue-600`;
    }
    return `${baseClass} text-slate-600 hover:bg-slate-50`;
  };

  // Функция для выхода
  const handleLogout = () => {
    Cookies.remove("adminToken");
    window.location.href = "/";
  };

  // Проверяем активность пользователя
  const isLoggedIn = Cookies.get("adminToken");

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold">✓</span>
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold text-xl">
              TestHub
            </span>
            <span className="sm:hidden text-blue-600 font-bold text-xl">TH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getNavLinkClass(item.path)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" />
                )}
              </Link>
            ))}
            
            
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-700 font-medium">Преподаватель</span>
                    <span className="text-xs text-slate-500">Активен</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  aria-label="Выйти"
                  title="Выйти из системы"
                >
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <FiX size={24} className="text-slate-700" />
            ) : (
              <FiMenu size={24} className="text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t border-blue-100 py-4 animate-fade-in">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={getMobileNavLinkClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Дополнительные ссылки для администратора в мобильной версии */}
              {isLoggedIn && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={getMobileNavLinkClass("/dashboard")}
                  >
                    Панель управления
                  </Link>
                  <Link
                    to="/tests"
                    onClick={() => setMenuOpen(false)}
                    className={getMobileNavLinkClass("/tests")}
                  >
                    Тесты
                  </Link>
                </>
              )}
            </div>

            {/* Mobile User Section */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {isLoggedIn ? (
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm flex items-center justify-center text-white font-bold">
                      T
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">Преподаватель</div>
                      <div className="text-xs text-slate-500">teacher@example.com</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Выйти"
                  >
                    <FiLogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium text-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Войти
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm font-medium text-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;