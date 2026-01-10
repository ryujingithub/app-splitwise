import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberOutstandingDebt } from "@/bill-splitter/types/index.type";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";

interface MemberDebtTableProps {
    debts: MemberOutstandingDebt[];
    onSettle: (debt: MemberOutstandingDebt) => void;
}

const MemberDebtTable = ({ debts, onSettle }: MemberDebtTableProps) => {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                            Outstanding Amount
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {debts.map((item) => (
                        <TableRow key={item.user._id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                        {item.user.username
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    {item.user.username}
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.totalOutstanding > 0 ? (
                                    <Badge
                                        variant="destructive"
                                        className="flex w-fit items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{" "}
                                        Unpaid
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="secondary"
                                        className="flex w-fit items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100">
                                        <CheckCircle2 className="w-3 h-3" />{" "}
                                        Settled
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-mono text-base">
                                {formatCurrency(item.totalOutstanding)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    size="sm"
                                    variant={
                                        item.totalOutstanding > 0
                                            ? "default"
                                            : "ghost"
                                    }
                                    disabled={item.totalOutstanding <= 0}
                                    onClick={() => onSettle(item)}>
                                    Mark as Paid
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {debts.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-center h-24 text-muted-foreground">
                                No members found in this group.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default MemberDebtTable;
