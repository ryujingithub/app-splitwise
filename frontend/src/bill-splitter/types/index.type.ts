import { User } from "@/auth/types/auth";
import { z } from "zod";

export interface ConvexDefaultProps {
    _id: string;
    _creationTime: string;
}

export interface Group extends ConvexDefaultProps {
    name: string;
    parent_group_id?: string | null;
}

// --- API RESPONSES (Nested Data) ---

export interface GroupMember extends ConvexDefaultProps {
    group_id: string;
    role: "admin" | "member";
    user_id: string;
    username: string;
    email: string;
}

export interface GroupWithMembers extends Group {
    members: GroupMember[];
}

export interface BillItemAssignment extends ConvexDefaultProps {
    bill_item_id: string;
    user_id: string;
    paid_date: string | null;
}

export interface BillItem extends ConvexDefaultProps {
    bill_id: string;
    name: string;
    quantity: number;
    amount: number; // Total cost (cents or float based on DB)
    assignments: BillItemAssignment[];
}

export interface Bill extends ConvexDefaultProps {
    group_id: string;
    title: string;
    raw_markdown?: string;
    total_amount: number;
    payer_id: string;
    bill_date: string;
    created_by: number;
    created_at: string;
    items: BillItem[];
}

// --- API PAYLOADS (Write Operations) ---

export interface CreateGroupPayload {
    name: string;
    parent_group_id?: string | null;
}

export interface AddGroupMemberPayload {
    user_id: string;
    role?: "admin" | "member";
}

// Nested payload for creating a bill
export interface CreateBillItemPayload {
    name: string;
    quantity: number;
    amount: number;
    assigned_user_ids: string[]; // Array of User IDs
}

export interface CreateBillPayload {
    title: string;
    group_id: string;
    payer_id: string;
    bill_date: string;
    created_by: string;
    raw_markdown?: string;
    items: CreateBillItemPayload[];
}

export interface UpdateBillPayload extends CreateBillPayload {
    updated_at?: string;
}

// --- VIEW MODELS (Derived / Calculated for UI) ---

export interface BillDebtShare {
    billId: string;
    title: string;
    date: string;
    amount: number;
}

export interface MemberDebtSummary {
    user: User;
    totalOwed: number;
    billBreakdown: BillDebtShare[];
}

// --- ZOD SCHEMAS ---

export const parserSchema = z.object({
    markdown: z.string().min(1, "Input cannot be empty"),
});

export interface ParsedMarkdownItem {
    description: string;
    quantity: number;
    amount: number; // Total amount for this line
}

export interface ReviewItem {
    id: string;
    description: string;
    quantity: number;
    amount: number;
    selectedMemberIds: string[]; // Controlled state for checkboxes/selects
}

export interface TransformedMember {
    id: string;
    name: string;
    role: string;
}

export interface TransformedGroup {
    id: string;
    name: string;
    memberIds: string[];
    members: Record<string, TransformedMember>;
}

export interface MemberOutstandingDebt {
    user: User;
    totalOutstanding: number;
    assignmentIds: string[];
}

export interface RuntimeGroupMember extends GroupMember {
    isActive?: boolean;
}

export interface GroupMemberBalance {
    userId: string;
    name: string;
    email: string;
    balance: number;
}

export interface GroupBalanceResponse {
    groupId: string;
    groupName: string;
    members: GroupMemberBalance[];
}
