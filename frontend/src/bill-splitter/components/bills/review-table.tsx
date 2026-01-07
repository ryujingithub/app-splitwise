import React, { useState } from "react";
import { Check, Save } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ReviewItem, TransformedGroup } from "@/bill-splitter/types";
import { formatCurrency } from "@/bill-splitter/lib/format-currency";

interface ReviewTableProps {
    items: ReviewItem[];
    activeGroup?: TransformedGroup;
    onUpdateItem: (itemId: string, memberIds: string[]) => void;
    onSave: () => void;
}

const ReviewTable: React.FC<ReviewTableProps> = ({
    items,
    activeGroup,
    onUpdateItem,
    onSave,
}) => {
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    const toggleItemSelection = (itemId: string): void => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleMemberSelection = (memberId: string): void => {
        if (selectedItemIds.length === 0) return;
        setSelectedMemberIds((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const assignMembers = (): void => {
        if (selectedItemIds.length === 0 || selectedMemberIds.length === 0)
            return;
        selectedItemIds.forEach((itemId) =>
            onUpdateItem(itemId, selectedMemberIds)
        );
        setSelectedItemIds([]);
        setSelectedMemberIds([]);
    };

    const toggleMemberForItem = (
        itemId: string,
        currentIds: string[],
        memberId: string
    ): void => {
        const newIds = currentIds.includes(memberId)
            ? currentIds.filter((id) => id !== memberId)
            : [...currentIds, memberId];
        onUpdateItem(itemId, newIds);
    };

    const MemberAssignmentBar = () => {
        if (!activeGroup) return null;
        return (
            <div className="flex flex-wrap gap-2 p-4 border rounded-md bg-muted">
                {Object.values(activeGroup.members).map((member) => {
                    const isSelected = selectedMemberIds.includes(member.id);
                    return (
                        <Button
                            key={member.id}
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => toggleMemberSelection(member.id)}
                            disabled={selectedItemIds.length === 0}
                            className={cn(
                                "h-8 text-xs transition-all",
                                isSelected
                                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                    : "text-muted-foreground hover:text-foreground"
                            )}>
                            {isSelected && <Check className="w-3 h-3 mr-1" />}
                            {member.name}
                        </Button>
                    );
                })}
                <Button
                    size="sm"
                    onClick={assignMembers}
                    disabled={
                        selectedItemIds.length === 0 ||
                        selectedMemberIds.length === 0
                    }
                    className="h-8 text-xs ml-auto">
                    <Save className="w-3 h-3 mr-1" />
                    Assign to Selected Items
                </Button>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <MemberAssignmentBar />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={
                                        selectedItemIds.length ===
                                            items.length && items.length > 0
                                    }
                                    onCheckedChange={(checked) =>
                                        setSelectedItemIds(
                                            checked
                                                ? items.map((i) => i.id)
                                                : []
                                        )
                                    }
                                />
                            </TableHead>
                            <TableHead className="w-[30%]">Item</TableHead>
                            <TableHead className="w-[10%]">Qty</TableHead>
                            <TableHead className="w-[15%]">Price</TableHead>
                            <TableHead className="w-[15%]">
                                Total Price
                            </TableHead>
                            <TableHead>Split Between</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            const isItemSelected = selectedItemIds.includes(
                                item.id
                            );
                            return (
                                <TableRow
                                    key={item.id}
                                    className={cn(
                                        isItemSelected && "bg-muted/50",
                                        "cursor-pointer"
                                    )}
                                    onClick={() =>
                                        toggleItemSelection(item.id)
                                    }>
                                    <TableCell
                                        onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isItemSelected}
                                            onCheckedChange={() =>
                                                toggleItemSelection(item.id)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.description}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                        {formatCurrency(item.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(
                                            item.amount * item.quantity
                                        )}
                                    </TableCell>
                                    <TableCell
                                        onClick={(e) => e.stopPropagation()}>
                                        {!activeGroup ? (
                                            <span className="text-muted-foreground text-sm italic">
                                                Select a group to assign members
                                            </span>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {Object.values(
                                                    activeGroup.members
                                                ).map((member) => {
                                                    const isSelected =
                                                        item.selectedMemberIds.includes(
                                                            member.id
                                                        );
                                                    return (
                                                        <Button
                                                            key={member.id}
                                                            size="sm"
                                                            variant={
                                                                isSelected
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            onClick={() =>
                                                                toggleMemberForItem(
                                                                    item.id,
                                                                    item.selectedMemberIds,
                                                                    member.id
                                                                )
                                                            }
                                                            className={cn(
                                                                "h-8 text-xs transition-all",
                                                                isSelected
                                                                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            )}>
                                                            {isSelected && (
                                                                <Check className="w-3 h-3 mr-1" />
                                                            )}
                                                            {member.name}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end py-4">
                <Button
                    onClick={onSave}
                    disabled={!activeGroup || items.length === 0}
                    className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Bill & Assignments
                </Button>
            </div>
        </div>
    );
};

export default ReviewTable;
