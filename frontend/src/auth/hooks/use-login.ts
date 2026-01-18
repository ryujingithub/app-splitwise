import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { LoginFormData } from "../types/auth";
import { useAuth } from "./use-auth";

const useLogin = () => {
    const { login } = useAuth();

    return useMutation({
        mutationFn: (formData: LoginFormData) => authApi.login(formData),
        onSuccess: (response) => {
            login(response.user, response.token);
        },
        onError: (error) => {
            console.error(
                error instanceof Error ? error.message : "Something went wrong",
            );
        },
    });
};

export default useLogin;
