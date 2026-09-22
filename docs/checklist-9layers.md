# AI Coding 九层流程对账清单

> 本文档是**复用规则的"逐层核对手册"**。开工前先读它，每层完成时对照「出口标准」打勾，
> 确保九层无遗漏。与 `docs/PLAYBOOK.md`（执行手册）配套使用。

## 免责声明 · 工具映射说明
用户原方案中的命令（grill、graphify、plan eng/ceo review、opsx、ship、no mistakes 等）
部分来自 Claude 原生技能包。本清单给出我（可在 TRAE 生态中）的**等效能力映射**，
已在模板中集成的用 ✅ 标注，需要人工/流程补齐的用 ⚠️ 标注。

| 层 | 原方案工具 | 等效能力（真实可用） | 模板集成 |
|----|-----------|---------------------|---------|
| ① 理解层 | graphify / opsx:explore | `openspec-explore` + **explore.ps1 静态导航** + **dependency-cruiser 依赖图**（`docs/code-graph.md`） | ✅ |
| ② 对齐层 | grill with docs → context.md + ADR | `brainstorming` + `openspec-new-change` + **ADR 模板（反证守卫）** | ✅ |
| ③ 规划层 | plan eng review / plan ceo review | `writing-plans` / `subagent-driven-development` + **architecture-review 审查清单模板** | ✅ |
| ④ 规格层 | opsx:propose | `openspec-propose` / `openspec-ff-change` | ✅ |
| ⑤ 实现层 | opsx:apply / implement TDD | `openspec-apply-change` + `test-driven-development` | ✅ |
| ⑥ 审查层 | code review / review | `requesting-code-review` / `receiving-code-review` | ✅ |
| ⑦ 质量层 | QA 浏览器验收 → cso 安全审计 | `TRAE-browseruse` 验收 + **semgrep+nuclei 门禁** | ✅（更强含 DAST） |
| ⑧ 发布层 | ship 合并+测试+changelog+PR | `gh-cli` + `finishing-a-development-branch` + **changelog 模板** | ✅ |
| ⑨ 收尾层 | opsx:archive → retro | `openspec-archive-change` + **retro 模板** | ✅ |
| 安全门 | no mistakes | gate-hook + CI（jest/semgrep/audit） | ✅ |

---

## 逐层出口标准（每层全勾才算过）

### ① 理解层 —— 先理解再改动
- [ ] 已运行 `openspec-explore` 探索变更范围
- [ ] 已读入口文件、目录结构、关键数据流
- [ ] 已识别受影响模块（回归风险区）
- [ ] 已运行 `_setup\explore.ps1` 生成 `docs/KNOWLEDGE.md`（静态导航）
- [ ] （中大型项目）已用 dependency-cruiser 生成依赖图（见 `docs/code-graph.md`）

### ② 对齐层 —— 先对齐再动手
- [ ] 已用 `brainstorming` 对齐需求（What/Who/Why/How good）
- [ ] 已产出 proposal 并得到人类确认
- [ ] 关键技术决策已写 ADR（用 `docs/templates/adr-template.md`）→ `docs/adr/`
- [ ] 项目约定写入 `AGENTS.md`（单一事实来源）

### ③ 规划层 —— 方案审查
- [ ] 已用 `writing-plans` 产出实现方案
- [ ] 已用 `architecture-review-template.md` 做对抗性审查（或交给隔离子代理挑刺）
- [ ] 方案经审查：架构权衡、备选方案、成本是否说明
- [ ] ⚠️ 人类参与架构/方向级 review（AI 不单独拍板高风险架构）

### ④ 规格层 —— 规格驱动
- [ ] 每个变更有 `openspec/` 目录
- [ ] 产出 proposal.md + design.md + tasks.md + specs/*
- [ ] 规格可被 AI 按图执行，人类可中途评审

### ⑤ 实现层 —— TDD
- [ ] **先写测试**，确认先红（失败）
- [ ] 写最小实现让测试转绿
- [ ] 有需则重构，保持全绿
- [ ] 出口：`npm test` 全部通过

### ⑥ 审查层 —— 代码审查
- [ ] 已 `requesting-code-review` 自检
- [ ] 收到 `receiving-code-review` 反馈后逐条核验（非盲从）
- [ ] 严重问题已修复后再进下一层

### ⑦ 质量层 —— 验收 + 安全审计
- [ ] 已用浏览器自动验收核心流程（登记→登录→CRUD）
- [ ] SAST：semgrep ERROR=0
- [ ] DAST：nuclei 无中高危
- [ ] 依赖：npm audit 无 high/critical
- [ ] 密钥：Secret 扫描无泄漏

### ⑧ 发布层 —— 交付
- [ ] 建分支 / 提交（门禁自动跑）/ push / 开 PR
- [ ] 人类 review PR 并 squash merge
- [ ] 更新 changelog（用 `docs/templates/changelog.md`）
- [ ] 关键节点打 tag 并推送

### ⑨ 收尾层 —— 归档 + 复盘
- [ ] `openspec-archive-change` 归档规格
- [ ] 写 retro（用 `docs/templates/retro-template.md`）→ `docs/retro/`
- [ ] 沉淀 backlog 到 next iteration

### 🔒 安全门（贯穿全程）
- [ ] 本地 pre-commit / pre-push hook 已装并触发
- [ ] 云端 CI 三道检查（jest / semgrep / audit）全绿
- [ ] 任何一环 FAIL 即阻断，修复后才推进

---

## 状态表（仓库维护者维护）
| 层 | 最近一次使用 | 状态 |
|----|-------------|------|
| ① 理解层 | | |
| …（共九层） | | |