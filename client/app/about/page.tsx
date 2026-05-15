import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/About.module.css";

const principles = [
  {
    n: "01",
    title: "Scoped to the diff",
    body: "Code Critiq only reviews what changed in the PR — never the whole codebase. This means zero noise from existing tech debt, and every comment is directly actionable.",
  },
  {
    n: "02",
    title: "Zero configuration",
    body: "If a tool requires setup, most teams won't use it consistently. Connect a repo and it works. No rules to write, no config files, no YAML pipelines to modify.",
  },
  {
    n: "03",
    title: "Async by design",
    body: "Reviews are posted as PR comments — they don't gate merges or block CI. The goal is to surface issues early, not create another approval bottleneck.",
  },
  {
    n: "04",
    title: "Additive, not prescriptive",
    body: "Code Critiq flags specific problems with specific reasons. It doesn't enforce style preferences or nitpick formatting — those are linter problems, not review problems.",
  },
];

const stack = [
  {
    layer: "Frontend",
    tech: "Next.js 16 · React 19 · TypeScript",
    reason:
      "App Router for clean server/client separation, CSS Modules to keep styles scoped and explicit. No Tailwind — utility classes make it hard to audit visual decisions later.",
  },
  {
    layer: "Auth",
    tech: "GitHub OAuth",
    reason:
      "Developers already trust GitHub with their code. Routing auth through GitHub means no separate password, no separate account, and no extra credential surface to protect.",
  },
  {
    layer: "Repo events",
    tech: "GitHub Webhooks",
    reason:
      "Webhooks fire on PR open and update events. This is the trigger that kicks off a review — no polling, no scheduled jobs, no delay.",
  },
  {
    layer: "AI layer",
    tech: "LLMs via AWS",
    reason:
      "The review engine runs large language models to analyse diffs. Hosted on AWS to keep latency low and data within a controlled infrastructure boundary.",
  },
  {
    layer: "Infrastructure",
    tech: "AWS",
    reason:
      "Lambda for the review pipeline, API Gateway for webhook ingestion. Serverless keeps costs proportional to usage and removes the need to manage servers.",
  },
  {
    layer: "Deployment",
    tech: "Vercel",
    reason:
      "The Next.js frontend deploys to Vercel on every merge to main via GitHub Actions. Preview deployments on every PR — same review workflow we ship for others.",
  },
];

export default function About() {
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>

        {/* ── Problem ── */}
        <section className={styles.problem}>
          <span className={styles.tag}>WHY THIS EXISTS</span>
          <h1 className={styles.problemHeading}>
            Code review shouldn&apos;t be the slow part
          </h1>
          <div className={styles.problemBody}>
            <p>
              Pull request review is one of the highest-value activities in a
              software team — and one of the most inconsistently done. When
              reviews are slow, PRs queue up. When reviewers are stretched, the
              mechanical checks get skipped: nobody has time to cross-reference
              every changed line against the OWASP list, profile the query plan,
              or map untested branches.
            </p>
            <p>
              The result is that security issues, performance regressions, and
              test gaps ship — not because nobody cared, but because the
              cognitive load of a thorough review is too high to sustain at pace.
            </p>
            <p>
              Code Critiq exists to handle the mechanical part automatically, so
              human reviewers can focus on the things that actually need human
              judgement: architecture, product logic, tradeoffs, and the
              questions a linter can&apos;t ask.
            </p>
          </div>
        </section>

        {/* ── Principles ── */}
        <section className={styles.section}>
          <span className={styles.tag}>THE PRINCIPLES</span>
          <h2 className={styles.sectionHeading}>Every product decision comes from one of these</h2>
          <div className={styles.principlesGrid}>
            {principles.map((p) => (
              <div key={p.n} className={styles.principleCard}>
                <span className={styles.principleNum}>{p.n}</span>
                <h3 className={styles.principleTitle}>{p.title}</h3>
                <p className={styles.principleBody}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stack ── */}
        <section className={styles.section}>
          <span className={styles.tag}>THE STACK</span>
          <h2 className={styles.sectionHeading}>What you&apos;re trusting</h2>
          <p className={styles.sectionSubtitle}>
            Developer tools live or die on trust. Here&apos;s exactly what runs
            under the hood and why each choice was made.
          </p>
          <div className={styles.stackList}>
            {stack.map((s) => (
              <div key={s.layer} className={styles.stackRow}>
                <div className={styles.stackLeft}>
                  <span className={styles.stackLayer}>{s.layer}</span>
                  <code className={styles.stackTech}>{s.tech}</code>
                </div>
                <p className={styles.stackReason}>{s.reason}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
