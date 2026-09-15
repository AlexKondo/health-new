"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "es_session_id";
const START_KEY = "es_session_start";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function beacon(payload: object) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  } else {
    fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const session_id = getSessionId();
    if (!sessionStorage.getItem(START_KEY)) sessionStorage.setItem(START_KEY, String(Date.now()));
    beacon({ session_id, type: "pageview" });
  }, [pathname]);

  useEffect(() => {
    function sendDuration() {
      const session_id = sessionStorage.getItem(SESSION_KEY);
      const start = Number(sessionStorage.getItem(START_KEY));
      if (!session_id || !start) return;
      const duration_seconds = Math.round((Date.now() - start) / 1000);
      beacon({ session_id, type: "duration", duration_seconds });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendDuration();
    });
    window.addEventListener("pagehide", sendDuration);
    return () => {
      window.removeEventListener("pagehide", sendDuration);
    };
  }, []);

  return null;
}
