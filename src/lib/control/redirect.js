export function resolveInternalRedirect(
  value,
  origin,
  fallback = "/admin"
) {
  const raw = String(value || "").trim();

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }

  try {
    const candidate = new URL(raw, origin);
    const expectedOrigin = new URL(origin).origin;

    if (candidate.origin !== expectedOrigin) {
      return fallback;
    }

    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return fallback;
  }
}
