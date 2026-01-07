// src/components/group-dashboard/GroupDetailView.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GroupWithMembers,
    MemberOutstandingDebt,
    Bill,
} from "@/bill-splitter/types";
import MemberDebtTable from "./member-debt-table";
import BillDebtBreakdown from "./bill-debt-breakdown";

interface GroupDetailViewProps {
    group: GroupWithMembers;
    memberDebts: MemberOutstandingDebt[];
    bills: Bill[];
    onBack: () => void;
    onAddBill: () => void;
    onSettle: (debt: MemberOutstandingDebt) => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({
    group,
    memberDebts,
    bills,
    onBack,
    onAddBill,
    onSettle,
}) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center justify-between">
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 hover:bg-transparent"
                    onClick={onBack}>
                    ← Back to Groups
                </Button>
                <h2 className="text-2xl font-bold mt-1">{group.name}</h2>
            </div>
            <Button variant="outline" onClick={onAddBill}>
                + Add Bill
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Member Debts</CardTitle>
                <CardDescription>
                    Overview of who owes what. Click "Mark as Paid" to settle
                    balances.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MemberDebtTable debts={memberDebts} onSettle={onSettle} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Bill Breakdown</CardTitle>
                <CardDescription>
                    Detailed breakdown of outstanding debts for each bill.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BillDebtBreakdown
                    bills={bills}
                    members={group.members || []}
                />
            </CardContent>
        </Card>
    </div>
);

export default GroupDetailView;
