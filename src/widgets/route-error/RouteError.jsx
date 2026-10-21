import { Link, useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();
  const message = String(error?.message || "");
  const missingChunk = /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(message);

  return <main className="route-error-page">
    <div className="route-error-card">
      <h1>{missingChunk ? "Страница обновилась" : "Не удалось открыть страницу"}</h1>
      <p>{missingChunk ? "Появилась новая версия сайта. Обновите страницу, чтобы продолжить." : "Попробуйте обновить страницу. Если ошибка повторится, вернитесь на главную."}</p>
      <div className="route-error-actions">
        <button type="button" className="primary-button" onClick={() => window.location.reload()}>Обновить страницу</button>
        <Link to="/auth/login">На главную</Link>
      </div>
    </div>
  </main>;
}
