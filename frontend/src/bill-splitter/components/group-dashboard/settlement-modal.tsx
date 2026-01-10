import React from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MemberOutstandingDebt } from "@/bill-splitter/types/index.type";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";

interface SettlementModalProps {
    candidate: MemberOutstandingDebt | null;
    isOpen: boolean;
    isProcessing: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SettlementModal = ({
    candidate,
    isOpen,
    isProcessing,
    onClose,
    onConfirm,
}: SettlementModalProps) => {
    if (!candidate) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Payment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to mark all outstanding items as
                        paid for{" "}
                        <span className="font-medium text-foreground">
                            {candidate.user.username}
                        </span>
                        ?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 flex items-center justify-center flex-col gap-2">
                    <div className="text-sm text-muted-foreground">
                        Total Amount Clearing
                    </div>
                    <div className="text-4xl font-bold text-primary">
                        {formatCurrency(candidate.totalOutstanding)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                        {candidate.assignmentIds.length} individual items will
                        be updated.
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isProcessing}>
                        {isProcessing && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SettlementModal;
