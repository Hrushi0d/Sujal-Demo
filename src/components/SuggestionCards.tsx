import {
  LineChart,
  LayoutDashboard,
  Images,
  GalleryHorizontal,
  Table,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

interface Suggestion {
  icon: LucideIcon;
  title: string;
  description: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: LayoutDashboard,
    title: "Sales dashboard",
    description: "Stat cards + revenue chart + activity",
    prompt:
      "Create an analytics dashboard for an e-commerce store. Top row: 4 stat cards (Revenue $124,580, Orders 1,284, Avg Order $96.94, Conversion 3.4%), each with a small trend indicator. Below: an area chart of monthly revenue over the last 8 months on the left, and a list of 5 recent orders on the right. End with 3 follow-up suggestions.",
  },
  {
    icon: LineChart,
    title: "Stock chart",
    description: "Line chart with metrics and tags",
    prompt:
      "Build a stock detail view for AAPL. Header with the ticker and current price ($227.34, +1.2%), 4 metric chips (Open, High, Low, Volume), a line chart of the last 30 days of daily close prices, and a 'Headlines' list with 3 recent news items.",
  },
  {
    icon: GalleryHorizontal,
    title: "Product carousel",
    description: "Hero carousel + feature grid",
    prompt:
      "Design a landing section for a sneaker brand 'Lumen Run'. A hero carousel with 4 product cards (each: image, name, price, color tag), a 3-column feature grid below highlighting Cushioning, Breathability, and Recycled Materials, and a primary CTA button.",
  },
  {
    icon: Images,
    title: "Image gallery",
    description: "Travel destinations with tags",
    prompt:
      "Create a 'Top 6 weekend trips from Tokyo' gallery: an image gallery of 6 destinations (Hakone, Nikko, Kamakura, Yokohama, Karuizawa, Atami), each with a short caption, a price-from tag, and a duration chip. Add a callout at the top with travel-tips.",
  },
  {
    icon: Table,
    title: "Comparison table",
    description: "Pricing tiers side-by-side",
    prompt:
      "Build a SaaS pricing comparison. Three plans: Hobby ($0), Pro ($29/mo, recommended), Enterprise (Custom). Show a comparison table with 8 features (rows) and three columns of checkmarks/values. Pro column should be visually highlighted. Include a CTA per plan.",
  },
  {
    icon: ShoppingBag,
    title: "Product page",
    description: "Image, specs, reviews, related",
    prompt:
      "Generate a product detail page for a wireless over-ear headphone 'Aria Pro'. Left: large image plus 3 thumbnails. Right: title, price ($349), 4-star rating with 1,247 reviews, color picker (Black, Sand, Forest), Add-to-cart button. Below: a specs table and a carousel of 4 related products.",
  },
];

interface SuggestionCardsProps {
  onPick: (prompt: string) => void;
}

export function SuggestionCards({ onPick }: SuggestionCardsProps) {
  return (
    <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {SUGGESTIONS.map((s) => (
        <button
          key={s.title}
          onClick={() => onPick(s.prompt)}
          className="group surface surface-hover relative flex flex-col items-start gap-3 overflow-hidden rounded-xl px-4 py-3.5 text-left transition-all"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.02] text-muted-foreground transition-colors group-hover:border-white/15 group-hover:text-foreground">
            <s.icon className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-foreground">{s.title}</p>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {s.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
