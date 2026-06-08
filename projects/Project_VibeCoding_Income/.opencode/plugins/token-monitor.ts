import { Database } from "bun:sqlite"
import { join } from "path"
import { homedir } from "os"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
// Try loading the tool helper, gracefully degrade if unavailable
let toolHelper: ((def: unknown) => unknown) | null = null
try {
  toolHelper = (await import("@opencode-ai/plugin")).tool
} catch { /* @opencode-ai/plugin not installed, tool will use plain object */ }

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

function calculateCost(modelId: string, input: number, output: number, cacheRead: number): number {
  const p = getPricing(modelId)
  const cacheHit = Math.min(cacheRead, input)
  const cacheMiss = input - cacheHit

  return Math.round(
    ((cacheHit / 1_000_000) * p.inputCacheHitPerM +
     (cacheMiss / 1_000_000) * p.inputCacheMissPerM +
     (output / 1_000_000) * p.outputPerM) * 100000
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

  const costRmb = calculateCost(model, tokensInput, tokensOutput, tokensCacheRead)

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

// ─── Plugin ────────────────────────────────────────────────

let currentSessionId = ""
let lastToastTime = 0
const TOAST_INTERVAL = 4000 // ms between toasts

export const TokenMonitor = async ({ client }: {
  client: { tui: { showToast: (opts: { body: { message: string; variant: string } }) => Promise<unknown> } }
  [key: string]: unknown
}) => {
  const maybeToast = async (message: string): Promise<void> => {
    const now = Date.now()
    if (now - lastToastTime < TOAST_INTERVAL) return
    lastToastTime = now
    try {
      await client.tui.showToast({ body: { message, variant: "info" } })
    } catch { /* ignore */ }
  }

  const refresh = async (sid: string): Promise<void> => {
    if (!sid) return
    const data = querySession(sid)
    if (!data) return

    const { costRmb } = updateStats(
      sid, data.title, data.model,
      data.tokensInput, data.tokensOutput, data.tokensReasoning,
      data.tokensCacheRead, data.tokensCacheWrite,
      data.messageCount,
    )

    const total = data.tokensInput + data.tokensOutput
    if (total === 0) return

    const stats = readStats()
    const modelShort = data.model.replace("deepseek/", "")

    const parts: string[] = [
      `${modelShort}  ${fmtTokens(total)}t  ${fmtRmb(costRmb)}`,
    ]
    if (data.tokensCacheRead > 0) {
      parts.push(`缓存命中 ${fmtTokens(data.tokensCacheRead)}t`)
    }
    parts.push(`累计 ${fmtRmb(stats.totalCostRmb)}`)

    await maybeToast(parts.join("  "))
  }

  const tokensToolDef = {
    description: "显示 Token 消耗统计和费用（人民币），基于 DeepSeek 官方定价",
    args: {} as Record<string, never>,
    async execute(_args: Record<string, never>, _ctx: unknown): Promise<string> {
      const stats = readStats()
      const sessions = Object.values(stats.sessions)
        .sort((a, b) => b.lastUpdated - a.lastUpdated)

      const lines: string[] = [
        "",
        "Token Monitor 统计",
        "=".repeat(55),
      ]

      // Current session
      if (currentSessionId && stats.sessions[currentSessionId]) {
        const s = stats.sessions[currentSessionId]!
        lines.push("")
        lines.push("当前会话")
        lines.push(`  模型: ${s.model}`)
        lines.push(`  消息数: ${s.messageCount}`)
        lines.push(`  输入: ${fmtTokens(s.usage.input)}t`)
        if (s.usage.cacheRead > 0) lines.push(`  缓存命中: ${fmtTokens(s.usage.cacheRead)}t`)
        if (s.usage.reasoning > 0) lines.push(`  思考: ${fmtTokens(s.usage.reasoning)}t`)
        lines.push(`  输出: ${fmtTokens(s.usage.output)}t`)
        lines.push(`  费用: ${fmtRmb(s.costRmb)}`)
      }

      // All-time
      lines.push("")
      lines.push("历史累计")
      lines.push(`  总 Tokens: ${fmtTokens(stats.totalTokens)}`)
      lines.push(`  输入: ${fmtTokens(stats.totalInputTokens)}t`)
      lines.push(`  输出: ${fmtTokens(stats.totalOutputTokens)}t`)
      lines.push(`  总费用: ${fmtRmb(stats.totalCostRmb)}`)
      lines.push(`  会话数: ${stats.sessionCount}`)

      // Recent sessions
      if (sessions.length > 1) {
        lines.push("")
        lines.push("最近会话 (Top 5)")
        for (const s of sessions.slice(0, 5)) {
          const id = s.sessionId.slice(0, 8)
          const title = s.title || id
          const date = new Date(s.lastUpdated).toLocaleString("zh-CN", {
            month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
          })
          const name = title.length > 22 ? title.slice(0, 22) + "..." : title
          lines.push(`  ${name.padEnd(25)} ${fmtRmb(s.costRmb).padStart(10)}  ${date}`)
        }
      }

      // Pricing reference
      lines.push("")
      lines.push("DeepSeek 官方定价参考 (RMB/百万tokens)")
      lines.push("  deepseek-v4-pro:   输入 3.00  缓存命中 0.025  输出 6.00")
      lines.push("  deepseek-v4-flash: 输入 1.00  缓存命中 0.02   输出 2.00")
      lines.push("")

      return lines.join("\n")
    },
  }

  return {
    tool: {
      tokens: toolHelper ? toolHelper(tokensToolDef) : tokensToolDef,
    },

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

export default TokenMonitor
