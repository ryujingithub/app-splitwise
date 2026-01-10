import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { router } from "./routes/index.tsx";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth/auth-context.tsx";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
                <Toaster richColors position="top-center" />
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>
);
