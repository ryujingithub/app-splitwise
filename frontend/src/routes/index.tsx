import { createBrowserRouter, Navigate } from "react-router";
import BillSplitterPage from "@/bill-splitter/bill-splitter-page";
import InputPanel from "@/bill-splitter/components/bills/input-panel";
import GroupManager from "@/bill-splitter/components/groups/group-manager";
import GroupDashboard from "@/bill-splitter/components/group-dashboard/group-dashboard";
import UserDashboard from "@/bill-splitter/components/user-dashboard/user-dashboard";

export const router = createBrowserRouter([
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
]);
