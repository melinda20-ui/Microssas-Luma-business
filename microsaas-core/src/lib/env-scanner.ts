import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(process.cwd());
const LUMA_OS_ROOT = "/root/luma-os";

const ENV_PATHS = [
  { file: ".env.local", scope: "frontend" },
  { file: ".env", scope: "api" },
  { file: ".env.example", scope: "api" },
];

const ENV_DIRS = [
  { dir: LUMA_OS_ROOT, name: "luma-os (PRIMARY)" },
  { dir: ".", name: "microsaas-core" },
  { dir: "../agents-api", name: "agents-api" },
];

const KEY_ALIASES: Record<string, string[]> = {
  OLLAMA_URL: ["OLLAMA_BASE_URL"],
  OLLAMA_MODEL: ["OLLAMA_MODEL_CHAT"],
  SUPABASE_URL: ["NEXT_PUBLIC_SUPABASE_URL"],
  SUPABASE_ANON_KEY: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  SUPABASE_SERVICE_KEY: ["SUPABASE_SERVICE_ROLE_KEY"],
  STRIPE_WEBHOOK_SECRET: ["STRIPE_WEBHOOK_SECRET"],
};

export type EnvVar = {
  key: string;
  value: string | null;
  source: string;
  runtime: boolean;
};

export type EnvFile = {
  path: string;
  name: string;
  vars: EnvVar[];
};

export type Integration = {
  name: string;
  status: "ready" | "partial" | "missing";
  required: string[];
  found: string[];
  missing: string[];
  source: string;
};

const INTEGRATIONS: { name: string; required: string[]; source: string }[] = [
  { name: "Gemini AI", required: ["GEMINI_API_KEY"], source: "luma-os .env.local" },
  { name: "Ollama Local", required: ["OLLAMA_URL", "OLLAMA_MODEL"], source: "luma-os .env" },
  { name: "Stripe Payments", required: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], source: "luma-os .env.local" },
  { name: "Discord Notifications", required: ["DISCORD_WEBHOOK_URL"], source: "luma-os .env.local" },
  { name: "Discord Bot Conversacional", required: ["DISCORD_BOT_TOKEN"], source: "luma-os .env.local" },
  { name: "Agents API", required: ["NEXT_PUBLIC_AGENT_API_URL"], source: "microsaas-core .env.local" },
  { name: "Supabase Auth", required: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_KEY"], source: "luma-os .env" },
  { name: "Brevo Email", required: ["BREVO_API_KEY", "BREVO_FROM_EMAIL"], source: "luma-os .env.local" },
  { name: "WhatsApp API", required: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"], source: "luma-os .env.local" },
  { name: "N8N Workflows", required: ["N8N_BASE_URL", "N8N_API_KEY"], source: "luma-os .env" },
  { name: "OpenRouter/OpenAI", required: ["OPENROUTER_API_KEY"], source: "luma-os .env.local" },
  { name: "xAI Grok", required: ["XAI_API_KEY"], source: "luma-os .env.local" },
];

function isPlaceholder(val: string): boolean {
  return !val || val === "SUA_CHAVE_AQUI" || val.startsWith("SUA_") || val.startsWith("seu_");
}

function readEnvFile(filePath: string): Record<string, string> {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const vars: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      const clean = val.replace(/^["']|["']$/g, "");
      if (key && !isPlaceholder(clean)) vars[key] = clean;
    }
    return vars;
  } catch {
    return {};
  }
}

function resolveKey(allVars: Record<string, string>, key: string): string | undefined {
  const direct = allVars[key];
  if (direct) return direct;
  const aliases = KEY_ALIASES[key];
  if (aliases) {
    for (const alias of aliases) {
      const v = allVars[alias];
      if (v) return v;
    }
  }
  return undefined;
}

export function scanEnvFiles(): EnvFile[] {
  const files: EnvFile[] = [];
  for (const { dir, name } of ENV_DIRS) {
    for (const { file, scope } of ENV_PATHS) {
      const fullPath = path.resolve(dir, file);
      const fileVars = readEnvFile(fullPath);
      const vars: EnvVar[] = Object.entries(fileVars).map(([key, value]) => ({
        key,
        value: key.includes("KEY") || key.includes("SECRET") || key.includes("TOKEN")
          ? value.slice(0, 16) + "..."
          : value,
        source: `${name}/${file}`,
        runtime: !!process.env[key],
      }));
      if (vars.length > 0) {
        files.push({ path: fullPath, name, vars });
      }
    }
  }
  return files;
}

export function getRuntimeEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}

export function checkIntegrations(): Integration[] {
  const allFileVars: Record<string, string> = {};
  for (const { dir, name } of ENV_DIRS) {
    for (const { file } of ENV_PATHS) {
      const fullPath = path.resolve(dir, file);
      const vars = readEnvFile(fullPath);
      for (const [k, v] of Object.entries(vars)) {
        if (!allFileVars[k]) allFileVars[k] = v;
      }
    }
  }

  const hardcoded: Record<string, string> = {};
  try {
    const supabasePath = path.resolve(PROJECT_ROOT, "src/lib/supabase.ts");
    const raw = fs.readFileSync(supabasePath, "utf8");
    const matches = raw.matchAll(/const (SUPABASE_\w+) = "([^"]+)"/g);
    for (const m of matches) {
      if (!isPlaceholder(m[2])) hardcoded[m[1]] = m[2];
    }
  } catch {}

  return INTEGRATIONS.map(({ name, required, source }) => {
    const found: string[] = [];
    const missing: string[] = [];
    for (const key of required) {
      const resolved = resolveKey(allFileVars, key) || process.env[key] || hardcoded[key];
      if (resolved && !isPlaceholder(resolved)) {
        found.push(key);
      } else {
        missing.push(key);
      }
    }
    const status = missing.length === 0 ? "ready" : found.length > 0 ? "partial" : "missing";
    return { name, status, required, found, missing, source };
  });
}

export function requireEnv(key: string, context: string): string {
  const val = process.env[key] || readEnvFilesForKey(key);
  if (val && !isPlaceholder(val)) return val;
  console.warn(`[env-scanner] ${key} not found — needed by ${context}`);
  console.warn(`[env-scanner] Checked:`, ENV_DIRS.map(d => path.resolve(d.dir)).join(", "));
  console.warn(`[env-scanner] Also check luma-os: ${LUMA_OS_ROOT}/.env or .env.local`);
  return "";
}

function readEnvFilesForKey(key: string): string | undefined {
  const allVars: Record<string, string> = {};
  for (const { dir } of ENV_DIRS) {
    for (const { file } of ENV_PATHS) {
      const vars = readEnvFile(path.resolve(dir, file));
      Object.assign(allVars, vars);
    }
  }
  return resolveKey(allVars, key);
}

export function diagnosticReport(): string {
  const files = scanEnvFiles();
  const integrations = checkIntegrations();

  const lines: string[] = [];
  lines.push("=".repeat(60));
  lines.push("  LUMA OS — ENV DIAGNOSTIC REPORT");
  lines.push("=".repeat(60));

  lines.push(`\n📁 Primary Env Source: ${LUMA_OS_ROOT}`);
  lines.push(`   (scanned first — overrides project-level .env)`);

  lines.push("\n📁 .env Files Found:");
  for (const f of files) {
    const tag = f.name.includes("PRIMARY") ? " ★ PRIMARY" : "";
    lines.push(`  ${tag} ${f.path}`);
    for (const v of f.vars) {
      lines.push(`    ${v.key}=${v.value}`);
    }
  }

  lines.push("\n🔌 Integration Status:");
  for (const i of integrations) {
    const icon = i.status === "ready" ? "✅" : i.status === "partial" ? "⚠️" : "❌";
    lines.push(`  ${icon} ${i.name} (${i.source})`);
    if (i.found.length) lines.push(`     found: ${i.found.join(", ")}`);
    if (i.missing.length) lines.push(`     missing: ${i.missing.join(", ")}`);
  }

  const ready = integrations.filter(i => i.status === "ready");
  const partial = integrations.filter(i => i.status === "partial");
  const missing = integrations.filter(i => i.status === "missing");

  lines.push("\n" + "=".repeat(60));
  lines.push(`  ✅ ${ready.length} ready  ⚠️  ${partial.length} partial  ❌ ${missing.length} missing`);

  // Discord bot validation
  try {
    const lumaEnvLocal = readEnvFile(path.resolve(LUMA_OS_ROOT, ".env.local"));
    const botStatus = lumaEnvLocal["DISCORD_BOT_STATUS"];
    if (botStatus === "invalid_token") {
      lines.push("\n⚠️ Discord Bot: token presente mas rejeitado pela API Discord.");
      lines.push("   → Resete o token no Discord Developer Portal e atualize DISCORD_BOT_TOKEN.");
    }
  } catch {}

  if (missing.length === 0 && partial.length === 0) {
    lines.push("\nAll integrations inherited from luma-os.");
  } else {
    lines.push("\nStill needed:");
    for (const i of missing) {
      lines.push(`     ❌ ${i.name}: ${i.missing.join(", ")}`);
    }
    for (const i of partial) {
      if (i.missing.length) lines.push(`     ⚠️  ${i.name}: ${i.missing.join(", ")}`);
    }
  }
  lines.push("=".repeat(60));
  return lines.join("\n");
}
