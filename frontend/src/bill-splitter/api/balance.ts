import { GroupBalanceResponse } from "../types";

export const balancesApi = {
    getGlobalBalances: async () => {
        const response = await fetch("/api/bills/balances");
        if (!response.ok) throw new Error("Failed to fetch global balances");
        return response.json();
    },

    // V2 Group-based Balances
    getGroupBalances: async (): Promise<GroupBalanceResponse[]> => {
        const response = await fetch("/api/bills/balances/v2");
        if (!response.ok) throw new Error("Failed to fetch group balances");
        return response.json();
    },
};
