import type { FooterIcon as IconName } from "../chrome";

/** Simple icons matching the original Divi/FontAwesome footer glyphs. */
export function FooterIcon({
  name,
  img,
}: {
  name: IconName;
  img?: string;
}) {
  if (img) {
    return (
      <span className="footer-icon">
        <img src={img} alt="" />
      </span>
    );
  }

  const paths: Record<IconName, string> = {
    home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z",
    pagoda:
      "M12 2l2 3h-4l2-3zm-5 4h10l-1 2H8L7 6zm-1.5 3h13l-1 2H6.5l-1-2zM5 12h14v2H5v-2zm1 3h12v6H6v-6zm5 1v4h2v-4h-2z",
    places:
      "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
    teachings:
      "M4 4h11a3 3 0 0 1 3 3v13l-4-2-4 2-4-2-4 2V4zm2 3v9.2l2-.9 4 2 4-2 1 .4V7a1 1 0 0 0-1-1H6z",
    festival:
      "M12 2l1.2 3.6H17l-3 2.2 1.1 3.6L12 9.8 8.9 11.4 10 7.8 7 5.6h3.8L12 2zm-7 14h14v2H5v-2zm2 3h10v2H7v-2z",
    map: "M3 5.5 9 3l6 2.5L21 3v15.5L15 21l-6-2.5L3 21V5.5zm2 1.7v11.2l4-1.5V5.7L5 7.2zm6 10.2 4 1.5V7.7l-4-1.5v11.2z",
  };

  return (
    <span className="footer-icon" aria-hidden>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d={paths[name]} />
      </svg>
    </span>
  );
}
