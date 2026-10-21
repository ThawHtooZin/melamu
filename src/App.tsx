import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ContentPage } from "./components/ContentPage";
import { Home } from "./components/Home";
import { Layout } from "./components/Layout";
import { MapPage } from "./components/MapPage";
import type { Manifest } from "./types";

export default function App() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/manifest.json")
      .then(async (r) => {
        if (!r.ok) throw new Error("manifest.json missing — run the scrape script");
        return r.json() as Promise<Manifest>;
      })
      .then(setManifest)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="status">
        <p>Could not load site data.</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!manifest) {
    return <div className="status">မယ်လမုဘုရား စတင်နေသည်…</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout manifest={manifest} />}>
          {/* No pagoda picker — Melamu home is the front door */}
          <Route index element={<Home />} />
          <Route path="my-page" element={<Navigate to="/" replace />} />
          <Route path="landing" element={<Navigate to="/" replace />} />
          <Route path="mlm-map" element={<MapPage />} />
          <Route path="*" element={<ContentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
