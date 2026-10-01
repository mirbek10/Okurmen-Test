import { createElement, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ChartNoAxesColumn, ChevronRight, Code2, GraduationCap, History, KeyRound, LayoutDashboard, LogOut, Menu, Trophy, X } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/stores/auth/authStore";

const primaryLinks = [
  { to: "/user/profile", label: "Главная", Icon: LayoutDashboard },
  { to: "/user/tests", label: "Тренировки", Icon: BookOpen },
  { to: "/join-test", label: "Тест по коду", Icon: KeyRound },
  { to: "/user/history", label: "История", Icon: History },
];
const extraLinks = [
  { to: "/user/leaderboard", label: "Рейтинг", Icon: Trophy },
  { to: "/user/creator", label: "О проекте", Icon: Code2 },
];

export default function ProfileLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const teacherLinks = user?.role === "teacher" ? [
    { to: "/teacher/dashboard", label: "Панель преподавателя", Icon: GraduationCap },
    { to: "/teacher/leaderboard", label: "Рейтинг преподавателей", Icon: ChartNoAxesColumn },
  ] : [];
  const pageName = [...primaryLinks, ...extraLinks, ...teacherLinks].find((item) => item.to === location.pathname)?.label || "Кабинет";

  const handleLogout = () => {
    logout();
    Cookies.remove("user");
    localStorage.removeItem("user");
    localStorage.removeItem("code");
    navigate("/auth/login", { replace: true });
  };
  const navItem = ({ to, label, Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `portal-link ${isActive ? "is-active" : ""}`}>{createElement(Icon, { size: 19, strokeWidth: 1.9 })}<span>{label}</span>{to === "/join-test" && <ChevronRight size={16} className="portal-link-arrow" />}</NavLink>;

  return <div className="portal-shell">
    <aside className="portal-sidebar">
      <Link to="/user/profile" className="portal-brand"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн — окуу борбору" /></Link>
      <p className="portal-nav-caption">Обучение</p>
      <nav aria-label="Основная навигация">{primaryLinks.map(navItem)}</nav>
      <p className="portal-nav-caption portal-nav-caption-second">Дополнительно</p>
      <nav aria-label="Дополнительная навигация">{extraLinks.map(navItem)}{teacherLinks.map(navItem)}</nav>
      <div className="sidebar-bottom"><div className="account-mini"><span className="account-initial">{(user?.username || user?.name || "У").slice(0, 1).toUpperCase()}</span><span><b>{user?.username || user?.name || "Ученик"}</b><small>{user?.email || "Личный кабинет"}</small></span></div><button type="button" className="sidebar-logout" onClick={handleLogout}><LogOut size={18} /> Выйти</button></div>
    </aside>

    <div className="portal-content">
      <header className="portal-topbar"><Link to="/user/profile" className="mobile-brand"><img className="brand-logo" src="/okurmen-logo.svg" alt="Окурмэн — окуу борбору" /></Link><div className="desktop-page-name">{pageName}</div><div className="topbar-actions"><Link className="topbar-code" to="/join-test"><KeyRound size={17} /> Ввести код</Link><button className="mobile-menu-button" type="button" aria-label="Открыть меню" onClick={() => setMenuOpen(true)}><Menu size={22} /></button></div></header>
      <main className="portal-main"><Outlet /></main>
    </div>

    <nav className="mobile-bottom-nav" aria-label="Быстрая навигация">{primaryLinks.map(({ to, label, Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-bottom-link ${isActive ? "is-active" : ""}`}>{createElement(Icon, { size: 21, strokeWidth: 1.9 })}<span>{label === "Тест по коду" ? "По коду" : label}</span></NavLink>)}</nav>
    {menuOpen && <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)}><div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}><div className="mobile-menu-heading"><b>Меню</b><button type="button" aria-label="Закрыть меню" onClick={() => setMenuOpen(false)}><X size={21} /></button></div><div className="mobile-menu-account">{user?.username || user?.name || "Ученик"}<small>{user?.email}</small></div><nav aria-label="Все разделы">{[...primaryLinks, ...extraLinks, ...teacherLinks].map(navItem)}</nav><button type="button" className="sidebar-logout" onClick={handleLogout}><LogOut size={18} /> Выйти из аккаунта</button></div></div>}
  </div>;
}
