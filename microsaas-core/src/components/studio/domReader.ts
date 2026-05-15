export type PageContext = {
  url: string;
  title: string;
  path: string;
  visibleText: string;
  selection: string;
  headings: string[];
  links: number;
  timestamp: string;
};

export function readPageContext(): PageContext {
  if (typeof document === "undefined") {
    return {
      url: "", title: "", path: "", visibleText: "",
      selection: "", headings: [], links: 0, timestamp: "",
    };
  }

  const selection = window.getSelection()?.toString().trim() || "";

  const main = document.querySelector("main") || document.body;
  const textNodes: string[] = [];
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = node.textContent?.trim();
    if (t && t.length > 20) textNodes.push(t.slice(0, 200));
    if (textNodes.length >= 10) break;
  }

  const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((h) => h.textContent?.trim() || "")
    .filter(Boolean);

  return {
    url: window.location.href,
    title: document.title,
    path: window.location.pathname,
    visibleText: textNodes.join("\n").slice(0, 3000),
    selection,
    headings: headings.slice(0, 15),
    links: document.querySelectorAll("a").length,
    timestamp: new Date().toISOString(),
  };
}

export function formatContext(ctx: PageContext): string {
  const parts = [`📄 Página: ${ctx.title}`, `🔗 URL: ${ctx.url}`];
  if (ctx.selection) parts.push(`📝 Selecionado: "${ctx.selection.slice(0, 200)}"`);
  if (ctx.headings.length) parts.push(`📑 Seções: ${ctx.headings.join(" · ")}`);
  if (ctx.visibleText) parts.push(`📖 Conteúdo: ${ctx.visibleText.slice(0, 500)}`);
  parts.push(`⏱ ${new Date(ctx.timestamp).toLocaleTimeString("pt-BR")}`);
  return parts.join("\n");
}
