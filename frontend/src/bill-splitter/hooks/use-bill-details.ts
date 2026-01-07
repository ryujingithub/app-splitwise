import { useQuery } from "@tanstack/react-query";
import { billsApi } from "../api/bills";

const useBillDetails = (billId: number | null, isOpen: boolean) => {
    const query = useQuery({
        queryKey: ["bill", billId],
        queryFn: () => billsApi.getByBillId(billId!),
        enabled: !!billId && isOpen,
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
    });

    return {
        bill: query.data ?? null,
        isLoading: query.isLoading,
        error: query.error instanceof Error ? query.error.message : null,
    };
};

export default useBillDetails;
