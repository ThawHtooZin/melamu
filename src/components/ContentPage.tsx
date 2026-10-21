import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom";
import { TOP_NAV } from "../chrome";
import { pageJsonUrl } from "../lib/paths";
import {
  FESTIVAL_SUBTITLE,
  detectLayout,
  gridColumns,
  localizeTileImage,
  parseTiles,
} from "../lib/tiles";
import type { Manifest, PageData } from "../types";
import { WpHtml } from "./WpHtml";

type Ctx = { manifest: Manifest };

const LOCAL_MEDIA = new Set([
  "cover-final-1.jpg",
  "cover-final.jpg",
  "MoutOu.jpg",
  "DSC06266-1.jpg",
  "DSC_0517.jpg",
  "SDG-Logo-copy-1.png",
  "Buddha-Teaching-1.jpg",
]);

function firstMedia(html: string): { type: "img" | "video"; src: string } | null {
  const video = html.match(/<(?:video[^>]+src|source[^>]+src)="([^"]+)"/i);
  if (video) return { type: "video", src: video[1] };
  const img = html.match(/<img[^>]+src="([^"]+)"/i);
  if (img) return { type: "img", src: img[1] };
  return null;
}

function extractIntro(html: string): string {
  const parts: string[] = [];
  const re = /<div class="melamu-text"[^>]*>([\s\S]*?)<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) parts.push(text);
  }
  return parts.join(" ");
}

function localMedia(src: string | undefined): string | null {
  if (!src) return null;
  const name = src.split("/").pop()?.split("?")[0];
  if (name && LOCAL_MEDIA.has(name)) {
    return `/media/${name === "cover-final.jpg" ? "cover-final-1.jpg" : name}`;
  }
  return src;
}

export function ContentPage() {
  const params = useParams();
  const { pathname } = useLocation();
  const splat = params["*"] ?? "";
  const slug = decodeURIComponent(splat.replace(/\/$/, ""));
  const { manifest } = useOutletContext<Ctx>();
  const [page, setPage] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const slugById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of manifest.index) m.set(p.id, p.slug);
    return m;
  }, [manifest.index]);

  const meta = useMemo(() => {
    return (
      manifest.index.find((p) => p.slug === slug) ||
      manifest.index.find((p) => p.slug === decodeURIComponent(slug)) ||
      manifest.index.find((p) => encodeURIComponent(p.slug) === slug)
    );
  }, [manifest.index, slug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(null);

    if (!meta) {
      setError("Page not found");
      setLoading(false);
      return;
    }

    fetch(pageJsonUrl(meta.id))
      .then(async (r) => {
        if (!r.ok) throw new Error(`Page not found (${r.status})`);
        return r.json() as Promise<PageData>;
      })
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [meta]);

  const childLinks = useMemo(() => {
    if (!page) return [];
    const seen = new Set<string>();
    const items: { path: string; title: string }[] = [];

    for (const l of page.linkOptions) {
      if (!l.path || l.path === "/" || seen.has(l.path)) continue;
      seen.add(l.path);
      const childSlug = l.path.slice(1);
      const title =
        l.title ||
        manifest.index.find((p) => p.slug === childSlug)?.title ||
        childSlug;
      items.push({ path: l.path, title });
    }
    for (const b of page.buttons) {
      if (!b.path || b.path === "/" || seen.has(b.path)) continue;
      if (/မူလ|ပင်မ|home/i.test(b.text)) continue;
      seen.add(b.path);
      items.push({ path: b.path, title: b.text });
    }
    return items;
  }, [page, manifest.index]);

  const tiles = useMemo(
    () => (page ? parseTiles(page.html, slugById) : []),
    [page, slugById]
  );

  const media = useMemo(() => (page ? firstMedia(page.html) : null), [page]);
  const intro = useMemo(() => (page ? extractIntro(page.html) : ""), [page]);
  const imgCount = useMemo(
    () => (page ? (page.html.match(/<img\b/gi) || []).length : 0),
    [page]
  );

  const layout = useMemo(() => {
    if (!page) return "leaf" as const;
    return detectLayout({
      tiles,
      childCount: childLinks.length,
      intro,
      imgCount,
      slug: page.slug,
    });
  }, [page, tiles, childLinks.length, intro, imgCount]);

  const backLink = useMemo(() => {
    if (!page) return { path: "/", label: "မူလစာမျက်နှာသို့" };
    const btn = page.buttons.find((b) => b.path && b.text);
    if (btn?.path) return { path: btn.path, label: btn.text };
    const parent = TOP_NAV.find((n) =>
      decodeURIComponent(pathname).startsWith(n.path)
    );
    if (parent && pathname !== parent.path) {
      return { path: parent.path, label: "မူလစာမျက်နှာသို့" };
    }
    return { path: "/", label: "မူလစာမျက်နှာသို့" };
  }, [page, pathname]);

  if (loading) return <div className="status">ဖတ်နေသည်…</div>;
  if (error || !page) {
    return (
      <div className="status">
        <p>{error || "Page missing"}</p>
        <Link to="/" className="home-btn">
          မူလစာမျက်နှာသို့
        </Link>
      </div>
    );
  }

  const imgSrc = localMedia(media?.src) || "/media/cover-final-1.jpg";

  // ===== IMAGE GRID (festival 6×2, beliefs 4×2, etc.) =====
  if (layout === "image-grid") {
    const cols = gridColumns(tiles.length);
    const isFestival = page.slug.includes("festival");
    // Festival art is landscape; belief/pagoda photo tiles are portrait 9:16
    const gridClass = isFestival
      ? "image-grid image-grid--landscape"
      : "image-grid image-grid--portrait";
    return (
      <div className="image-grid-page">
        <h2 className="grid-heading">
          {isFestival ? FESTIVAL_SUBTITLE : page.title}
        </h2>
        <div
          className={gridClass}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {tiles.map((t, i) => {
            const inner = (
              <>
                {t.image ? (
                  <img
                    src={localizeTileImage(t.image) || t.image}
                    alt={t.title}
                    loading="lazy"
                  />
                ) : null}
                {t.title ? <div className="tile-title">{t.title}</div> : null}
                {t.caption ? (
                  <div className="tile-caption">{t.caption}</div>
                ) : null}
              </>
            );
            return t.path ? (
              <Link key={i} to={t.path} className="grid-tile">
                {inner}
              </Link>
            ) : (
              <div key={i} className="grid-tile">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== GALLERY (images only) =====
  if (layout === "gallery") {
    const srcs = [...page.html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map(
      (m) => m[1]
    );
    const cols = gridColumns(srcs.length);
    return (
      <div className="image-grid-page">
        <h2 className="grid-heading">{page.title}</h2>
        <div
          className="image-grid gallery-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {srcs.map((src, i) => (
            <div key={i} className="grid-tile">
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ===== TEXT HUB (Jataka / Eight Victories — blurb titles only) =====
  if (layout === "text-hub") {
    const hasHero = Boolean(media?.src);
    if (!hasHero) {
      return (
        <div className="text-hub-page">
          <h2 className="grid-heading">{page.title}</h2>
          <div className="text-hub-grid">
            {tiles.map((t, i) =>
              t.path ? (
                <Link key={i} to={t.path} className="banner-btn">
                  {t.title}
                </Link>
              ) : (
                <span key={i} className="banner-btn">
                  {t.title}
                </span>
              )
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="screen-grid">
        <div className="hero-frame">
          <img src={imgSrc} alt="" width={1280} height={720} />
        </div>
        <div className="banner-stack">
          {tiles.map((t, i) =>
            t.path ? (
              <Link key={i} to={t.path} className="banner-btn">
                {t.title}
              </Link>
            ) : (
              <span key={i} className="banner-btn">
                {t.title}
              </span>
            )
          )}
        </div>
      </div>
    );
  }

  // ===== SOFT HUB =====
  if (layout === "soft-hub") {
    return (
      <div className="screen-grid">
        <div className="hero-frame">
          <img src={imgSrc} alt="" width={1280} height={720} />
        </div>
        <div className="soft-hub">
          {intro ? <p className="soft-hub-intro">{intro}</p> : null}
          <div className="pill-stack">
            {childLinks.map((c) => (
              <Link key={c.path} to={c.path} className="pill-btn">
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== BANNER HUB =====
  if (layout === "banner-hub") {
    return (
      <div className="screen-grid">
        <div className="hero-frame">
          <img src={imgSrc} alt="" width={1280} height={720} />
        </div>
        <div className="banner-stack">
          {childLinks.map((c) => (
            <Link key={c.path} to={c.path} className="banner-btn">
              {c.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ===== LEAF =====
  return (
    <div className="screen-grid">
      <div className="media-panel">
        {media?.type === "video" ? (
          <video src={media.src} controls playsInline />
        ) : (
          <img src={imgSrc} alt="" width={960} height={540} />
        )}
      </div>

      <div className="text-panel">
        <h1>{page.title}</h1>
        <div className="body">
          <WpHtml html={page.html} slugById={slugById} />
        </div>
        <Link to={backLink.path} className="home-btn">
          {backLink.label}
        </Link>
      </div>
    </div>
  );
}
