// Connection helper for Framer API
// Usage: import { getFramer, loadConfig, withRetry } from './connect.js'
//
// const { framer, disconnect } = await getFramer()
// // ... do work ...
// await disconnect()

import { connect, isRetryableError } from "framer-api";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, "../config/framer-config.json");

const CONNECTION_TIMEOUT_MS = 30000;

export function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      "Config not found. Copy config/framer-config.example.json → config/framer-config.json and fill in your values."
    );
  }
  let raw;
  try {
    raw = readFileSync(CONFIG_PATH, "utf-8");
  } catch {
    throw new Error("Failed to read config file.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Config file contains invalid JSON.");
  }
}

function resolveHome(p) {
  return p.startsWith("~") ? p.replace("~", process.env.HOME) : p;
}

function getApiKey(config) {
  // Env var takes priority
  if (process.env.FRAMER_API_KEY) return process.env.FRAMER_API_KEY;

  // Read from file
  if (config.apiKeyFile) {
    const keyPath = resolveHome(config.apiKeyFile);
    if (existsSync(keyPath)) {
      return readFileSync(keyPath, "utf-8").trim();
    }
  }

  throw new Error(
    "No API key found. Set FRAMER_API_KEY env var or configure apiKeyFile in framer-config.json"
  );
}

/**
 * Retry wrapper for transient Framer API errors.
 * Usage: const result = await withRetry(() => framer.someMethod());
 */
export async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (!isRetryableError(e) || attempt === maxRetries - 1) throw e;
      const delay = 1000 * (attempt + 1);
      console.error(`Retryable error, attempt ${attempt + 1}/${maxRetries}, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Sanitize error messages to avoid leaking API keys or full paths.
 */
export function sanitizeError(err) {
  let msg = err?.message || String(err);
  // Strip anything that looks like an API key (long hex/base64 tokens)
  msg = msg.replace(/[A-Za-z0-9_-]{32,}/g, "[REDACTED]");
  // Strip home directory paths
  if (process.env.HOME) {
    msg = msg.replaceAll(process.env.HOME, "~");
  }
  return msg;
}

export async function getFramer() {
  const config = loadConfig();
  const apiKey = getApiKey(config);

  // Connect with timeout
  let framer;
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Connection timeout after 30s")), CONNECTION_TIMEOUT_MS)
  );
  try {
    framer = await Promise.race([connect(config.projectUrl, apiKey), timeoutPromise]);
  } catch (e) {
    console.error(`Connection failed: ${sanitizeError(e)}`);
    process.exit(1);
  }

  // Auto-disconnect on exit
  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    try { await framer.disconnect(); } catch {}
  };
  process.on("SIGINT", async () => { await cleanup(); process.exit(130); });
  process.on("SIGTERM", async () => { await cleanup(); process.exit(143); });
  process.on("beforeExit", cleanup);

  return { framer, config, disconnect: () => framer.disconnect() };
}

/**
 * Parse JSON from CLI arg with safe error handling.
 */
export function safeParseJSON(str, label = "input") {
  try {
    return JSON.parse(str);
  } catch {
    console.error(`Invalid JSON in ${label}. Check syntax and try again.`);
    process.exit(1);
  }
}
