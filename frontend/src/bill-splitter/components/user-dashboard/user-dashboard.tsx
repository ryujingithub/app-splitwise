"use client"; // Assuming this is a Client Component

import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

import { useAllUsers } from "@/bill-splitter/hooks/use-all-users"; // V1 Hook
import { useGroupBalances } from "@/bill-splitter/hooks/use-group-balances"; // V2 Hook
import { formatCurrency } from "@/bill-splitter/lib/format-currency";
import GroupBalanceCard from "./group-balance-card";
import UserBalanceCard from "./user-balance-card";

// Define the possible states for the tabs
type BalanceView = "global" | "groups";

const UserDashboard = () => {
    const [currentView, setCurrentView] = useState<BalanceView>("global");

    // --- V1: Global Balances ---
    const {
        users,
        isLoading: isLoadingGlobal,
        error: errorGlobal,
        refetch: refetchGlobal,
    } = useAllUsers();

    const totalOutstandingGlobal = users.reduce((acc, user) => {
        return user.netBalance > 0 ? acc + user.netBalance : acc;
    }, 0);

    // --- V2: Group Balances ---
    const {
        groups,
        isLoading: isLoadingGroups,
        error: errorGroups,
        refetch: refetchGroups,
    } = useGroupBalances();

    const totalOutstandingGroups = groups.reduce((acc, group) => {
        const groupTotal = group.members.reduce((gAcc, member) => {
            return member.balance > 0 ? gAcc + member.balance : gAcc;
        }, 0);
        return acc + groupTotal;
    }, 0);

    // --- Render Logic ---
    const renderGlobalTabContent = () => {
        if (isLoadingGlobal) {
            return (
                <div className="flex h-[400px] w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (errorGlobal) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load user balances. Please try again later.
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <>
                {users.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No users found in the system.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {users.map((user) => (
                            <UserBalanceCard key={user.id} user={user} />
                        ))}
                    </div>
                )}

                {users.length > 0 && (
                    <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                        Total floating debt in system:{" "}
                        <span className="font-medium text-foreground">
                            {formatCurrency(totalOutstandingGlobal)}
                        </span>
                    </div>
                )}
            </>
        );
    };

    const renderGroupsTabContent = () => {
        if (isLoadingGroups) {
            return (
                <div className="flex h-[400px] w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (errorGroups) {
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
            <>
                {groups.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        No active groups found.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {groups.map((group) => (
                            <GroupBalanceCard
                                key={group.groupId}
                                group={group}
                            />
                        ))}
                    </div>
                )}

                {groups.length > 0 && (
                    <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
                        Total floating debt in system:{" "}
                        <span className="font-medium text-foreground">
                            {formatCurrency(totalOutstandingGroups)}
                        </span>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Balances Overview
                    </h2>
                    <p className="text-muted-foreground">
                        View your global net balance or breakdowns by group.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    // Conditionally call the correct refetch function
                    onClick={() =>
                        currentView === "global"
                            ? refetchGlobal()
                            : refetchGroups()
                    }
                    className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <Tabs
                value={currentView}
                onValueChange={(value) => setCurrentView(value as BalanceView)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="global">Global Balances</TabsTrigger>
                    <TabsTrigger value="groups">Group Balances</TabsTrigger>
                </TabsList>
                <TabsContent value="global" className="mt-6">
                    {renderGlobalTabContent()}
                </TabsContent>
                <TabsContent value="groups" className="mt-6">
                    {renderGroupsTabContent()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default UserDashboard;
