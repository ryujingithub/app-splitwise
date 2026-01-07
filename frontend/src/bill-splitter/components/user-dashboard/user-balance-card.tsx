import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserBalance } from "@/bill-splitter/hooks/use-all-users";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";

interface UserBalanceCardProps {
    user: UserBalance;
}

const UserBalanceCard = ({ user }: UserBalanceCardProps) => {
    const isOwed = user.netBalance > 0;
    const isDebt = user.netBalance < 0;

    const getStatusColor = () => {
        if (isOwed) return "text-green-600";
        if (isDebt) return "text-red-600";
        return "text-muted-foreground";
    };

    const getBadgeVariant = () => {
        if (isOwed) return "default"; // Green/Primary
        if (isDebt) return "destructive"; // Red
        return "secondary"; // Gray
    };

    const getBadgeLabel = () => {
        if (isOwed) return "Gets back";
        if (isDebt) return "Owes";
        return "Settled";
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar>
                        {/* If you have avatar URLs in the future */}
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor()}`}>
                        {formatCurrency(Math.abs(user.netBalance))}
                    </p>
                    <Badge variant={getBadgeVariant()} className="mt-1">
                        {getBadgeLabel()}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserBalanceCard;
