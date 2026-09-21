# OpenSpec 流程骨架

OpenSpec 提供「规格驱动的开发」：**先写清楚要做什么/怎么做，再动手写代码**。
本目录是新项目存放规格文档的位置。

## 推荐流程（对应 AI Coding 阶段 1、2）

1. **对齐需求** → 每个变更建一个目录 + `proposal.md`（做什么、为什么、范围）
2. **理解实现** → 写 `design.md`（技术方案、架构选择与理由）
3. **拆解任务** → 写 `tasks.md`（怎么一步步实现，可勾选）
4. **定义规格** → `specs/*.md`（每条能力的具体验收规格）
5. 实现完核对 specs，全绿才算完成

## 建议的目录结构

```
openspec/
└── changes/
    └── <change-name>/
        ├── proposal.md      # 需求范围与动机
        ├── design.md        # 技术方案与架构决策
        ├── tasks.md         # 任务拆解
        └── specs/           # 能力规格，每条一个 md
```

## 一个变更的最小模板

`openspec/changes/your-feature/proposal.md`：

```markdown
# Proposal: <功能名>

## 为什么做
（背景、痛点、收益）

## 做什么
- 支持 X
- 支持 Y

## 范围
- 包含：...
- 不包含：...

## 验收标准
1. 当用户 ... 时，结果 ... 
2. ...
```

design.md / tasks.md / specs 同理，一层层细化。每一步都有清晰边界，AI 按图施工，人类可随时评审纠偏。