# Evolink Router API — Parameter Reference

Complete API reference for the Smart Router skill. All models accessed via `direct.evolink.ai` with a single `EVOLINK_API_KEY`.

---

## API Endpoints

Evolink provides three compatible API formats under one domain and one auth token:

| Provider | Format | Endpoint |
|----------|--------|----------|
| **Anthropic (Claude)** | Anthropic Messages API | `POST https://direct.evolink.ai/v1/messages` |
| **Google (Gemini)** | Gemini API | `POST https://direct.evolink.ai/v1beta/models/{model}:generateContent` |
| **All others** (GPT, DeepSeek, Kimi, Doubao) | OpenAI Chat Completions | `POST https://direct.evolink.ai/v1/chat/completions` |
| **Model list** | — | `GET https://direct.evolink.ai/v1/models` |

**Auth:** `Authorization: Bearer $EVOLINK_API_KEY` (all endpoints).

---

## Curl Examples

### Claude (Anthropic format)

```bash
curl https://direct.evolink.ai/v1/messages \
  -H "Authorization: Bearer $EVOLINK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":1024,"messages":[{"role":"user","content":"hello"}]}'
```

### GPT / DeepSeek / Kimi / Doubao (OpenAI format)

```bash
curl https://direct.evolink.ai/v1/chat/completions \
  -H "Authorization: Bearer $EVOLINK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5.1","messages":[{"role":"user","content":"hello"}]}'
```

### Gemini (Google format)

```bash
curl https://direct.evolink.ai/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer $EVOLINK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"hello"}]}]}'
```

### List all models

```bash
curl https://direct.evolink.ai/v1/models -H "Authorization: Bearer $EVOLINK_API_KEY"
```

---

## OpenClaw Configuration

Full formatted `~/.openclaw/openclaw.json` for Smart Router:

```json
{
  "providers": {
    "evolink": {
      "baseUrl": "https://direct.evolink.ai/v1",
      "apiKey": "${EVOLINK_API_KEY}"
    }
  },
  "models": {
    "evolink": {
      "enabled": true,
      "models": [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-6",
        "claude-opus-4-6",
        "gpt-5.1",
        "gpt-5.2",
        "gpt-5.1-thinking",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-3.1-pro-preview",
        "deepseek-chat",
        "deepseek-reasoner",
        "kimi-k2-thinking-turbo",
        "kimi-k2-thinking",
        "doubao-seed-2.0-pro",
        "doubao-seed-2.0-lite",
        "doubao-seed-2.0-mini",
        "doubao-seed-2.0-code"
      ]
    }
  },
  "agents": {
    "list": [
      {
        "name": "main",
        "model": "evolink/claude-sonnet-4-6",
        "permissions": {
          "spawn": ["*"],
          "maxSpawnDepth": 2
        }
      }
    ]
  }
}
```

**Notes:**
- Main agent uses Sonnet — best cost/performance for daily operation.
- `spawn: ["*"]` allows spawning sub-agents with any registered model.
- `maxSpawnDepth: 2` prevents infinite recursion.
- If existing config is present, merge keys — avoid overwriting user's other providers/agents.

---

## Complete Text Model List

### Tier 1 — Lightweight ($)

| Model | Provider | API Format | Best for |
|-------|----------|------------|----------|
| `claude-haiku-4-5-20251001` | Anthropic | Anthropic | Quick Q&A, classification, extraction, triage |
| `gemini-2.5-flash` | Google | Gemini | Multimodal understanding, fast reasoning |
| `gemini-2.5-flash-lite` | Google | Gemini | Ultra-lightweight, lowest latency |
| `doubao-seed-2.0-mini` | ByteDance | OpenAI | Chinese lightweight tasks |
| `doubao-seed-2.0-lite` | ByteDance | OpenAI | Chinese balanced lightweight |

### Tier 2 — Balanced ($$)

| Model | Provider | API Format | Best for |
|-------|----------|------------|----------|
| `claude-sonnet-4-6` | Anthropic | Anthropic | Coding, tool use, content creation |
| `claude-sonnet-4-5-20250929` | Anthropic | Anthropic | Previous-gen Sonnet (fallback) |
| `gpt-5.1` | OpenAI | OpenAI | General chat, instruction following |
| `gpt-5.1-chat` | OpenAI | OpenAI | Conversational variant |
| `gemini-2.5-pro` | Google | Gemini | Long context, multimodal |
| `gemini-3-flash-preview` | Google | Gemini | Next-gen fast preview |
| `deepseek-chat` | DeepSeek | OpenAI | Chinese dialogue, cost-effective |
| `doubao-seed-2.0-pro` | ByteDance | OpenAI | Chinese content creation |
| `doubao-seed-2.0-code` | ByteDance | OpenAI | Code generation (Chinese ecosystem) |
| `kimi-k2-thinking-turbo` | Moonshot | OpenAI | Chinese long-document understanding |

### Tier 3 — Flagship ($$$)

| Model | Provider | API Format | Best for |
|-------|----------|------------|----------|
| `claude-opus-4-6` | Anthropic | Anthropic | Deep reasoning, high-stakes decisions |
| `claude-opus-4-5-20251101` | Anthropic | Anthropic | Previous-gen Opus (fallback) |
| `gpt-5.2` | OpenAI | OpenAI | Strongest general capability |
| `gpt-5.1-thinking` | OpenAI | OpenAI | Complex chain-of-thought reasoning |
| `gemini-3.1-pro-preview` | Google | Gemini | Latest multimodal reasoning |
| `gemini-3-pro-preview` | Google | Gemini | Next-gen pro preview |
| `deepseek-reasoner` | DeepSeek | OpenAI | Math/logic reasoning specialist |
| `kimi-k2-thinking` | Moonshot | OpenAI | Deep Chinese reasoning |

---

## Detailed Routing Rules

### Task Type → Model Mapping

#### Tier 1 (Lightweight) Scenarios

| Scenario | Default | Alt model | Example |
|----------|---------|-----------|---------|
| Knowledge Q&A | Haiku | — | "What's a list comprehension in Python?" |
| Concept explanation | Haiku | — | "What is GDPR?" |
| Status query | Haiku | — | "Server status?" / "What's tomorrow?" |
| Simple translation | Haiku | — | "Translate this to English" |
| Format conversion | Haiku | — | "JSON to YAML" |
| Info extraction | Haiku | — | "What date is in this email?" |
| Classification | Haiku | — | "Which department for this ticket?" |
| Grammar check | Haiku | — | "Check this paragraph's grammar" |
| Quick math | Haiku | — | "50k at 8% for 3 years?" |
| Chinese light Q&A | `doubao-seed-2.0-mini` | — | Simple Chinese factual queries |

#### Tier 2 (Balanced) Scenarios

| Category | Scenario | Default | Alt model |
|----------|----------|---------|-----------|
| **Content** | Article/blog writing | Sonnet | — |
| | Marketing copy | Sonnet | — |
| | Multi-platform adaptation | Sonnet | — |
| | Email writing | Sonnet | — |
| | Report generation | Sonnet | — |
| | Chinese long-form writing | Sonnet | `doubao-seed-2.0-pro` |
| **Coding** | Feature development | Sonnet | — |
| | Bug fixing | Sonnet | — |
| | Refactoring | Sonnet | — |
| | Test writing | Sonnet | — |
| | Chinese tech stack code | Sonnet | `doubao-seed-2.0-code` |
| **Data** | Data analysis | Sonnet | — |
| | SQL queries | Sonnet | — |
| | Market research | Sonnet | — |
| | Literature summary | Sonnet | — |
| | Chinese document research | Sonnet | `kimi-k2-thinking-turbo` |
| **Automation** | Workflow orchestration | Sonnet | — |
| | Batch processing | Sonnet | — |
| | CRM/project management | Sonnet | — |
| **Daily** | Travel planning | Sonnet | — |
| | Resume/interview prep | Sonnet | — |

#### Tier 3 (Flagship) Scenarios

| Category | Scenario | Default | Alt model |
|----------|----------|---------|-----------|
| **Architecture** | System design | Opus | — |
| | Tech selection | Opus | — |
| | Business strategy | Opus | — |
| | Product roadmap | Opus | — |
| **Analysis** | Security audit | Opus | — |
| | Root cause analysis | Opus | — |
| | Legal review | Opus | — |
| | Financial modeling | Opus | — |
| | Math/logic proofs | Opus | `deepseek-reasoner` |
| | Complex CoT reasoning | Opus | `gpt-5.1-thinking` |
| **Long context** | Tech debt assessment | Opus | — |
| | Cross-module refactoring | Opus | — |
| | Deep research reports | Opus | — |

---

## Spawn Reference

### Timeout by Tier

| Tier | Light task | Heavy task |
|------|-----------|-----------|
| Tier 1 | 120s | 300s |
| Tier 2 | 300s | 600s |
| Tier 3 | 600s | 900s |

### Task Description Template

Include 4 elements: **action**, **input/context**, **expected output**, **constraints**.

Good: `"Analyze /data/sales-q2.csv and generate quarterly report. Include trends, MoM change, Top 5 clients. Markdown format."`

Bad: `"Analyze sales data"`

### Cleanup Rules

| Cleanup | When |
|---------|------|
| `delete` | One-off tasks: Q&A, format conversion, single code generation |
| `keep` | Important deliverables: strategy reports, architecture designs, audit results, research reports, long-form content |

---

## Error Reference

### HTTP Errors

| Code | Meaning | User action |
|------|---------|-------------|
| 401 | Invalid API key | Check at evolink.ai/dashboard/keys |
| 402 | Insufficient balance | Add credits at evolink.ai/dashboard/billing |
| 429 | Rate limited | Wait 30s, retry |
| 503 | Service temporarily busy | Retry in 1 minute |

### Routing Fallback Errors

| Scenario | Action |
|----------|--------|
| Sub-agent timeout | Notify user, offer stronger model |
| Sub-agent error | Extract error, retry if possible |
| Low quality result | Escalate to next tier |
| User dissatisfied | Ask details, upgrade and redo |
| Model unavailable | Fallback to same-tier alternative |
