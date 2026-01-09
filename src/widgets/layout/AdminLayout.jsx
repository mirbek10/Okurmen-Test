import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "../header/Header";
import Cookies from "js-cookie";
import { useEffect } from "react";
// import { Footer } from "../footer/Footer";
function AdminLayout() {
  const nav = useNavigate();
  const token = Cookies.get("adminToken");
  useEffect(() => {
    nav("/");
  }, [token]);
  return (
    <div>
      <Header />
      <Outlet />
      {/* <Footer/> */}
    </div>
  );
}

export default AdminLayout;
