import { mediaUrl, wpUrlToPath } from "./paths";

export type Tile = {
  image: string | null;
  title: string;
  caption: string;
  path: string | null;
};

export type PageLayout =
  | "image-grid"
  | "banner-hub"
  | "soft-hub"
  | "text-hub"
  | "leaf"
  | "gallery";

/** Parse Divi melamu-blurb cards from extracted page HTML. */
export function parseTiles(
  html: string,
  slugById: Map<number, string>
): Tile[] {
  const tiles: Tile[] = [];
  const re = /<div class="melamu-blurb">([\s\S]*?)(?=<div class="melamu-blurb">|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const block = m[1];
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/i);
    const titleMatch = block.match(/<h3>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h3>/i);
    const captionMatch = block.match(/<p>([\s\S]*?)<\/p>/i);
    const hrefMatch = block.match(/<a[^>]+href="([^"]+)"/i);

    const title = (titleMatch?.[1] || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\\t/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const caption = (captionMatch?.[1] || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\\t/g, "")
      .replace(/\s+/g, " ")
      .trim();

    let path: string | null = null;
    const href = hrefMatch?.[1] || "";
    if (href && href !== "#") {
      path = wpUrlToPath(href, slugById);
    }

    const image = imgMatch ? mediaUrl(imgMatch[1]) : null;
    if (!title && !image) continue;
    tiles.push({ image, title, caption, path });
  }
  return tiles;
}

export function detectLayout(opts: {
  tiles: Tile[];
  childCount: number;
  intro: string;
  imgCount: number;
  slug: string;
}): PageLayout {
  const { tiles, childCount, intro, imgCount, slug } = opts;
  const imageTiles = tiles.filter((t) => t.image).length;

  // Festival / belief / pagoda / statue photo grids
  if (imageTiles >= 6) return "image-grid";

  // Pure photo galleries (no titles)
  if (imgCount >= 6 && imageTiles === 0) return "gallery";

  // Text-only blurb lists (Jataka, Eight Victories, etc.)
  if (tiles.length >= 4 && imageTiles === 0) return "text-hub";

  if (childCount >= 4) return "banner-hub";
  if (childCount >= 2) return "soft-hub";

  // Festival slug with few parsed kids still prefers grid if tiles exist
  if (slug.includes("festival") && imageTiles >= 4) return "image-grid";

  if (intro && childCount >= 2) return "soft-hub";
  return "leaf";
}

export function gridColumns(tileCount: number): number {
  if (tileCount >= 12) return 6;
  if (tileCount >= 10) return 5;
  if (tileCount >= 8) return 4;
  if (tileCount >= 6) return 3;
  return Math.min(tileCount, 4);
}

/** Prefer local festival copies when present. */
export function localizeTileImage(src: string | null): string | null {
  if (!src) return null;
  const name = src.split("/").pop()?.split("?")[0];
  if (!name) return src;
  const festivalNames = new Set([
    "1-scaled.jpg",
    "2-scaled.jpg",
    "3-scaled.jpg",
    "4-scaled.jpg",
    "5-scaled.jpg",
    "6-scaled.jpg",
    "7-scaled.jpg",
    "8-scaled.jpg",
    "9-scaled.jpg",
    "10-scaled.jpg",
    "11-Tapotwae.jpg",
    "12-Tapoung.jpg",
  ]);
  if (festivalNames.has(name)) return `/media/festivals/${name}`;
  return src;
}

export const FESTIVAL_SUBTITLE =
  "ဆုတောင်းပြည့် မယ်လမုစေတီတော် ၁၂လ ရာသီပွဲတော်များ";
