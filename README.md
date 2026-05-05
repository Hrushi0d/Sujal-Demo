# OpenUI Demo

A minimal dark-mode chat that turns natural-language prompts into live UI
using [OpenUI](https://openui.com) (Thesys's generative-UI framework).

Bring your own LLM — supports **Groq**, **OpenRouter**, and **Google Gemini**
out of the box. No separate backend; the Vite app calls the chosen provider
directly from the browser.

The chat shell is built with React 19 + Tailwind + a small set of ShadCN-style
primitives. Generated UI renders inline as a result card and in a right-side
preview drawer with a Code tab, using OpenUI's `<Renderer />` and the built-in
`openuiLibrary` component set.

## Setup

```bash
npm install
cp .env.example .env.local
# pick ONE provider and paste its API key into .env.local
npm run dev
```

Then open http://localhost:5173 (or 5174 if 5173 is busy). You can also click
the gear icon at the top right to switch provider/model/key at runtime —
those settings save to localStorage and override `.env.local`.

## Providers

| Provider | Get a key | Recommended model |
| --- | --- | --- |
| **Groq** | [console.groq.com/keys](https://console.groq.com/keys) | `openai/gpt-oss-120b` (reasoning model, very fast) |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | `openai/gpt-4o-mini` (cheap), `anthropic/claude-3.5-sonnet` (best) |
| **Google Gemini** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `gemini-2.5-flash` (fast), `gemini-2.5-pro` (best) |

You can set keys for **all three** in `.env.local`; switch between them in the
in-app Settings dialog without restarting.

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_LLM_PROVIDER` | auto | `groq` \| `openrouter` \| `gemini`. Auto-detected from whichever key is set. |
| `VITE_LLM_MODEL` | provider default | Any model id the provider supports. |
| `VITE_GROQ_API_KEY` | — | Groq key. |
| `VITE_OPENROUTER_API_KEY` | — | OpenRouter key. |
| `VITE_GEMINI_API_KEY` | — | Google AI Studio key. |

> ⚠️ The browser calls the LLM directly using `dangerouslyAllowBrowser`-style
> options. Fine for a local demo — **don't deploy as-is**, or your key will be
> visible in the bundle. If you ship it, put a tiny proxy in front.

## OpenUI Agent Skill

This project ships the OpenUI Agent Skill at
`.claude/skills/openui/SKILL.md`. When Claude Code / Cursor / Codex run inside
this folder, they automatically get OpenUI Lang knowledge — component-library
design, syntax, system-prompt generation, the Renderer, and how to debug
malformed LLM output.

> The user-supplied link `openui.com/docs/mcp` describes this same skill;
> Thesys ships it as a Claude Code Agent Skill rather than a separate MCP
> server. To re-install or update the skill:
>
> ```bash
> # Skills CLI (works across all AI assistants)
> npx skills add thesysdev/openui --skill openui
>
> # …or copy from upstream
> curl -L https://raw.githubusercontent.com/thesysdev/openui/main/skills/openui/SKILL.md \
>   -o .claude/skills/openui/SKILL.md
> ```

## How it works

```
User prompt
   ↓
useChat → resolveLLMConfig() → Groq | OpenRouter | Gemini
            (system prompt = library.prompt() with rich-component preamble)
   ↓
streamed OpenUI Lang
   ↓
ResultCard renders inline + drawer "Open full" gives a Preview/Code split view
```

## File map

```
src/
├── lib/
│   ├── llm/
│   │   ├── types.ts                 # ProviderId, LLMConfig, ChatTurn
│   │   ├── storage.ts               # localStorage + env config resolver
│   │   ├── providers/
│   │   │   ├── openai-compat.ts     # Groq + OpenRouter (different baseURL)
│   │   │   └── gemini.ts            # Google Generative AI
│   │   └── index.ts                 # streamGenerate(args), currentConfig()
│   ├── openui.ts                    # openuiLibrary + system prompt
│   └── utils.ts
├── hooks/useChat.ts                 # messages, streaming, send/regenerate
├── components/
│   ├── ui/                          # button, textarea, sheet, dialog, input
│   ├── WelcomeHeader.tsx
│   ├── ChatComposer.tsx
│   ├── SuggestionCards.tsx          # 6 prompts that exercise rich components
│   ├── ChatMessages.tsx
│   ├── ResultCard.tsx               # inline rendered UI + toolbar
│   ├── GeneratedUIPreview.tsx       # full-screen drawer w/ Preview/Code tabs
│   └── SettingsDialog.tsx           # provider/model/key picker
├── App.tsx
└── main.tsx
```
