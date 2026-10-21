import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type MapArea = {
  id: number;
  title: string;
  shape: string;
  coords: number[];
  cx: number;
  cy: number;
  path: string | null;
};

type LegendItem = {
  id: number;
  title: string;
  path: string | null;
};

type MapData = {
  image: string;
  width: number;
  height: number;
  areas: MapArea[];
  legend: LegendItem[];
};

const MM_DIGITS = "၀၁၂၃၄၅၆၇၈၉";

function toMmNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => MM_DIGITS[Number(d)] ?? d)
    .join("");
}

function coordsToPoints(coords: number[]): string {
  const pts: string[] = [];
  for (let i = 0; i < coords.length; i += 2) {
    pts.push(`${coords[i]},${coords[i + 1]}`);
  }
  return pts.join(" ");
}

/** Strip leading "၁။ " style numbering from Divi legend labels. */
function cleanLegendTitle(title: string): string {
  return title.replace(/^[၀-၉0-9]+[။.\)]\s*/, "").trim();
}

export function MapPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<MapData | null>(null);
  const [hovered, setHovered] = useState<MapArea | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/map.json")
      .then(async (r) => {
        if (!r.ok) throw new Error("map.json missing");
        return r.json() as Promise<MapData>;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const legendCols = useMemo(() => {
    if (!data) return [[], []] as const;
    const mid = Math.ceil(data.legend.length / 2);
    return [data.legend.slice(0, mid), data.legend.slice(mid)] as const;
  }, [data]);

  function goTo(path: string | null | undefined) {
    if (path) navigate(path);
  }

  function onAreaClick(area: MapArea) {
    if (area.path) navigate(area.path);
  }

  if (error) return <div className="status">{error}</div>;
  if (!data) return <div className="status">မြေပုံ ဖတ်နေသည်…</div>;

  const tipLeft = hovered
    ? Math.min(92, Math.max(8, (hovered.cx / data.width) * 100))
    : 0;
  const tipTop = hovered
    ? Math.min(88, Math.max(6, (hovered.cy / data.height) * 100))
    : 0;

  return (
    <div className="map-page">
      <h2 className="map-heading">
        ဆုတောင်းပြည့်မယ်လမုစေတီတော် ဖူးမြှော် ကြည်ညိုနိုင်ရန် လမ်းညွှန်
      </h2>

      <div className="map-body">
        <div className="map-stage">
          <div className="map-stage-inner">
            <img
              src={data.image}
              alt="မယ်လမုမြေပုံ"
              width={data.width}
              height={data.height}
              className="map-image"
              draggable={false}
            />
            <svg
              className="map-hotspots"
              viewBox={`0 0 ${data.width} ${data.height}`}
              preserveAspectRatio="none"
            >
              {data.areas.map((a) => (
                <polygon
                  key={a.id}
                  points={coordsToPoints(a.coords)}
                  className={
                    hovered?.id === a.id
                      ? "hotspot active linked"
                      : a.path
                        ? "hotspot linked"
                        : "hotspot"
                  }
                  onMouseEnter={() => setHovered(a)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(a)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onAreaClick(a)}
                />
              ))}
            </svg>

            {hovered ? (
              <div
                className="map-tip"
                style={{
                  left: `${tipLeft}%`,
                  top: `${tipTop}%`,
                }}
              >
                {hovered.title}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="map-legend" aria-label="လမ်းညွှန်စာရင်း">
          {legendCols.map((col, ci) => (
            <ol
              key={ci}
              className="map-legend-col"
              start={ci === 0 ? 1 : col[0]?.id || 1}
            >
              {col.map((item) => {
                const label = cleanLegendTitle(item.title);
                const area = data.areas.find(
                  (a) =>
                    a.title === label ||
                    label.includes(a.title) ||
                    a.title.includes(label)
                );
                return (
                  <li
                    key={item.id}
                    className={[
                      item.path ? "linked" : "",
                      hovered?.id === area?.id ? "active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined}
                    onMouseEnter={() => area && setHovered(area)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => goTo(item.path)}
                    role={item.path ? "link" : undefined}
                  >
                    <span className="mm-num">{toMmNum(item.id)}</span>
                    <span className="mm-label">{label}</span>
                  </li>
                );
              })}
            </ol>
          ))}
        </aside>
      </div>
    </div>
  );
}
