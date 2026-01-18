import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { LoginFormData, loginSchema } from "./types/auth";
import useLogin from "./hooks/use-login";

type LoginFormProps = {
    onSwitchToRegister: () => void;
    onSuccess?: () => void;
};

const LoginForm = ({ onSwitchToRegister, onSuccess }: LoginFormProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: login, isPending, isError, error } = useLogin();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = (data: LoginFormData) => {
        login(data, {
            onSuccess: (response) => {
                localStorage.setItem("token", response.token);
                form.reset();
                onSuccess?.();
            },
        });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4">
                {isError && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error instanceof Error
                            ? error.message
                            : "Login failed"}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={isPending}
                                    {...field}
                                    defaultValue="renz@gmail.com"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        disabled={isPending}
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }>
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="font-medium text-primary underline-offset-4 hover:underline">
                        Sign up
                    </button>
                </p>
            </form>
        </Form>
    );
};

export default LoginForm;
