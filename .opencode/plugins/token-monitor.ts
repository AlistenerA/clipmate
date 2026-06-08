import { Database } from "bun:sqlite"
import { join } from "path"
import { homedir } from "os"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

// ─── Types ────────────────────────────────────────────────

interface TokenUsage {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
  total: number
}

interface ModelPricing {
  inputCacheMissPerM: number
  inputCacheHitPerM: number
  outputPerM: number
}

interface SessionStats {
  sessionId: string
  title: string
  model: string
  usage: TokenUsage
  costRmb: number
  messageCount: number
  lastUpdated: number
}

interface CumulativeStats {
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCostRmb: number
  sessionCount: number
  sessions: Record<string, SessionStats>
  lastUpdated: number
}

// ─── Constants ─────────────────────────────────────────────

const DB_PATH = join(homedir(), ".local", "share", "opencode", "opencode.db")
const STATS_DIR = join(homedir(), ".config", "opencode")
const STATS_FILE = join(STATS_DIR, "token-stats.json")

// ─── DeepSeek Official Pricing (RMB per 1M tokens) ─────────
// Source: https://api-docs.deepseek.com/zh-cn/quick_start/pricing

const PRICING: Record<string, ModelPricing> = {
  "deepseek-v4-pro":           { inputCacheMissPerM: 3.00, inputCacheHitPerM: 0.025, outputPerM: 6.00 },
  "deepseek/deepseek-v4-pro":  { inputCacheMissPerM: 3.00, inputCacheHitPerM: 0.025, outputPerM: 6.00 },
  "deepseek-v4-flash":         { inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
  "deepseek/deepseek-v4-flash":{ inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
  "deepseek-chat":             { inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
  "deepseek-reasoner":         { inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
  "deepseek/deepseek-chat":    { inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
  "deepseek/deepseek-reasoner":{ inputCacheMissPerM: 1.00, inputCacheHitPerM: 0.02,  outputPerM: 2.00 },
}

const DEFAULT_PRICING: ModelPricing = { inputCacheMissPerM: 3.00, inputCacheHitPerM: 0.025, outputPerM: 6.00 }

// ─── Utility Functions ─────────────────────────────────────

function getPricing(modelId: string): ModelPricing {
  // Try exact match, then prefix match, then default
  if (PRICING[modelId]) return PRICING[modelId]!

  const cleanModel = modelId.replace(/^deepseek\//, "")
  for (const [key, val] of Object.entries(PRICING)) {
    if (key === cleanModel || key.endsWith(`/${cleanModel}`)) return val
  }
  return DEFAULT_PRICING
}

function calculateCost(modelId: string, input: number, output: number, reasoning: number): number {
  const p = getPricing(modelId)
  // Use full input price (no cache-hit discount since opencode's tokens_cache_read
  // is NOT the same as DeepSeek's cache-hit tokens — it's context KV cache reads)
  // Reasoning tokens are billed at the same rate as output tokens per DeepSeek
  const totalOutput = output + reasoning
  return Math.round(
    ((input / 1_000_000) * p.inputCacheMissPerM +
     (totalOutput / 1_000_000) * p.outputPerM) * 100000
  ) / 100000
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return String(n)
}

function fmtRmb(cost: number): string {
  if (cost <= 0) return "¥0"
  if (cost < 0.001) return `${(cost * 100).toFixed(2)}分`
  if (cost < 1) return `¥${cost.toFixed(4)}`
  return `¥${cost.toFixed(2)}`
}

// ─── Persistence ───────────────────────────────────────────

function readStats(): CumulativeStats {
  try {
    if (existsSync(STATS_FILE)) {
      const raw = readFileSync(STATS_FILE, "utf-8")
      return JSON.parse(raw)
    }
  } catch { /* ignore */ }
  return createEmptyStats()
}

function createEmptyStats(): CumulativeStats {
  return {
    totalTokens: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostRmb: 0,
    sessionCount: 0,
    sessions: {},
    lastUpdated: Date.now(),
  }
}

function writeStats(stats: CumulativeStats): void {
  if (!existsSync(STATS_DIR)) mkdirSync(STATS_DIR, { recursive: true })
  stats.lastUpdated = Date.now()
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8")
}

function updateStats(
  sessionId: string,
  title: string,
  model: string,
  tokensInput: number,
  tokensOutput: number,
  tokensReasoning: number,
  tokensCacheRead: number,
  tokensCacheWrite: number,
  messageCount: number,
): { costRmb: number; isNewSession: boolean } {
  const stats = readStats()
  const existing = stats.sessions[sessionId]
  const isNewSession = !existing

  const costRmb = calculateCost(model, tokensInput, tokensOutput, tokensReasoning)

  stats.sessions[sessionId] = {
    sessionId,
    title,
    model,
    usage: {
      input: tokensInput,
      output: tokensOutput,
      reasoning: tokensReasoning,
      cacheRead: tokensCacheRead,
      cacheWrite: tokensCacheWrite,
      total: tokensInput + tokensOutput + tokensReasoning,
    },
    costRmb,
    messageCount,
    lastUpdated: Date.now(),
  }

  // Recalculate global totals
  stats.totalTokens = 0
  stats.totalInputTokens = 0
  stats.totalOutputTokens = 0
  stats.totalCostRmb = 0
  stats.sessionCount = 0

  for (const s of Object.values(stats.sessions)) {
    stats.totalTokens += s.usage.total
    stats.totalInputTokens += s.usage.input
    stats.totalOutputTokens += s.usage.output
    stats.totalCostRmb += s.costRmb
    stats.sessionCount++
  }

  writeStats(stats)
  return { costRmb, isNewSession }
}

// ─── Database Query ────────────────────────────────────────

interface SessionRow {
  model: string | null
  title: string | null
  tokens_input: number | null
  tokens_output: number | null
  tokens_reasoning: number | null
  tokens_cache_read: number | null
  tokens_cache_write: number | null
}

/** Parse the model JSON from opencode's DB (e.g. {"id":"deepseek-v4-pro","providerID":"deepseek"}) */
function parseModelId(raw: string | null): string {
  if (!raw) return "unknown"
  try {
    const parsed = JSON.parse(raw)
    // Build a consistent key: "providerID/modelId"
    if (parsed.providerID && parsed.id) {
      return `${parsed.providerID}/${parsed.id}`
    }
    return parsed.id || parsed.model || raw
  } catch {
    return raw
  }
}

function querySession(sessionId: string): {
  model: string
  title: string
  tokensInput: number
  tokensOutput: number
  tokensReasoning: number
  tokensCacheRead: number
  tokensCacheWrite: number
  messageCount: number
} | null {
  if (!existsSync(DB_PATH)) return null

  let db: Database | null = null
  try {
    db = new Database(DB_PATH, { readonly: true })

    const row = db.query<SessionRow, [string]>(
      `SELECT model, title, tokens_input, tokens_output, tokens_reasoning, tokens_cache_read, tokens_cache_write
       FROM session WHERE id = ?`
    ).get(sessionId)

    if (!row) return null

    const msgCount = db.query<{ cnt: number }, [string]>(
      `SELECT COUNT(*) as cnt FROM message WHERE session_id = ?`
    ).get(sessionId)?.cnt || 0

    const modelId = parseModelId(row.model)

    return {
      model: modelId,
      title: row.title || "",
      tokensInput: row.tokens_input || 0,
      tokensOutput: row.tokens_output || 0,
      tokensReasoning: row.tokens_reasoning || 0,
      tokensCacheRead: row.tokens_cache_read || 0,
      tokensCacheWrite: row.tokens_cache_write || 0,
      messageCount: msgCount,
    }
  } catch {
    return null
  } finally {
    try { db?.close() } catch { /* ignore */ }
  }
}

// ─── Plugin (Silent Tracking) ────────────────────────────────

let currentSessionId = ""

export const TokenMonitor = async () => {
  const refresh = async (sid: string): Promise<void> => {
    if (!sid) return
    const data = querySession(sid)
    if (!data) return

    const totalTokens = data.tokensInput + data.tokensOutput + data.tokensReasoning
    if (totalTokens === 0) return

    updateStats(
      sid, data.title, data.model,
      data.tokensInput, data.tokensOutput, data.tokensReasoning,
      data.tokensCacheRead, data.tokensCacheWrite,
      data.messageCount,
    )
  }

  return {
    event: async ({ event }: {
      event: { type: string; properties?: { info?: { id?: string } } }
    }) => {
      switch (event.type) {
        case "session.created":
          currentSessionId = event.properties?.info?.id || currentSessionId
          break

        case "session.updated":
          if (event.properties?.info?.id) {
            currentSessionId = event.properties.info.id
          }
          break

        case "session.idle":
          await refresh(currentSessionId)
          break

        case "session.deleted": {
          const sid = event.properties?.info?.id
          if (sid) {
            const stats = readStats()
            delete stats.sessions[sid]
            writeStats(stats)
          }
          break
        }
      }
    },
  }
}

export const server = TokenMonitor
export default TokenMonitor
