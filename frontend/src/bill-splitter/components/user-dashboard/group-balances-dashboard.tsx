import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useGroupBalances from "@/bill-splitter/hooks/use-group-balances";
import GroupBalanceCard from "./group-balance-card";
// Assuming you create a new hook for the v2 endpoint

const GroupBalancesDashboard = () => {
    const { groups, isLoading, error, refetch } = useGroupBalances();

    if (isLoading) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load group balances. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Group Balances
                    </h2>
                    <p className="text-muted-foreground">
                        Breakdown of debts by specific groups.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No groups found.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {groups.map((group) => (
                        <GroupBalanceCard key={group.groupId} group={group} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupBalancesDashboard;
