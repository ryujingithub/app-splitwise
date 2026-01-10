import {
    CreateGroupPayload,
    Group,
    GroupWithMembers,
} from "../types/index.type";

export interface AddMemberPayload {
    user_id: string;
    role?: string;
}

export const groupsApi = {
    getAll: async (): Promise<Group[]> => {
        const res = await fetch(`/api/groups`);
        if (!res.ok) throw new Error("Failed to fetch groups");
        const json = await res.json();
        return json;
    },

    getById: async (id: string): Promise<GroupWithMembers> => {
        if (!id) throw new Error("Group ID is required");
        const res = await fetch(`/api/groups/${id}`);
        if (!res.ok) throw new Error("Failed to fetch group");
        const json = await res.json();
        return json;
    },

    create: async (payload: CreateGroupPayload): Promise<{ id: string }> => {
        const res = await fetch(`/api/groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create group");
        return res.json();
    },

    delete: async (id: string): Promise<void> => {
        const res = await fetch(`/api/groups/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete group");
    },

    addMember: async (
        groupId: string,
        payload: AddMemberPayload
    ): Promise<void> => {
        const res = await fetch(`/api/groups/${groupId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to add member");
    },

    removeMember: async (groupId: string, userId: string): Promise<void> => {
        const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove member");
    },
};
