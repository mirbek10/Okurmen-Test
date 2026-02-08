import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "../header/Header";
import Cookies from "js-cookie";
import { useEffect } from "react";
function AdminLayout() {
  const nav = useNavigate();
  const token = Cookies.get("adminToken");
  useEffect(() => {
    if (!token) {
      nav("/");
    }
  }, [token]);
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
