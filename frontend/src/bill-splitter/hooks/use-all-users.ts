import { useQuery } from "@tanstack/react-query";
import { billsApi } from "../api/bills";

export type UserBalance = {
    id: string;
    name: string;
    email: string;
    netBalance: number; // Positive = Owed to them, Negative = They owe
    currency: string;
};

export const useAllUsers = () => {
    const query = useQuery({
        queryKey: ["bills", "balances"],
        queryFn: billsApi.getBalances,
    });

    return {
        users: (query.data as UserBalance[]) ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
