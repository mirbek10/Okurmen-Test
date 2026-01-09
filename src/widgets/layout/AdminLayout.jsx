import { Outlet } from "react-router-dom";
import { Header } from "../header/Header";
// import { Footer } from "../footer/Footer";
function AdminLayout() {
  return (
    <div>
      <Header/>
      <Outlet/>
      {/* <Footer/> */}
    </div>
  );
}

export default AdminLayout;
