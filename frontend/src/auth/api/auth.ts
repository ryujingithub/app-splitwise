import { LoginFormData, RegisterFormData } from "../types/auth";

export const authApi = {
    login: async (payload: LoginFormData) => {
        const response = await fetch("/api/auth/login", {
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
            throw new Error(error.error || "Failed to login");
        }
        return response.json();
    },
    register: async (payload: RegisterFormData) => {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...payload, role: "member" as const }),
        });
        if (!response.ok) {
            const error = await response
                .json()
                .catch(() => ({ error: "Unknown error" }));
            throw new Error(error.error || "Failed to register user");
        }
        return response.json();
    },
};
