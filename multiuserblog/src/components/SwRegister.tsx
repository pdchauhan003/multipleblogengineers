"use client";

import { useEffect } from "react";

/**
 * SwRegister – silently registers /sw.js after the app hydrates.
 * Place this in the root layout so it runs on every page.
 * It does NOT render any visible UI.
 */
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[SW] Registered, scope:", registration.scope);
        })
        .catch((err) => {
          console.error("[SW] Registration failed:", err);
        });
    }
  }, []);

  return null;
}
