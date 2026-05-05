import { useState } from "react";
import { Renderer } from "@openuidev/react-lang";
import {
  ThemeProvider,
  defaultDarkTheme,
  defaultLightTheme,
} from "@openuidev/react-ui";
import { Copy, Check, Sparkles, Code2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { library } from "@/lib/openui";
import { cn } from "@/lib/utils";

interface GeneratedUIPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string | null;
  isStreaming?: boolean;
  prompt?: string;
}

type Tab = "preview" | "code";

export function GeneratedUIPreview({
  open,
  onOpenChange,
  source,
  isStreaming,
  prompt,
}: GeneratedUIPreviewProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const { mode } = useTheme();

  const handleCopy = async () => {
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // noop
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            Generated UI
          </SheetTitle>
          {prompt ? (
            <SheetDescription className="line-clamp-2">
              {prompt}
            </SheetDescription>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex rounded-lg border border-border bg-secondary p-0.5">
              <TabBtn active={tab === "preview"} onClick={() => setTab("preview")}>
                <Sparkles className="mr-1 h-3 w-3" />
                Preview
              </TabBtn>
              <TabBtn active={tab === "code"} onClick={() => setTab("code")}>
                <Code2 className="mr-1 h-3 w-3" />
                Code
              </TabBtn>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!source}
              className="gap-1.5 text-muted-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {tab === "preview" ? (
            <div className="openui-render px-6 pb-10 pt-2">
              <ThemeProvider
                mode={mode}
                lightTheme={defaultLightTheme}
                darkTheme={defaultDarkTheme}
              >
                {source ? (
                  <Renderer
                    response={source}
                    library={library}
                    isStreaming={Boolean(isStreaming)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No content yet.</p>
                )}
              </ThemeProvider>
            </div>
          ) : (
            <pre className="m-6 max-h-[calc(100vh-180px)] overflow-auto rounded-xl border border-border bg-secondary/60 px-4 py-4 text-[12px] leading-relaxed text-foreground/90">
              <code>{source ?? "(empty)"}</code>
            </pre>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-medium transition-colors",
        active
          ? "bg-card text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
