import { LoginFormData, RegisterFormData } from "../types/auth";

export class AuthError extends Error {
    constructor(
        message: string,
        public status: number,
        public statusText: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = "AuthError";
    }
}

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
            const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }));

            throw new AuthError(
                errorData.message ||
                    `Login failed: ${response.status} ${response.statusText}`,
                response.status,
                response.statusText,
                errorData,
            );
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
            const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }));

            throw new AuthError(
                errorData.message ||
                    `Registration failed: ${response.status} ${response.statusText}`,
                response.status,
                response.statusText,
                errorData,
            );
        }

        return response.json();
    },
};
