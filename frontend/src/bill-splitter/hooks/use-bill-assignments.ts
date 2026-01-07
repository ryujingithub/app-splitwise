// src/bill-splitter/hooks/use-bill-assignments.ts
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { billsApi } from "../api/bills";
import {
    ReviewItem,
    TransformedGroup,
    TransformedMember,
    CreateBillItemPayload,
    CreateBillPayload,
} from "../types";
import { useGroup } from "./use-group";
import { useGroups } from "./use-groups";

interface UseBillAssignmentProps {
    initialItems: ReviewItem[];
    rawMarkdown: string;
    initialGroupId?: string;
    onComplete: () => void;
}

export const useBillAssignment = ({
    initialItems,
    rawMarkdown,
    initialGroupId,
    onComplete,
}: UseBillAssignmentProps) => {
    const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialItems);
    const [targetGroupId, setTargetGroupId] = useState<string>(
        initialGroupId || ""
    );
    const [payerId, setPayerId] = useState<string>("");
    const [billDate, setBillDate] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Data Fetching
    const { groups = [] } = useGroups();

    const numericGroupId = targetGroupId
        ? parseInt(targetGroupId, 10)
        : undefined;

    const { group: activeGroup } = useGroup(numericGroupId ?? null);

    // 2. Data Transformation
    const groupOptions = useMemo<Record<string, TransformedGroup>>(() => {
        const options: Record<string, TransformedGroup> = {};

        groups.forEach((g) => {
            options[g.id.toString()] = {
                id: g.id.toString(),
                name: g.name,
                memberIds: [],
                members: {},
            };
        });

        if (activeGroup && activeGroup.members) {
            const membersRecord = activeGroup.members.reduce<
                Record<string, TransformedMember>
            >((acc, m) => {
                acc[m.id.toString()] = {
                    id: m.id.toString(),
                    name: m.username,
                    role: m.role,
                };
                return acc;
            }, {});

            options[activeGroup.id.toString()] = {
                id: activeGroup.id.toString(),
                name: activeGroup.name,
                memberIds: activeGroup.members.map((m) => m.id.toString()),
                members: membersRecord,
            };
        }

        return options;
    }, [groups, activeGroup]);

    const activeGroupForReview = targetGroupId
        ? groupOptions[targetGroupId]
        : undefined;

    // Derived: Get list of members for the dropdown
    const availablePayers = useMemo(() => {
        if (!activeGroupForReview) return [];
        return activeGroupForReview.memberIds
            .map((id) => activeGroupForReview.members[id])
            .filter((m): m is TransformedMember => !!m);
    }, [activeGroupForReview]);

    // 3. Effects

    // Auto-assign members when group loads
    useEffect(() => {
        if (activeGroupForReview && activeGroupForReview.memberIds.length > 0) {
            const allMemberIds = activeGroupForReview.memberIds;

            setReviewItems((prevItems) =>
                prevItems.map((item) => ({
                    ...item,
                    selectedMemberIds: allMemberIds,
                }))
            );
        }
    }, [activeGroupForReview?.id, activeGroupForReview?.memberIds.length]);

    // Reset or Default Payer when group changes
    useEffect(() => {
        if (availablePayers.length > 0) {
            setPayerId("");
        } else {
            setPayerId("");
        }
    }, [targetGroupId, availablePayers.length]);

    // 4. Handlers
    const handleUpdateItem = useCallback(
        (itemId: string, memberIds: string[]) => {
            setReviewItems((prev) =>
                prev.map((item) =>
                    item.id === itemId
                        ? { ...item, selectedMemberIds: memberIds }
                        : item
                )
            );
        },
        []
    );

    const handleAddItems = useCallback(
        (
            items: Array<{
                description: string;
                quantity: number;
                amount: number;
            }>
        ) => {
            if (!activeGroupForReview) {
                toast.error("Please select a group first");
                return;
            }

            const newItems: ReviewItem[] = items.map((item) => ({
                id: `manual-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 9)}`,
                description: item.description,
                quantity: item.quantity,
                amount: item.amount,
                selectedMemberIds: activeGroupForReview.memberIds,
            }));

            setReviewItems((prev) => [...prev, ...newItems]);

            toast.success(
                `${items.length} item${
                    items.length > 1 ? "s" : ""
                } added successfully`
            );
        },
        [activeGroupForReview]
    );

    const handleCommit = async () => {
        if (!targetGroupId) {
            toast.error("Please select a group.");
            return;
        }

        if (!payerId) {
            toast.error("Please select who paid the bill.");
            return;
        }

        setIsSubmitting(true);
        try {
            const billItems: CreateBillItemPayload[] = reviewItems.map(
                (item) => ({
                    name: item.description,
                    amount: item.amount,
                    quantity: item.quantity,
                    assigned_user_ids: item.selectedMemberIds.map((id) =>
                        parseInt(id, 10)
                    ),
                })
            );

            const payload: CreateBillPayload = {
                title: `${title} - ${new Date().toLocaleDateString()}`,
                group_id: parseInt(targetGroupId, 10),
                payer_id: parseInt(payerId, 10),
                bill_date: billDate,
                raw_markdown: rawMarkdown,
                created_by: 1,
                items: billItems,
            };

            await billsApi.create(payload);

            toast.success("Bill and assignments saved successfully!");
            onComplete();
        } catch (error) {
            console.error(error);
            const message =
                error instanceof Error ? error.message : "Failed to save bill";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        reviewItems,
        targetGroupId,
        billDate,
        title,
        payerId,
        groupsRaw: groups,
        isSubmitting,
        groupOptions,
        activeGroupForReview,
        availablePayers,
        // Handlers
        setTargetGroupId,
        setPayerId,
        setBillDate,
        setTitle,
        handleUpdateItem,
        handleAddItems,
        handleCommit,
    };
};
