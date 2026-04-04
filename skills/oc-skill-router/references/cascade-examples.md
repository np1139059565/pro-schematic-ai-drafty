# 路由示例集

覆盖 7 大场景的路由决策示例，展示直接路由、跨厂商选择和 Cascade 三种模式。
所有模型通过 Evolink API（`EVOLINK_API_KEY`）统一调用。

---

## 一、生产力与自动化

### 示例 1：日程查询 → Haiku 直接回答

**用户：** "我明天有什么安排？"

```
路由: evolink/claude-haiku-4-5-20251001 | 策略: direct | spawn: false
理由: 信息检索，无需生成内容
```

### 示例 2：工作流编排 → Sonnet spawn

**用户：** "帮我做一个每日晨间简报自动化：天气、日程、待办事项、行业新闻"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 多步工作流编排，需要调用多个工具，产出物长期使用
task: "设计并实现每日晨间简报自动化流程。包含 4 个模块：
  1. 天气查询（基于用户位置）
  2. 日历日程提取
  3. 待办事项汇总
  4. 行业新闻 Top 5
  输出格式：结构化 Markdown，适合每天早上快速浏览。"
```

### 示例 3：邮件批量处理 → Sonnet spawn

**用户：** "帮我整理收件箱，分类这周的邮件，标记需要回复的"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 300s | cleanup: delete
理由: 批量处理 + 分类任务，执行型工作
```

---

## 二、内容创作

### 示例 4：社交媒体文案 → Sonnet 直接

**用户：** "写一组产品上线的社交媒体文案，X + LinkedIn + 小红书"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: false
理由: 内容生成，输出量中等（3 段文案），不需要隔离
```

### 示例 5：中文长文写作 → 豆包（跨厂商路由示例）

**用户：** "写一篇 3000 字的中文博客，关于国内 AI 创业生态"

```
路由: evolink/doubao-seed-2.0-pro | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 纯中文长文场景，豆包中文表达更自然，成本更低
task: "撰写 3000 字深度博客，主题：2026 年中国 AI 创业生态。
  结构：引言 → 3-4 个核心趋势（配数据/案例）→ 行业影响 → 结语。
  风格：专业但可读。输出 Markdown。"
```

### 示例 6：英文长文写作 → Sonnet spawn

**用户：** "Write a 3000-word blog about AI Agent trends in 2026"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 英文内容创作，Sonnet 英文写作质量最优
```

### 示例 7：简单翻译 → Haiku

**用户：** "把这段话翻译成英文：我们的产品已经支持 60 多个 AI 模型"

```
路由: evolink/claude-haiku-4-5-20251001 | 策略: direct | spawn: false
理由: 短文本翻译，轻量任务
```

---

## 三、数据分析与研究

### 示例 8：SQL 查询 → Sonnet

**用户：** "写一个 SQL 查询，统计过去 30 天每个渠道的注册转化率"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: false
理由: 单一技术任务，明确的输入输出
```

### 示例 9：数据分析报告 → Sonnet spawn

**用户：** "分析 sales-q2.csv 里的数据，生成季度销售报告"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 数据处理 + 报告生成，需要读取文件、计算、生成图表描述
task: "读取 /data/sales-q2.csv，生成 Q2 销售分析报告。
  包含：总体趋势、环比变化、Top 5 客户、Top 5 产品、异常值标注。
  输出 Markdown 格式，含数据表格。"
```

### 示例 10：中文长文档理解 → Kimi（跨厂商路由示例）

**用户：** "帮我读完这份 50 页的中文行业报告，提炼核心观点"

```
路由: evolink/kimi-k2-thinking-turbo | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 中文超长文档理解，Kimi 的长上下文中文处理更强
```

### 示例 11：深度市场研究 → Opus spawn

**用户：** "深入研究东南亚 SaaS 市场的机会，对比各国政策、竞争格局、进入壁垒"

```
路由: evolink/claude-opus-4-6 | 策略: direct | spawn: true | timeout: 900s | cleanup: keep
理由: 多维度深度分析，需要长上下文推理，战略级产出
```

---

## 四、销售与客户

### 示例 12：客户跟进邮件 → Sonnet

**用户：** "帮我写一封跟进邮件给上周 demo 的客户，提醒他们试用期快到了"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: false
理由: 单封邮件撰写，内容生产型任务
```

### 示例 13：CRM 整理 → Sonnet spawn

**用户：** "整理 CRM 里上个月新增的 50 个客户，按行业和规模分类，标记优先级"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 300s | cleanup: keep
理由: 批量数据处理 + 分类，输出量大
```

### 示例 14：定价策略分析 → Opus spawn

**用户：** "分析我们和 3 个主要竞品的定价模式，给出调价建议"

```
路由: evolink/claude-opus-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 竞品对比 + 策略建议，需要深度推理
```

---

## 五、编程开发

### 示例 15：知识问答 → Haiku

**用户：** "React useEffect 的 cleanup 函数什么时候执行？"

```
路由: evolink/claude-haiku-4-5-20251001 | 策略: direct | spawn: false
理由: 知识问答，事实型信息
```

### 示例 16：功能开发 → Sonnet spawn

**用户：** "在 /src/components 下实现一个响应式侧边栏，React + Tailwind"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 300s | cleanup: delete
理由: 代码编写，输出量大
task: "在 /src/components/Sidebar.tsx 实现响应式侧边栏。
  要求：React + Tailwind CSS，支持折叠/展开，移动端自动收起（<768px）。
  完成后运行 TypeScript 编译检查。"
```

### 示例 17：数学推理 → DeepSeek Reasoner（跨厂商路由示例）

**用户：** "证明：对于所有正整数 n，1+2+...+n = n(n+1)/2"

```
路由: evolink/deepseek-reasoner | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 数学证明/推理任务，DeepSeek Reasoner 专攻此类场景
```

### 示例 18：系统架构 → Opus spawn

**用户：** "我们要从 monolith 拆成微服务，帮我设计拆分方案"

```
路由: evolink/claude-opus-4-6 | 策略: direct | spawn: true | timeout: 900s | cleanup: keep
理由: 架构级决策，需要全面分析现有系统，给出迁移路径
```

---

## 六、创意与媒体

### 示例 19：媒体生成 → Evolink Media Skill

**用户：** "帮我生成一张赛博朋克风格的城市夜景图"

```
路由: evolink-media skill（不走文本模型路由）
理由: 直接调用 Evolink API 的 generate_image，共用同一个 EVOLINK_API_KEY
```

### 示例 20：创意方案讨论 → Sonnet

**用户：** "我想做一个产品宣传视频，帮我想想创意方向"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: false
理由: 创意讨论，不是生成任务，需要对话交互
```

### 示例 21：跨媒体工作流 → Sonnet spawn

**用户：** "先生成一张产品海报，然后把它做成 5 秒的动态视频，再配上背景音乐"

```
路由: evolink/claude-sonnet-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 多步工作流，Sonnet 编排调用 evolink-media 的图片→视频→音乐三个工具
```

---

## 七、战略与决策

### 示例 22：合同审查 → Opus spawn

**用户：** "审查这份合作协议，标出风险条款和需要谈判的点"

```
路由: evolink/claude-opus-4-6 | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 法律风险分析，需要细致推理，产出物重要
```

### 示例 23：商业计划 → Opus spawn

**用户：** "帮我做一个 Q3 产品路线图，结合市场趋势和技术可行性"

```
路由: evolink/claude-opus-4-6 | 策略: direct | spawn: true | timeout: 900s | cleanup: keep
理由: 战略规划，多维度综合决策
```

### 示例 24：复杂推理链 → GPT-5.1 Thinking（跨厂商路由示例）

**用户：** "分析这 5 个互相矛盾的市场信号，推导出最可能的走势"

```
路由: evolink/gpt-5.1-thinking | 策略: direct | spawn: true | timeout: 600s | cleanup: keep
理由: 需要显式思维链（CoT），GPT-5.1-thinking 在多步推理上有专门优化
```

---

## 八、Cascade 实战

### 示例 25：模糊请求触发 Cascade

**用户：** "帮我优化一下这个"

```
步骤 1: evolink/claude-haiku-4-5-20251001
  → "请求不明确，'优化'可以指很多方向。
     如果指文本润色我可以处理，但需要更多上下文。
     置信度: 低"
  → 升级到 Tier 2

步骤 2: evolink/claude-sonnet-4-6
  → 检查当前上下文，发现用户在看一份营销邮件
  → "我来优化这封邮件：
     1. 主题行更吸引人
     2. CTA 更明确
     3. 段落结构调整
     置信度: 高"
  → 返回结果
```

**成本：** Haiku($0.001) + Sonnet($0.05) = $0.051（vs 直接 Opus $0.15，节省 66%）

### 示例 26：跨领域任务触发 Cascade

**用户：** "帮我准备明天的投资人会议"

```
步骤 1: evolink/claude-haiku-4-5-20251001
  → "这涉及多个方面（数据准备、演讲稿、Q&A 预案），超出单一轻量任务范围。
     置信度: 低"
  → 升级到 Tier 2

步骤 2: evolink/claude-sonnet-4-6
  → "我来拆解并执行：
     1. 整理关键业务指标（MRR、增长率、客户数）
     2. 生成 10 页演讲要点
     3. 预测 10 个投资人常见问题 + 回答模板
     置信度: 高"
  → 返回结果（spawn: true, cleanup: keep）
```

### 示例 27：三级 Cascade 完整升级

**用户：** "评估我们是否应该从 AWS 迁移到 GCP"

```
步骤 1: evolink/claude-haiku-4-5-20251001 (Tier 1)
  → "这是一个重大基础设施决策，我只能给出表面对比。
     AWS vs GCP 基础差异：定价模型不同、GCP 大数据更强...
     置信度: 低（无法评估贵司具体情况）"
  → 升级到 Tier 2

步骤 2: evolink/claude-sonnet-4-6 (Tier 2)
  → "在 Haiku 基础上深入：
     - 分析了当前 AWS 用量和成本结构
     - GCP 对应服务价格对比
     - 迁移工作量估算
     但无法准确评估迁移风险和长期 TCO 影响。
     置信度: 中"
  → 升级到 Tier 3

步骤 3: evolink/claude-opus-4-6 (Tier 3)
  → "完整迁移评估报告：
     [成本] 年化节省 ~18%，但迁移成本约 $XX,XXX
     [风险] 3 个关键服务无直接对应，需重写
     [时间] 预计 4-6 个月，需要 2 名 DevOps 全职投入
     [建议] 混合策略：新服务上 GCP，现有服务保持 AWS，12 个月内逐步迁移
     [决策框架] ..."
  → 返回完整报告（cleanup: keep）
```

**成本：** $0.001 + $0.03 + $0.15 = $0.181
**价值：** 每一级贡献增量分析，Opus 只在真正需要深度推理时才被调用

---

## 九、跨厂商路由总结

以上示例中有 4 个跨厂商路由案例，说明 Smart Router 不只在 Claude 内部切换，而是根据任务特性选最合适的模型：

| 示例 | 场景 | 选了谁 | 为什么不用默认 Claude |
|------|------|--------|---------------------|
| #5 | 中文长文写作 | `doubao-seed-2.0-pro` | 中文表达更自然，成本更低 |
| #10 | 中文长文档理解 | `kimi-k2-thinking-turbo` | 中文长上下文处理更强 |
| #17 | 数学证明 | `deepseek-reasoner` | 数学/逻辑推理专项优化 |
| #24 | 复杂推理链 | `gpt-5.1-thinking` | 显式 CoT 多步推理 |

**一个 EVOLINK_API_KEY，路由到 20+ 模型，用户无需管理多个 API Key。**
