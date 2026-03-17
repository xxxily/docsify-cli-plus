# 系统右键菜单功能 - 待实现

## 状态
**暂停开发** - 等待更可靠的实现方案

## 需求
1. 注册系统右键菜单，允许用户通过右键一键执行 `docsify-plus start`
2. 管理多个运行实例（列表、停止单个、停止全部）
3. 支持 macOS 和 Windows
4. 一键注册/取消注册菜单

## 已尝试方案

### 方案1: Automator Service (Workflow)
- **结果**: 不稳定，有时无响应，有时提示文件损坏
- **问题**: 
  - XML 转义问题导致 workflow 文件损坏
  - macOS Services 缓存机制不稳定
  - 权限问题导致菜单不显示

### 方案2: 第三方工具集成
调研的项目：
- custom-finder-right-click-menu (143 stars) - 需要用户安装额外 App
- RClick (639 stars) - 图形界面工具，不适合 CLI 工具
- open-terminal - 参考实现，但不够成熟

## 推荐后续方案

### 方案A: 使用成熟第三方工具
推荐用户安装 [custom-finder-right-click-menu](https://github.com/samiyuru/custom-finder-right-click-menu)，然后提供配置脚本：
```bash
#!/bin/bash
# 创建右键菜单脚本
cat > ~/FinderMenu/"📚 Docsify Start.sh" << 'EOF'
#!/bin/bash
cd "$1" && docsify-plus start --open
EOF
chmod +x ~/FinderMenu/"📚 Docsify Start.sh"
```

### 方案B: 开发原生 Finder Sync Extension
- 使用 Swift + Xcode 开发轻量级 App
- 实现 Finder Sync Extension 框架
- 打包成独立的 .app 供用户安装
- **优点**: 原生稳定，用户体验好
- **缺点**: 需要 Xcode 开发，代码签名，额外维护成本

### 方案C: 使用 Raycast/Alfred 插件
- 开发 Raycast 或 Alfred 插件
- 通过快捷键快速启动 docsify
- **优点**: 现代 macOS 用户常用工具
- **缺点**: 需要用户安装额外工具

## 相关文件（已删除）
- `lib/commands/register-menu.js` - 菜单注册命令
- `lib/commands/unregister-menu.js` - 菜单取消注册命令
- `lib/commands/instances.js` - 实例管理命令
- `lib/util/instance-manager.js` - 实例管理器

## 技术要点记录

### macOS Services 工作原理
1. Workflow 文件放在 `~/Library/Services/` 目录
2. Info.plist 需要 NSServices 配置
3. document.wflow 是 Automator 工作流定义
4. 需要运行 `/System/Library/CoreServices/pbs -flush` 刷新缓存
5. 需要重启 Finder 或重新登录

### 常见问题
- XML 特殊字符需要正确转义
- 文件权限需要设置为可执行
- 扩展属性 `com.apple.provenance` 可能阻止执行
- macOS 安全设置可能阻止未知来源的 workflow

## 决策
暂时搁置此功能，因为：
1. 现有方案都不够稳定可靠
2. 开发原生扩展成本较高
3. 优先级相对较低
4. 用户可以通过终端或编辑器集成实现类似功能

## 后续行动
- [ ] 评估是否值得开发原生 Finder Sync Extension
- [ ] 或者提供第三方工具的配置指南
- [ ] 考虑 Raycast/Alfred 插件作为替代方案
