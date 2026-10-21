/** Convert WP /melamu/... or ?page_id= links into React Router paths. */
export function wpUrlToPath(
  raw: string,
  slugById: Map<number, string>
): string | null {
  if (!raw) return null;
  try {
    const absolute = raw.startsWith("http")
      ? raw.replace("localhost", "127.0.0.1")
      : `http://127.0.0.1${raw.startsWith("/") ? "" : "/"}${raw}`;
    const u = new URL(absolute);
    const pageId = u.searchParams.get("page_id");
    if (pageId) {
      const slug = slugById.get(Number(pageId));
      if (!slug) return null;
      return slug === "my-page" ? "/" : `/${slug}`;
    }
    let parts = u.pathname.replace(/^\/melamu\/?/, "").replace(/\/$/, "");
    if (!parts) return "/";
    try {
      parts = decodeURIComponent(parts);
    } catch {
      /* keep encoded */
    }
    if (parts === "my-page") return "/";
    return `/${parts}`;
  } catch {
    return null;
  }
}

export function mediaUrl(src: string): string {
  if (!src) return src;
  return src
    .replace(/https?:\/\/localhost\/melamu/gi, "http://127.0.0.1/melamu")
    .replace(/^\/melamu\//, "http://127.0.0.1/melamu/");
}

export function pageJsonUrl(id: number): string {
  return `/data/pages/${id}.json`;
}
