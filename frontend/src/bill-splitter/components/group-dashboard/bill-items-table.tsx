import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";
import { BillItem, GroupMember } from "@/bill-splitter/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

interface BillItemsTableProps {
    items: BillItem[];
    members: GroupMember[];
}

const BillItemsTable = ({ items, members }: BillItemsTableProps) => {
    const grandTotal = items.reduce(
        (sum, item) => sum + item.amount * item.quantity,
        0
    );

    const getAssigneeNames = (assignments: BillItem["assignments"]) => {
        if (!assignments || assignments.length === 0) return [];
        return assignments.map((assignment) => {
            const member = members.find((m) => m.id === assignment.user_id);
            return member?.username || "Unknown";
        });
    };

    const handleCopyToSpreadsheet = () => {
        if (!items.length) return;

        // Define header columns
        const headers = ["Item", "Qty", "Cost", "Total Amount", "Assigned To"];

        // Convert each row to a tab-separated line
        const rows = items.map((item) => {
            const names = getAssigneeNames(item.assignments);
            return [
                item.name,
                item.quantity.toString(),
                formatCurrency(item.amount),
                formatCurrency(item.amount * item.quantity),
                names.join(", "),
            ];
        });

        // Add grand total row
        const footer = ["Total", "", "", formatCurrency(grandTotal), ""];

        // Combine everything into one tab-separated string
        const tsvContent = [headers, ...rows, footer]
            .map((line) => line.join("\t"))
            .join("\n");

        // Copy to clipboard
        navigator.clipboard
            .writeText(tsvContent)
            .then(() => {
                console.log("Table copied to clipboard (TSV format)");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
            });
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">
                            Total Amount
                        </TableHead>
                        <TableHead className="text-right">Assigned</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => {
                        const names = getAssigneeNames(item.assignments);
                        return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(item.amount)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(
                                        item.amount * item.quantity
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-wrap gap-1 justify-end">
                                        {names.length > 0 ? (
                                            names.map((name, index) => (
                                                <Badge
                                                    key={`${item.id}-${index}`}
                                                    variant="secondary"
                                                    className="text-xs font-normal">
                                                    {name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">
                                                Unassigned
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="font-bold">
                            Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                            {formatCurrency(grandTotal)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyToSpreadsheet}
                                title="Copy to Spreadsheet">
                                <Copy className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
};

export default BillItemsTable;
