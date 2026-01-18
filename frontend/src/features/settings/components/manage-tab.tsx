import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Loader2, Users, Crown, UserMinus, ShieldCheck } from "lucide-react";
import { GroupMember } from "@/bill-splitter/types/index.type";
import { toast } from "sonner";
import {
    useCurrentUser,
    useUserGroups,
    useUpdateDefaultGroup,
    useGroupMembers,
    useUpdateMemberRole,
    useRemoveMember,
} from "../hooks/use-settings";

const ManageTab = () => {
    const { data: user } = useCurrentUser();
    const { data: groups, isLoading: loadingGroups } = useUserGroups();
    const updateDefaultGroup = useUpdateDefaultGroup();

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
        user?.defaultGroupId || null,
    );

    const { data: members, isLoading: loadingMembers } =
        useGroupMembers(selectedGroupId);
    const updateMemberRole = useUpdateMemberRole(selectedGroupId || "");
    const removeMember = useRemoveMember(selectedGroupId || "");

    // Check if current user is admin of selected group
    const currentUserMembership = members?.find((m) => m.user_id === user?._id);
    const isGroupAdmin = currentUserMembership?.role === "admin";

    const handleDefaultGroupChange = async (groupId: string) => {
        try {
            await updateDefaultGroup.mutateAsync(
                groupId === "none" ? null : groupId,
            );
            toast.success("Default group updated");
        } catch (error) {
            toast.error(`Failed to update default group ${error}`);
        }
    };

    const handleRoleChange = async (
        member: GroupMember,
        newRole: "admin" | "member",
    ) => {
        try {
            await updateMemberRole.mutateAsync({
                memberId: member.user_id,
                role: newRole,
            });
            toast.success(`Updated ${member.username}'s role to ${newRole}`);
        } catch (error) {
            toast.error(`Failed to update role ${error}`);
        }
    };

    const handleRemoveMember = async (member: GroupMember) => {
        try {
            await removeMember.mutateAsync(member.user_id);
            toast.success(`Removed ${member.username} from group`);
        } catch (error) {
            toast.error(`Failed to remove member ${error}`);
        }
    };

    if (user?.role === "member") {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShieldCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                        You need admin privileges to access group management.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Default Group Selection */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">
                        Default Group
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Select your default group for quick access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingGroups ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="defaultGroup">Default Group</Label>
                            <Select
                                value={user?.defaultGroupId || "none"}
                                onValueChange={handleDefaultGroupChange}
                                disabled={updateDefaultGroup.isPending}>
                                <SelectTrigger
                                    id="defaultGroup"
                                    className="w-full">
                                    <SelectValue placeholder="Select a default group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        No default group
                                    </SelectItem>
                                    {groups?.map((group) => (
                                        <SelectItem
                                            key={group._id}
                                            value={group._id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Group Selection for Management */}
            <Card>
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Users className="h-5 w-5" />
                        Group Management
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        Select a group to manage its members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingGroups ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <Select
                            value={selectedGroupId || ""}
                            onValueChange={(value) =>
                                setSelectedGroupId(value || null)
                            }>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a group to manage" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups?.map((group) => (
                                    <SelectItem
                                        key={group._id}
                                        value={group._id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {/* Members List */}
            {selectedGroupId && (
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-lg sm:text-xl">
                            Group Members
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {isGroupAdmin
                                ? "Manage member roles and access"
                                : "View group members (admin access required to edit)"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingMembers ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : !members?.length ? (
                            <p className="text-center text-sm text-muted-foreground">
                                No members in this group
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {members.map((member) => {
                                    const isSelf = member.user_id === user?._id;
                                    const initials = member.username
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <div
                                            key={member._id}
                                            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback>
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-medium">
                                                            {member.username}
                                                        </p>
                                                        {member.role ===
                                                            "admin" && (
                                                            <Crown className="h-4 w-4 text-yellow-500" />
                                                        )}
                                                        {isSelf && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs">
                                                                You
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>

                                            {isGroupAdmin && (
                                                <div className="flex items-center gap-2 sm:ml-auto">
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(
                                                            value:
                                                                | "admin"
                                                                | "member",
                                                        ) =>
                                                            handleRoleChange(
                                                                member,
                                                                value,
                                                            )
                                                        }
                                                        disabled={
                                                            isSelf ||
                                                            updateMemberRole.isPending
                                                        }>
                                                        <SelectTrigger className="h-9 w-28">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">
                                                                Admin
                                                            </SelectItem>
                                                            <SelectItem value="member">
                                                                Member
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                disabled={
                                                                    isSelf
                                                                }>
                                                                <UserMinus className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Remove
                                                                    Member?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Remove{" "}
                                                                    {
                                                                        member.username
                                                                    }{" "}
                                                                    from this
                                                                    group? They
                                                                    will lose
                                                                    access to
                                                                    all group
                                                                    resources.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                                                <AlertDialogCancel className="w-full sm:w-auto">
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        handleRemoveMember(
                                                                            member,
                                                                        )
                                                                    }
                                                                    className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-auto">
                                                                    {removeMember.isPending && (
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    )}
                                                                    Remove
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ManageTab;
