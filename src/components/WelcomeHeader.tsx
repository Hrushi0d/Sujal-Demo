import { Sparkles } from "lucide-react";

export function WelcomeHeader() {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="welcome-halo animate-halo-pulse" aria-hidden />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="relative mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur">
          <div
            className="absolute inset-0 rounded-2xl opacity-60 blur-md"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.45), transparent 65%)",
            }}
            aria-hidden
          />
          <Sparkles className="relative h-5 w-5 text-emerald-300/90" />
        </div>
        <h1 className="text-[30px] font-semibold tracking-tight text-foreground">
          What will you{" "}
          <span className="gradient-text-brand">build</span> today?
        </h1>
        <p className="max-w-[420px] text-[13.5px] leading-relaxed text-muted-foreground">
          Describe any interface — dashboards, gallery walls, pricing pages.
          The model writes <span className="text-foreground/80">OpenUI Lang</span>;
          we render it live.
        </p>
      </div>
    </div>
  );
}
