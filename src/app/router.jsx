import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import UserLayout from "@/widgets/layout/UserLayout";
import ProtectedRoute from "@/widgets/layout/ProtectedRoute";
import ProfileLayout from "@/widgets/layout/ProfileLayout";
import AdminLayout from "@/widgets/layout/AdminLayout";
import AppShell from "@/widgets/layout/AppShell";
import Login from "@/pages/auth/login/Login";
import ForgotPassword from "@/pages/auth/login/ForgotPassword";
import JoinTest from "@/pages/auth/register/Regist";
import RouteError from "@/widgets/route-error/RouteError";

const NotFound = lazy(() => import("@/widgets/not-found/not-found").then((m) => ({ default: m.NotFound })));
const WaitingList = lazy(() => import("@/pages/user/WaitingList").then((m) => ({ default: m.WaitingList })));
const StudentTestPage = lazy(() => import("@/pages/user/Test").then((m) => ({ default: m.StudentTestPage })));
const UserDashboard = lazy(() => import("@/pages/profile/UserDashboard").then((m) => ({ default: m.UserDashboard })));
const AccountPage = lazy(() => import("@/pages/profile/AccountPage").then((m) => ({ default: m.AccountPage })));
const PracticeSelection = lazy(() => import("@/pages/profile/Test").then((m) => ({ default: m.PracticeSelection })));
const Lider = lazy(() => import("@/pages/profile/Lider").then((m) => ({ default: m.Lider })));
const PracticeTestPage = lazy(() => import("@/pages/profile/PracticeTestPage").then((m) => ({ default: m.PracticeTestPage })));
const PracticeHistoryPage = lazy(() => import("@/pages/profile/PracticeHistoryPage").then((m) => ({ default: m.PracticeHistoryPage })));
const CreatorPage = lazy(() => import("@/pages/profile/CreatorPage").then((m) => ({ default: m.CreatorPage })));
const TeacherDashboard = lazy(() => import("@/pages/teacher/TeacherDashboard").then((m) => ({ default: m.TeacherDashboard })));
const TeacherLeaderboard = lazy(() => import("@/pages/teacher/TeacherLeaderboard").then((m) => ({ default: m.TeacherLeaderboard })));
const Dashboard = lazy(() => import("@/pages/admin/dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
const TestMonitorPage = lazy(() => import("@/pages/admin/test-monitor/TestMonitorPage"));
const Result = lazy(() => import("@/pages/admin/result/Result"));
const QuestionsPage = lazy(() => import("@/pages/admin/question/Qestion").then((m) => ({ default: m.QuestionsPage })));
const TeachersPage = lazy(() => import("@/pages/admin/teachers/Teachers").then((m) => ({ default: m.TeachersPage })));
const UsersMonitoringPage = lazy(() => import("@/pages/admin/users/UsersMonitoringPage"));
const PendingAuthPage = lazy(() => import("@/pages/admin/pending-auth/PendingAuthPage"));
const ROP_CATEGORY = "\u0420\u041e\u041f";

export const router = createBrowserRouter([
  { element: <AppShell />, children: [
  { element: <UserLayout />, errorElement: <RouteError />, children: [
    { path: "/", element: <Login /> },
    { path: "/auth/login", element: <Login /> },
    { path: "/auth/register", element: <Login /> },
    { path: "/auth/forgot-password", element: <ForgotPassword /> },
    { path: "/auth/reset-password", element: <ForgotPassword /> },
    { path: "/rop-code", element: <JoinTest requiredCategory={ROP_CATEGORY} /> },
    { path: "/rop-waiting", element: <WaitingList entryPath="/rop-code" /> },
    { path: "/rop-student-test/:id", element: <StudentTestPage /> },
    { path: "/rop-student-test/*", element: <StudentTestPage /> },
  ] },
  { element: <ProtectedRoute />, errorElement: <RouteError />, children: [
    { path: "/join-test", element: <JoinTest /> },
    { path: "/student-waiting-list", element: <WaitingList /> },
    { path: "/student-test/:id", element: <StudentTestPage /> },
    { path: "/student-test/*", element: <StudentTestPage /> },
    { path: "/practice-test", element: <PracticeTestPage /> },
    { path: "/practice-test/:type", element: <PracticeTestPage /> },
    { path: "/practice-test/*", element: <PracticeTestPage /> },
    { path: "/user", element: <ProfileLayout />, children: [
      { path: "profile", element: <UserDashboard /> },
      { path: "account", element: <AccountPage /> },
      { path: "tests", element: <PracticeSelection /> },
      { path: "leaderboard", element: <Lider /> },
      { path: "history", element: <PracticeHistoryPage /> },
      { path: "creator", element: <CreatorPage /> },
    ] },
    { path: "/teacher", element: <ProfileLayout />, children: [
      { path: "dashboard", element: <TeacherDashboard /> },
      { path: "leaderboard", element: <TeacherLeaderboard /> },
    ] },
  ] },
  { path: "/admin", element: <AdminLayout />, errorElement: <RouteError />, children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "test-monitor/:id", element: <TestMonitorPage /> },
    { path: "resalt", element: <Result /> },
    { path: "questions", element: <QuestionsPage /> },
    { path: "leaderboard", element: <Navigate to="/admin/users" replace /> },
    { path: "users", element: <UsersMonitoringPage /> },
    { path: "pending-auth", element: <PendingAuthPage /> },
    { path: "teachers", element: <TeachersPage /> },
    { path: "teachers-leaderboard", element: <Navigate to="/admin/teachers" replace /> },
    { path: "add-question", element: <Navigate to="/admin/questions" replace /> },
  ] },
  { path: "*", element: <NotFound /> },
  ] },
]);
