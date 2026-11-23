import { Navigate, Outlet } from "react-router-dom";
import { Header } from "../header/Header";
import { hasSession } from "@/shared/lib/api/session";

function AdminLayout() {
  if (!hasSession("admin")) return <Navigate to="/auth/login" replace />;
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
