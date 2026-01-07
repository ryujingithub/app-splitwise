import { Toaster } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

const BillSplitterPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current tab based on the last segment of the URL
    const currentTab = location.pathname.split("/").pop() || "input";

    const handleTabChange = (value: string) => {
        navigate(value);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="mb-8">
                    <Link to="/">
                        <h1 className="text-4xl font-bold">Bill Splitter</h1>
                    </Link>
                    <p className="text-muted-foreground mt-2">
                        Easily split expenses among friends and groups
                    </p>
                </div>

                <Tabs
                    value={currentTab}
                    onValueChange={handleTabChange}
                    className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="input">Input Data</TabsTrigger>
                        <TabsTrigger value="groups">Manage Group</TabsTrigger>
                        <TabsTrigger value="dashboard">
                            Group Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="user-dashboard">
                            User Dashboard
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="mt-6">
                    <Outlet />
                </div>

                <Toaster position="top-right" richColors />
            </div>
        </div>
    );
};

export default BillSplitterPage;
