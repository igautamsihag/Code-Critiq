import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import styles from "@/styles/Reviews.module.css";

type Review = {
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  summary: string;
  commentCount: number;
  status: string;
  createdAt: string;
};

async function getUser() {
  if (process.env.NODE_ENV === "test") {
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

async function fetchReviews(token: string): Promise<Review[]> {
  if (process.env.NODE_ENV === "test") {
    return [
      {
        repoFullName: "devuser/api-service",
        prNumber: 12,
        prTitle: "Add authentication middleware",
        summary: "Overall the implementation looks solid. Found a potential SQL injection risk and a missing await on an async call.",
        commentCount: 3,
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      {
        repoFullName: "devuser/frontend-app",
        prNumber: 7,
        prTitle: "Refactor dashboard components",
        summary: "Good structural improvements. One component is doing too much — consider splitting it. No security issues found.",
        commentCount: 2,
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ];
  }
  try {
    const res = await fetch(`${process.env.API_URL}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function ReviewsPage() {
  const session = await getUser();
  const user = session!;
  const initials = user.username.slice(0, 2).toUpperCase();
  const reviews = await fetchReviews(user.token);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reviews</h1>
        <div className={styles.headerRight}>
          <span className={styles.avatarCircle}>{initials}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>ALL REVIEWS</span>
            <span className={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          </div>

          {reviews.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No reviews yet.</p>
              <p className={styles.emptyHint}>Open a pull request on a connected repo to trigger your first AI review.</p>
            </div>
          ) : (
            <ul className={styles.reviewList}>
              {reviews.map((review) => {
                const repoName = review.repoFullName.split("/")[1];
                return (
                  <li key={`${review.repoFullName}#${review.prNumber}`} className={styles.reviewItem}>
                    <div className={styles.reviewIcon}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="1" width="10" height="14" rx="1.5" />
                        <line x1="5.5" y1="5" x2="10.5" y2="5" />
                        <line x1="5.5" y1="8" x2="10.5" y2="8" />
                        <line x1="5.5" y1="11" x2="9" y2="11" />
                      </svg>
                    </div>
                    <div className={styles.reviewInfo}>
                      <div className={styles.reviewTitleRow}>
                        <p className={styles.reviewTitle}>{review.prTitle || `PR #${review.prNumber}`}</p>
                        <span className={styles.repoBadge}>{repoName}</span>
                      </div>
                      <p className={styles.reviewSummary}>
                        {review.summary.length > 120
                          ? review.summary.slice(0, 120) + "…"
                          : review.summary}
                      </p>
                      <p className={styles.reviewMeta}>
                        #{review.prNumber} · {review.commentCount} comment{review.commentCount !== 1 ? "s" : ""} · {timeAgo(review.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
