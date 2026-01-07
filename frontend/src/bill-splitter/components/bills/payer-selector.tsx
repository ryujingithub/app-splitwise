import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TransformedMember } from "@/bill-splitter/types";
import { User, WalletCards } from "lucide-react";

interface PayerSelectorProps {
    members: TransformedMember[];
    selectedPayerId: string;
    onSelect: (value: string) => void;
    disabled?: boolean;
}

const PayerSelector = ({
    members,
    selectedPayerId,
    onSelect,
    disabled,
}: PayerSelectorProps) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <WalletCards className="w-4 h-4" />
                Who paid?
            </label>
            <Select
                value={selectedPayerId}
                onValueChange={onSelect}
                disabled={disabled || members.length === 0}>
                <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                    {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{member.name}</span>
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({member.role})
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default PayerSelector;
