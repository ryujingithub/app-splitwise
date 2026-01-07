import React from "react";
import { Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Group } from "@/bill-splitter/types";

interface GroupListProps {
    groups: Group[];
    onSelect: (id: number) => void;
}

const GroupList = ({ groups, onSelect }: GroupListProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
                <Card
                    key={g.id}
                    className="cursor-pointer hover:border-primary transition-colors group"
                    onClick={() => onSelect(g.id)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">
                            {g.name}
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground pt-4 flex items-center">
                            Select to view debts
                            <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default GroupList;
