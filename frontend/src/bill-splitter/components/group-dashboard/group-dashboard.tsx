import { useGroupDashboard } from "@/bill-splitter/hooks/use-group-dashboard";
import React from "react";
import DashboardHeader from "./dashboard-header";
import GroupDetailView from "./group-detail-view";
import GroupListView from "./group-list-view";
import LoadingSpinner from "./loading-spinner";
import SettlementModal from "./settlement-modal";
export const GroupDashboard: React.FC<{ initialGroupId?: string }> = ({
    initialGroupId,
}) => {
    const {
        bills,
        groups,
        selectedGroup,
        memberDebts,
        isLoading,
        settlementCandidate,
        isSettling,
        setSettlementCandidate,
        handleSelectGroup,
        handleInitiateSettlement,
        handleConfirmSettlement,
        navigate,
    } = useGroupDashboard(initialGroupId);

    if (isLoading && !selectedGroup) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <DashboardHeader />

            {!selectedGroup ? (
                <GroupListView
                    groups={groups}
                    onSelect={handleSelectGroup}
                    isLoading={isLoading}
                    navigate={navigate}
                />
            ) : (
                <GroupDetailView
                    group={selectedGroup}
                    memberDebts={memberDebts}
                    bills={bills}
                    onBack={() => handleSelectGroup(undefined)}
                    onAddBill={() => navigate(`/`)}
                    onSettle={handleInitiateSettlement}
                />
            )}

            <SettlementModal
                candidate={settlementCandidate}
                isOpen={!!settlementCandidate}
                isProcessing={isSettling}
                onClose={() => setSettlementCandidate(null)}
                onConfirm={handleConfirmSettlement}
            />
        </div>
    );
};

export default GroupDashboard;
