import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import styles from "@/styles/Repositories.module.css";

type Repo = {
  name: string;
  fullName: string;
  private: boolean;
  language: string | null;
  stars: number;
  openIssues: number;
};

async function getUser() {
  if (process.env.NODE_ENV !== "production") {
    return { userId: "dev", username: "devuser", avatarUrl: "", token: "" };
  }
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
  if (process.env.NODE_ENV !== "production") {
    return [
      { name: "frontend-app", fullName: "devuser/frontend-app", private: false, language: "TypeScript", stars: 12, openIssues: 3 },
      { name: "api-service", fullName: "devuser/api-service", private: false, language: "JavaScript", stars: 8, openIssues: 1 },
      { name: "data-pipeline", fullName: "devuser/data-pipeline", private: true, language: "Python", stars: 4, openIssues: 2 },
      { name: "ml-experiments", fullName: "devuser/ml-experiments", private: true, language: "Python", stars: 2, openIssues: 0 },
      { name: "portfolio", fullName: "devuser/portfolio", private: false, language: "TypeScript", stars: 5, openIssues: 1 },
    ];
  }

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

export default async function RepositoriesPage() {
  const session = await getUser();
  const user = session!;
  const initials = user.username.slice(0, 2).toUpperCase();
  const repos = await fetchRepos(user.token);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Repositories</h1>
        <div className={styles.headerRight}>
          <span className={styles.avatarCircle}>{initials}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>ALL REPOSITORIES</span>
            <span className={styles.repoCount}>{repos.length} repo{repos.length !== 1 ? "s" : ""}</span>
          </div>
          <ul className={styles.repoList}>
            {repos.map((repo) => (
              <li key={repo.fullName} className={styles.repoItem}>
                <span className={styles.repoIcon}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 4a1 1 0 011-1h3.5l2 2H14a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" />
                  </svg>
                </span>
                <div className={styles.repoInfo}>
                  <div className={styles.repoNameRow}>
                    <p className={styles.repoName}>{repo.name}</p>
                    {repo.private && <span className={styles.privateBadge}>Private</span>}
                  </div>
                  <p className={styles.repoMeta}>
                    {repo.language ?? "—"} · ★ {repo.stars} · {repo.openIssues} issue{repo.openIssues !== 1 ? "s" : ""}
                  </p>
                </div>
                <button className={styles.connectBtn}>Connect</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
