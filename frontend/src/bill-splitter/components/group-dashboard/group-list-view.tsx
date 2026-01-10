import { Group } from "@/bill-splitter/types/index.type";
import React from "react";
import GroupList from "./group-list";
import EmptyState from "./empty-dashboard-state";

interface GroupListViewProps {
    groups: Group[];
    onSelect: (id: string) => void;
    isLoading: boolean;
    navigate: (path: string) => void;
}

export const GroupListView: React.FC<GroupListViewProps> = ({
    groups,
    onSelect,
    isLoading,
    navigate,
}) => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Groups</h2>
        <GroupList groups={groups} onSelect={onSelect} />
        {groups.length === 0 && !isLoading && (
            <EmptyState
                message="No groups found."
                actionLabel="Create one now"
                onAction={() => navigate("/groups/create")}
            />
        )}
    </div>
);
export default GroupListView;
