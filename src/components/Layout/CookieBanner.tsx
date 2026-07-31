"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_KEY = "cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COOKIE_KEY);
    if (stored !== "accepted" && stored !== "rejected") {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_KEY, "accepted");
    }
    setVisible(false);
  };

  const declineCookies = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_KEY, "rejected");
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:pb-6">
      <div className="flex w-full max-w-4xl flex-col gap-3 rounded-[10px] border border-[#1d2a45] bg-[#2c3c5e] px-4 py-3 text-white shadow-[0_8px_30px_rgba(29,42,69,0.35)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="text-sm leading-relaxed sm:text-base">
          <p>
            This website uses cookies to improve your experience and analyze traffic. By continuing to browse, you agree to our use of cookies. Read our{" "}
            <Link href="/privacy-policy" className="font-medium text-[#c79a55] underline hover:text-[#e0b56e]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 sm:ml-4">
          <button
            type="button"
            onClick={acceptCookies}
            className="rounded-md bg-[#3f7267] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#355f56]"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={declineCookies}
            className="rounded-md border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1d2a45]"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
