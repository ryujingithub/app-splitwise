// src/components/bill-splitter/AddItemForm.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DraftItem {
    id: string;
    description: string;
    quantity: number;
    amount: number;
}

interface AddItemFormProps {
    onAdd: (
        items: Array<{ description: string; quantity: number; amount: number }>
    ) => void;
    onCancel: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAdd, onCancel }) => {
    const [draftItems, setDraftItems] = useState<DraftItem[]>([
        { id: "draft-1", description: "", quantity: 1, amount: 0 },
    ]);

    // Auto-add new row when last item is complete
    useEffect(() => {
        const lastItem = draftItems[draftItems.length - 1];
        if (lastItem.description.trim() && lastItem.amount > 0) {
            setDraftItems((prev) => [
                ...prev,
                {
                    id: `draft-${Date.now()}`,
                    description: "",
                    quantity: 1,
                    amount: 0,
                },
            ]);
        }
    }, [draftItems]);

    const handleAdd = () => {
        const validItems = draftItems
            .filter((item) => item.description.trim() && item.amount > 0)
            .map((item) => ({
                description: item.description.trim(),
                quantity: item.quantity,
                amount: Math.round(item.amount * 100), // Convert to cents
            }));

        if (validItems.length === 0) return;

        onAdd(validItems);

        // Reset form with one empty row
        setDraftItems([
            {
                id: `draft-${Date.now()}`,
                description: "",
                quantity: 1,
                amount: 0,
            },
        ]);
    };

    const updateField = (
        id: string,
        field: keyof DraftItem,
        value: string | number
    ) => {
        setDraftItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const hasValidItems = draftItems.some(
        (item) => item.description.trim() && item.amount > 0
    );

    return (
        <div className="bg-muted/30 p-4 rounded-lg border">
            <h3 className="text-sm font-medium mb-3">Add New Items</h3>
            <div className="space-y-3">
                {draftItems.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) =>
                                updateField(
                                    item.id,
                                    "description",
                                    e.target.value
                                )
                            }
                            className="px-3 py-2 border rounded-md bg-background text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                                updateField(
                                    item.id,
                                    "quantity",
                                    Math.max(1, parseInt(e.target.value) || 1)
                                )
                            }
                            min="1"
                            className="px-3 py-2 border rounded-md bg-background text-sm"
                        />
                        <input
                            type="number"
                            placeholder="Amount (AUD)"
                            value={item.amount || ""}
                            onChange={(e) =>
                                updateField(
                                    item.id,
                                    "amount",
                                    Math.max(0, parseFloat(e.target.value) || 0)
                                )
                            }
                            min="0.01"
                            step="0.01"
                            className="px-3 py-2 border rounded-md bg-background text-sm"
                        />
                        <div className="hidden md:block" />
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={handleAdd} disabled={!hasValidItems} size="sm">
                    Add Items
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm">
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default AddItemForm;
