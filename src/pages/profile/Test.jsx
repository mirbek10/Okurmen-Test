import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Code2, KeyRound, Layers3 } from "lucide-react";
import { useTestCategoryStore } from "@/app/stores/all/getTestCategory";

export function PracticeSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const { testCategories, fetchTestCategories, loading, error } = useTestCategoryStore();

  useEffect(() => {
    fetchTestCategories();
  }, [fetchTestCategories]);

  const availableCategories = useMemo(
    () => testCategories.filter((item) => item.category && item.parentCategory && Number(item.availableCount) > 0),
    [testCategories]
  );
  const directions = useMemo(() => {
    const grouped = new Map();
    for (const item of availableCategories) {
      const title = String(item.parentCategory).trim();
      if (!title) continue;
      if (!grouped.has(title)) grouped.set(title, []);
      grouped.get(title).push(item);
    }
    return [...grouped.entries()]
      .map(([title, tests]) => ({ title, tests }))
      .sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [availableCategories]);
  const direction = directions.find((item) => item.title === selected);

  if (direction) return <div className="practice-page">
    <button type="button" className="text-link practice-back" onClick={() => setSelected(null)}><ArrowLeft size={17} /> Все направления</button>
    <div className="practice-title"><span className="section-kicker">Тренировка</span><h1>{direction.title}</h1><p>Выберите тему. Результат сохранится в истории тренировок.</p></div>
    <div className="practice-list">{direction.tests.map(({ category, count }, index) => <button type="button" className="practice-row" onClick={() => navigate(`/practice-test?category=${encodeURIComponent(category)}`)} key={category}><span className="practice-number">{String(index + 1).padStart(2, "0")}</span><span className="practice-row-copy"><strong>{category}</strong><small>{count} вопросов · доступно для тренировки</small></span><ArrowRight size={19} /></button>)}</div>
  </div>;

  return <div className="practice-page">
    <div className="practice-title"><span className="section-kicker">Практика</span><h1>Выберите тренировку</h1><p>Изучайте темы в своём темпе. Начните с направления, которое вам интересно.</p></div>
    <Link to="/join-test" className="practice-exam"><span className="practice-exam-icon"><KeyRound size={23} /></span><span><small>Тест преподавателя</small><strong>Есть код теста?</strong><span>Введите его, чтобы подключиться к официальному тесту.</span></span><ArrowRight size={20} /></Link>
    <div className="practice-section-heading"><div><span className="section-kicker">Самостоятельно</span><h2>Направления</h2></div><span>{directions.length} направлений</span></div>
    {loading && testCategories.length === 0 ? <p role="status">Загружаем доступные темы…</p> : error ? <p role="alert" className="form-error">Не удалось загрузить список тем.</p> : directions.length > 0 ? <div className="practice-directions">{directions.map(({ title, tests }) => <button type="button" className="direction-card" onClick={() => setSelected(title)} key={title}><span className="direction-icon"><Code2 size={24} /></span><span className="direction-copy"><strong>{title}</strong><small>{tests.map((test) => test.category).join(", ")}</small><em>{tests.length} тем · {tests.reduce((sum, test) => sum + Number(test.count || 0), 0)} вопросов</em></span><ArrowRight size={20} /></button>)}</div> : null}
    {!loading && !error && availableCategories.length === 0 && <p className="mt-5 text-sm text-slate-500">Пока нет доступных вопросов для тренировки.</p>}
    <p className="practice-help"><Layers3 size={16} /> Результаты тренировок находятся в разделе «История».</p>
  </div>;
}
