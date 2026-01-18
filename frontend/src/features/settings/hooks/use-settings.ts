import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

import useDebounce from "@/hooks/use-debounce";
import {
    UpdateUsernamePayload,
    UpdateEmailPayload,
    ChangePasswordPayload,
    UpdateMemberRolePayload,
} from "../types/settings.type";
import {
    fetchCurrentUser,
    checkUsernameAvailability,
    updateUsername,
    updateEmail,
    changePassword,
    deactivateAccount,
    fetchUserGroups,
    updateDefaultGroup,
    fetchGroupMembers,
    updateMemberRole,
    removeMember,
} from "../api/setings";

// Query Keys
export const settingsKeys = {
    user: ["user", "current"] as const,
    groups: ["groups", "user"] as const,
    groupMembers: (groupId: string) => ["groups", groupId, "members"] as const,
    usernameCheck: (username: string) =>
        ["username", "check", username] as const,
};

// Current User Hook
export const useCurrentUser = () => {
    return useQuery({
        queryKey: settingsKeys.user,
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000,
    });
};

export const useUsernameAvailability = (username: string, enabled: boolean) => {
    const debouncedUsername = useDebounce(username, 500);

    return useQuery({
        queryKey: settingsKeys.usernameCheck(debouncedUsername),
        queryFn: () => checkUsernameAvailability(debouncedUsername),
        enabled: enabled && debouncedUsername.length >= 3,
        staleTime: 30 * 1000,
    });
};

// Update Username Mutation
export const useUpdateUsername = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateUsernamePayload) => updateUsername(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.user });
        },
    });
};

// Update Email Mutation
export const useUpdateEmail = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateEmailPayload) => updateEmail(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.user });
        },
    });
};

// Change Password Mutation
export const useChangePassword = () => {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    });
};

// Deactivate Account Mutation
export const useDeactivateAccount = () => {
    return useMutation({
        mutationFn: deactivateAccount,
    });
};

// User Groups Hook
export const useUserGroups = () => {
    return useQuery({
        queryKey: settingsKeys.groups,
        queryFn: fetchUserGroups,
        staleTime: 5 * 60 * 1000,
    });
};

// Update Default Group Mutation
export const useUpdateDefaultGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (groupId: string | null) => updateDefaultGroup(groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: settingsKeys.user });
        },
    });
};

// Group Members Hook
export const useGroupMembers = (groupId: string | null) => {
    return useQuery({
        queryKey: settingsKeys.groupMembers(groupId || ""),
        queryFn: () => fetchGroupMembers(groupId!),
        enabled: !!groupId,
        staleTime: 2 * 60 * 1000,
    });
};

// Update Member Role Mutation
export const useUpdateMemberRole = (groupId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateMemberRolePayload) =>
            updateMemberRole(groupId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: settingsKeys.groupMembers(groupId),
            });
        },
    });
};

// Remove Member Mutation
export const useRemoveMember = (groupId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memberId: string) => removeMember(groupId, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: settingsKeys.groupMembers(groupId),
            });
        },
    });
};

// Selected Group State Hook
export const useSelectedGroup = () => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    const selectGroup = useCallback((groupId: string | null) => {
        setSelectedGroupId(groupId);
    }, []);

    return { selectedGroupId, selectGroup };
};
