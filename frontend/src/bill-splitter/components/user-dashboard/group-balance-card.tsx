import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroupMemberRow, { GroupMemberBalance } from "./group-member-balance";

export interface GroupBalanceData {
    groupId: string;
    groupName: string;
    members: GroupMemberBalance[];
}

interface GroupBalanceCardProps {
    group: GroupBalanceData;
}

const GroupBalanceCard = ({ group }: GroupBalanceCardProps) => {
    // Filter out completely settled members if desired, or keep all
    const activeMembers = group.members.filter((m) => m.balance !== 0);

    return (
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 bg-muted/20">
                <CardTitle className="text-lg font-semibold flex justify-between items-center">
                    <span>{group.groupName}</span>
                    <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border">
                        {group.members.length} Members
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
                {activeMembers.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        All debts settled in this group.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activeMembers.map((member) => (
                            <GroupMemberRow
                                key={member.userId}
                                member={member}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GroupBalanceCard;
