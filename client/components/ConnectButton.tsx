"use client";

import { useState } from "react";
import styles from "@/styles/ConnectButton.module.css";

type State = "idle" | "loading" | "connected" | "error";

export default function ConnectButton({
  fullName,
  initialConnected,
}: {
  fullName: string;
  initialConnected: boolean;
}) {
  const [state, setState] = useState<State>(initialConnected ? "connected" : "idle");

  async function handleConnect() {
    setState("loading");
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      if (res.ok) {
        setState("connected");
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Connect failed:", data.error);
        setState("error");
      }
    } catch (err) {
      console.error("Connect error:", err);
      setState("error");
    }
  }

  if (state === "connected") {
    return <span className={styles.connected}>Connected</span>;
  }

  return (
    <button
      className={`${styles.btn} ${state === "error" ? styles.error : ""}`}
      onClick={handleConnect}
      disabled={state === "loading"}
    >
      {state === "loading" ? "Connecting…" : state === "error" ? "Retry" : "Connect"}
    </button>
  );
}
