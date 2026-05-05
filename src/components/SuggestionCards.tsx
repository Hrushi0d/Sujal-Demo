import { cn } from "@/lib/utils";

interface Suggestion {
  title: string;
  prompt: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    title: "Build a sales dashboard",
    prompt:
      "Create an analytics dashboard for an e-commerce store. Top row: 4 stat cards (Revenue $124,580, Orders 1,284, Avg Order $96.94, Conversion 3.4%) each with a trend indicator. Below: an area chart of monthly revenue over 8 months on the left and a list of 5 recent orders on the right. End with 3 follow-up suggestions.",
  },
  {
    title: "Show a stock chart for AAPL",
    prompt:
      "Build a stock detail view for AAPL. Header with the ticker and current price ($227.34, +1.2%), 4 metric chips (Open, High, Low, Volume), a line chart of the last 30 days of daily close prices, and a 'Headlines' list with 3 recent news items.",
  },
  {
    title: "Design a product page",
    prompt:
      "Generate a product page for a wireless over-ear headphone 'Aria Pro'. Left: a large image plus 3 thumbnails. Right: title, price ($349), 4-star rating with 1,247 reviews, color picker (Black, Sand, Forest), Add-to-cart button. Below: a specs table and a carousel of 4 related products.",
  },
];

interface SuggestionCardsProps {
  onPick: (prompt: string) => void;
  className?: string;
}

export function SuggestionCards({ onPick, className }: SuggestionCardsProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-start gap-2", className)}>
      {SUGGESTIONS.map((s) => (
        <button
          key={s.title}
          onClick={() => onPick(s.prompt)}
          className="pill-surface pill-hover rounded-full px-4 py-1.5 text-[12.5px] text-foreground/85 transition-colors hover:text-foreground"
        >
          {s.title}
        </button>
      ))}
    </div>
  );
}
