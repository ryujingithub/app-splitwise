import AuthPage from "@/auth/auth-page";
import BillSplitterPage from "@/bill-splitter/bill-splitter-page";
import InputPanel from "@/bill-splitter/components/bills/input-panel";
import GroupDashboard from "@/bill-splitter/components/group-dashboard/group-dashboard";
import GroupManager from "@/bill-splitter/components/groups/group-manager";
import UserDashboard from "@/bill-splitter/components/user-dashboard/user-dashboard";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";

export const router = createBrowserRouter([
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/auth",
                element: <AuthPage />,
            },
        ],
    },

    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <BillSplitterPage />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="input" replace />,
                    },
                    {
                        path: "input",
                        element: <InputPanel />,
                    },
                    {
                        path: "groups",
                        element: <GroupManager />,
                    },
                    {
                        path: "dashboard",
                        element: <GroupDashboard />,
                    },
                    {
                        path: "user-dashboard",
                        element: <UserDashboard />,
                    },
                ],
            },
        ],
    },
]);
