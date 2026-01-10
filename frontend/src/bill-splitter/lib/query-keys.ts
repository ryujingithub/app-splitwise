export const queryKeys = {
    users: {
        all: ["users"] as const,
        detail: (id: string) => ["users", id] as const,
    },
    groups: {
        all: ["groups"] as const,
        detail: (id: string) => ["groups", id] as const,
        members: (id: string) => ["groups", id, "members"] as const,
    },
    bills: {
        all: ["bills"] as const,
        detail: (id: string) => ["bills", id] as const,
        byGroup: (groupId: string) => ["bills", "group", groupId] as const,
    },
    balances: {
        global: ["balances", "global"] as const,
        groupV2: ["balances", "group-v2"] as const,
    },
} as const;
