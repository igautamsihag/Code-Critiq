import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Services.module.css";

const reviewTypes = [
  {
    accent: styles.accentSecurity,
    icon: "🔐",
    title: "Security analysis",
    tagline: "Catch vulnerabilities before they ship.",
    description:
      "Every diff is scanned for security issues — scoped only to what changed, never the whole codebase. No false positives from code you didn't touch.",
    checks: [
      "Hardcoded secrets and API keys",
      "SQL injection and XSS patterns",
      "Insecure or outdated dependencies",
      "OWASP Top 10 in changed code",
    ],
  },
  {
    accent: styles.accentPerf,
    icon: "⚡",
    title: "Performance review",
    tagline: "Spot regressions before they hit production.",
    description:
      "Code Critiq flags inefficiencies introduced in the PR — not existing tech debt. It tells you exactly what changed and why it's a problem.",
    checks: [
      "N+1 database queries",
      "Blocking synchronous I/O",
      "Algorithmic complexity regressions",
      "Unnecessary re-renders",
    ],
  },
  {
    accent: styles.accentTest,
    icon: "✓",
    title: "Test coverage gaps",
    tagline: "Know exactly what needs a test.",
    description:
      "For every new code path in the diff, Code Critiq identifies which cases are untested and suggests the specific scenarios worth covering.",
    checks: [
      "New paths with no coverage",
      "Missing edge and error cases",
      "Uncovered branches in changed functions",
      "Suggested test cases per gap",
    ],
  },
];

const steps = [
  {
    n: "01",
    title: "Sign in with GitHub",
    body: "OAuth login — no separate password or API keys to manage. Your credentials never touch our servers.",
  },
  {
    n: "02",
    title: "Connect a repo",
    body: "Click Connect on any repo you own. A webhook is registered in seconds. No config files, no YAML.",
  },
  {
    n: "03",
    title: "Open a pull request",
    body: "GitHub notifies Code Critiq automatically when a PR is opened or updated. You do nothing extra.",
  },
  {
    n: "04",
    title: "Read the review",
    body: "A structured comment appears on the PR within ~30 seconds — security, performance, and test gaps, all in one place.",
  },
];

export default function Services() {
  const id = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/callback`;
  const githubURL = `https://github.com/login/oauth/authorize?client_id=${id}&scope=repo,read:user,user:email,admin:repo_hook&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>

        {/* ── Intro ── */}
        <section className={styles.intro}>
          <span className={styles.tag}>WHAT WE REVIEW</span>
          <h1 className={styles.introHeading}>Three things that matter most</h1>
          <p className={styles.introSubtitle}>
            Every PR gets analysed across security, performance, and test
            coverage — automatically, every time, with zero configuration.
          </p>
        </section>

        {/* ── Review type cards ── */}
        <section className={styles.cardsGrid}>
          {reviewTypes.map((r) => (
            <div key={r.title} className={`${styles.card} ${r.accent}`}>
              <div className={styles.cardIcon}>{r.icon}</div>
              <h2 className={styles.cardTitle}>{r.title}</h2>
              <p className={styles.cardTagline}>{r.tagline}</p>
              <p className={styles.cardDesc}>{r.description}</p>
              <ul className={styles.checkList}>
                {r.checks.map((c) => (
                  <li key={c} className={styles.checkItem}>
                    <span className={styles.checkMark}>✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ── Four-step flow ── */}
        <section className={styles.stepsSection}>
          <span className={styles.tag}>HOW IT WORKS</span>
          <h2 className={styles.stepsHeading}>From zero to reviewed in four steps</h2>
          <p className={styles.stepsSubtitle}>
            No setup time. No configuration. Just connect your repo and open a PR.
          </p>

          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNum}>{s.n}</span>
                  {i < steps.length - 1 && <span className={styles.stepConnector} />}
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.cta}>
          <h2 className={styles.ctaHeading}>Start reviewing smarter</h2>
          <p className={styles.ctaSubtitle}>
            Connect your first repo in under a minute. No credit card, no setup, no config files required.
          </p>
          <div className={styles.ctaButtons}>
            <a href={githubURL} className={styles.primaryBtn}>
              <Image src="/github.svg" width={17} height={17} alt="" className={styles.btnIcon} />
              Continue with GitHub — it&apos;s free
            </a>
          </div>
          <div className={styles.ctaPills}>
            <span>Free tier</span>
            <span>·</span>
            <span>No credit card</span>
            <span>·</span>
            <span>Disconnect anytime</span>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
