import { useState } from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        autoClose={2000}
        theme="colored"
        position="top-right"
        hideProgressBar
        pauseOnHover
        pauseOnFocusLoss
        closeOnClick
      />
    </>
  );
}

export default App;
