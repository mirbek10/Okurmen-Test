import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./router";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return <Suspense fallback={<div className="page-loading" role="status">Загружаем страницу...</div>}>
    <RouterProvider router={router} />
    <ToastContainer autoClose={2000} theme="light" position="top-right" hideProgressBar pauseOnHover pauseOnFocusLoss closeOnClick />
  </Suspense>;
}
