import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";

export interface GroupMemberBalance {
    userId: string;
    name: string;
    email: string;
    balance: number;
}

interface GroupMemberRowProps {
    member: GroupMemberBalance;
}

const GroupMemberRow = ({ member }: GroupMemberRowProps) => {
    const isOwed = member.balance > 0;
    const isDebt = member.balance < 0;

    const getStatusColor = () => {
        if (isOwed) return "text-green-600";
        if (isDebt) return "text-red-600";
        return "text-muted-foreground";
    };

    const getBadgeVariant = () => {
        if (isOwed) return "default";
        if (isDebt) return "destructive";
        return "secondary";
    };

    const getBadgeLabel = () => {
        if (isOwed) return "Gets back";
        if (isDebt) return "Owes";
        return "Settled";
    };

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                    <p className="text-sm font-medium leading-none">
                        {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {member.email}
                    </p>
                </div>
            </div>

            <div className="text-right flex items-center gap-3">
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                    {formatCurrency(Math.abs(member.balance))}
                </span>
                <Badge
                    variant={getBadgeVariant()}
                    className="text-[10px] px-2 h-5">
                    {getBadgeLabel()}
                </Badge>
            </div>
        </div>
    );
};

export default GroupMemberRow;
