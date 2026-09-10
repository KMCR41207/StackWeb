import livaani from "@/assets/work-livaani.jpg";
import farcarfix from "@/assets/work-farcarfix.jpg";
import primeflex from "@/assets/work-primeflex.jpg";
import svlt from "@/assets/work-svlt.jpg";
import asrinfra from "@/assets/work-asrinfra.jpg";
import peoplix from "@/assets/work-peoplix.jpg";

export type Project = {
  slug: string;
  client: string;
  type: string;
  result: string;
  year: string;
  image: string;
  alt: string;
  tags?: string[];
  url?: string;
};

export const projects: Project[] = [
  {
    slug: "livaani",
    client: "Livaani",
    type: "E-commerce / Brand",
    result: "A candle-lit storefront that lifted average order value by 34%.",
    year: "2025",
    image: livaani,
    alt: "Livaani home fragrance storefront with a dark editorial hero and product row",
    tags: ["E-commerce", "Brand", "Shopify"],
  },
  {
    slug: "farcarfix",
    client: "Farcarfix",
    type: "Booking platform",
    result: "Sixty-second booking flow; drop-off cut by more than half.",
    year: "2025",
    image: farcarfix,
    alt: "Farcarfix car repair booking site with a bold headline and booking form",
    tags: ["Booking", "Service", "React"],
  },
  {
    slug: "prime-flex",
    client: "Prime Flex",
    type: "Membership site",
    result: "Membership sign-ups doubled in the first eight weeks.",
    year: "2024",
    image: primeflex,
    alt: "Prime Flex gym membership site with oversized type and a training photograph",
    tags: ["Membership", "Fitness", "Marketing"],
  },
  {
    slug: "svlt",
    client: "SVLT",
    type: "Fashion / Shopify",
    result: "A stark retail experience built for repeat drops.",
    year: "2024",
    image: svlt,
    alt: "SVLT streetwear store with an oversized logotype and product grid",
    tags: ["Fashion", "Shopify", "E-commerce"],
  },
  {
    slug: "asr-infra",
    client: "ASR Infra",
    type: "Corporate site",
    result: "Tender enquiries up 3x with a credibility-first rebuild.",
    year: "2024",
    image: asrinfra,
    alt: "ASR Infra construction company site with a bridge photograph and statistics",
    tags: ["Corporate", "B2B", "Rebrand"],
  },
  {
    slug: "peoplix",
    client: "Peoplix",
    type: "SaaS product UI",
    result: "A full HR dashboard system shipped in six weeks.",
    year: "2023",
    image: peoplix,
    alt: "Peoplix HR dashboard with sidebar navigation, charts and an employee table",
    tags: ["SaaS", "Dashboard", "Product UI"],
    url: "https://peoplix.ai",
  },
];

export const navLinks = [
  { to: "/designs", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
] as const;
