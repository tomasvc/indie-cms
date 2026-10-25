/** Same-origin path only. Rejects protocol-relative, backslash, and encoded `//` redirects. */
export function safeNextPath(value: string | null): string {
    if (!value) return "/";
    const candidate = value.trim();
    if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\") || candidate.includes("://")) {
        return "/";
    }

    let url: URL;
    try {
        url = new URL(candidate, "http://localhost");
    } catch {
        return "/";
    }
    if (url.origin !== "http://localhost") return "/";

    let decoded = url.pathname;
    for (let i = 0; i < 2; i++) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch {
            return "/";
        }
    }
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\") || decoded.includes("://")) {
        return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
}
