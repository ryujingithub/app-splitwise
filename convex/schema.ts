// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    groups: defineTable({
        name: v.string(),
        parentGroupId: v.optional(v.id("groups")),
    }).index("by_parent", ["parentGroupId"]),

    users: defineTable({
        username: v.string(),
        name: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        defaultGroupId: v.optional(v.id("groups")),
        role: v.union(
            v.literal("member"),
            v.literal("admin"),
            v.literal("system_admin"),
        ),
        isActive: v.boolean(),
        deletedAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_is_active", ["isActive"]),

    groupMembers: defineTable({
        groupId: v.id("groups"),
        userId: v.id("users"),
        role: v.optional(v.string()),
        joinedAt: v.number(),
    })
        .index("by_group", ["groupId"])
        .index("by_user", ["userId"])
        .index("by_group_user", ["groupId", "userId"]),

    bills: defineTable({
        groupId: v.id("groups"),
        title: v.string(),
        rawMarkdown: v.optional(v.string()),
        totalAmount: v.number(),
        currency: v.string(),
        splitType: v.string(),
        payerId: v.id("users"),
        createdBy: v.id("users"),
    })
        .index("by_group", ["groupId"])
        .index("by_payer", ["payerId"]),

    billItems: defineTable({
        billId: v.id("bills"),
        name: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
    }).index("by_bill", ["billId"]),

    billItemAssignments: defineTable({
        billItemId: v.id("billItems"),
        userId: v.id("users"),
        shareAmount: v.number(),
        settledAt: v.optional(v.number()),
    })
        .index("by_bill_item", ["billItemId"])
        .index("by_user", ["userId"])
        .index("by_item_user", ["billItemId", "userId"]),

    settlements: defineTable({
        groupId: v.id("groups"),
        fromUserId: v.id("users"),
        toUserId: v.id("users"),
        amount: v.number(),
        currency: v.string(),
        note: v.optional(v.string()),
    })
        .index("by_group", ["groupId"])
        .index("by_from_user", ["fromUserId"])
        .index("by_to_user", ["toUserId"]),
});
