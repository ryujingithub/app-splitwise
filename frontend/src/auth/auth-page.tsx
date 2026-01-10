import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

type AuthMode = "login" | "register";

const AuthPage = () => {
    const [mode, setMode] = useState<AuthMode>("login");

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
                            onSwitchToRegister={() => setMode("register")}
                        />
                    ) : (
                        <RegisterForm
                            onSwitchToLogin={() => setMode("login")}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
export default AuthPage;
