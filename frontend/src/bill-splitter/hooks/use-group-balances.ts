import { useQuery } from "@tanstack/react-query";
import { GroupBalanceResponse } from "@/bill-splitter/types";
import { balancesApi } from "../api/balance";

export const useGroupBalances = () => {
    const { data, isLoading, error, refetch } = useQuery<
        GroupBalanceResponse[],
        Error
    >({
        queryKey: ["balances", "group-v2"],
        queryFn: balancesApi.getGroupBalances,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        groups: data ?? [],
        isLoading,
        error,
        refetch,
    };
};

export default useGroupBalances;
