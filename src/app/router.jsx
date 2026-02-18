import { createBrowserRouter } from "react-router-dom";

import UserLayout from "../widgets/layout/UserLayout";
import { NotFound } from "../widgets/not-found/not-found.jsx";
import AdminLayout from "../widgets/layout/AdminLayout";
import { Dashboard } from "../pages/admin/dashboard/Dashboard";
import TestMonitorPage from "@/pages/admin/test-monitor/TestMonitorPage";
import Register from "@/pages/auth/register/Regist";
import RegisterComponent from "@/pages/auth/register/Register";
import LoginComponent from "@/pages/auth/login/Login";
import { WaitingList } from "../pages/user/WaitingList.jsx";
import { StudentTestPage } from "@/pages/user/Test";
import Result from "@/pages/admin/result/Result";
import { QuestionsPage } from "@/pages/admin/question/Qestion";
import { UserDashboard } from "@/pages/profile/UserDashboard";
import ProfileLayout from "@/widgets/layout/ProfileLayout";
import { PracticeSelection } from "@/pages/profile/Test";
import { Lider } from "@/pages/profile/Lider";
import { PracticeTestPage } from "@/pages/profile/PracticeTestPage";
import { PracticeHistoryPage } from "@/pages/profile/PracticeHistoryPage";
import { CreatorPage } from "@/pages/profile/CreatorPage";
import { AddQuestion } from "@/pages/admin/add-question/AddQuestion";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <Register />,
      },
      {
        path: "/student-waiting-list",
        element: <WaitingList />,
      },
      {
        path: "/student-test/:id",
        element: <StudentTestPage />,
      },
      {
        path: "/auth/register",
        element: <RegisterComponent />,
      },
      {
        path: "/auth/login",
        element: <LoginComponent />,
      },
    ],
  },
  {
    path: "/user",
    element: <ProfileLayout />,
    children: [
      {
        path: "profile",
        element: <UserDashboard />,
      },
      {
        path: "tests",
        element: <PracticeSelection />,
      },
      {
        path: "leaderboard",
        element: <Lider />,
      },
      {
        path:"history",
        element:<PracticeHistoryPage/>
      },
      {
        path:"creator",
        element:<CreatorPage/>
      }
    ],
  },
  {
    path: "/practice-test/:type",
    element: <PracticeTestPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "test-monitor/:id",
        element: <TestMonitorPage />,
      },
      {
        path: "resalt",
        element: <Result />,
      },
      {
        path: "questions",
        element: <QuestionsPage />,
      },
      {
        path: "leaderboard",
        element: <Lider />,
      },
      {
        path:"add-question",
        element:<AddQuestion/>
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
