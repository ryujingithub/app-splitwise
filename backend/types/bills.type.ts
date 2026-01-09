export interface BillResponse {
    id: number;
    group_id: number;
    title: string;
    total_amount: number;
    payer_id: number;
    created_by: number;
    created_at: string;
    items: BillItemResponse[];
}

export interface BillItemResponse {
    id: number;
    bill_id: number;
    name: string;
    amount: number;
    quantity: number;
    assignments: BillItemAssignment[];
}

export interface BillItemAssignment {
    id: number;
    bill_item_id: number;
    user_id: number;
    paid_date: string | null;
}

// Request payload types
export interface CreateBillItemPayload {
    name: string;
    amount: number;
    quantity: number;
    assigned_user_ids: number[];
}

export interface CreateBillPayload {
    title: string;
    group_id: number;
    payer_id: number;
    created_by: number;
    // bill_date: string;
    raw_markdown?: string;
    items: CreateBillItemPayload[];
}

export interface UpdateBillPayload extends CreateBillPayload {
    udpated_at?: string;
}

export interface SettleDebtPayload {
    assignmentIds: number[];
}

// --- Internal SQL Row Types ---

export interface RawBillRow {
    // Bill Data
    bill_id: number;
    bill_group_id: number;
    bill_title: string;
    bill_total: number;
    // bill_date: string;
    bill_created_at: string;
    bill_created_by: number;
    bill_payer_id: number;

    // Item Data (Nullable due to LEFT JOIN)
    item_id: number | null;
    item_name: string | null;
    item_amount: number | null;
    item_quantity: number | null;

    // Assignment Data (Nullable)
    assign_id: number | null;
    assign_user_id: number | null;
    assign_paid_date: string | null;

    // User Data (Nullable)
    user_username: string | null;
    user_email: string | null;
}

export interface MemberBalance {
    id: number;
    name: string;
    email: string;
    netBalance: number;
    currency: string;
}

export interface GroupBalanceResponse {
    groupId: number;
    groupName: string;
    members: MemberBalance[];
}

// --- SQL Row Interfaces ---

export interface UserRow {
    id: number;
    username: string;
    email: string;
}

// Specific row type for the balance calculation query
export interface BalanceQueryRow {
    group_id: number;
    group_name: string;
    debtor_id: number;
    creditor_id: number;
    item_amount: number;
    item_quantity: number;
    item_id: number;
}

export interface SplitCountRow {
    bill_item_id: number;
    count: number;
}

export interface BaseUnpaidAssignment {
    debtor_id: number;
    creditor_id: number;
    item_amount: number;
    item_quantity: number;
    item_id: number;
}

export interface GroupUnpaidAssignment extends BaseUnpaidAssignment {
    group_id: number;
    group_name: string;
}

export type UnpaidResult = {
    users: UserRow[];
    userMap: Map<number, UserRow>;
    splitMap: Map<number, number>;
};

export type GroupedResult = UnpaidResult & {
    unpaidAssignments: GroupUnpaidAssignment[];
};
export type FlatResult = UnpaidResult & {
    unpaidAssignments: BaseUnpaidAssignment[];
};

export interface CalculateUnpaidBalancesFn {
    (groupByGroup: true): GroupedResult;
    (groupByGroup: false): FlatResult;
}
