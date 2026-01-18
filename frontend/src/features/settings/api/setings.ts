import { User } from "@/auth/types/auth";
import { Group, GroupMember } from "@/bill-splitter/types/index.type";
import {
    UpdateUsernamePayload,
    UpdateEmailPayload,
    ChangePasswordPayload,
    UpdateMemberRolePayload,
} from "../types/settings.type";

const API_BASE = "/api";

const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Something went wrong");
    }
    return response.json();
};

// User API
export const fetchCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me`);
    return handleResponse<User>(res);
};

export const checkUsernameAvailability = async (
    username: string
): Promise<{ available: boolean }> => {
    const res = await fetch(
        `${API_BASE}/users/check-username?username=${encodeURIComponent(username)}`
    );
    return handleResponse(res);
};

export const updateUsername = async (
    payload: UpdateUsernamePayload
): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/username`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse<User>(res);
};

export const updateEmail = async (
    payload: UpdateEmailPayload
): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse<User>(res);
};

export const changePassword = async (
    payload: ChangePasswordPayload
): Promise<void> => {
    const res = await fetch(`${API_BASE}/users/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
};

export const deactivateAccount = async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/users/me/deactivate`, {
        method: "POST",
    });
    return handleResponse(res);
};

export const updateDefaultGroup = async (
    groupId: string | null
): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/me/default-group`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
    });
    return handleResponse<User>(res);
};

// Groups API
export const fetchUserGroups = async (): Promise<Group[]> => {
    const res = await fetch(`${API_BASE}/groups/my-groups`);
    return handleResponse<Group[]>(res);
};

export const fetchGroupMembers = async (
    groupId: string
): Promise<GroupMember[]> => {
    const res = await fetch(`${API_BASE}/groups/${groupId}/members`);
    return handleResponse<GroupMember[]>(res);
};

export const updateMemberRole = async (
    groupId: string,
    payload: UpdateMemberRolePayload
): Promise<GroupMember> => {
    const res = await fetch(
        `${API_BASE}/groups/${groupId}/members/${payload.memberId}/role`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: payload.role }),
        }
    );
    return handleResponse<GroupMember>(res);
};

export const removeMember = async (
    groupId: string,
    memberId: string
): Promise<void> => {
    const res = await fetch(
        `${API_BASE}/groups/${groupId}/members/${memberId}`,
        {
            method: "DELETE",
        }
    );
    return handleResponse(res);
};
