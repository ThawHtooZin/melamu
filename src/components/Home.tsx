import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { HOME_HERO_IMAGES } from "../chrome";
import type { Manifest } from "../types";

type Ctx = { manifest: Manifest };

export function Home() {
  const { manifest } = useOutletContext<Ctx>();
  const tiles = manifest.homeNav.historyTiles;
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIdx((i) => (i + 1) % HOME_HERO_IMAGES.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="screen-grid">
      <div className="hero-frame">
        <img
          key={HOME_HERO_IMAGES[heroIdx]}
          src={HOME_HERO_IMAGES[heroIdx]}
          alt="မယ်လမုဘုရား"
          width={1280}
          height={720}
        />
      </div>

      <div className="banner-stack">
        {tiles.map((t) => (
          <Link key={t.path} to={t.path} className="banner-btn">
            {t.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
