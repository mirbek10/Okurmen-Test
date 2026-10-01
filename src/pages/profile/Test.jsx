import { createElement, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Code2, KeyRound, Layers3, Server, Smartphone, Terminal } from "lucide-react";

const directions = [
  { id: "front", title: "Frontend", description: "HTML, CSS, JavaScript, React и TypeScript", Icon: Code2, tests: [
    { id: "html", name: "HTML и CSS", description: "Разметка страниц и стили" },
    { id: "javascript", name: "JavaScript", description: "Основы языка и современный синтаксис" },
    { id: "react", name: "React и Redux", description: "Компоненты и состояние" },
    { id: "typescript", name: "TypeScript", description: "Типизация и практика" },
  ] },
  { id: "back", title: "Backend", description: "Python, Django и серверная разработка", Icon: Server, tests: [
    { id: "Основа", name: "Основы Python", description: "Синтаксис, типы данных и циклы" },
    { id: "Продвинутый", name: "Продвинутый Python", description: "ООП, декораторы и генераторы" },
    { id: "django", name: "Django", description: "Фреймворк и работа с данными" },
  ] },
  { id: "java", title: "Java", description: "Синтаксис, ООП и Spring", Icon: Terminal, tests: [
    { id: "Java основы", name: "Основы Java", description: "Синтаксис, типы данных и циклы" },
    { id: "Java продвинутый", name: "Продвинутый Java", description: "Коллекции и ООП" },
    { id: "spring", name: "Spring", description: "Разработка на Spring Framework" },
  ] },
  { id: "flutter", title: "Flutter", description: "Dart, виджеты и интерфейсы", Icon: Smartphone, tests: [
    { id: "flutter1", name: "Основы Flutter", description: "Виджеты и структура проекта" },
    { id: "dart1", name: "Продвинутый Flutter", description: "Управление состоянием и архитектура" },
    { id: "flutter5", name: "Flutter UI", description: "Интерфейсы и адаптивность" },
  ] },
];

export function PracticeSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const direction = directions.find((item) => item.id === selected);

  if (direction) return <div className="practice-page">
    <button type="button" className="text-link practice-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Все направления</button>
    <div className="practice-title"><span className="section-kicker">Тренировка</span><h1>{direction.title}</h1><p>Выберите тему. Результат сохранится в истории тренировок.</p></div>
    <div className="practice-list">{direction.tests.map((test, index) => <button type="button" className="practice-row" onClick={() => navigate(`/practice-test/${encodeURIComponent(test.id)}`)} key={test.id}><span className="practice-number">{String(index + 1).padStart(2, "0")}</span><span className="practice-row-copy"><strong>{test.name}</strong><small>{test.description}</small></span><ArrowRight size={19} /></button>)}</div>
  </div>;

  return <div className="practice-page">
    <div className="practice-title"><span className="section-kicker">Практика</span><h1>Выберите тренировку</h1><p>Изучайте темы в своём темпе. Начните с направления, которое вам интересно.</p></div>
    <Link to="/join-test" className="practice-exam"><span className="practice-exam-icon"><KeyRound size={23} /></span><span><small>Тест преподавателя</small><strong>Есть код теста?</strong><span>Введите его, чтобы подключиться к официальному тесту.</span></span><ArrowRight size={20} /></Link>
    <div className="practice-section-heading"><div><span className="section-kicker">Самостоятельно</span><h2>Направления</h2></div><span>4 направления</span></div>
    <div className="practice-directions">{directions.map(({ id, title, description, Icon, tests }) => <button type="button" className="direction-card" onClick={() => setSelected(id)} key={id}><span className="direction-icon">{createElement(Icon, { size: 24 })}</span><span className="direction-copy"><strong>{title}</strong><small>{description}</small><em>{tests.length} темы</em></span><ArrowRight size={20} /></button>)}</div>
    <p className="practice-help"><Layers3 size={16} /> Результаты тренировок находятся в разделе «История».</p>
  </div>;
}
