import { formatCurrency } from "@/bill-splitter/lib/format-currency";
import { formatDate } from "@/bill-splitter/lib/format-date";
import { Badge } from "@/components/ui/badge";

interface BillSummaryProps {
    date: string;
    total: number;
    payerId: number;
}

const BillSummary = ({ date, total, payerId }: BillSummaryProps) => {
    return (
        <div className="flex flex-col gap-2 rounded-md bg-muted p-4 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Paid By (ID):</span>
                <span className="font-medium">{payerId}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-bold">Total:</span>
                <Badge variant="outline" className="text-base font-bold">
                    {formatCurrency(total)}
                </Badge>
            </div>
        </div>
    );
};

export default BillSummary;
