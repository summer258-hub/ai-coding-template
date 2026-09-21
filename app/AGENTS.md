# AGENTS.md - 项目知识库

> 本文件是 AI 助手的项目单一事实来源（Single Source of Truth）。
> 任何 AI 助手在操作本项目前，必须先阅读此文件。

---

## 📋 项目概览

| 属性 | 值 |
|------|-----|
| **项目名称** | 用户 Todo App |
| **版本** | v1.0.0 |
| **一句话描述** | 带用户认证的 Web Todo 应用，支持分类、标签、优先级、搜索筛选 |
| **技术栈** | Node.js + Express + 内存存储 + 原生前端 |
| **项目状态** | 开发完成，本地运行 |

---

## 🏗️ 仓库结构地图

`
user-todo-app/
├── server.js                 # 应用入口
├── package.json              # 依赖配置
├── database/
│   └── db.js                 # 内存数据存储（含持久化到 JSON 文件）
├── middleware/
│   ├── auth.js               # JWT 认证中间件
│   └── errorHandler.js       # 全局错误处理
├── models/                   # 数据模型层（数据库操作）
│   ├── userModel.js
│   ├── todoModel.js
│   ├── categoryModel.js
│   └── tagModel.js
├── controllers/              # 控制层（业务逻辑 + 输入校验）
│   ├── authController.js
│   ├── todoController.js
│   ├── categoryController.js
│   └── tagController.js
├── routes/                   # 路由层
│   ├── auth.js
│   ├── todos.js
│   ├── categories.js
│   └── tags.js
├── utils/
│   └── validators.js         # 输入校验工具
├── public/                   # 前端静态文件
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js            # API 请求封装
│       └── app.js            # 前端主逻辑
├── tests/
│   └── auth.test.js          # 认证模块测试（11 个用例）
├── openspec/                 # OpenSpec 规格文档
│   └── changes/user-todo-app/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/            # 各能力规格
├── docs/                     # 项目文档
│   ├── adr/                  # 架构决策记录
│   ├── code-review-report.md # 代码审查报告
│   ├── security-audit-report.md # 安全审计报告
│   └── retro-and-architecture.md # 回顾与架构改进
└── AGENTS.md                 # 本文件
`

---

## 🚀 开发命令表

| 命令 | 说明 |
|------|------|
| 
pm start | 启动服务（默认端口 3000） |
| 
pm test | 运行所有测试 |
| 
ode server.js | 直接启动服务 |

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3000 | 服务端口 |
| JWT_SECRET | dev-secret-key-change-in-production | JWT 签名密钥（生产环境必须修改） |

---

## 🧠 核心心智模型

### 数据流动方式

`
前端请求 → Routes → Controllers（校验+业务） → Models（数据操作）
              ↓
         Middleware（认证、错误处理）
`

### 数据存储

- **当前实现**：内存数组 + JSON 文件持久化（database/data.json）
- **设计意图**：环境限制下的简化方案，接口设计与真实数据库一致，便于迁移
- **迁移路径**：替换 Model 层的实现即可切换到 SQLite/PostgreSQL，Controller 和 Routes 不用改

### 认证机制

- 使用 JWT Bearer Token（HS256，有效期 24 小时）
- 密码使用 bcryptjs 哈希（salt rounds: 10）
- 登录接口有限流（5次/分钟/IP）
- 所有敏感接口通过 authMiddleware 校验

### 用户数据隔离

- 所有数据都有 user_id 字段
- 查询时必须带上 user_id 过滤
- 更新/删除前必须校验归属权
- 不属于当前用户的数据返回 404（防止枚举攻击）

---

## 📌 热点地图（回归风险索引）

> 这些是最容易出 bug 的地方，修改时要特别小心。

| 区域 | 风险等级 | 原因 | 相关测试 |
|------|---------|------|---------|
| 认证中间件 | 🔴 高 | 一旦出问题，整个应用安全受影响 | auth.test.js |
| Todo 查询筛选 | 🟡 中 | 筛选条件多，组合逻辑复杂 | 待补充 |
| 标签多对多关联 | 🟡 中 | 增删时需要维护关联表 | 待补充 |
| 数据权限校验 | 🔴 高 | 漏掉校验会导致越权访问 | 待补充 |
| 密码哈希比对 | 🟡 中 | bcrypt 异步操作容易出错 | auth.test.js |

---

## ⚠️ 当前风险区域

### 1. 测试覆盖不足
- **状态**: 只有认证模块有测试
- **风险**: 修改其他模块容易引入回归
- **建议**: 优先补充 Todo CRUD 和权限隔离的测试

### 2. 存储层简单
- **状态**: 内存 + JSON 文件
- **风险**: 并发写入可能丢数据，无事务支持
- **建议**: 迁移到 SQLite 或 PostgreSQL

### 3. JWT 密钥默认值
- **状态**: 开发环境有默认密钥
- **风险**: 生产环境忘记修改会导致安全问题
- **建议**: 启动时检查，生产环境强制使用环境变量

---

## 🔧 深层机制

### 为什么用内存存储而不是数据库？
- 环境限制：better-sqlite3 需要 C++ 编译环境，当前环境没有
- 备选方案 sql.js 也因为网络问题安装失败
- 折中方案：内存数组 + JSON 文件持久化，接口设计兼容数据库

### 为什么是两层架构（Controller + Model）而不是三层？
- 详见 ADR-003
- 当前业务逻辑简单，两层足够
- 触发重构信号：Controller 超过 300 行、业务逻辑重复

### 为什么注册接口也返回 Token？
- 用户体验：注册后直接登录，不用再跳登录页
- 行业惯例：大多数应用都是注册即登录

---

## 📚 相关文档索引

| 文档 | 位置 | 用途 |
|------|------|------|
| 变更提案 | openspec/changes/user-todo-app/proposal.md | 需求范围和动机 |
| 设计方案 | openspec/changes/user-todo-app/design.md | 技术方案和架构 |
| 任务清单 | openspec/changes/user-todo-app/tasks.md | 实现任务拆解 |
| 能力规格 | openspec/changes/user-todo-app/specs/ | 各功能详细规格 |
| 架构决策 | docs/adr/ | 关键技术决策记录 |
| 代码审查 | docs/code-review-report.md | 代码质量审查 |
| 安全审计 | docs/security-audit-report.md | 安全检查报告 |
| 发布回顾 | docs/retro-and-architecture.md | 复盘和改进计划 |

---

## 🎯 AI 助手工作准则

1. **先读这个文件** — 任何修改前先理解项目结构和约定
2. **遵循分层架构** — 不要把数据库操作写到 Controller 里
3. **权限不能漏** — 任何用户数据操作都要校验归属权
4. **输入要校验** — 所有用户输入必须在服务端校验
5. **测试先行** — 新功能优先写测试，再写实现
6. **更新本文档** — 如果事实有变化，及时更新 AGENTS.md

---

*最后更新: 2026-09-19*