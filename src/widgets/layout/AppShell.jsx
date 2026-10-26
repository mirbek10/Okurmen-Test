import { Outlet, useLocation } from "react-router-dom";
import ActiveTestNotice from "@/widgets/layout/ActiveTestNotice";

export default function AppShell() {
  const { pathname } = useLocation();
  const isTakingTest = pathname.startsWith("/student-test/") || pathname.startsWith("/rop-student-test/") || pathname.startsWith("/practice-test/");
  const isWaitingPage = pathname === "/student-waiting-list" || pathname === "/rop-waiting";

  return <>
    <Outlet />
    {!isTakingTest && !isWaitingPage && <ActiveTestNotice />}
  </>;
}
