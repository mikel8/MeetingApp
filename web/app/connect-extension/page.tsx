"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConnectExtensionPage() {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if user is logged in
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login?redirect=/connect-extension");
            }
        };
        checkUser();
    }, [router, supabase]);

    const generateCode = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("No active session");
            }

            // Generate a random 6-digit code
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Calculate expiration (5 minutes from now)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

            // Insert into database
            // Storing refresh_token to allow the extension to start a session
            const { error: insertError } = await supabase
                .from("extension_pair_codes")
                .insert({
                    code: newCode,
                    user_id: session.user.id,
                    refresh_token: session.refresh_token,
                    expires_at: expiresAt
                });

            if (insertError) throw insertError;

            setCode(newCode);
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Failed to generate code"
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div className="card" style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
                <h1 className="text-2xl" style={{ marginBottom: "1rem" }}>Connect Extension</h1>
                <p className="text-muted" style={{ marginBottom: "2rem" }}>
                    Generate a pairing code to authenticate your browser extension.
                </p>

                {error && (
                    <div style={{ color: "hsl(var(--destructive))", marginBottom: "1rem", padding: "0.5rem", border: "1px solid currentColor", borderRadius: "var(--radius)" }}>
                        {error}
                    </div>
                )}

                {!code ? (
                    <button
                        className="btn btn-primary w-full"
                        onClick={generateCode}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Pairing Code"}
                    </button>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeIn 0.5s ease" }}>
                        <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius)", fontSize: "2.5rem", fontWeight: "bold", letterSpacing: "0.5rem", color: "hsl(var(--primary))" }}>
                            {code}
                        </div>
                        <p className="text-sm text-muted">
                            This code expires in 5 minutes. Enter it in the extension options.
                        </p>
                        <button
                            className="btn w-full"
                            onClick={() => setCode(null)}
                            style={{ border: "1px solid hsl(var(--border))", backgroundColor: "transparent" }}
                        >
                            Generate New Code
                        </button>
                    </div>
                )}
            </div>
            <div style={{ marginTop: "2rem" }}>
                <Link href="/meetings" className="text-muted text-sm hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
