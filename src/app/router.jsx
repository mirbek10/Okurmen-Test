import { createBrowserRouter } from "react-router-dom";

import UserLayout from "../widgets/layout/userLayout";
import { NotFound } from "../widgets/not-found/not-found.jsx";
import AdminLayout from "../widgets/layout/AdminLayout";
import path from "path";
import { Dashboard } from "../pages/admin/dashboard/Dashboard";
import TestMonitorPage from "@/pages/admin/test-monitor/TestMonitorPage";
import Register from "@/pages/auth/register/Regist";
import { WaitingList } from "../pages/user/WaitingList.jsx";
import { StudentTestPage } from "@/pages/user/Test";
import Result from "@/pages/admin/result/Result";
import { QuestionsPage } from "@/pages/admin/question/Qestion";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <UserLayout />,
        children: [
            {
                path: "/",
                element: <Register/>
            },
            {
                path: "/student-waiting-list",
                element: <WaitingList/>
            },
            {
                path: "/student-test/:id",
                element: <StudentTestPage/>
            }
        ],
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
                path:"resalt",
                element:<Result/>
            },
            {
                path:"questions",
                element:<QuestionsPage/>
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);
