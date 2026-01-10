"use client";
import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserGetStatus } from "@/app/stores/user/userGetStatus";
import { toast } from "react-toastify";

export const WaitingList = () => {
  const navigate = useNavigate();

  // 1. ИСПРАВЛЕНИЕ: Деструктурируем данные из хука. Будем использовать их напрямую.
  const { loading, error, user, getStatus } = useUserGetStatus();

  // Состояния для логики теста
  const [testStatus, setTestStatus] = useState("waiting"); // "waiting" | "active"
  
  // Состояние для хранения ID студента и кода доступа
  const [credentials, setCredentials] = useState({
    studentId: null,
    code: null
  });

  // --- ЭФФЕКТЫ (useEffect) ---

  // 2. ИСПРАВЛЕНИЕ: Читаем localStorage только один раз при монтировании
  useEffect(() => {
    try {
      const studentDataRaw = localStorage.getItem("user");
      const codeDataRaw = localStorage.getItem("code");

      if (studentDataRaw && codeDataRaw) {
        const studentData = JSON.parse(studentDataRaw);
        const codeData = JSON.parse(codeDataRaw);

        if (studentData?.studentId && codeData) {
          setCredentials({
            studentId: studentData.studentId,
            code: codeData
          });
        } else {
          // Если данных нет, перенаправляем на вход
          navigate("/", { replace: true });
        }
      } else {
        // Если данных нет в localStorage, перенаправляем на вход
        navigate("/", { replace: true });
      }
    } catch (e) {
      console.error("Ошибка парсинга данных из localStorage:", e);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // 3. ИСПРАВЛЕНИЕ: Запрашиваем статус только когда есть credentials
  useEffect(() => {
    if (credentials.studentId && credentials.code) {
      // ВАЖНО: Если ваш бэкенд не поддерживает WebSocket, вам может потребоваться
      // периодический опрос (polling). Раскомментируйте этот блок, если нужно:
      
      const intervalId = setInterval(() => {
        getStatus(credentials.studentId, credentials.code);
      }, 5000); // Опрос каждые 5 секунд

      // Очистка интервала при размонтировании
      return () => clearInterval(intervalId);
      
    }
  }, [credentials, getStatus]);

  // 4. КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Реагируем на изменение данных пользователя (user) с сервера
  useEffect(() => {
    // ВАЖНО: Замените условие `user.status === 'test_started'` на то,
    // которое реально приходит с вашего сервера для обозначения начала теста.
    // Например: if (user?.activeTestId) или if (user?.isTestActive)
    if (user && user?.student.status === 'active' && testStatus === 'waiting') {
      console.log("Сервер подтвердил начало теста. Переход к тесту.");
      setTestStatus("active");
    }
  }, [user, testStatus]);

  // 4.1. НОВОЕ: Обработка ошибки "студент не найден"
  useEffect(() => {
    // Проверяем, есть ли ошибка 404 или сообщение о том, что студент не найден
    if (error) {
      const isNotFoundError = 
        error.includes('404') || 
        error.includes('не найден') ||
        error.includes('Студент не найден') ||
        error.toLowerCase().includes('not found');

      if (isNotFoundError) {
        // Показываем уведомление пользователю
        toast.error('Вы были удалены из теста или студент не найден. Вы будете перенаправлены на страницу входа.');
        
        // Очищаем localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("code");
        
        // Перенаправляем на страницу входа
        navigate("/", { replace: true });
      }
    }
  }, [error, navigate]);

  // 5. Логика перехода при активном статусе
  useEffect(() => {
    if (testStatus === "active" && user?.category) {
        // Небольшая задержка перед переходом для отображения статуса "Удачи!"
        const timeoutId = setTimeout(() => {
             navigate(`/student-test/${user.category}`, { replace: true });
        }, 1500);
        return () => clearTimeout(timeoutId);
    }
  }, [testStatus, navigate, user]);

  // --- ФУНКЦИИ ---

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("code");
    // Используем navigate с replace для предотвращения возврата назад
    navigate("/", { replace: true });
  };


  // --- РЕНДЕРИНГ ---



  // Показываем экран загрузки, если идет первоначальный запрос и данных пользователя еще нет
  if (loading && !user && testStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Подключение к серверу...</p>
          <p className="text-gray-500 text-sm mt-2">Пожалуйста, подождите.</p>
        </div>
      </div>
    );
  }

  // НОВОЕ: Показываем экран ошибки, если студент не найден
  if (error && (
    error.includes('404') || 
    error.includes('не найден') ||
    error.includes('Студент не найден') ||
    error.toLowerCase().includes('not found')
  )) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600 mb-6">
            Вы были удалены из теста или студент не найден в системе.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Перенаправление на страницу входа...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Основная карточка */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-4">
          {/* Заголовок, меняющийся в зависимости от статуса */}
          {testStatus === "waiting" && (
            <>
              <div className="flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-indigo-600 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Ожидание начала теста
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Преподаватель скоро запустит тестирование
              </p>
            </>
          )}

          {testStatus === "active" && (
            <>
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Удачи!
              </h1>
              <p className="text-center text-gray-600 mb-8">
                Переход к странице тестирования...
              </p>
            </>
          )}

          {/* Информация о студенте */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Студент</p>
            {/* ИСПРАВЛЕНО: Отображаем имя из объекта user с защитой от null */}
            <p className="text-lg font-semibold text-gray-800">
              {user?.student.name || "Информация загружается..."}
            </p>
          </div>

          {/* Инструкции */}
          <div className="bg-blue-50 border-l-4 border-indigo-600 p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-2">
              Важная информация:
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Не обновляйте и не закрывайте эту страницу, тест начнется автоматически.</li>
              <li>• Убедитесь в стабильности интернет-соединения.</li>
              <li>• После начала теста таймер нельзя будет остановить.</li>
            </ul>
          </div>

          {/* Индикатор ожидания и ошибки */}
          {testStatus === "waiting" && (
            <div className="text-center">
              {/* Анимация точек */}
              <div className="flex justify-center items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
              </div>

              {/* Текст статуса или ошибки */}
              {error ? (
                <div className="flex items-center justify-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Ошибка подключения: {error}</span>
                </div>
              ) : (
                <p className="text-gray-600">
                  Ожидаем старта от преподавателя...
                </p>
              )}
            </div>
          )}

          {/* Кнопка выхода */}
          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            Выйти
          </button>
        </div>

        {/* Подвал */}
        <div className="text-center text-gray-600 text-sm">
          Если возникли проблемы, обратитесь к преподавателю или технической поддержке.
        </div>
      </div>
    </div>
  );
};