# AI Coding Workflow 模板仓库

> 一套**可复用的 AI Coding 完整流程脚手架**。用它生成新项目，立即可获得：
> 安全门禁、CI 检查、测试脚手架、OpenSpec 流程骨架和一份照着走就完整的 Playbook。

**用法**：点击 GitHub 仓库页面的 **"Use this template"** 即可为你的新项目一键复制本脚手架。

---

## 为什么用它

人工搭这套流程（门禁、CI、测试、安全规则）要折腾大半天；用本模板生成后，从第一天起
新项目就自带完整的质量与安全约束，AI 帮你写代码时也会被强制拉回正确轨道。

## 仓库内容

```
ai-coding-template/
├── app/                         # 示例应用（可运行、可测试）
│   ├── server.js                #   Express 入口
│   ├── controllers/ models/ routes/ middleware/ database/ utils/ public/
│   ├── tests/                   #   jest + supertest 测试（20+ 用例）
│   ├── package.json             #   依赖 + overrides（安全收紧）
│   ├── package-lock.json
│   └── AGENTS.md                #   项目单一事实来源示范
├── _setup/                      # 本地安全门禁（可复用资产）
│   ├── install-gate.ps1         #   一键装 pre-commit / pre-push 钩子
│   ├── gate-hook.ps1            #   钩子执行器
│   ├── security-scan.ps1        #   semgrep SAST 扫描
│   ├── security-rules/          #   semgrep 自定义安全规则
│   ├── nuclei-tpl/              #   DAST 动态扫描模板
│   └── self-test/               #   规则正反例自检
├── .github/
│   ├── workflows/ci.yml         # CI：jest + semgrep + npm audit
│   └── dependabot.yml           # 每周依赖/CI 更新
├── docs/
│   ├── PLAYBOOK.md              # ⭐ 7 阶段完整 AI Coding 流程（照着走）
│   └── openspec/                # OpenSpec 流程骨架
└── README.md
```

## 快速开始（新项目）

```bash
# 生成项目后：
cd my-new-project
cd app && npm install && cd ..          # 1) 装依赖
powershell -ExecutionPolicy Bypass -File .\_setup\install-gate.ps1   # 2) 本地门禁
npm test --prefix app                    # 3) 跑测试
git commit -am "init from template" && git push   # 4) 触发云端 CI
```

详细流程见 **[docs/PLAYBOOK.md](docs/PLAYBOOK.md)**。

## 预置的安全能力

| 能力 | 工具 | 何时生效 |
|------|------|---------|
| 静态扫描 (SAST) | semgrep + 自定义规则 | 本地 commit/push + 云端 CI |
| 动态扫描 (DAST) | nuclei（远程运行） | 开发/预发联调 |
| 依赖审计 | npm audit + Dependabot | 每次 CI + 每周 |
| 密钥泄漏 | GitHub Secret scanning | 每次 push |
| 双门禁（本地+云端） | git hooks + Actions | commit / push / PR |

## 在你的新项目里自定义

- **改业务**：重写 `app/` 里的 controllers / models / routes 即可，脚手架与门禁不受影响
- **加安全规则**：往 `_setup/security-rules/*.yml` 追加规则
- **加 DAST 模板**：往 `_setup/nuclei-tpl/*.yaml` 追加
- **加 CI 检查**：编辑 `.github/workflows/ci.yml`

---

*由 AI Coding 工作流固化而成，供后续所有项目复用。*