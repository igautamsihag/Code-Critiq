import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/page.module.css";

const languages = ["JavaScript", "TypeScript", "Python", "Go", "Ruby", "Java", "Rust"];

export default function Home() {
  const id = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`;
  const githubURL = `https://github.com/login/oauth/authorize?client_id=${id}&scope=repo,read:user,user:email,admin:repo_hook&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              AI-powered · Every PR reviewed
            </span>

            <h1 className={styles.heroTitle}>
              Automated pull request feedback, <em>instantly</em>
            </h1>

            <p className={styles.heroSubtitle}>
              Code Critiq connects to your GitHub repos and posts a structured AI
              review on every pull request — catching security issues, performance
              problems, and test gaps before your team even looks at it.
            </p>

            <div className={styles.heroButtons}>
              <a href={githubURL} className={styles.primaryBtn}>
                <Image src="/github.svg" width={17} height={17} alt="" className={styles.btnIcon} />
                Continue with GitHub
              </a>
              <a href="/services" className={styles.secondaryBtn}>
                See how it works →
              </a>
            </div>
          </div>

          {/* ── PR review mockup ── */}
          <div className={styles.heroRight}>
            <div className={styles.prCard}>
              <div className={styles.prChrome}>
                <div className={styles.prDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <div className={styles.prMeta}>
                  <span className={styles.prTitle}>#47 — Add user authentication</span>
                  <span className={styles.prAuthor}>opened by @alice · 2 files changed</span>
                </div>
                <span className={styles.openBadge}>open</span>
              </div>

              <div className={`${styles.finding} ${styles.findingSec}`}>
                <div className={styles.findingHeader}>
                  <span className={styles.findingIcon}>🔐</span>
                  <span className={styles.findingTag}>SECURITY</span>
                </div>
                <p className={styles.findingFile}>Line 83 in auth.js</p>
                <p className={styles.findingBody}>
                  JWT secret hardcoded in source. Move to AWS Secrets Manager or env var.
                </p>
              </div>

              <div className={`${styles.finding} ${styles.findingPerf}`}>
                <div className={styles.findingHeader}>
                  <span className={styles.findingIcon}>⚡</span>
                  <span className={styles.findingTag}>PERFORMANCE</span>
                </div>
                <p className={styles.findingFile}>Lines 91–98 in db.js</p>
                <p className={styles.findingBody}>
                  Database query inside loop. Batch the query outside — reduces from O(n) to O(1) calls.
                </p>
              </div>

              <div className={`${styles.finding} ${styles.findingTest}`}>
                <div className={styles.findingHeader}>
                  <span className={styles.findingIcon}>✓</span>
                  <span className={styles.findingTag}>TEST COVERAGE</span>
                </div>
                <p className={styles.findingFile}>Lines 42–67 in handler.js</p>
                <p className={styles.findingBody}>
                  No test for token expiry path. Add case for 401 response on expired token.
                </p>
              </div>

              <div className={styles.prFooter}>
                <span>Code Critiq · 3 findings</span>
                <span className={styles.prFooterRight}>● Powered by LLM and AWS</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats + Languages ── */}
        <div className={styles.belowHero}>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>~30s</span>
              <span className={styles.statLabel}>avg review time</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>3</span>
              <span className={styles.statLabel}>review types</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>0</span>
              <span className={styles.statLabel}>config files needed</span>
            </div>
          </div>

          <div className={styles.languageRow}>
            <span className={styles.languageLabel}>Works with any language</span>
            <div className={styles.languagePills}>
              {languages.map((l) => (
                <span key={l} className={styles.pill}>{l}</span>
              ))}
              <span className={styles.andMore}>and more</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
