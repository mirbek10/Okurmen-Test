import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Импортируем ваши сторы (замените на ваши реальные пути)
import { useAdminLoginStore } from "@/app/stores/admin/adminLogin";
import { useUserJoinStore } from "@/app/stores/user/userJoin";

const Register = () => {
  const [name, setName] = useState("");
  const [testCode, setTestCode] = useState("");
  const [localError, setLocalError] = useState("");
  
  const { login, admin, loading: adminLoading, error: adminError } = useAdminLoginStore();
  const { join, user, loading: userLoading, error: userError } = useUserJoinStore();
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e?.preventDefault();
    
    // Сбрасываем ошибки
    setLocalError("");
    
    // Валидация
    if (!name.trim() || !testCode.trim()) {
      setLocalError("Пожалуйста, заполните все поля.");
      return;
    }

    if (testCode.length < 4) {
      setLocalError("Код теста должен содержать минимум 4 цифры");
      return;
    }

    if (name.toUpperCase() === "ADMIN") {
      // Вход администратора
      try {
        await login(name, testCode);
        // После успешного входа перенаправляем
       
          navigate("/admin/dashboard");
        
      } catch (error) {
        console.error("Ошибка входа администратора:", error);
        setLocalError(adminError || "Ошибка входа администратора");
      }
    } else {
      // Вход студента
      try {
        await join(name, testCode);
       
      } catch (error) {
        console.error("Ошибка подключения студента:", error);
        setLocalError(userError || "Ошибка подключения к тесту");
      }
    }
  };

  useEffect(() => {
    if (user && testCode) {
      navigate("/student-waiting-list");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("code", testCode);
    }
  }, [navigate, user, testCode]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister(e);
    }
  };

  // Определяем общее состояние загрузки и ошибки
  const loading = adminLoading || userLoading;
  const error = localError || adminError || userError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Вход в систему тестирования
            </h1>
            <p className="text-gray-600">
              Введите данные для начала тестирования
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ваше имя
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) {
                      setLocalError("");
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pl-10"
                  disabled={loading}
                  // autoComplete="name"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
             
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Код теста
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testCode}
                  onChange={(e) => {
                    // Разрешаем только цифры
                    const value = e.target.value.replace(/\D/g, '');
                    setTestCode(value);
                    if (error) {
                      setLocalError("");
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pl-10"
                  disabled={loading}
                  autoComplete="off"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Получите код теста у преподавателя
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !testCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {name.toUpperCase() === "ADMIN" ? "Вход..." : "Подключение..."}
                </>
              ) : (
                "Войти"
              )}
            </button>
          </form>

          

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Как получить доступ:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">1</span>
                Получите код теста у преподавателя
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">2</span>
                Введите ваше настоящее имя
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">3</span>
                Нажмите "Войти" для начала тестирования
              </li>
            </ul>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Register;