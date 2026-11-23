import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { useAdminLoginStore } from "@/app/stores/admin/adminLogin";

// Короткие подписи помещаются в одну строку уже на ноутбуке (от 1024px).
const navItems = [
  { path: "/admin/dashboard", label: "Главная", hint: "Тесты и запуск" },
  { path: "/admin/questions", label: "Вопросы", hint: "База вопросов" },
  { path: "/admin/resalt", label: "Результаты", hint: "Итоги тестов" },
  { path: "/admin/users", label: "Ученики", hint: "Мониторинг пользователей" },
  { path: "/admin/pending-auth", label: "Заявки", hint: "Ожидают подтверждения" },
  { path: "/admin/teachers", label: "Учителя", hint: "Мониторинг учителей" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAdminLoginStore((state) => state.logout);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    if (!window.confirm("Выйти из панели администратора?")) return;
    logout();
    navigate("/auth/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col rounded-xl px-4 py-3 transition-colors ${
      isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/admin/dashboard" className="admin-brand-link shrink-0">
            <img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн — панель администратора" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы панели">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass} title={item.hint}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Администратор</span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <FiLogOut size={16} /> Выйти
            </button>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-slate-50 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={24} className="text-slate-700" /> : <FiMenu size={24} className="text-slate-700" />}
          </button>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-blue-100 py-3 lg:hidden">
            <nav className="grid gap-1" aria-label="Разделы панели">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={mobileLinkClass}>
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs text-slate-500">{item.hint}</span>
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 px-4 pt-3">
              <span className="text-sm font-semibold text-slate-700">Администратор</span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <FiLogOut size={16} /> Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
