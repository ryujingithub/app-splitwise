// src/components/bill-splitter/BillAssignmentManager.tsx
import React, { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import GroupDestinationSelector from "./group-destination-selector";
import PayerSelector from "./payer-selector";
import ReviewTable from "./review-table";
import AddItemForm from "./add-item-form";
import { ReviewItem } from "@/bill-splitter/types";
import { useBillAssignment } from "@/bill-splitter/hooks/use-bill-assignments";

interface BillAssignmentManagerProps {
    initialItems: ReviewItem[];
    rawMarkdown: string;
    initialGroupId?: string;
    onBack: () => void;
    onComplete: () => void;
}

const BillAssignmentManager: React.FC<BillAssignmentManagerProps> = ({
    initialItems,
    rawMarkdown,
    initialGroupId,
    onBack,
    onComplete,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);

    const {
        reviewItems,
        targetGroupId,
        payerId,
        groupsRaw,
        groupOptions,
        activeGroupForReview,
        availablePayers,
        isSubmitting,
        handleAddItems,
        // Handlers
        setTargetGroupId,
        setPayerId,
        handleUpdateItem,
        handleCommit,
    } = useBillAssignment({
        initialItems,
        rawMarkdown,
        initialGroupId,
        onComplete,
    });

    const toggleAddForm = () => {
        setShowAddForm((prev) => !prev);
    };

    return (
        <Card className="animate-in fade-in slide-in-from-right-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Assign & Review</CardTitle>
                    <CardDescription>
                        Select the group and the payer, then confirm item
                        assignments.
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    disabled={isSubmitting}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Edit Markdown
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Header Controls */}
                <div className="bg-muted/30 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GroupDestinationSelector
                        groups={groupOptions}
                        groupIds={groupsRaw.map((g) => g.id.toString())}
                        selectedId={targetGroupId}
                        onSelect={setTargetGroupId}
                    />

                    <PayerSelector
                        members={availablePayers}
                        selectedPayerId={payerId}
                        onSelect={setPayerId}
                        disabled={!targetGroupId}
                    />
                </div>

                {/* Add Item Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={toggleAddForm}
                        variant="outline"
                        size="sm"
                        className="gap-2">
                        <Plus className="w-4 h-4" />
                        {showAddForm ? "Close" : "Add Item"}
                    </Button>
                </div>

                {/* Add Item Form */}
                {showAddForm && (
                    <AddItemForm
                        onAdd={handleAddItems}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                <ReviewTable
                    items={reviewItems}
                    activeGroup={activeGroupForReview}
                    onUpdateItem={handleUpdateItem}
                    onSave={handleCommit}
                />
            </CardContent>
        </Card>
    );
};

export default BillAssignmentManager;
