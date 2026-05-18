import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import styles from "@/styles/Dashboard.module.css";

type Repo = {
  name: string;
  fullName: string;
  private: boolean;
  language: string | null;
  stars: number;
  openIssues: number;
};

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/");
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return { ...(payload as { userId: string; username: string; avatarUrl: string }), token };
  } catch {
    redirect("/");
  }
}

async function fetchRepos(token: string): Promise<Repo[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/repos`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const issueBreakdown = [
  { label: "Security", color: "#ef4444", count: 2, pct: 50 },
  { label: "Performance", color: "#f59e0b", count: 4, pct: 100 },
  { label: "Style", color: "#8b5cf6", count: 3, pct: 75 },
  { label: "Logic", color: "#10b981", count: 1, pct: 25 },
];

const activity = [
  {
    dot: "red",
    text: <>Potential SQL injection in <code>userQuery()</code> — input is not sanitised</>,
    repo: "api-service",
    time: "10 min ago",
  },
  {
    dot: "orange",
    text: <>Nested loop is O(n²) — consider using a hash map for lookups</>,
    repo: "data-pipeline",
    time: "2 hr ago",
  },
  {
    dot: "purple",
    text: <>Function exceeds 80 lines — could be broken into 3 smaller helpers</>,
    repo: "frontend-app",
    time: "yesterday",
  },
  {
    dot: "green",
    text: <>All 14 tests passing after refactor — quality score improved to A</>,
    repo: "frontend-app",
    time: "yesterday",
  },
];

export default async function Dashboard() {
  const session = await getUser();
  const user = session!;
  const initials = user.username.slice(0, 2).toUpperCase();
  const repos = await fetchRepos(user.token);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.headerRight}>
          <span className={styles.avatarCircle}>{initials}</span>
        </div>
      </header>

      <div className={styles.content}>
        {/* Stat cards */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Reviews this week</p>
            <p className={styles.statValue}>24</p>
            <p className={`${styles.statDelta} ${styles.deltaGreen}`}>
              <span className={styles.deltaIcon} /> +6 vs last week
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Avg quality score</p>
            <p className={styles.statValue}>B+</p>
            <p className={`${styles.statDelta} ${styles.deltaGreen}`}>Improving</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Open issues</p>
            <p className={styles.statValue}>7</p>
            <p className={`${styles.statDelta} ${styles.deltaAmber}`}>3 high priority</p>
          </div>
        </div>

        {/* Middle row */}
        <div className={styles.midRow}>
          {/* GitHub Repos */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>GITHUB REPOS</span>
              <a href="/dashboard/repositories" className={styles.viewAll}>View all →</a>
            </div>
            <ul className={styles.repoList}>
              {repos.slice(0, 3).map((repo) => (
                <li key={repo.fullName} className={styles.repoItem}>
                  <span className={styles.repoIcon}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4a1 1 0 011-1h3.5l2 2H14a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" />
                    </svg>
                  </span>
                  <div className={styles.repoInfo}>
                    <p className={styles.repoName}>{repo.name}</p>
                    <p className={styles.repoMeta}>
                      {repo.language ?? "—"} · {repo.openIssues} open issue{repo.openIssues !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button className={styles.connectBtn}>Connect</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Issue Breakdown */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>ISSUE BREAKDOWN</span>
            </div>
            <ul className={styles.breakdownList}>
              {issueBreakdown.map((item) => (
                <li key={item.label} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>{item.label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                  <span className={styles.breakdownCount}>{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Activity feed */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>RECENT AI REVIEW ACTIVITY</span>
            <a href="/dashboard/reviews" className={styles.viewAll}>See all →</a>
          </div>
          <ul className={styles.activityList}>
            {activity.slice(0, 3).map((item, i) => (
              <li key={i} className={styles.activityItem}>
                <span className={`${styles.dot} ${styles[`dot${item.dot.charAt(0).toUpperCase()}${item.dot.slice(1)}`]}`} />
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>{item.text}</p>
                  <p className={styles.activityMeta}>{item.repo} · {item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
