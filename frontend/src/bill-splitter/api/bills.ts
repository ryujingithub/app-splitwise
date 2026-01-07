import { Bill, CreateBillPayload, UpdateBillPayload } from "../types";

export const billsApi = {
    create: async (payload: CreateBillPayload) => {
        const response = await fetch("/api/bills", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            throw new Error(error.error || "Failed to create bill");
        }

        return response.json();
    },

    update: async (id: number, payload: UpdateBillPayload) => {
        const response = await fetch(`/api/bills/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            throw new Error(error.error || "Failed to update bill");
        }

        return response.json();
    },

    getByBillId: async (id: number): Promise<Bill> => {
        const response = await fetch(`/api/bills/${id}`);
        if (!response.ok) throw new Error("Failed to fetch bill");
        return response.json();
    },

    getByGroup: async (groupId: number): Promise<Bill[]> => {
        const response = await fetch(`/api/bills?groupId=${groupId}`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        return response.json();
    },

    settleDebts: async (payload: {
        assignmentIds: number[];
    }): Promise<void> => {
        const response = await fetch("/api/bills/settle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Failed to settle debts");
        }
    },

    getBalances: async () => {
        const response = await fetch("/api/bills/balances");
        if (!response.ok) {
            throw new Error("Failed to fetch user balances");
        }
        return response.json();
    },
};
