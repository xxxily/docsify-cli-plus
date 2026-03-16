# 参与贡献 docsify-cli-plus

感谢您有兴趣为 docsify-cli-plus 做出贡献！本文档提供全面的指南，帮助您快速上手。

## 目录

- [项目概览](#项目概览)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [可用命令](#可用命令)
- [开发工作流](#开发工作流)
- [提交规范](#提交规范)
- [代码风格](#代码风格)
- [测试](#测试)
- [提交变更](#提交变更)

## 项目概览

docsify-cli-plus 是 [Docsify](https://docsify.js.org/) 的增强版 CLI 工具，Docsify 是一个神奇的文档站点生成器。此分支添加了 `start` 命令，实现零配置文档服务。

### 主要特性

- **init**: 使用可自定义模板生成新的文档项目
- **serve**: 运行带实时重载的开发服务器
- **start**: 零配置服务器，自动生成侧边栏（新增）
- **generate**: 从目录结构自动生成侧边栏文件

### 技术栈

- **运行时**: Node.js >= 20.11.0
- **CLI 框架**: [yargs](https://github.com/yargs/yargs) + [yargonaut](https://github.com/nickmccurdy/yargonaut) 样式
- **构建工具**: [Rollup](https://rollupjs.org/) 打包
- **服务器**: [connect](https://github.com/senchalabs/connect) 中间件
- **实时重载**: [livereload](https://github.com/napcs/node-livereload)
- **测试**: [AVA](https://github.com/avajs/ava)
- **代码检查**: [ESLint](https://eslint.org/) + xo-space 配置
- **版本管理**: [standard-version](https://github.com/conventional-changelog/standard-version) 生成变更日志

## 开发环境搭建

### 前置要求

- Node.js >= 20.11.0
- npm 或 yarn

### 初始设置

```bash
# 在 GitHub 上 Fork 仓库
# 本地克隆您的 Fork
git clone https://github.com/xxxily/docsify-cli-plus.git
cd docsify-cli-plus

# 安装依赖
npm install

# 构建项目
npm run build

# 链接到全局进行测试
npm link
```

## 项目结构

```
docsify-cli-plus/
├── bin/                    # 编译后的可执行文件（由构建生成）
│   └── docsify            # CLI 主入口
├── lib/                    # 源代码
│   ├── commands/          # CLI 命令实现
│   │   ├── init.js        # 初始化新文档项目
│   │   ├── serve.js       # 开发服务器
│   │   ├── start.js       # 零配置服务器（新增）
│   │   └── generate.js    # 生成侧边栏
│   ├── template/          # HTML 模板
│   │   ├── index.html     # init 默认模板
│   │   └── start-index.html # start 命令模板
│   ├── util/              # 工具函数
│   │   ├── index.js       # 通用工具
│   │   └── logger.js      # 日志工具
│   ├── cli.js             # CLI 设置和命令定义
│   └── index.js           # 主入口点
├── tools/                 # 构建和本地化工具
│   └── locales/          # i18n 翻译文件
│       ├── en.json       # 英文
│       ├── zh.json       # 中文
│       └── de.json       # 德文
├── e2e/                  # 端到端测试
│   └── cli.test.js       # CLI 测试（含快照）
├── docs/                 # 文档
├── media/                # 资源（图标、截图）
├── package.json          # 项目配置
├── rollup.config.js      # 构建设置
└── eslint.config.js      # 代码检查规则
```

## 可用命令

### 开发命令

| 命令 | 描述 | 使用时机 |
|---------|-------------|-------------|
| `npm run lint` | 对所有文件运行 ESLint | 提交前检查代码风格 |
| `npm run lint:fix` | 运行 ESLint 自动修复 | 自动修复风格问题 |
| `npm run build` | 使用 Rollup 构建 CLI | lib/ 代码变更后 |
| `npm test` | 运行所有测试 | 提交 PR 前 |
| `npm link` | 创建全局符号链接 | 本地测试 CLI |

### 发布命令

| 命令 | 描述 | 使用时机 |
|---------|-------------|-------------|
| `npm run release` | 提升版本、更新变更日志、创建标签 | 发布新版本时 |
| `npm run prerelease` | 发布前构建 | 发布前自动运行 |

### 构建流程

构建流程使用 Rollup 打包 CLI：

1. **输入**: `lib/cli.js`
2. **输出**: `bin/docsify`（可执行文件）
3. **插件**:
   - `rollup-plugin-executable`: 使输出文件可执行
   - Shebang 注入: `#!/usr/bin/env node`

构建后，可通过以下方式运行 CLI：
```bash
./bin/docsify <command>
# 或如果已全局链接：
docsify <command>
```

## 开发工作流

### 进行变更

1. **创建分支**：
   ```bash
   git checkout -b feat/您的特性名称
   # 或
   git checkout -b fix/bug-描述
   ```

2. **修改 lib/ 中的源代码**

3. **构建项目**：
   ```bash
   npm run build
   ```

4. **测试您的变更**：
   ```bash
   # 本地测试
   npm link
   docsify <command>

   # 运行测试
   npm test
   ```

5. **检查代码风格**：
   ```bash
   npm run lint
   ```

### 本地测试

`npm link` 后，您可以在任何目录测试 CLI：

```bash
# 测试 init 命令
cd /tmp
mkdir test-docs
cd test-docs
docsify init

# 测试 start 命令
docsify start

# 带选项测试
docsify start --port 4000 --open
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 配合 [commitlint](https://commitlint.js.org/) 规则。这支持自动生成变更日志。

### 提交消息格式

```
<类型>(<范围>): <主题>

<正文>

<脚注>
```

### 类型

| 类型 | 描述 | 示例 |
|------|-------------|---------|
| `feat` | 新特性 | `feat: 添加 start 命令` |
| `fix` | Bug 修复 | `fix: 解决侧边栏加载问题` |
| `docs` | 文档变更 | `docs: 更新 README` |
| `style` | 代码风格（格式化） | `style: 修复缩进` |
| `refactor` | 代码重构 | `refactor: 简化服务器设置` |
| `perf` | 性能改进 | `perf: 优化文件监视` |
| `test` | 添加/更新测试 | `test: 为 start 添加 e2e 测试` |
| `chore` | 构建/工具变更 | `chore: 更新依赖` |
| `ci` | CI/CD 变更 | `ci: 添加 GitHub Actions` |

### 范围（可选）

- `commands` - CLI 命令（init, serve, start, generate）
- `template` - HTML 模板
- `util` - 工具函数
- `deps` - 依赖
- `docs` - 文档

### 示例

```bash
# 特性提交
feat(commands): 添加零配置服务的 start 命令

添加新的 'start' 命令，提供零配置文档服务器，
支持自动生成侧边栏和默认 index.html 模板。

# Bug 修复提交
fix(commands): 解决用户 index.html 时虚拟侧边栏加载问题

修复 history fallback 以在使用用户提供的
自定义 index.html 时正确提供虚拟 _sidebar.md。

# 文档提交
docs: 添加 README 中文翻译

# 依赖更新
chore(deps): 升级 docsify 到 v5.0.0-rc.4
```

### 破坏性变更

对于破坏性变更，在脚注中添加 `BREAKING CHANGE:`：

```
feat(commands): 将默认端口改为 8080

BREAKING CHANGE: 默认端口从 3000 改为 8080
```

## 代码风格

我们使用 ESLint 配合 `xo-space` 配置。关键规则：

- **缩进**: 2 个空格
- **引号**: 单引号
- **分号**: 必需
- **换行符**: Unix (LF)
- **最大行长度**: 100 字符

### 自动格式化

```bash
# 修复所有可自动修复的问题
npm run lint:fix
```

### 提交前钩子

Husky 在每次提交前运行 lint-staged：
- 自动对已暂存的 `.js` 文件运行 `eslint --fix`
- 将修复后的文件重新添加到提交

## 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 带详细输出运行
npm test -- --verbose

# 运行特定测试文件
npx ava e2e/cli.test.js
```

### 测试结构

测试位于 `e2e/cli.test.js`，使用 AVA：
- **单元测试**: 测试单个函数
- **集成测试**: 端到端测试 CLI 命令
- **快照**: 测试输出一致性

### 添加测试

添加新特性时，添加相应测试：

```javascript
test('start 命令提供默认 index', async t => {
  const result = await execa('node', ['bin/docsify', 'start', '--help'])
  t.true(result.stdout.includes('Start a server'))
})
```

## 提交变更

### Pull Request 流程

1. **确保测试通过**：
   ```bash
   npm test
   ```

2. **确保代码检查通过**：
   ```bash
   npm run lint
   ```

3. **如需要，更新文档**：
   - README.md 用于面向用户的变更
   - CONTRIBUTING.md 用于开发流程变更

4. **创建 Pull Request**：
   - 使用清晰的标题，遵循提交规范
   - 描述变更内容和原因
   - 引用相关 issue

### PR 标题格式

```
<类型>(<范围>): <描述>

示例：
feat(commands): 添加带虚拟侧边栏的 start 命令
```

### 审查清单

提交 PR 前，请验证：

- [ ] 代码遵循风格指南（`npm run lint`）
- [ ] 测试通过（`npm test`）
- [ ] 构建成功（`npm run build`）
- [ ] 文档已更新
- [ ] 提交消息遵循规范
- [ ] 变更向后兼容（或标记为破坏性变更）

## 获取帮助

- **Issues**: [GitHub Issues](https://github.com/xxxily/docsify-cli-plus/issues)
- **讨论**: [GitHub Discussions](https://github.com/xxxily/docsify-cli-plus/discussions)
- **文档**: [Docsify 文档](https://docsify.js.org/)

## 许可证

通过贡献，您同意您的贡献将在 [MIT 许可证](LICENSE) 下授权。
