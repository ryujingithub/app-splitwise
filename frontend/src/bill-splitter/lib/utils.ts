import { Bill, MemberDebtSummary } from "../types";

export const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateString));
};

/**
 * Calculates exactly how much a user owes based on bill item assignments.
 * Logic: Item Amount / Number of Assignments = Share per person.
 */
export const calculateMemberDebt = (
    userId: number,
    bills: Bill[]
): MemberDebtSummary["billBreakdown"] => {
    const breakdown: MemberDebtSummary["billBreakdown"] = [];

    bills.forEach((bill) => {
        let userBillTotal = 0;

        // Iterate through every item in the bill
        bill.items?.forEach((item) => {
            const assignmentCount = item.assignments?.length || 0;

            // Skip if no one is assigned or empty
            if (assignmentCount === 0) return;

            // Check if target user is assigned to this item
            const isAssigned = item.assignments.some(
                (a) => a.user_id === userId
            );

            if (isAssigned) {
                // Split the item amount equally among assigned users
                const splitAmount = item.amount / assignmentCount;
                userBillTotal += splitAmount;
            }
        });

        // Only add to breakdown if user owes > 0 for this bill
        if (userBillTotal > 0) {
            breakdown.push({
                billId: bill.id,
                title: bill.title,
                date: bill.created_at,
                amount: userBillTotal,
            });
        }
    });

    return breakdown;
};
