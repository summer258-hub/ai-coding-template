# Changelog

> 用法：每个 PR 合入后，在对应版本区块下追加一条记录。
> 遵循 [Keep a Changelog](https://keepachangelog.com) + [SemVer](https://semver.org)。
> 分类：`Added`（新增）/ `Changed`（变更）/ `Fixed`（修复）/ `Deprecated`（废弃）/ `Removed`（移除）/ `Security`（安全）。

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

### Security
- 

## [1.0.0] - 2026-09-22

### Added
- 初始版本：Express 应用 + JWT 认证 + todos/categories/tags 管理
- 本地安全门禁：semgrep SAST（pre-commit / pre-push）
- 云端 CI：jest 测试 + semgrep + npm audit
- OpenSpec 规格流程骨架

### Security
- helmet 安全响应头、禁用 X-Powered-By 指纹
- JWT 密钥 fail-fast，禁止硬编码默认值
- 列表接口排序参数白名单校验

---

## 版本发布流程（配合 /ship）
1. 更新本文件 `[Unreleased]` → 新版本号（SemVer 递增）
2. 确认三类门禁全绿：jest、semgrep、npm audit
3. 合并 PR 到 main
4. 打 tag：`git tag v1.0.0` 并推送