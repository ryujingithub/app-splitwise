import useBillDetails from "@/bill-splitter/hooks/use-bill-details";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import BillItemsTable from "./bill-items-table";
import BillSummary from "./bill-summary";

interface BillDetailsModalProps {
    billId: string | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const BillDetailsModal = ({
    billId,
    isOpen,
    onOpenChange,
}: BillDetailsModalProps) => {
    const { bill, isLoading, error } = useBillDetails(billId, isOpen);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] sm:max-w-[700px] justify-center align-middle">
                <DialogHeader>
                    <DialogTitle>{bill?.title || "Bill Details"}</DialogTitle>
                    <DialogDescription>
                        Review the breakdown of expenses and assignments.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {error && (
                    <div className="rounded bg-destructive/10 p-4 text-destructive">
                        Error: {error}
                    </div>
                )}

                {!isLoading && !error && bill && (
                    <ScrollArea className="max-h-[60vh]">
                        <div className="flex flex-col gap-6">
                            <BillSummary
                                date={bill.bill_date}
                                total={bill.total_amount}
                                payerId={bill.payer_id}
                            />

                            <div className="flex flex-col gap-2">
                                <h4 className="font-semibold leading-none tracking-tight">
                                    Items
                                </h4>
                                <BillItemsTable
                                    items={bill.items}
                                    members={[]}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BillDetailsModal;
