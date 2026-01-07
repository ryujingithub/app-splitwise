import { CreateGroupPayload, Group, GroupWithMembers } from "../types";

export interface AddMemberPayload {
    user_id: number;
    role?: string;
}

export const groupsApi = {
    getAll: async (): Promise<Group[]> => {
        const res = await fetch(`/api/groups`);
        if (!res.ok) throw new Error("Failed to fetch groups");
        const json = await res.json();
        return json;
    },

    getById: async (id: number): Promise<GroupWithMembers> => {
        if (!id) throw new Error("Group ID is required");
        const res = await fetch(`/api/groups/${id}`);
        if (!res.ok) throw new Error("Failed to fetch group");
        const json = await res.json();
        return json;
    },

    create: async (payload: CreateGroupPayload): Promise<{ id: number }> => {
        const res = await fetch(`/api/groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create group");
        return res.json();
    },

    delete: async (id: number): Promise<void> => {
        const res = await fetch(`/api/groups/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete group");
    },

    addMember: async (
        groupId: number,
        payload: AddMemberPayload
    ): Promise<void> => {
        const res = await fetch(`/api/groups/${groupId}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to add member");
    },

    removeMember: async (groupId: number, userId: number): Promise<void> => {
        const res = await fetch(`/api/groups/${groupId}/members/${userId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove member");
    },
};
