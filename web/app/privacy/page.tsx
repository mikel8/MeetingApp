import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href="/" className="text-muted text-sm hover:underline">
                    &larr; Back to MeetingApp
                </Link>
            </header>

            <main className="prose">
                <h1 className="text-2xl" style={{ marginBottom: '0.5rem' }}>Privacy Policy — MeetingApp</h1>
                <p className="text-muted" style={{ marginBottom: '3rem' }}>Effective date: January 2, 2026</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>What MeetingApp does</h2>
                    <p className="text-muted">
                        MeetingApp is a Chrome extension and web application that allows you to record meetings and access those recordings in a private dashboard.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Information we collect</h2>
                    <p className="text-muted">We collect the following information when you use MeetingApp:</p>
                    <ul className="text-muted" style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li><strong>Account information:</strong> your Google account email address and basic profile identifier used for authentication.</li>
                        <li><strong>Recordings:</strong> audio and video recordings you choose to capture using the MeetingApp Chrome extension.</li>
                        <li><strong>Meeting metadata:</strong> timestamps, recording duration, file identifiers, and diagnostic information required for reliable uploads.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>How we use your information</h2>
                    <p className="text-muted">We use your information to:</p>
                    <ul className="text-muted" style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>Authenticate you and maintain your session</li>
                        <li>Upload, store, and display your recordings</li>
                        <li>Provide customer support</li>
                        <li>Improve product reliability and performance</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Where your data is stored</h2>
                    <p className="text-muted">
                        Recordings and associated metadata are stored using our backend infrastructure, including Supabase database and object storage services.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Sharing</h2>
                    <p className="text-muted">We do not sell your personal information.</p>
                    <p className="text-muted">We do not share your recordings with third parties except as required to provide the service (for example, infrastructure and storage providers).</p>
                    <p className="text-muted">Recordings are accessible only to your account unless you explicitly share them.</p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Data retention</h2>
                    <p className="text-muted">
                        We retain recordings and metadata until you delete them or request account deletion.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Deleting your data</h2>
                    <ul className="text-muted" style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                        <li>You may delete recordings from your dashboard where available.</li>
                        <li>To request deletion of your entire account and associated data, contact us at the email below.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Security</h2>
                    <p className="text-muted">
                        We use authentication and access controls designed to prevent unauthorized access to your recordings.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Children’s privacy</h2>
                    <p className="text-muted">
                        MeetingApp is not intended for children under the age of 13.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Changes to this policy</h2>
                    <p className="text-muted">
                        We may update this Privacy Policy from time to time. The effective date will be updated when changes are made.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 className="text-xl" style={{ marginBottom: '1rem' }}>Contact</h2>
                    <p className="text-muted">For privacy questions or data deletion requests, contact:</p>
                    <p className="text-muted"><a href="mailto:eastbrightmarketing1@gmail.com" className="text-primary hover:underline">eastbrightmarketing1@gmail.com</a></p>
                </section>
            </main>
        </div>
    );
}
