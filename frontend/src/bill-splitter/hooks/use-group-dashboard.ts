// src/components/group-dashboard/useGroupDashboard.ts
import { useState } from "react";
import { toast } from "sonner";
import { useGroups } from "./use-groups";
import { useGroup } from "./use-group";
import { useBills } from "./use-bills";
import {
    Bill,
    GroupWithMembers,
    MemberOutstandingDebt,
    RuntimeGroupMember,
} from "../types";
import { billsApi } from "../api/bills";
import { User } from "../types/user.type";

export const useGroupDashboard = (urlGroupId?: string) => {
    const navigate = (path: string) => (window.location.href = path);

    const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
        urlGroupId ? parseInt(urlGroupId, 10) : undefined
    );

    const [settlementCandidate, setSettlementCandidate] =
        useState<MemberOutstandingDebt | null>(null);
    const [isSettling, setIsSettling] = useState(false);

    const { groups, isLoading: groupsLoading } = useGroups();
    const { group, isLoading: groupLoading } = useGroup(selectedGroupId);
    const {
        bills,
        isLoading: billsLoading,
        refreshBills,
    } = useBills(selectedGroupId);

    const memberDebts: MemberOutstandingDebt[] = (() => {
        if (!group || !bills) return [];

        const members = (group as GroupWithMembers).members || [];

        return members.map((member: RuntimeGroupMember) => {
            let rawTotalOwed = 0;
            const unpaidIds: number[] = [];

            const memberUserId = member.user_id ?? member.id;

            if (!memberUserId) {
                console.warn("Member missing ID:", member);
                return {
                    user: { ...member, id: 0 } as unknown as User,
                    totalOutstanding: 0,
                    assignmentIds: [],
                };
            }

            bills.forEach((bill: Bill) => {
                bill.items.forEach((item) => {
                    const assignees = item.assignments || [];
                    if (assignees.length === 0) return;

                    const userAssignment = assignees.find(
                        (a) => a.user_id === memberUserId
                    );

                    if (userAssignment && !userAssignment.paid_date) {
                        const share = item.amount / assignees.length;
                        rawTotalOwed += share;
                        unpaidIds.push(userAssignment.id);
                    }
                });
            });

            const totalOutstanding = Math.round(rawTotalOwed);

            const userObj: User = {
                id: memberUserId,
                username: member.username || "Unknown",
                email: member.email || "",
                created_at: new Date().toISOString(),
            };

            return {
                user: userObj,
                totalOutstanding,
                assignmentIds: unpaidIds,
            };
        });
    })();

    const handleSelectGroup = (id: number | undefined) =>
        setSelectedGroupId(id);
    const handleInitiateSettlement = (debt: MemberOutstandingDebt) =>
        setSettlementCandidate(debt);

    const handleConfirmSettlement = async () => {
        if (!settlementCandidate) return;
        setIsSettling(true);
        try {
            await billsApi.settleDebts({
                assignmentIds: settlementCandidate.assignmentIds,
            });
            toast.success(
                `Settled debt for ${settlementCandidate.user.username}`
            );
            refreshBills();
            setSettlementCandidate(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update records.");
        } finally {
            setIsSettling(false);
        }
    };

    return {
        groups,
        selectedGroup: group as GroupWithMembers | undefined,
        bills,
        memberDebts,
        isLoading:
            groupsLoading ||
            (!!selectedGroupId && (groupLoading || billsLoading)),
        settlementCandidate,
        isSettling,
        setSettlementCandidate,
        handleSelectGroup,
        handleInitiateSettlement,
        handleConfirmSettlement,
        navigate,
    };
};
