import { UserRow } from "../types/bills.type";

export const formatGlobalBalances = (
    users: UserRow[],
    balanceMap: Map<number, number>
) => {
    return users
        .map((u) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            netBalance: Number((balanceMap.get(u.id) || 0).toFixed(2)),
            currency: "AUD",
        }))
        .sort((a, b) => a.netBalance - b.netBalance);
};

export const formatGroupBalances = (
    groupLedger: Map<number, { name: string; balances: Map<number, number> }>,
    userMap: Map<number, UserRow>
) => {
    return Array.from(groupLedger.entries()).map(([groupId, data]) => ({
        groupId,
        groupName: data.name,
        members: Array.from(data.balances.entries()).map(
            ([userId, balance]) => {
                const user = userMap.get(userId);
                return {
                    userId,
                    name: user?.username || "Unknown",
                    email: user?.email || "",
                    balance: Number(balance.toFixed(2)), // Fix floating point precision
                };
            }
        ),
    }));
};
