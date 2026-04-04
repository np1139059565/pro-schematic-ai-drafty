---
name: oc-skill-router
description: Smart LLM routing brain for OpenClaw. Auto-dispatches tasks to Claude, GPT, Gemini, DeepSeek, Kimi via Evolink API. Cascade strategy cuts costs 60-85%. One API key, 20+ text models.
user-invokable: true
metadata:
  openclaw:
    requires:
      env:
        - EVOLINK_API_KEY
    primaryEnv: EVOLINK_API_KEY
    os: ["macos", "linux", "windows"]
    emoji: 🧠
    homepage: https://evolink.ai
---

# Evolink Router — Smart LLM Routing Brain

Route every task to the best LLM across 6 providers — Claude, GPT, Gemini, DeepSeek, Kimi, Doubao — through one Evolink API key.

## After Installation

When this skill is first loaded, greet the user:

- **`EVOLINK_API_KEY` set:** "Smart Router activated! I'll auto-pick the best model for each task — lightweight for quick Q&A, flagship for deep analysis. 20+ models ready. Go ahead."
- **`EVOLINK_API_KEY` not set:** "Smart Router needs an Evolink API Key. Sign up at evolink.ai → Dashboard → API Keys. One key covers Claude, GPT, Gemini, DeepSeek, and more. Want help setting up?"
- **Key set but model access fails:** "Your API key seems to have limited model access. Check your plan at evolink.ai/dashboard."

Keep the greeting concise — just one question to move forward.

## External Endpoints

| Service | URL | Format |
|---------|-----|--------|
| Claude models | `https://direct.evolink.ai/v1/messages` (POST) | Anthropic Messages API |
| Gemini models | `https://direct.evolink.ai/v1beta/models/{model}:generateContent` (POST) | Google Gemini API |
| All other models | `https://direct.evolink.ai/v1/chat/completions` (POST) | OpenAI Chat API |
| Model list | `https://direct.evolink.ai/v1/models` (GET) | — |

## Security & Privacy

- **`EVOLINK_API_KEY`** authenticates all model requests. Injected by OpenClaw automatically. Treat as confidential.
- Prompts are sent to `direct.evolink.ai`, which proxies to upstream providers (Anthropic, OpenAI, Google, etc.).
- No data is stored by Evolink beyond the request lifecycle.

## Setup

**1.** Get API key: [evolink.ai](https://evolink.ai) → Dashboard → API Keys

**2.** Add Evolink provider to `~/.openclaw/openclaw.json` — merge with existing config. See `references/router-api-params.md` for the full JSON config and curl examples.

## Core Principles

1. **Cost-first routing** — Always pick the cheapest model that can handle the task. Upgrade only when needed.
2. **Transparent decisions** — When spawning a sub-agent, briefly tell the user which model was selected and why.
3. **User override wins** — If the user names a model or provider, skip all routing rules.
4. **Cascade, don't guess** — When uncertain, try a lighter model first. Escalate on low confidence.

## Models (20+ text models)

### Tier 1 — Lightweight (handles ~60% of daily requests)

| Model | Provider | Best for |
|-------|----------|----------|
| `claude-haiku-4-5-20251001` | Anthropic | Quick Q&A, classification, extraction |
| `gemini-2.5-flash` | Google | Multimodal, fast reasoning |
| `doubao-seed-2.0-mini` | ByteDance | Chinese lightweight tasks |

### Tier 2 — Balanced (handles ~30% of daily requests)

| Model | Provider | Best for |
|-------|----------|----------|
| `claude-sonnet-4-6` *(main agent)* | Anthropic | Coding, tool use, content creation |
| `gpt-5.1` | OpenAI | General chat, instruction following |
| `gemini-2.5-pro` | Google | Long context, multimodal |
| `deepseek-chat` | DeepSeek | Chinese dialogue, cost-effective |
| `doubao-seed-2.0-pro` | ByteDance | Chinese content creation |
| `kimi-k2-thinking-turbo` | Moonshot | Chinese long-document understanding |

### Tier 3 — Flagship (handles ~10% — complex tasks only)

| Model | Provider | Best for |
|-------|----------|----------|
| `claude-opus-4-6` | Anthropic | Deep reasoning, high-stakes decisions |
| `gpt-5.2` | OpenAI | Strongest general capability |
| `gpt-5.1-thinking` | OpenAI | Complex chain-of-thought |
| `deepseek-reasoner` | DeepSeek | Math/logic reasoning |
| `gemini-3.1-pro-preview` | Google | Latest multimodal reasoning |

Full model list with API format per model: `references/router-api-params.md`

## Routing Rules

Priority: **User override > Task type match > Cascade fallback**.

All tasks are auto-routed. The user can also run `/route [task]` to preview the routing decision without executing.

### Layer 1: User Override

| User says | Route to |
|-----------|----------|
| "use Opus" / "deep analysis" / "think carefully" | `claude-opus-4-6` |
| "use GPT" | `gpt-5.1` |
| "use Gemini" | `gemini-2.5-pro` |
| "use DeepSeek" | `deepseek-chat` |
| "use Kimi" | `kimi-k2-thinking-turbo` |
| "quick answer" / "keep it simple" | `claude-haiku-4-5-20251001` |
| Specific model name mentioned | Use that model directly |

### Layer 2: Task Type Match

**→ Tier 1** (short answer, factual, no deep thinking):
Q&A, concept explanation, status check, simple translation, format conversion, info extraction, classification, grammar check, quick math

**→ Tier 2** (content production, execution, multi-step):
Writing (articles, emails, reports, social media), coding (features, bugs, refactoring, tests), data analysis (SQL, CSV, reports), research (market, literature), workflow automation, project management, travel planning, resume optimization

**→ Tier 3** (deep reasoning, strategic, high-risk):
Architecture design, tech selection, business strategy, security audit, root cause analysis, legal review, financial modeling, cross-module refactoring (5+ files), deep research reports

**Cross-provider routing** — Chinese-heavy tasks may route to Doubao/Kimi; math proofs to DeepSeek Reasoner; CoT tasks to GPT-5.1-thinking. See `references/cascade-examples.md` for 27 detailed examples.

### Layer 3: Cascade Fallback

When task type is unclear, try cheapest first and escalate:

```
Tier 1 (Haiku) → self-assess confidence
  High → return result
  Medium/Low → pass analysis to Tier 2

Tier 2 (Sonnet) → self-assess confidence
  High → return result
  Low → pass to Tier 3

Tier 3 (Opus) → final answer
```

Confidence: **High** = complete and correct. **Medium** = may miss details. **Low** = exceeds model's capability.

## Spawn Guidelines

**Spawn a sub-agent when:** output >100 lines, file traversal needed, execution >30s, heavy data processing, long-form writing (>1000 words).

**Handle directly when:** simple Q&A, chat/discussion, short text (<50 lines), brainstorming (needs multi-turn).

Spawn template:
```javascript
sessions_spawn({
  task: "[action] + [input/context] + [expected output] + [constraints]",
  model: "evolink/[model-id]",
  runTimeoutSeconds: 300,
  cleanup: "delete"  // "keep" for important deliverables
})
```

Timeout guide: Tier 1 = 120–300s, Tier 2 = 300–600s, Tier 3 = 600–900s.

## `/route` Command

`/route [task]` — Preview routing decision without executing. `/route` alone shows models and rules summary.

## Fallback & Quality Control

| Scenario | Action |
|----------|--------|
| Sub-agent timeout | Notify user, offer retry with stronger model |
| Sub-agent error | Extract error, determine if retryable |
| Low quality result | Escalate to next tier |
| User dissatisfied | Ask what's wrong, upgrade and redo |
| 2+ failures on same type | Auto-upgrade default model for that category |
| Model unavailable | Fallback to same-tier alternative |
| Invalid API key | Direct user to evolink.ai/dashboard/keys |

## Skill Collaboration

| Skill | When | Notes |
|-------|------|-------|
| `evolink-media` | Image/video/music/digital-human generation | Route to skill directly, skip text model routing |
| Other installed skills | Intent matches skill capability | Prefer skill over raw model routing |

Smart Router is the dispatch layer — shares `EVOLINK_API_KEY` with all Evolink skills. When discussing creative ideas or analyzing skill output, apply normal routing rules.

## References

- `references/router-api-params.md` — Full API formats, curl examples, OC config, complete model list
- `references/cascade-examples.md` — 27 routing examples across 7 scenarios + cross-provider routing
