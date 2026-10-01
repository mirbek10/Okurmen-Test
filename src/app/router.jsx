import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import UserLayout from "@/widgets/layout/UserLayout";
import ProtectedRoute from "@/widgets/layout/ProtectedRoute";
import ProfileLayout from "@/widgets/layout/ProfileLayout";
import AdminLayout from "@/widgets/layout/AdminLayout";
import Login from "@/pages/auth/login/Login";
import JoinTest from "@/pages/auth/register/Regist";

const NotFound = lazy(() => import("@/widgets/not-found/not-found").then((m) => ({ default: m.NotFound })));
const WaitingList = lazy(() => import("@/pages/user/WaitingList").then((m) => ({ default: m.WaitingList })));
const StudentTestPage = lazy(() => import("@/pages/user/Test").then((m) => ({ default: m.StudentTestPage })));
const UserDashboard = lazy(() => import("@/pages/profile/UserDashboard").then((m) => ({ default: m.UserDashboard })));
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
const TeachersLeaderboardPage = lazy(() => import("@/pages/admin/teachers/TeachersLeaderboardPage").then((m) => ({ default: m.TeachersLeaderboardPage })));
const AddQuestion = lazy(() => import("@/pages/admin/add-question/AddQuestion").then((m) => ({ default: m.AddQuestion })));

export const router = createBrowserRouter([
  { element: <UserLayout />, children: [
    { path: "/", element: <Login /> },
    { path: "/auth/login", element: <Login /> },
    { path: "/auth/register", element: <Login /> },
  ] },
  { element: <ProtectedRoute />, children: [
    { path: "/join-test", element: <JoinTest /> },
    { path: "/student-waiting-list", element: <WaitingList /> },
    { path: "/student-test/:id", element: <StudentTestPage /> },
    { path: "/practice-test/:type", element: <PracticeTestPage /> },
    { path: "/user", element: <ProfileLayout />, children: [
      { path: "profile", element: <UserDashboard /> },
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
  { path: "/admin", element: <AdminLayout />, children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "test-monitor/:id", element: <TestMonitorPage /> },
    { path: "resalt", element: <Result /> },
    { path: "questions", element: <QuestionsPage /> },
    { path: "leaderboard", element: <Lider /> },
    { path: "teachers", element: <TeachersPage /> },
    { path: "teachers-leaderboard", element: <TeachersLeaderboardPage /> },
    { path: "add-question", element: <AddQuestion /> },
  ] },
  { path: "*", element: <NotFound /> },
]);
