import { useMemo, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { mediaUrl, wpUrlToPath } from "../lib/paths";

type Props = {
  html: string;
  slugById: Map<number, string>;
};

export function WpHtml({ html, slugById }: Props) {
  const navigate = useNavigate();

  const cleaned = useMemo(() => {
    let h = html
      .replace(/https?:\/\/localhost\/melamu/gi, "http://127.0.0.1/melamu")
      .replace(/src="(\/melamu\/[^"]+)"/gi, (_m, p1) => `src="http://127.0.0.1${p1}"`);

    // neutralize empty or builder chrome that breaks layout
    h = h.replace(/onclick="[^"]*"/gi, "");
    // literal \n artifacts from WP export (as text or entities)
    h = h.replace(/\\n/g, "");
    h = h.replace(/>\s*\\n\s*</g, "><");
    // hide gallery placeholder lines (shown as media left instead)
    h = h.replace(/<[^>]*>ဓာတ်ပုံပြခန်း\s*\([^)]*\)<\/[^>]*>/gi, "");
    h = h.replace(/ဓာတ်ပုံပြခန်း\s*\([^)]*\)/gi, "");
    // hide back buttons already rendered by the shell
    h = h.replace(/<a[^>]*class="[^"]*et_pb_button[^"]*"[^>]*>[\s\S]*?မူလစာမျက်နှာသို့[\s\S]*?<\/a>/gi, "");
    return h;
  }, [html]);

  function onClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const a = target.closest("a") as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;

    // lightbox / pure media — let browser open or ignore SPA
    if (/\.(jpe?g|png|gif|webp|mp4|pdf)(\?|$)/i.test(href)) {
      a.setAttribute("href", mediaUrl(href));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noreferrer");
      return;
    }

    const path = wpUrlToPath(href, slugById);
    if (path) {
      e.preventDefault();
      navigate(path);
    }
  }

  return (
    <div
      className="wp-content"
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}
