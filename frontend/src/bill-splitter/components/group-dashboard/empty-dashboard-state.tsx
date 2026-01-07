import { Button } from "@/components/ui/button";
import React from "react";

interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    message,
    actionLabel,
    onAction,
}) => (
    <div className="text-center py-10 border border-dashed rounded-lg">
        <p className="text-muted-foreground">{message}</p>
        {actionLabel && onAction && (
            <Button variant="link" onClick={onAction}>
                {actionLabel}
            </Button>
        )}
    </div>
);

export default EmptyState;
