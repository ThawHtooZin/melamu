/** Fixed kiosk chrome matching the original Melamu WP Theme Builder. */

export const SITE_TITLE =
  "ဆုတောင်းပြည့် မယ်လမုစေတီတော် သမိုင်းအချက်အလက်များနှင့် ဘုရားဖူးလမ်းညွှန်";

export const TOP_NAV = [
  { path: "/စေတီတော်ဆိုင်ရာ", label: "စေတီတော်ဆိုင်ရာ" },
  { path: "/mlm-သာသနိကအဆောက်အအုံများ", label: "သာသနိကအဆောက်အအုံများ" },
  { path: "/mlm-ကိုးကွယ်ယုံကြည်မှု", label: "ကိုးကွယ်ယုံကြည်မှု" },
  { path: "/mlm-ပြတိုက်ပြခန်း-2", label: "မဟာဗုဒ္ဓဝင် ပြတိုက်၊ ပြခန်း" },
  { path: "/mlm-general", label: "အထွေထွေ" },
] as const;

export type FooterIcon = "home" | "pagoda" | "places" | "teachings" | "festival" | "map";

export const FOOTER_NAV: {
  path: string;
  label: string;
  icon: FooterIcon;
  img?: string;
}[] = [
  { path: "/", label: "ပင်မစာမျက်နှာ", icon: "home" },
  {
    path: "/",
    label: "မယ်လမုစေတီတော်",
    icon: "pagoda",
    img: "/media/icons8-asia-64.png",
  },
  { path: "/mlm-ဖူးမြှော်ရန်နေရာများ-2", label: "ဖူးမြော်ရန်နေရာများ", icon: "places" },
  { path: "/mlm-buddha-teaching-main", label: "ဗုဒ္ဓအဆုံးအမများ", icon: "teachings" },
  { path: "/mlm-festival", label: "ပွဲတော်များ", icon: "festival" },
  { path: "/mlm-map", label: "ဘုရားဖူးလမ်းညွှန်", icon: "map" },
];

export const HOME_HERO_IMAGES = [
  "/media/MoutOu.jpg",
  "/media/DSC06266-1.jpg",
  "/media/cover-final-1.jpg",
  "/media/DSC_0517.jpg",
];
