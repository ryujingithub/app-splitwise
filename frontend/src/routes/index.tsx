import AuthPage from "@/auth/auth-page";
import BillSplitterPage from "@/bill-splitter/bill-splitter-page";
import InputPanel from "@/bill-splitter/components/bills/input-panel";
import GroupDashboard from "@/bill-splitter/components/group-dashboard/group-dashboard";
import GroupManager from "@/bill-splitter/components/groups/group-manager";
import UserDashboard from "@/bill-splitter/components/user-dashboard/user-dashboard";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./protected-route";
import { PublicRoute } from "./public-route";
import AccountTab from "@/features/settings/components/account-tab";
import ManageTab from "@/features/settings/components/manage-tab";
import ProfileTab from "@/features/settings/components/profile-tab";
import SettingsPage from "@/features/settings/settings-page";
import FloatingSettings from "@/features/settings/components/floating-settings";

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
        element: (
            <>
                <ProtectedRoute />
                <FloatingSettings />
            </>
        ),
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
            {
                path: "/settings",
                element: <SettingsPage />,
                children: [
                    { index: true, element: <AccountTab /> },
                    { path: "account", element: <AccountTab /> },
                    { path: "profile", element: <ProfileTab /> },
                    { path: "manage", element: <ManageTab /> },
                ],
            },
        ],
    },
]);
