import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "../api/groups";
import { queryKeys } from "../lib/query-keys";
import { CreateGroupPayload } from "../types/index.type";

export const useGroups = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.groups.all,
        queryFn: groupsApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateGroupPayload) => groupsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => groupsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
        },
    });

    return {
        groups: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        createGroup: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        deleteGroup: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};
