import Link from 'next/link'
import styles from './landing.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <header className="container">
        <div className={styles.header}>
          <div className={styles.brand}>Briefly AI</div>
        </div>
      </header>

      <main className={`container ${styles.hero}`}>
        <h1 className={styles.title}>Briefly AI</h1>
        <p className={styles.subtitle}>
          Smart Meeting Notes. Record meetings with our Chrome extension and review them later in your private dashboard.
        </p>

        <div className={styles.actions}>
          <a
            href="https://chromewebstore.google.com/detail/briefly-ai-%E2%80%93-smart-meetin/ocialdcjgkdkebggglngkpeiideimdoo"
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.ctaBtn}`}
          >
            Install Chrome Extension
          </a>
          <Link href="/login" className={`btn glass ${styles.ctaBtn}`}>
            Sign in
          </Link>
        </div>

        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.grid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepText}>Install the Chrome extension</div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepText}>Sign in with Google</div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepText}>Record meetings from your browser</div>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepText}>Access and replay recordings anytime</div>
            </div>
          </div>
        </div>

        <p className={styles.privacyNote}>
          Your recordings are private to your account.
        </p>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerLinks}`}>
          <Link href="/privacy" className={styles.link}>Privacy</Link>
          <span>•</span>
          <Link href="/terms" className={styles.link}>Terms</Link>
          <span>•</span>
          <a href="mailto:eastbrightmarketing1@gmail.com" className={styles.link}>Support</a>
        </div>
      </footer>
    </div>
  )
}
