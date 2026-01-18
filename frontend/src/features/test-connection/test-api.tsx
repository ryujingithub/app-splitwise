// frontend/src/components/api-test.tsx
import { useState } from "react";

export const TestApi = () => {
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const testApi = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/test/ping");

            const data = {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url,
                body: null as unknown,
            };

            try {
                data.body = await response.json();
            } catch {
                data.body = await response.text();
            }

            setResult(JSON.stringify(data, null, 2));
        } catch (err) {
            setResult(
                JSON.stringify(
                    {
                        error: true,
                        name: err instanceof Error ? err.name : "Unknown",
                        message:
                            err instanceof Error ? err.message : String(err),
                        stack: err instanceof Error ? err.stack : undefined,
                    },
                    null,
                    2,
                ),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1rem", fontFamily: "monospace" }}>
            <button
                onClick={testApi}
                disabled={loading}
                style={{
                    padding: "0.5rem 1rem",
                    cursor: loading ? "wait" : "pointer",
                }}>
                {loading ? "Testing..." : "Test API Connection"}
            </button>

            {result && (
                <pre
                    style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#1e1e1e",
                        color: "#d4d4d4",
                        borderRadius: "4px",
                        overflow: "auto",
                        maxHeight: "400px",
                    }}>
                    {result}
                </pre>
            )}
        </div>
    );
};
