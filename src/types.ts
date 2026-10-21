export type PageIndexItem = {
  id: number;
  slug: string;
  title: string;
  section: string;
};

export type NavItem = {
  path: string;
  title: string;
  id?: number;
};

export type HomeNav = {
  historyTiles: NavItem[];
  sideButtons: NavItem[];
  footer: NavItem[];
};

export type Manifest = {
  baseMedia: string;
  homeSlug: string;
  pageCount: number;
  sections: string[];
  index: PageIndexItem[];
  homeNav: HomeNav;
};

export type PageData = {
  id: number;
  slug: string;
  title: string;
  section: string;
  html: string;
  buttons: { href: string; text: string; path: string | null }[];
  linkOptions: {
    className: string;
    url: string;
    path: string | null;
    title?: string;
  }[];
};
