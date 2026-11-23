import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Сессия входа.
// Сервер выдаёт пару токенов: access живёт 1 день, refresh — 30 дней.
// Перед запросом, если access скоро истечёт, и после ответа 401 мы тихо
// получаем новую пару через /auth/refresh (или /admin/refresh) и повторяем запрос.
// Пользователь выходит только сам, при смене пароля, блокировке
// или если не заходил на сайт больше 30 дней.

export const API_URL = "https://beckend-test-sqyj.onrender.com/api/";

export type SessionKind = "user" | "admin";

const COOKIE = {
  user: { token: "userToken", refresh: "userRefreshToken" },
  admin: { token: "adminToken", refresh: "adminRefreshToken" },
} as const;

const REFRESH_URL: Record<SessionKind, string> = {
  user: "auth/refresh",
  admin: "admin/refresh",
};

// Обновляем заранее, если до конца access-токена осталось меньше этого.
const REFRESH_AHEAD_MS = 10 * 60 * 1000;
// Cookie живут столько же, сколько refresh-токен; сам срок проверяет сервер.
const COOKIE_DAYS = 30;

const cookieOptions = () => ({
  expires: COOKIE_DAYS,
  sameSite: "lax" as const,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
});

export function getToken(kind: SessionKind) {
  return Cookies.get(COOKIE[kind].token) || null;
}

export function hasSession(kind: SessionKind) {
  return Boolean(Cookies.get(COOKIE[kind].token) || Cookies.get(COOKIE[kind].refresh));
}

export function saveSession(kind: SessionKind, data: { token?: string; refreshToken?: string }) {
  if (data?.token) Cookies.set(COOKIE[kind].token, data.token, cookieOptions());
  if (data?.refreshToken) Cookies.set(COOKIE[kind].refresh, data.refreshToken, cookieOptions());
}

export function clearSession(kind: SessionKind) {
  Cookies.remove(COOKIE[kind].token);
  Cookies.remove(COOKIE[kind].refresh);
}

function tokenExpiresAt(token: string | null) {
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

class SessionExpiredError extends Error {
  constructor() {
    super("Сессия истекла. Войдите снова.");
    this.name = "SessionExpiredError";
  }
}

// Один общий запрос на обновление, даже если параллельно упало несколько запросов.
const pending: Partial<Record<SessionKind, Promise<string>>> = {};

export function refreshSession(kind: SessionKind): Promise<string> {
  if (pending[kind]) return pending[kind]!;

  // Старые входы (до появления refresh-токена) обновляем по их обычному токену.
  const refreshToken = Cookies.get(COOKIE[kind].refresh) || Cookies.get(COOKIE[kind].token);
  if (!refreshToken) return Promise.reject(new SessionExpiredError());

  const request = axios
    .post(`${API_URL}${REFRESH_URL[kind]}`, { refreshToken }, { timeout: 30000 })
    .then((response) => {
      saveSession(kind, response.data);
      return response.data.token as string;
    })
    .catch((error) => {
      const status = error.response?.status;
      // Выходим только если сервер явно отказал. Сеть пропала или сервер
      // просыпается (Render) — сессию не трогаем, попробуем позже.
      if (status === 401 || status === 403) {
        clearSession(kind);
        onSessionEnded(kind);
        throw new SessionExpiredError();
      }
      throw error;
    })
    .finally(() => {
      delete pending[kind];
    });

  pending[kind] = request;
  return request;
}

function onSessionEnded(kind: SessionKind) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const isPublic = path === "/" || path.startsWith("/auth") || path.startsWith("/rop-");
  if (kind === "admin" ? path.startsWith("/admin") : !isPublic) {
    window.location.assign("/auth/login?expired=1");
  }
}

type RetryConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

export function attachSession(instance: AxiosInstance, kind: SessionKind) {
  instance.interceptors.request.use(async (config) => {
    let token = getToken(kind);
    const hasRefresh = Boolean(Cookies.get(COOKIE[kind].refresh));
    // access-токена нет (cookie удалена) или он вот-вот истечёт — обновим заранее.
    if (hasRefresh && (!token || tokenExpiresAt(token) - Date.now() < REFRESH_AHEAD_MS)) {
      try {
        token = await refreshSession(kind);
      } catch (error) {
        if (error instanceof SessionExpiredError) throw error;
        // сеть недоступна — отправим запрос со старым токеном
      }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(undefined, async (error) => {
    const config = error.config as RetryConfig | undefined;
    if (error.response?.status !== 401 || !config || config._authRetried || !hasSession(kind)) {
      throw error;
    }
    config._authRetried = true;
    const token = await refreshSession(kind);
    config.headers.Authorization = `Bearer ${token}`;
    return instance(config);
  });

  return instance;
}
