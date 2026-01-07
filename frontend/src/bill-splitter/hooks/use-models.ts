import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { modelApi } from "../api/ai-models";
import { AIModel } from "../types/ai-model.types";

export const useModels = () => {
    const queryClient = useQueryClient();
    const QUERY_KEY = ["ai-models"];

    // 1. Default Query: Loads Local Data
    const query = useQuery<AIModel[]>({
        queryKey: QUERY_KEY,
        queryFn: modelApi.getLocal, // Default to local file
        staleTime: Infinity, // Local data is considered fresh forever unless we force update
    });

    // 2. Mutation: Fetches Remote Data and Updates Cache
    const syncMutation = useMutation({
        mutationFn: modelApi.fetchRemote,
        onSuccess: (remoteData) => {
            // Force update the cache with the new data from server
            queryClient.setQueryData(QUERY_KEY, remoteData);
            toast.success("Model list updated from server");
        },
        onError: () => {
            toast.error("Failed to sync with server. Using local list.");
        },
    });

    return {
        models: query.data || [],
        isLoading: query.isLoading,
        isSyncing: syncMutation.isPending,
        syncModels: syncMutation.mutate, // The function to call on button click
    };
};
