import { ConvexDefaultProps } from "@/bill-splitter/types/index.type";
import z from "zod";

export interface User extends ConvexDefaultProps {
    _id: string;
    name: string;
    username: string;
    email: string;
    role: "member" | "admin" | "system_admin";
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    defaultGroupId?: string;
    activeGroupId?: string;
}

export type AuthResponse = {
    user: User;
    token: string;
};

export type AuthError = {
    message: string;
    field?: string;
};

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        email: z.string().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /[A-Z]/,
                "Password must contain at least one uppercase letter",
            )
            .regex(
                /[a-z]/,
                "Password must contain at least one lowercase letter",
            )
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
