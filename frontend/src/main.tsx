import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/auth-context";

import "./index.css";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <QueryClientProvider client={client}>
                <App />
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>,
);
