# 跨平台右键菜单注册工具调研报告

## 调研目标

寻找或设计一个能够通过纯命令/脚本实现 macOS 和 Windows 系统右键菜单注册的项目，以便集成到 docsify-cli-plus 中。

---

## 核心发现

### 🔴 关键结论：目前**不存在**真正的跨平台右键菜单注册工具

经过全面调研，发现 npm 生态系统中**没有任何一个包**能够同时支持 macOS 和 Windows 的系统级右键菜单注册。所有现有解决方案都是平台特定的。

---

## macOS 平台方案分析

### 1. Finder Sync Extension (Finder 同步扩展) ⭐推荐

**代表项目：**
- [RClick](https://github.com/wflixu/rclick) - 639 stars，活跃维护
- [SzContext](https://github.com/RoadToDream/SzContext) - 157 stars
- [custom-finder-right-click-menu](https://github.com/samiyuru/custom-finder-right-click-menu) - 143 stars

**实现方式：**
- 使用 Apple 官方的 `FIFinderSync` 框架
- 需要创建 Xcode 项目，编写 Swift/Objective-C 代码
- 生成 `.appex` 扩展包，嵌入到主应用中

**优点：**
- ✅ 原生集成，直接出现在 Finder 右键菜单（不在 Services 子菜单）
- ✅ 支持图标、子菜单、动态菜单项
- ✅ 用户体验最佳

**缺点：**
- ❌ 必须创建 macOS App Bundle，无法纯 CLI 实现
- ❌ 需要代码签名
- ❌ 用户需要在 系统设置 > 扩展 中手动启用
- ❌ 开发门槛高（需要 Xcode + Swift/Obj-C）

**核心代码结构：**
```swift
// FinderSync.swift
class FinderSync: FIFinderSync {
    override func menu(for menuKind: FIMenuKind) -> NSMenu {
        let menu = NSMenu(title: "")
        menu.addItem(withTitle: "Start Docsify Server", action: #selector(startServer(_:)), keyEquivalent: "")
        return menu
    }
    
    @objc func startServer(_ sender: AnyObject?) {
        // 执行命令
    }
}
```

---

### 2. Automator Quick Actions (自动操作/快速操作)

**实现方式：**
- 创建 `.workflow` 或 `.qlgenerator` 文件
- 放置在 `~/Library/Services/` 或 `~/Library/QuickActions/`
- 使用 XML 定义工作流

**优点：**
- ✅ 纯文件操作，无需编译
- ✅ 可以通过 Node.js 生成文件
- ✅ 无需管理员权限

**缺点：**
- ❌ 出现在 "Quick Actions" 子菜单，不是直接右键菜单
- ❌ macOS 版本差异大（Catalina 前后变化）
- ❌ 可靠性问题（之前尝试失败）

**文件结构：**
```
~/Library/Services/MyApp.workflow/
├── Contents/
│   ├── Info.plist          # 服务配置
│   ├── document.wflow      # 工作流定义
│   └── main.scpt          # AppleScript（可选）
```

---

### 3. Shortcuts (快捷指令) - macOS 12+

**实现方式：**
- 使用 `shortcuts` CLI 工具
- 创建接收文件输入的快捷指令

**优点：**
- ✅ 现代 macOS 原生支持
- ✅ 可以通过 CLI 创建和运行

**缺点：**
- ❌ 仅 macOS 12+
- ❌ 需要学习 Shortcuts 的复杂格式

---

## Windows 平台方案分析

### 1. Windows Registry (注册表) ⭐推荐

**代表项目：**
- [node-regedit](https://github.com/kessler/node-regedit) - 297 stars，95.7K 周下载
- [electron-regedit](https://github.com/Tympanix/electron-regedit) - 38 stars
- [shell-context-menu](https://github.com/tymmesyde/node-shell-context-menu) - 7 stars

**实现方式：**
- 修改注册表键值：`HKCU\Software\Classes\*\shell\`
- 创建命令子项，指向可执行文件

**优点：**
- ✅ 成熟稳定，大量项目使用
- ✅ 无需额外依赖（node-regedit 使用 VBScript）
- ✅ 支持文件、文件夹、特定扩展名
- ✅ HKCU 路径无需管理员权限

**缺点：**
- ❌ 仅 Windows

**注册表结构：**
```
HKCU\Software\Classes\*\shell\MyApp
    (默认) = "Open with MyApp"
    Icon = "C:\\Path\\MyApp.exe,0"
    
HKCU\Software\Classes\*\shell\MyApp\command
    (默认) = "\"C:\\Path\\MyApp.exe\" \"%1\""
```

**Node.js 实现示例：**
```javascript
const regedit = require('regedit').promisified;

async function registerContextMenu() {
  const keyPath = 'HKCU\\Software\\Classes\\*\\shell\\DocsifyStart';
  
  await regedit.putValue({
    [keyPath]: {
      '': { value: 'Start Docsify Server', type: 'REG_SZ' },
      'Icon': { value: 'C:\\Path\\docsify.exe,0', type: 'REG_SZ' }
    },
    [`${keyPath}\\command`]: {
      '': { value: '"C:\\Path\\docsify.exe" start "%V"', type: 'REG_SZ' }
    }
  });
}
```

---

### 2. Shell Extension (COM 组件)

**代表项目：**
- [ShellAnything](https://github.com/end2endzone/ShellAnything) - 218 stars
- [shell-x](https://github.com/oleg-shilo/shell-x) - 167 stars

**实现方式：**
- 编写 C++/C# COM DLL
- 注册为 Shell Extension

**优点：**
- ✅ 功能最强大，支持动态菜单
- ✅ 直接出现在右键菜单

**缺点：**
- ❌ 需要编译原生代码
- ❌ 复杂度高
- ❌ 需要管理员权限注册 DLL

---

## 跨平台方案对比

| 方案 | macOS | Windows | 复杂度 | 用户体验 | 维护性 |
|------|-------|---------|--------|----------|--------|
| Finder Sync + Registry | ✅ | ✅ | 高 | ⭐⭐⭐ | 中 |
| Automator + Registry | ✅ | ✅ | 中 | ⭐⭐ | 低 |
| 纯 Registry (仅 Windows) | ❌ | ✅ | 低 | ⭐⭐⭐ | 高 |
| 第三方工具依赖 | ✅ | ✅ | 低 | ⭐⭐ | 低 |

---

## 推荐方案

### 方案一：Windows 优先 + macOS 辅助工具（推荐）

**核心思路：**
1. **Windows**：使用 `node-regedit` 实现完整的注册表操作
2. **macOS**：推荐用户使用成熟的第三方工具，提供配置脚本

**macOS 推荐工具：**
- [RClick](https://github.com/wflixu/rclick) - 开源免费，功能强大
- [SzContext](https://github.com/RoadToDream/SzContext) - 开源免费
- 提供配置导入文件，一键配置

**优点：**
- ✅ Windows 实现完美
- ✅ macOS 利用成熟工具，避免重复造轮子
- ✅ 开发成本低

**缺点：**
- ❌ macOS 需要用户额外安装工具

---

### 方案二：完整跨平台实现（高投入）

**核心思路：**
1. **Windows**：使用 `node-regedit`
2. **macOS**：开发原生 Finder Sync Extension App

**macOS 实现步骤：**
1. 创建 Xcode 项目
2. 实现 FinderSync 扩展
3. 与 Node.js CLI 通信（通过 XPC 或文件）
4. 打包为 `.app`，随 npm 包分发

**项目结构：**
```
context-menu-registrar/
├── lib/
│   ├── windows.js      # Windows 注册表操作
│   ├── macos.js        # macOS App 管理
│   └── index.js        # 统一 API
├── macos-app/          # Xcode 项目
│   └── ContextMenu.app
├── package.json
└── README.md
```

**优点：**
- ✅ 真正的跨平台
- ✅ 最佳用户体验

**缺点：**
- ❌ 开发成本高（需要 Xcode + Swift）
- ❌ 维护成本高（需要维护 macOS App）
- ❌ 包体积增大

---

### 方案三：纯脚本方案（折中）

**核心思路：**
1. **Windows**：使用 `node-regedit`
2. **macOS**：使用 AppleScript + Automator，但改进可靠性

**改进点：**
- 使用 `shortcuts` CLI 替代 Automator（macOS 12+）
- 提供详细的故障排查指南
- 使用 `plutil` 确保 plist 格式正确

**优点：**
- ✅ 无需原生开发
- ✅ 纯 Node.js 实现

**缺点：**
- ❌ macOS 体验不如原生扩展
- ❌ 可能存在兼容性问题

---

## 建议

### 短期（推荐）：方案一 + 方案三混合

1. **Windows**：完整实现注册表操作
2. **macOS**：
   - 首先尝试 Shortcuts CLI（macOS 12+）
   - 回退到 Automator（旧版本）
   - 提供 RClick/SzContext 配置作为备选

### 长期：方案二

如果项目有足够资源，可以开发原生 macOS Finder Sync Extension，提供最佳体验。

---

## 相关项目链接

### Windows
- [node-regedit](https://github.com/kessler/node-regedit) - 注册表操作
- [electron-regedit](https://github.com/Tympanix/electron-regedit) - Electron 注册表
- [shell-context-menu](https://github.com/tymmesyde/node-shell-context-menu) - 简单封装

### macOS
- [RClick](https://github.com/wflixu/rclick) - 639 stars，推荐
- [SzContext](https://github.com/RoadToDream/SzContext) - 157 stars
- [custom-finder-right-click-menu](https://github.com/samiyuru/custom-finder-right-click-menu) - 143 stars

### 跨平台（概念验证）
- [shell-x](https://github.com/oleg-shilo/shell-x) - Windows 动态菜单
- [ShellAnything](https://github.com/end2endzone/ShellAnything) - Windows Shell 扩展

---

## 下一步行动

1. **验证 Windows 方案**：使用 `node-regedit` 实现原型
2. **验证 macOS Shortcuts 方案**：测试 `shortcuts` CLI 的可行性
3. **决策**：根据验证结果选择最终方案
4. **开发**：实现选定的方案

---

*调研日期：2026-03-17*
