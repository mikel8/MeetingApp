'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="card glass flex flex-col items-center gap-4" style={{ width: '320px' }}>
                <h1 className="text-2xl">Welcome</h1>
                <p className="text-muted text-sm text-center">Sign in to access your meetings</p>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? 'Redirecting...' : (
                        <div className="flex items-center gap-2">
                            <Chrome size={18} />
                            <span>Sign in with Google</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    )
}
