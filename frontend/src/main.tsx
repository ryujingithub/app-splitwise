import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/auth-context";

import "./index.css";
import { TestApi } from "./features/test-connection/test-api";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={client}>
                <App />
                <TestApi />
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>,
);
