"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "@/styles/Docs.module.css";

const NAV = [
  {
    group: "Getting Started",
    items: [
      { id: "introduction",     label: "Introduction" },
      { id: "quick-start",      label: "Quick Start" },
      { id: "connecting-a-repo", label: "Connecting a Repo" },
    ],
  },
  {
    group: "Webhooks",
    items: [
      { id: "how-webhooks-work", label: "How Webhooks Work" },
      { id: "webhook-payload",   label: "Webhook Payload" },
      { id: "retry-logic",       label: "Retry Logic" },
    ],
  },
  {
    group: "Reviews",
    items: [
      { id: "what-gets-reviewed",    label: "What Gets Reviewed" },
      { id: "review-format",         label: "Review Format" },
      { id: "security-findings",     label: "Security Findings" },
      { id: "performance-findings",  label: "Performance Findings" },
      { id: "test-coverage",         label: "Test Coverage" },
    ],
  },
];

const ALL_IDS = NAV.flatMap(g => g.items.map(i => i.id));

export default function Docs() {
  const [activeId, setActiveId] = useState(ALL_IDS[0]);

  useEffect(() => {
    const onScroll = () => {
      let current = ALL_IDS[0];
      for (const id of ALL_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 96) {
          current = id;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.docsLayout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          {NAV.map((group) => (
            <div key={group.group} className={styles.sidebarGroup}>
              <span className={styles.groupLabel}>{group.group}</span>
              <ul className={styles.groupList}>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`${styles.sidebarLink} ${activeId === item.id ? styles.sidebarLinkActive : ""}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* ── Content ── */}
        <main className={styles.content}>

          {/* Getting Started */}
          <section id="introduction" className={styles.docSection}>
            <h1 className={styles.docH1}>Introduction</h1>
            <p>Code Critiq is an automated code review tool that connects to GitHub and posts structured feedback on every pull request. It analyses the diff — not the full codebase — and surfaces security vulnerabilities, performance regressions, and test coverage gaps as a single PR comment.</p>
            <p>There are no dashboards to configure, no rules to write, and no alerting pipelines to maintain. Connect a repo, open a PR, and read the review.</p>
            <p>Reviews are posted within ~30 seconds of a PR being opened or updated, while context is still fresh.</p>
          </section>

          <section id="quick-start" className={styles.docSection}>
            <h2 className={styles.docH2}>Quick Start</h2>
            <p>Getting your first review takes under a minute.</p>
            <ol className={styles.orderedList}>
              <li>Sign in with GitHub on the homepage.</li>
              <li>Go to your dashboard and click <strong>Connect</strong> next to a repo.</li>
              <li>Open or update a pull request on that repo.</li>
              <li>Code Critiq posts a structured review comment within ~30 seconds.</li>
            </ol>
            <p>That&apos;s it. There is nothing else to set up.</p>
          </section>

          <section id="connecting-a-repo" className={styles.docSection}>
            <h2 className={styles.docH2}>Connecting a Repo</h2>
            <p>When you click <strong>Connect</strong> on a repo from the dashboard, Code Critiq registers a GitHub webhook on that repository. From that point on, every PR open and update event triggers a review automatically.</p>
            <p>Permissions required during GitHub OAuth:</p>
            <ul className={styles.unorderedList}>
              <li><code className={styles.inlineCode}>repo</code> — to read the PR diff and post review comments</li>
              <li><code className={styles.inlineCode}>admin:repo_hook</code> — to register and manage the webhook</li>
              <li><code className={styles.inlineCode}>read:user</code> and <code className={styles.inlineCode}>user:email</code> — for account identification</li>
            </ul>
            <p>You can disconnect a repo at any time from the dashboard. Disconnecting removes the webhook from GitHub immediately — no further reviews will be posted on that repo.</p>
          </section>

          {/* Webhooks */}
          <section id="how-webhooks-work" className={styles.docSection}>
            <h2 className={styles.docH2}>How Webhooks Work</h2>
            <p>When a PR is opened or updated on a connected repo, GitHub sends a <code className={styles.inlineCode}>pull_request</code> event to Code Critiq&apos;s webhook endpoint.</p>
            <p>The endpoint responds with <code className={styles.inlineCode}>200 OK</code> immediately. The review pipeline runs asynchronously in the background — this means the webhook delivery never times out waiting for the review to finish.</p>
            <p>Code Critiq listens for the following <code className={styles.inlineCode}>pull_request</code> actions:</p>
            <ul className={styles.unorderedList}>
              <li><code className={styles.inlineCode}>opened</code> — a new PR is created</li>
              <li><code className={styles.inlineCode}>synchronize</code> — new commits are pushed to an existing PR</li>
              <li><code className={styles.inlineCode}>reopened</code> — a previously closed PR is reopened</li>
            </ul>
            <p>Other actions (<code className={styles.inlineCode}>closed</code>, <code className={styles.inlineCode}>labeled</code>, etc.) are acknowledged but ignored.</p>
          </section>

          <section id="webhook-payload" className={styles.docSection}>
            <h2 className={styles.docH2}>Webhook Payload</h2>
            <p>Code Critiq uses the following fields from GitHub&apos;s standard <code className={styles.inlineCode}>pull_request</code> webhook payload:</p>
            <ul className={styles.unorderedList}>
              <li><code className={styles.inlineCode}>repository.full_name</code> — identifies the repo (e.g. <code className={styles.inlineCode}>acme/api</code>)</li>
              <li><code className={styles.inlineCode}>pull_request.number</code> — used to post the review comment on the correct PR</li>
              <li><code className={styles.inlineCode}>pull_request.head.sha</code> — the latest commit on the PR branch</li>
              <li><code className={styles.inlineCode}>pull_request.base.sha</code> — the base branch commit, used to compute the diff</li>
            </ul>
            <p>No other fields from the payload are stored or processed.</p>
          </section>

          <section id="retry-logic" className={styles.docSection}>
            <h2 className={styles.docH2}>Retry Logic</h2>
            <p>If a webhook delivery fails (network error, timeout, or a non-2xx response), GitHub automatically retries the delivery up to 3 times with increasing delays between attempts.</p>
            <p>On Code Critiq&apos;s side, if the review pipeline fails after a webhook is received, the error is logged but no automatic retry is attempted. The most reliable way to re-trigger a review is to push a new commit to the PR branch — this fires a fresh <code className={styles.inlineCode}>synchronize</code> event and starts a clean pipeline run.</p>
          </section>

          {/* Reviews */}
          <section id="what-gets-reviewed" className={styles.docSection}>
            <h2 className={styles.docH2}>What Gets Reviewed</h2>
            <p>Every PR diff is analysed across three categories. Only the changed lines are in scope — existing code outside the diff is never flagged.</p>
            <ul className={styles.unorderedList}>
              <li><strong>Security</strong> — injection vulnerabilities, hardcoded secrets, insecure dependencies, OWASP Top 10 patterns.</li>
              <li><strong>Performance</strong> — N+1 queries, blocking I/O, algorithmic complexity regressions, unnecessary re-renders.</li>
              <li><strong>Test coverage</strong> — new code paths with no test coverage, missing edge cases, suggested test cases for each gap.</li>
            </ul>
            <p>If a category has no findings, the section is included in the comment with a short &quot;No issues found&quot; note rather than being omitted — this confirms the check ran.</p>
          </section>

          <section id="review-format" className={styles.docSection}>
            <h2 className={styles.docH2}>Review Format</h2>
            <p>Reviews are posted as a single GitHub PR comment structured into three sections. Each finding includes the file, the line range, a description of the problem, and a suggested fix.</p>
            <pre className={styles.codeBlock}>{`## Code Critiq Review

### 🔐 Security
**Line 83 in auth.js**
JWT secret hardcoded in source.
→ Move to AWS Secrets Manager or an env var.

### ⚡ Performance
**Lines 91–98 in db.js**
Database query inside loop — O(n) calls.
→ Batch the query outside the loop: O(1).

### ✓ Test Coverage
**Lines 42–67 in handler.js**
No test for the token expiry path.
→ Add a case for 401 on an expired token.

---
_Code Critiq · 3 findings · Powered by LLM and AWS_`}</pre>
            <p>The comment is updated in-place on subsequent pushes to the same PR — it does not post a new comment each time.</p>
          </section>

          <section id="security-findings" className={styles.docSection}>
            <h2 className={styles.docH2}>Security Findings</h2>
            <p>Security findings are triggered by patterns in the diff that match known vulnerability classes. The analysis is scoped to changed lines only — it will not surface existing issues in untouched code.</p>
            <ul className={styles.unorderedList}>
              <li><strong>Hardcoded credentials</strong> — API keys, tokens, passwords, or secrets assigned to variables or interpolated into strings.</li>
              <li><strong>Injection vulnerabilities</strong> — unsanitised user input passed to SQL queries, shell commands, or template renderers.</li>
              <li><strong>Insecure dependencies</strong> — package versions with known CVEs in a changed <code className={styles.inlineCode}>package.json</code>, <code className={styles.inlineCode}>requirements.txt</code>, or equivalent.</li>
              <li><strong>OWASP Top 10</strong> — patterns matching the current OWASP Top 10 list (XSS, CSRF, broken access control, etc.) in the changed code.</li>
            </ul>
          </section>

          <section id="performance-findings" className={styles.docSection}>
            <h2 className={styles.docH2}>Performance Findings</h2>
            <p>Performance findings target common regressions introduced in the PR. The focus is on patterns that cause measurable slowdowns at runtime, not stylistic preferences.</p>
            <ul className={styles.unorderedList}>
              <li><strong>N+1 queries</strong> — database calls inside loops or list comprehensions that could be batched.</li>
              <li><strong>Blocking I/O</strong> — synchronous file reads, network calls, or sleep statements on the main thread.</li>
              <li><strong>Complexity regressions</strong> — nested loops or recursive calls that change the algorithmic complexity of a function introduced or modified in the diff.</li>
              <li><strong>Unnecessary re-renders</strong> — React components with missing dependency arrays, unstable object references in hooks, or missing memoisation on expensive computations.</li>
            </ul>
          </section>

          <section id="test-coverage" className={styles.docSection}>
            <h2 className={styles.docH2}>Test Coverage</h2>
            <p>Test coverage findings identify new code introduced in the PR that lacks corresponding tests. Each finding includes a specific suggested test case describing the scenario worth covering.</p>
            <ul className={styles.unorderedList}>
              <li><strong>New functions with no tests</strong> — functions or methods added in the diff with no test file referencing them.</li>
              <li><strong>Uncovered branches</strong> — new <code className={styles.inlineCode}>if/else</code> blocks or <code className={styles.inlineCode}>switch</code> cases where some branches have no test exercising them.</li>
              <li><strong>Untested error paths</strong> — new error handling code (<code className={styles.inlineCode}>catch</code> blocks, error returns) with no test for the failure case.</li>
              <li><strong>Missing edge cases</strong> — new input validation or boundary logic with no test for values at or beyond the boundary.</li>
            </ul>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
