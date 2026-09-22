"use client";

export function clearBrowserSessionState() {
  try {
    localStorage.clear();
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }

  try {
    sessionStorage.clear();
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }

  if (typeof document === "undefined") return;

  const hostParts = window.location.hostname.split(".");
  const domains = hostParts.flatMap((_, index) => {
    const domain = hostParts.slice(index).join(".");
    return domain ? [domain, `.${domain}`] : [];
  });
  const paths = ["/", window.location.pathname];

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const path of paths) {
      document.cookie = `${name}=; Max-Age=0; path=${path}`;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=${path}; domain=${domain}`;
      }
    }
  }
}
