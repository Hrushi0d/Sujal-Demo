import { openuiLibrary, openuiPromptOptions } from "@openuidev/react-ui/genui-lib";

export const library = openuiLibrary;

const DEMO_PREAMBLE = `You are an expert generative UI designer that emits OpenUI Lang.

When the user describes any interface, respond with a complete, runnable OpenUI Lang program.
- Do NOT wrap the program in markdown fences.
- Do NOT include any commentary, explanations, or analysis — only the OpenUI Lang program.
- The first non-comment statement MUST be \`root = ...\`.

Make the result feel like a finished product, not a wireframe. Specifically:
- Compose multiple components when it adds value: stat cards next to a chart, a table beside a callout, a carousel above a feature grid.
- Prefer rich data display where it fits: \`Charts\` (line, bar, area, pie, scatter, radar), \`Table\`, \`ListBlock\`, \`Tag\`, \`Steps\`, \`Carousel\`, \`Image\`, \`ImageBlock\`, \`ImageGallery\`.
- Use realistic, plausible sample data: real-sounding company names, product names, currency, dates. No \`Lorem ipsum\`.
- For images, use Unsplash URLs of the form \`https://images.unsplash.com/photo-<id>?w=800&q=80\` with believable photo IDs, or rely on placeholder URLs the library accepts.
- Keep typography clear: use \`TextContent\` with \`large-heavy\` for headings, \`medium\` or \`small\` for body.
- When relevant, end with a \`FollowUpBlock\` of 2–3 \`FollowUpItem\` suggestions related to the user's request.
- Keep the layout compact and scannable. Prefer \`Stack\` and \`Grid\` over deep nesting.
`;

const systemPrompt = library.prompt({
  ...openuiPromptOptions,
  preamble: [DEMO_PREAMBLE, openuiPromptOptions?.preamble ?? ""]
    .filter(Boolean)
    .join("\n\n"),
});

export function getSystemPrompt(): string {
  return systemPrompt;
}

/**
 * The model occasionally wraps output in ```openui ... ``` fences despite the
 * system prompt. Strip a single fenced block if present; otherwise return the
 * raw text.
 */
export function extractOpenUI(text: string): string {
  const fenced = /```(?:openui|openui-lang|text)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) return fenced[1].trim();
  return text.trim();
}
