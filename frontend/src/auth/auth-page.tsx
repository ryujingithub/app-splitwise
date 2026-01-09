import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import LoginForm from "./login-form";
import { LoginFormData, RegisterFormData } from "./types/auth";

type AuthMode = "login" | "register";

const API_URL = import.meta.env.VITE_API_URL;

const AuthPage = () => {
    const [mode, setMode] = useState<AuthMode>("login");
    const navigate = useNavigate();

    const handleLogin = async (data: LoginFormData) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Login failed");
            }

            const result = await res.json();
            localStorage.setItem("token", result.token);

            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    };

    const handleRegister = async (data: RegisterFormData) => {
        try {
            const { ...registerData } = data;

            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Registration failed");
            }

            toast.success("Account created! Please sign in.");
            setMode("login");
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        {mode === "login"
                            ? "Welcome back"
                            : "Create an account"}
                    </CardTitle>
                    <CardDescription>
                        {mode === "login"
                            ? "Enter your credentials to sign in"
                            : "Enter your details to get started"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mode === "login" ? (
                        <LoginForm
                            onSubmit={handleLogin}
                            onSwitchToRegister={() => setMode("register")}
                        />
                    ) : (
                        <h2>Be right back</h2>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
export default AuthPage;
