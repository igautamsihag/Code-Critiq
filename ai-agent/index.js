import { runReviewPipeline } from "./graph.js";

export async function handler(event) {
  const { userId, repoFullName, prNumber, prTitle, prBody, reviewableFiles } = event;

  if (!userId || !repoFullName || !prNumber || !reviewableFiles) {
    console.error("ai-agent: missing required fields in event", event);
    return { statusCode: 400, error: "Missing required fields" };
  }

  try {
    await runReviewPipeline({ userId, repoFullName, prNumber, prTitle, prBody, reviewableFiles });
    return { statusCode: 200, ok: true };
  } catch (err) {
    console.error("ai-agent: pipeline error", err);
    return { statusCode: 500, error: err.message };
  }
}
