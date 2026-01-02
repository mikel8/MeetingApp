import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/" className="text-muted text-sm hover:underline">
                    &larr; Back to Briefly AI
                </Link>
            </header>

            <main className="prose">
                <h1 className="text-2xl" style={{ marginBottom: '0.5rem' }}>Terms of Service — Briefly AI – Smart Meeting Notes</h1>
                <p className="text-muted" style={{ marginBottom: '3rem' }}>Effective date: January 2, 2026</p>

                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    By using Briefly AI (the Chrome extension and web application), you agree to these Terms.
                </p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Use of the service</h2>
                    <p className="text-muted">
                        You may use Briefly AI to record meetings and store recordings in your private dashboard.
                        You are responsible for ensuring that you have the legal right and permission to record any audio or video.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Your content</h2>
                    <p className="text-muted">
                        You retain ownership of your recordings.
                        You grant Briefly AI permission to store and process recordings solely for the purpose of providing the service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Prohibited use</h2>
                    <p className="text-muted">
                        You agree not to misuse the service, attempt unauthorized access, or use Briefly AI in violation of applicable laws.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Availability</h2>
                    <p className="text-muted">
                        Briefly AI is provided on an “as is” basis.
                        We may modify or discontinue parts of the service at any time.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Limitation of liability</h2>
                    <p className="text-muted">
                        To the maximum extent permitted by law, Briefly AI is not liable for indirect, incidental, or consequential damages.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Contact</h2>
                    <p className="text-muted">For support questions, contact:</p>
                    <p className="text-muted"><a href="mailto:eastbrightmarketing1@gmail.com" className="text-primary hover:underline">eastbrightmarketing1@gmail.com</a></p>
                </section>
            </main>
        </div>
    );
}
