// src/components/group-dashboard/bill-debt-breakdown.tsx
import React, { useState } from "react";
import { Bill, GroupMember } from "@/bill-splitter/types";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronDown,
    ChevronRight,
    ChevronsDown,
    ChevronsUp,
    Copy,
} from "lucide-react";
import BillItemsTable from "./bill-items-table"; // Assuming sibling file

interface BillDebtBreakdownProps {
    bills: Bill[];
    members: GroupMember[];
}

const BillDebtBreakdown: React.FC<BillDebtBreakdownProps> = ({
    bills,
    members,
}) => {
    const [expandedBillIds, setExpandedBillIds] = useState<number[]>([]);

    // Calculate derived data for bills
    const billRows = bills.map((bill) => {
        const totalAmount = bill.items.reduce(
            (sum, item) => sum + item.amount * item.quantity,
            0
        );

        // Identify unique members involved in this bill
        const participantIds = new Set<number>();
        bill.items.forEach((item) => {
            item.assignments?.forEach((assignment) => {
                participantIds.add(assignment.user_id);
            });
        });

        const participants = members.filter((m) => participantIds.has(m.id));

        return {
            ...bill,
            totalAmount,
            participants,
        };
    });

    const grandTotal = billRows.reduce((sum, row) => sum + row.totalAmount, 0);

    // Handlers
    const toggleBill = (billId: number) => {
        setExpandedBillIds((prev) =>
            prev.includes(billId)
                ? prev.filter((id) => id !== billId)
                : [...prev, billId]
        );
    };

    const handleExpandAll = () => {
        setExpandedBillIds(bills.map((b) => b.id));
    };

    const handleCollapseAll = () => {
        setExpandedBillIds([]);
    };

    const handleCopySummary = () => {
        const headers = ["Bill", "Total", "Participants", "Items Count"];
        const rows = billRows.map((b) => [
            b.title,
            formatCurrency(b.totalAmount),
            b.participants.map((p) => p.username).join(", "),
            b.items.length.toString(),
        ]);
        const footer = ["Total", formatCurrency(grandTotal), "", ""];
        const tsv = [headers, ...rows, footer]
            .map((row) => row.join("\t"))
            .join("\n");
        navigator.clipboard.writeText(tsv);
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExpandAll}>
                        <ChevronsDown className="mr-2 h-4 w-4" />
                        Show All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCollapseAll}>
                        <ChevronsUp className="mr-2 h-4 w-4" />
                        Hide All
                    </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopySummary}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Summary
                </Button>
            </div>

            {/* Main Table */}
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Bill Title</TableHead>
                            <TableHead className="text-right">
                                Total Amount
                            </TableHead>
                            <TableHead>Participants</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {billRows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center">
                                    No bills found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            billRows.map((bill) => {
                                const isExpanded = expandedBillIds.includes(
                                    bill.id
                                );
                                return (
                                    <React.Fragment key={bill.id}>
                                        {/* Summary Row */}
                                        <TableRow
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleBill(bill.id)}
                                            data-state={
                                                isExpanded
                                                    ? "selected"
                                                    : undefined
                                            }>
                                            <TableCell>
                                                {isExpanded ? (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {bill.title}
                                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                                    ({bill.items.length} items)
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(
                                                    bill.totalAmount
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {bill.participants.length >
                                                    0 ? (
                                                        bill.participants.map(
                                                            (p) => (
                                                                <Badge
                                                                    key={p.id}
                                                                    variant="secondary"
                                                                    className="text-xs font-normal">
                                                                    {p.username}
                                                                </Badge>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">
                                                            No assignments
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Details Row */}
                                        {isExpanded && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell
                                                    colSpan={4}
                                                    className="p-0">
                                                    <div className="p-4 pl-12">
                                                        <BillItemsTable
                                                            items={bill.items}
                                                            members={members}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="font-bold">
                                Total
                            </TableCell>
                            <TableCell className="text-right font-bold">
                                {formatCurrency(grandTotal)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
};

export default BillDebtBreakdown;
