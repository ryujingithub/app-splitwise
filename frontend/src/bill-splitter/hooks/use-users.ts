// src/hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { queryKeys } from "../lib/query-keys";
import { CreateUserRequest, UpdateUserRequest } from "../types/user.type";

export function useUsers() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.users.all,
        queryFn: usersApi.getAll,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateUserRequest) => usersApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateUserRequest;
        }) => usersApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });

    console.log(`USERS DATA: ${JSON.stringify(query.data, null, 2)}`);

    return {
        users: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        createUser: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateUser: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        deleteUser: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
}
