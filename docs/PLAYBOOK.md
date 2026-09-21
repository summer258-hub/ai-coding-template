# AI Coding 完整流程 Playbook

> 这套流程把「先对齐 → 先理解 → 先测试 → 先门禁 → 安全贯穿 → 交付回顾 → 持续改进」
> 从头到尾固化为可执行的 7 阶段。每个新项目，照着这份清单走即可复现完整闭环。
> 本文档同时配套：`.github/workflows/ci.yml`（云端门禁）与 `_setup/`（本地门禁）。

---

## 7 阶段总览

| 阶段 | 一句话目标 | 关键产物 | 门禁 |
|------|-----------|---------|------|
| 1. 对齐 | 先对齐再动手，不跑偏 | proposal / specs | 需求评审 |
| 2. 理解 | 先理解再改代码 | design / ADR | 架构评审 |
| 3. TDD | 先测试再代码 | 测试 + 实现 | 单测通过 |
| 4. 门禁 | 先门禁再推送 | 本地 hook + CI | commit/push 拦截 |
| 5. 安全 | 安全贯穿全程 | SAST/DAST/依赖审计结果 | 安全门禁 |
| 6. 交付 | 交付 → 回顾 | PR / merge / retro | 人类 merge + 回顾 |
| 7. 改进 | 防止泥球 | backlog + retro | 定期回归 |

---

## 阶段 1：先对齐再动手（需求对齐）

**目的**：不搞清楚做什么就写代码，是最贵的浪费。此阶段只讨论，不写代码。

- [ ] 用自然语言描述需求（一句话 + 关键场景 + 验收标准）
- [ ] 明确 3W1H：What（做什么）/ Who（谁用）/ Why（为什么）/ How good（怎样算好）
- [ ] 记录为 proposal，列出 in-scope / out-of-scope
- [ ] 产出：`openspec/` 下的 proposal.md、specs/*.md

**责任人**：人类 + AI 协作；**出口标准**：人类确认需求理解一致。

---

## 阶段 2：先理解再改代码（架构理解 + 决策记录）

**目的**：改代码前，先搞清现有架构、约束与历史决策，避免盲目改动。

- [ ] 读项目入口与目录结构（如 `AGENTS.md`、`README`）
- [ ] 标注数据流向、热点模块（回归风险高区域）
- [ ] 对每个关键技术决策写 ADR（架构决策记录）：用什么 / 为什么不选别的
- [ ] 产出：`docs/adr/`、设计说明

**出口标准**：能说清"改动会影响哪些模块、为什么这么设计"。

---

## 阶段 3：先测试再代码（TDD）

**目的**：先写测试定义"正确行为"，再写实现让它通过，防止回归。

- [ ] 为要改/新增的行为写测试（最小、聚焦、可读）
- [ ] 运行测试，确认先失败（红）——证明测试有效
- [ ] 写最小实现让测试通过（绿）
- [ ] 有需要时重构，保持测试全绿
- [ ] 产出：`app/tests/` 下对应测试 + 实现

**本地命令**：`cd app && npm test`
**云端命令**：GitHub Actions(`test` job) 每次 push/PR 自动跑。

---

## 阶段 4：先门禁再推送（门禁）

**目的**：不合格的代码不让提交/推送，把"质量"变成强制约束而不是自觉。

模板预置两套门禁：

- **本地门禁**（`_setup/`）
  ```bash
  # 一次性安装：为 .git/hooks 写入 pre-commit / pre-push
  powershell -ExecutionPolicy Bypass -File .\_setup\install-gate.ps1
  # 之后每次 commit / push 自动运行 semgrep；可随时手动验证：
  powershell -ExecutionPolicy Bypass -File .\_setup\security-scan.ps1
  ```
  - `pre-commit`：提交前扫 SAST，ERROR 拦截
  - `pre-push`：推送前扫 SAST，ERROR 拦截；`-Strict` 时 WARNING 也拦截

- **云端门禁**（`.github/workflows/ci.yml`）
  - `test`：jest 全量测试
  - `semgrep`：SAST 自定义规则，ERROR 拦截 + SARIF 上传
  - `audit`：npm 依赖审计，high/critical 拦截

**出口标准**：本地与云端门禁全绿才能合入。

---

## 阶段 5：安全贯穿全程

**目的**：安全不是最后才做，而是每一行代码都要过。

双引擎扫描（DAST + SAST）：

- **SAST（静态）**：`semgrep` 扫源码坏味道
  - 规则见 `_setup/security-rules/express-js.yml`：eval、硬编码密钥、JWT none 算法、SQL 注入、弱默认密钥、路径穿越
  - 新增规则：往 `security-rules/` 里加 `.yml` 即可
- **DAST（动态）**：`nuclei` 扫运行中的服务
  - 模板见 `_setup/nuclei-tpl/`：健康探针、安全响应头、未授权 API、X-Powered-By 指纹
  - 运行：`nuclei -u http://127.0.0.1:3000 -t _setup/nuclei-tpl`
- **依赖审计**：`npm audit`（本地）+ Actions `audit`（云端）+ Dependabot（每周版本更新）
- **密钥扫描**：GitHub Secret scanning（仓库设置开启）

**出口标准**：
- [ ] semgrep：ERROR = 0（本地 + CI）
- [ ] nuclei：无中高危命中
- [ ] `npm audit`：无 high/critical
- [ ] Dependabot 告警归零

---

## 阶段 6：交付 → 回顾

**目的**：变更通过评审合入，并对过程做复盘，留下可追溯记录。

- [ ] 建分支 → 提交（门禁自动跑）→ push → 开 PR
- [ ] 人类评审 PR（尤其看测试与安全项）
- [ ] 通过后 squash merge 到 main（保留干净历史）
- [ ] 更新 `docs/retro*.md`：做了什么 / 哪些有效 / 哪些可改进
- [ ] 记录本迭代的 backlog（未完成/待办）

**出口标准**：PR 合入 + 回顾文档更新。

---

## 阶段 7：持续架构改进（防止泥球）

**目的**：预防代码腐化，让项目长期保持可维护。

- [ ] 定期（每迭代/每发布）：回看 `docs/retro*.md` 的 backlog
- [ ] 优先清理：重复代码、坏味道、安全 backlog、过时依赖
- [ ] 更新趋势：测试覆盖率是否下降？重点模块是否越来越难改？
- [ ] 架构健康检查：分层是否被破坏？控制器是否过长？魔法常量是否扩散？

**出口标准**：backlog 被逐项消化，架构保持清爽。

---

## 新项目启用清单（30 秒冷启动）

```bash
# 1) 从模板仓库生成新项目（GitHub 网页点 "Use this template" 即可）
# 2) 进入项目
cd my-new-project

# 3) 安装依赖
cd app && npm install && cd ..

# 4) 安装本地安全门禁
powershell -ExecutionPolicy Bypass -File .\_setup\install-gate.ps1

# 5) 确认门禁可用
npm test --prefix app
powershell -ExecutionPolicy Bypass -File .\_setup\security-scan.ps1

# 6) 推送启用 CI（GitHub Actions 自动跑 test + semgrep + audit）
git add -A && git commit -m "chore: init from ai-coding template" && git push
```

**看完即可跑完整流程**：从阶段 1 开始，按顺序走到阶段 7，循环往复。