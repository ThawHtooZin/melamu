import { Link, Outlet, useLocation } from "react-router-dom";
import { FOOTER_NAV, SITE_TITLE, TOP_NAV } from "../chrome";
import type { Manifest } from "../types";
import { FooterIcon } from "./FooterIcon";

type Props = { manifest: Manifest };

export function Layout({ manifest }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <header className="kiosk-header">
        <Link to="/">
          <img
            className="kiosk-logo"
            src="/media/SDG-Logo-copy-1.png"
            alt="Melamu"
            width={68}
            height={68}
          />
        </Link>
        <h1 className="kiosk-title">{SITE_TITLE}</h1>
        <Link to="/" style={{ justifySelf: "end" }}>
          <img
            className="kiosk-logo"
            src="/media/SDG-Logo-copy-1.png"
            alt=""
            width={68}
            height={68}
          />
        </Link>
      </header>

      <nav className="top-nav" aria-label="Main categories">
        {TOP_NAV.map((item) => {
          const active =
            pathname === item.path ||
            decodeURIComponent(pathname) === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={active ? "nav-rect active" : "nav-rect"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="kiosk-main">
        <Outlet context={{ manifest }} />
      </main>

      <footer className="kiosk-footer">
        {FOOTER_NAV.map((item, i) => (
          <Link key={item.label + i} to={item.path} className="footer-item">
            <FooterIcon name={item.icon} img={item.img} />
            <span>{item.label}</span>
          </Link>
        ))}
      </footer>
    </div>
  );
}
