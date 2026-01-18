import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { useCurrentUser } from "../hooks/use-settings";

const ProfileTab = () => {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 sm:flex-row">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = user?.username?.slice(0, 2).toUpperCase() || "??";
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Unknown";

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Profile Overview */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Profile Overview
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Your public profile information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                            <AvatarFallback className="text-xl sm:text-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                            <div>
                                <h3 className="text-xl font-semibold sm:text-2xl">
                                    {user?.username}
                                </h3>
                                <Badge
                                    variant={
                                        user?.role === "admin"
                                            ? "default"
                                            : "secondary"
                                    }>
                                    {user?.role}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Member since {joinDate}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Details */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Account Details
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Read-only account information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Username
                            </p>
                            <p className="truncate font-medium">
                                {user?.username}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Email
                            </p>
                            <p className="truncate font-medium">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Role
                            </p>
                            <p className="font-medium capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                Joined
                            </p>
                            <p className="font-medium">{joinDate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Future Extensions Placeholder */}
            <Card className="border-dashed">
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg text-muted-foreground sm:text-xl">
                        Coming Soon
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Additional profile customization options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Avatar upload</li>
                        <li>• Bio / description</li>
                        <li>• Language preferences</li>
                        <li>• Theme settings</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileTab;
