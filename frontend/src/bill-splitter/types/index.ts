import { z } from "zod";
import { User } from "./user.type";

export interface Group {
    id: number;
    name: string;
    parent_group_id?: number | null;
    created_at: string;
}

// --- API RESPONSES (Nested Data) ---

export interface GroupMember {
    id: number;
    group_id: number;
    role: "admin" | "member";
    username: string;
    email: string;
}

export interface GroupWithMembers extends Group {
    members: GroupMember[];
}

export interface BillItemAssignment {
    id: number;
    bill_item_id: number;
    user_id: number;
    paid_date: string | null;
}

export interface BillItem {
    id: number;
    bill_id: number;
    name: string;
    quantity: number;
    amount: number; // Total cost (cents or float based on DB)
    assignments: BillItemAssignment[];
}

export interface Bill {
    id: number;
    group_id: number;
    title: string;
    raw_markdown?: string;
    total_amount: number;
    payer_id: number;
    bill_date: string;
    created_by: number;
    created_at: string;
    items: BillItem[];
}

// --- API PAYLOADS (Write Operations) ---

export interface CreateGroupPayload {
    name: string;
    parent_group_id?: number | null;
}

export interface AddGroupMemberPayload {
    user_id: number;
    role?: "admin" | "member";
}

// Nested payload for creating a bill
export interface CreateBillItemPayload {
    name: string;
    quantity: number;
    amount: number;
    assigned_user_ids: number[]; // Array of User IDs
}

export interface CreateBillPayload {
    title: string;
    group_id: number;
    payer_id: number;
    bill_date: string;
    created_by: number;
    raw_markdown?: string;
    items: CreateBillItemPayload[];
}

export interface UpdateBillPayload extends CreateBillPayload {
    updated_at?: string;
}

// --- VIEW MODELS (Derived / Calculated for UI) ---

export interface BillDebtShare {
    billId: number;
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
    id: string; // Temporary UUID for React keys
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
    assignmentIds: number[];
}

export interface RuntimeGroupMember extends GroupMember {
    user_id?: number;
}

export interface GroupMemberBalance {
    userId: number;
    name: string;
    email: string;
    balance: number;
}

export interface GroupBalanceResponse {
    groupId: number;
    groupName: string;
    members: GroupMemberBalance[];
}
