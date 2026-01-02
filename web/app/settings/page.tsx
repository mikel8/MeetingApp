import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return redirect('/login')
    }

    const emailInitial = (user.email && user.email[0]) ? user.email[0].toUpperCase() : '?'

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem' }}>
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl">Settings</h1>
                <Link href="/meetings" className="btn glass">
                    &larr; Back to Dashboard
                </Link>
            </header>

            <div className="card glass">
                <div className="flex flex-col gap-4">
                    <section>
                        <h2 className="text-lg mb-4">Account</h2>
                        <div className="flex items-center gap-4 text-muted">
                            <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center text-xl font-bold">
                                {emailInitial}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{user.email}</p>
                                <p className="text-sm">Signed in with Google</p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-border my-4"></div>

                    <section>
                        <h2 className="text-lg mb-4">Support & Legal</h2>
                        <ul className="flex flex-col gap-2">
                            <li>
                                <a href="mailto:eastbrightmarketing1@gmail.com" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                    Contact Support
                                </a>
                            </li>
                            <li>
                                <Link href="/privacy" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </section>

                    <div className="border-t border-border my-4"></div>

                    <section>
                        <form action={signOut}>
                            <button type="submit" className="btn btn-destructive">
                                Sign Out
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    )
}
