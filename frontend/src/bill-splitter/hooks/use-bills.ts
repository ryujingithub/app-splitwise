import { useState, useEffect, useCallback } from "react";
import { Bill } from "../types/index.type";
import { billsApi } from "../api/bills";

export const useBills = (groupId?: string) => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBills = useCallback(async () => {
        if (!groupId) {
            setBills([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await billsApi.getByGroup(groupId);
            setBills(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch bills";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    return {
        bills,
        isLoading,
        error,
        refreshBills: fetchBills,
    };
};
