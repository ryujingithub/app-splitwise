import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { RegisterFormData } from "../types/auth";

const useRegister = () => {
    return useMutation({
        mutationFn: (formData: RegisterFormData) => authApi.register(formData),
        onError: (error) => {
            console.error(
                error instanceof Error ? error.message : "Something went wrong"
            );
            console.error("Registration failed");
        },
    });
};

export default useRegister;
