export async function postPRReview(repoFullName, prNumber, githubToken, summary, comments) {
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/reviews`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: summary,
        event: "COMMENT",
        comments: comments.map((c) => ({
          path: c.path,
          line: c.line,
          side: "RIGHT",
          body: c.body,
        })),
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub review API ${res.status}: ${text}`);
  }

  return res.json();
}
