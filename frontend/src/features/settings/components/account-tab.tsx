import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
    useCurrentUser,
    useUsernameAvailability,
    useUpdateUsername,
    useUpdateEmail,
    useChangePassword,
    useDeactivateAccount,
} from "../hooks/use-settings";

const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Only letters, numbers, and underscores allowed"
        )
        .transform((v) => v.trim()),
});

const emailSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .transform((v) => v.trim().toLowerCase()),
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain uppercase letter")
            .regex(/[a-z]/, "Must contain lowercase letter")
            .regex(/[0-9]/, "Must contain a number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type UsernameForm = z.infer<typeof usernameSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const AccountTab = () => {
    const { data: user } = useCurrentUser();
    const [usernameInput, setUsernameInput] = useState("");

    const { data: usernameCheck, isFetching: checkingUsername } =
        useUsernameAvailability(
            usernameInput,
            usernameInput !== user?.username && usernameInput.length >= 3
        );

    const updateUsername = useUpdateUsername();
    const updateEmail = useUpdateEmail();
    const changePassword = useChangePassword();
    const deactivateAccount = useDeactivateAccount();

    const usernameForm = useForm<UsernameForm>({
        resolver: zodResolver(usernameSchema),
        defaultValues: { username: user?.username || "" },
    });

    const emailForm = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: user?.email || "" },
    });

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onUsernameSubmit = async (data: UsernameForm) => {
        if (!usernameCheck?.available) return;

        try {
            await updateUsername.mutateAsync(data);
            toast.success("Username updated successfully");
        } catch (error) {
            toast.error(
                `Failed to update username ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const onEmailSubmit = async (data: EmailForm) => {
        try {
            await updateEmail.mutateAsync(data);
            toast.success("Verification email sent");
        } catch (error) {
            toast.error(
                `Failed to update email ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        try {
            await changePassword.mutateAsync({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success("Password changed successfully");
            passwordForm.reset();
        } catch (error) {
            toast.error(
                `Failed to change password ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    const handleDeactivate = async () => {
        try {
            await deactivateAccount.mutateAsync();
            toast.success("Account deactivated");
            // Redirect to login or home
        } catch (error) {
            toast.error(
                `Failed to deactivate account ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Username Section */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Username
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Change your public username
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        {...usernameForm.register("username", {
                                            onChange: (e) =>
                                                setUsernameInput(
                                                    e.target.value
                                                ),
                                        })}
                                        className="pr-10"
                                    />
                                    {usernameInput !== user?.username &&
                                        usernameInput.length >= 3 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {checkingUsername ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : usernameCheck?.available ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <X className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>
                                        )}
                                </div>
                                {usernameForm.formState.errors.username && (
                                    <p className="text-xs text-destructive">
                                        {
                                            usernameForm.formState.errors
                                                .username.message
                                        }
                                    </p>
                                )}
                                {!checkingUsername &&
                                    usernameCheck?.available === false &&
                                    usernameInput !== user?.username && (
                                        <p className="text-xs text-destructive">
                                            Username is already taken
                                        </p>
                                    )}
                            </div>
                            <Button
                                type="submit"
                                disabled={
                                    updateUsername.isPending ||
                                    !usernameCheck?.available ||
                                    usernameInput === user?.username
                                }
                                className="w-full sm:w-auto">
                                {updateUsername.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Username
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Email Section */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Email</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Update your email address. A verification link will be
                        sent.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...emailForm.register("email")}
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-xs text-destructive">
                                        {
                                            emailForm.formState.errors.email
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={updateEmail.isPending}
                                className="w-full sm:w-auto">
                                {updateEmail.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Email
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Password
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Change your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">
                                    Current Password
                                </Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    {...passwordForm.register(
                                        "currentPassword"
                                    )}
                                />
                                {passwordForm.formState.errors
                                    .currentPassword && (
                                    <p className="text-xs text-destructive">
                                        {
                                            passwordForm.formState.errors
                                                .currentPassword.message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...passwordForm.register("newPassword")}
                                />
                                {passwordForm.formState.errors.newPassword && (
                                    <p className="text-xs text-destructive">
                                        {
                                            passwordForm.formState.errors
                                                .newPassword.message
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...passwordForm.register(
                                        "confirmPassword"
                                    )}
                                />
                                {passwordForm.formState.errors
                                    .confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {
                                            passwordForm.formState.errors
                                                .confirmPassword.message
                                        }
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={changePassword.isPending}
                                className="w-full sm:w-auto">
                                {changePassword.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Change Password
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive sm:text-xl">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Irreversible actions for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription className="text-xs sm:text-sm">
                            Deactivating your account will disable access. This
                            action can be reversed by contacting support.
                        </AlertDescription>
                    </Alert>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto">
                                Deactivate Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Deactivate Account?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Your account will be disabled and you will
                                    be logged out. You can reactivate by
                                    contacting support.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                <AlertDialogCancel className="w-full sm:w-auto">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeactivate}
                                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto">
                                    {deactivateAccount.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Deactivate
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
};

export default AccountTab;
