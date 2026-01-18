import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "./hooks/use-settings";

const SettingsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: user, isLoading } = useCurrentUser();

    const currentTab = location.pathname.split("/").pop() || "account";

    const handleTabChange = (value: string) => {
        navigate(value);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto max-w-4xl p-4 sm:p-6">
                    <Skeleton className="mb-6 h-10 w-48" />
                    <Skeleton className="mb-6 h-12 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <Settings className="h-7 w-7 sm:h-8 sm:w-8" />
                        <h1 className="text-2xl font-bold sm:text-4xl">
                            Settings
                        </h1>
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
                        Manage your account, profile, and groups
                    </p>
                </div>

                <Tabs
                    value={currentTab}
                    onValueChange={handleTabChange}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="account"
                            className="text-xs sm:text-sm">
                            Account
                        </TabsTrigger>
                        <TabsTrigger
                            value="profile"
                            className="text-xs sm:text-sm">
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="manage"
                            className="text-xs sm:text-sm"
                            disabled={user?.role === "member"}>
                            Manage
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="mt-4 sm:mt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
