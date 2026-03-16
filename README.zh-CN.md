<p align="center">
  <a href="https://docsify.js.org">
    <img alt="docsify" src="./media/icon.svg">
  </a>
</p>

<p align="center">
 🖌 docsify cli - 一个神奇的文档生成器。
</p>

<p align="center">
  <a href="README.md">English</a> | <strong>中文</strong>
</p>

<p align="center">
  <a href="#backers"><img alt="Backers on Open Collective" src="https://opencollective.com/docsify/backers/badge.svg?style=flat-square"></a>
  <a href="#sponsors"><img alt="Sponsors on Open Collective" src="https://opencollective.com/docsify/sponsors/badge.svg?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/docsify"><img alt="npm" src="https://img.shields.io/npm/v/docsify-cli.svg?style=flat-square"></a>
  <a href="https://github.com/docsifyjs/docsify-cli/actions"><img alt="Github Actions Status" src="https://github.com/docsifyjs/docsify-cli/workflows/docsify-cli/badge.svg"></a>
<a href="https://discord.gg/3NwKFyR"><img alt="Join Discord community and chat about Docsify" src="https://img.shields.io/discord/713647066802421792.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2&cacheSeconds=60"></a>
<a href="https://github.com/docsifyjs/docsify-cli/blob/master/LICENSE"><img alt="license" src="https://img.shields.io/github/license/docsifyjs/docsify-cli.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/docsify-cli"><img alt="npm-total-download" src="https://img.shields.io/npm/dt/docsify-cli.svg?style=flat-square"></a>
<a href="https://www.npmjs.com/package/docsify-cli"><img alt="npm-monthly-download" src="https://img.shields.io/npm/dm/docsify-cli.svg?style=flat-square"></a>

</p>

<p align="center">通过 <a href="https://opencollective.com/docsify">Open Collective</a> 成为金牌赞助商</p>

<p align="center">
  <a href="https://opencollective.com/docsify/order/3254">
    <img src="https://opencollective.com/docsify/tiers/gold-sponsor.svg?avatarHeight=36">
  </a>
</p>

## 演示

![演示](https://raw.githubusercontent.com/docsifyjs/docsify-cli/master/media/screencast.gif)

> 在 `localhost` 上运行服务器并支持实时重载。

## 安装

通过 `npm` 或 `yarn` 全局安装 `docsify-cli`。

```shell
npm i docsify-cli -g
# yarn global add docsify-cli
```

## 使用方法

### `init` 命令

使用 `init` 生成您的文档项目。

```shell
docsify init [path] [--local false] [--rcMode] [--theme vue] [--plugins]

# docsify i [path] [-l false] [--rc] [-t vue] [-p]
```

`[path]` 默认为当前目录。使用相对路径如 `./docs`（或 `docs`）。

- `--local` 选项：
  - 简写：`-l`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：将 `docsify` 文件复制到文档路径，默认为 `false`，使用 `cdn.jsdelivr.net` 作为内容分发网络（CDN）。要显式设置为 `false`，请使用 `--no-local`。
- `--rcMode` 选项：
  - 简写：`--rc`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：尝试使用 `docsify` 预览版本（`rc` 资源）。
- `--theme` 选项：
  - 简写：`-t`
  - 类型：字符串
  - 默认值：`vue`
  - 描述：选择主题，默认为 `vue`。
- `--plugins` 选项：
  - 简写：`-p`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：提供插件列表作为 `<script>` 标签插入到 `index.html`。

### `serve` 命令

在 `localhost` 上运行服务器并支持实时重载。

```shell
docsify serve [path] [--open false] [--port 3000]

# docsify s [path] [-o false] [-p 3000]
```

- `--open` 选项：
  - 简写：`-o`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：在默认浏览器中打开文档，默认为 `false`。要显式设置为 `false`，请使用 `--no-open`。
- `--port` 选项：
  - 简写：`-p`
  - 类型：数字
  - 默认值：`3000`
  - 描述：选择监听端口，默认为 `3000`。
- `--host` 选项：
  - 简写：`-H`
  - 类型：字符串
  - 默认值：`localhost`
  - 描述：选择绑定的主机，默认为 `localhost`。

### `start` 命令

零配置启动服务器。此命令类似于 `serve`，但具有自动回退功能：

- 如果没有 `index.html`，将提供默认的（已配置 `loadSidebar: true`、`subMaxLevel: 2`、`auto2top: true` 和搜索插件）
- 如果没有 `_sidebar.md`，将从您的 Markdown 文件自动生成虚拟侧边栏，并在文件更改时自动更新

```shell
docsify start [path] [--open false] [--port 3000]

# docsify st [path] [-o false] [-p 3000]
```

- `--open` 选项：
  - 简写：`-o`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：在默认浏览器中打开文档，默认为 `false`。要显式设置为 `false`，请使用 `--no-open`。
- `--port` 选项：
  - 简写：`-p`
  - 类型：数字
  - 默认值：`3000`
  - 描述：选择监听端口，默认为 `3000`。
- `--host` 选项：
  - 简写：`-H`
  - 类型：字符串
  - 默认值：`localhost`
  - 描述：选择绑定的主机，默认为 `localhost`。

#### `start` 命令特性

**模板加载优先级**：
1. `~/.docsify/index.html` - 用户自定义模板
2. `lib/template/start-index.html` - 项目默认模板
3. 内置回退模板

**虚拟侧边栏**：
- 自动从目录结构生成
- 每 2 秒监视文件变化
- 支持嵌套目录结构

**启动信息**：
服务器启动时会显示详细信息：
- 使用的模板来源路径
- 是否使用虚拟侧边栏
- 自定义配置提示

### `generate` 命令

Docsify 的生成器。

```shell
docsify generate [path] [--sidebar _sidebar.md] [--overwrite]

# docsify g [path] [-s _sidebar.md] [-o]
```

- `--sidebar` 选项：
  - 简写：`-s`
  - 类型：字符串
  - 默认值：`_sidebar.md`
  - 描述：生成侧边栏文件，默认为 `_sidebar.md`。

- `--overwrite` 选项：
  - 简写：`-o`
  - 类型：布尔值
  - 默认值：`false`
  - 描述：允许覆盖已生成的文件。

## 快速开始示例

### 场景 1：从零开始（推荐）

```bash
# 创建文档目录
mkdir my-docs && cd my-docs

# 启动服务器（自动生成所有配置）
docsify start

# 在浏览器中访问 http://localhost:3000
```

### 场景 2：已有 Markdown 文件

```bash
# 进入包含 Markdown 文件的目录
cd existing-docs

# 启动服务器
docsify start --open
```

### 场景 3：传统方式（完整控制）

```bash
# 初始化项目
docsify init ./docs

# 生成侧边栏
docsify generate

# 启动服务器
docsify serve docs
```

## 全局快捷命令

创建全局快捷命令 `docsify-plus`：

```bash
# 创建包装脚本
cat > ~/.local/bin/docsify-plus << 'EOF'
#!/bin/bash
node /path/to/docsify-cli-plus/bin/docsify "$@"
EOF

# 添加执行权限
chmod +x ~/.local/bin/docsify-plus

# 确保 ~/.local/bin 在 PATH 中
export PATH="$HOME/.local/bin:$PATH"
```

现在可以在任何目录使用：
```bash
docsify-plus start
docsify-plus serve
docsify-plus init
```

## 参与贡献

请参阅 [贡献指南](./CONTRIBUTING.zh-CN.md)

## 在线开发

[![在 Gitpod 中打开](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/docsifyjs/docsify-cli)

## 许可证

[MIT](LICENSE)
