<p align="center">
  <a href="https://docsify.js.org">
    <img alt="docsify" src="./media/icon.svg">
  </a>
</p>

<p align="center">
 🖌 docsify cli - A magical documentation generator.
</p>

<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a>
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

<p align="center">Gold Sponsor via <a href="https://opencollective.com/docsify">Open Collective</a></p>

<p align="center">
  <a href="https://opencollective.com/docsify/order/3254">
    <img src="https://opencollective.com/docsify/tiers/gold-sponsor.svg?avatarHeight=36">
  </a>
</p>

## Screencast

![Screencast](https://raw.githubusercontent.com/docsifyjs/docsify-cli/master/media/screencast.gif)

> Running a server on `localhost` with live-reload.

## Installation

Install `docsify-cli` via `npm` or `yarn` globally.

```shell
npm i docsify-cli -g
# yarn global add docsify-cli
```

## Usage

### `init` command

Use `init` to generate your docs.

```shell
docsify init [path] [--local false] [--rcMode] [--theme vue] [--plugins]

# docsify i [path] [-l false] [--rc] [-t vue] [-p]
```

`[path]` defaults to the current directory. Use relative paths like `./docs` (or `docs`).

- `--local` option:
  - Shorthand: `-l`
  - Type: boolean
  - Default: `false`
  - Description: Copy `docsify` files to the docs path, defaults to `false` using `cdn.jsdelivr.net` as the content delivery network (CDN). To explicitly set this option to `false` use `--no-local`.
- `--rcMode` option:
  - Shorthand: `--rc`
  - Type: boolean
  - Default: `false`
  - Description: Try `docsify` preview release version (`rc` resource).
- `--theme` option:
  - Shorthand: `-t`
  - Type: string
  - Default: `vue`
  - Description: Choose a theme, defaults to `vue`.
- `--plugins` option:
  - Shorthand: `-p`
  - Type: boolean
  - Default: `false`
  - Description: Provide a list of plugins to insert as `<script>` tags to `index.html`.

### `serve` command

Run a server on `localhost` with livereload.

```shell
docsify serve [path] [--open false] [--port 3000]

# docsify s [path] [-o false] [-p 3000]
```

- `--open` option:
  - Shorthand: `-o`
  - Type: boolean
  - Default: `false`
  - Description: Open the docs in the default browser, defaults to `false`. To explicitly set this option to `false` use `--no-open`.
- `--port` option:
  - Shorthand: `-p`
  - Type: number
  - Default: `3000`
  - Description: Choose a listen port, defaults to `3000`.
- `--host` option:
  - Shorthand: `-H`
  - Type: string
  - Default: `localhost`
  - Description: Choose a host to bind to, defaults to `localhost`.

### `start` command

Start a server with zero configuration. This command works like `serve`, but with automatic fallback:

- If no `index.html` exists, a default one will be served (with `loadSidebar: true`, `subMaxLevel: 2`, `auto2top: true`, and search plugin enabled)
- If no `_sidebar.md` exists, a virtual sidebar will be auto-generated from your markdown files and updated automatically when files change

```shell
docsify start [path] [--open false] [--port 3000]

# docsify st [path] [-o false] [-p 3000]
```

- `--open` option:
  - Shorthand: `-o`
  - Type: boolean
  - Default: `false`
  - Description: Open the docs in the default browser, defaults to `false`. To explicitly set this option to `false` use `--no-open`.
- `--host` option:
  - Shorthand: `-H`
  - Type: string
  - Default: `localhost`
  - Description: Choose a host to bind to, defaults to `localhost`.
- `--sidebar-sort` option:
  - Shorthand: `-S`
  - Type: string
  - Choices: `natural`, `mtime`
  - Default: `natural`
  - Description: Choose a sorting method for the virtual sidebar, defaults to `natural` (alphabetical). Use `mtime` to sort by file modification time (newest first).

#### `start` command features

**Virtual Sidebar Enhancements**:
- **Collapsible Folders**: Folders in the virtual sidebar are collapsed by default using HTML `<details>` and `<summary>` tags.
- **State Persistence**: The expanded/collapsed state of folders is preserved when navigating through different pages.
- **Smart Sorting**: Use `--sidebar-sort mtime` to keep your most recently updated docs at the top of the sidebar. Useful for "What's New" style documentation.
- **Multi-instance Support**: Automatically detects and uses the next available port if the default port is busy (supports both main server and livereload server auto-tuning).

**Template Loading Priority**:
1. `~/.docsify/index.html` - User-defined template
2. `lib/template/start-index.html` - Project default template
3. Built-in fallback template

### `generate` command

Docsify's generators.

```shell
docsify generate [path] [--sidebar _sidebar.md] [--overwrite]

# docsify g [path] [-s _sidebar.md] [-o]
```

- `--sidebar` option:
  - Shorthand: `-s`
  - Type: string
  - Default: `_sidebar.md`
  - Description: Generate sidebar file, defaults to `_sidebar.md`.

- `--overwrite` option:
  - Shorthand: `-o`
  - Type: boolean
  - Default: `false`
  - Description: Allow to overwrite generated files.

### `menu` command

Manage system context menu and running Docsify instances.

```shell
docsify menu [subcommand] [arg]

# docsify m [subcommand] [arg]
```

- **Subcommands**:
  - `register`: Register the system right-click context menu (supports macOS and Windows).
  - `unregister`: Unregister the system context menu.
  - `status`: Show the list of running instances and registration status.
  - `stop-all`: Stop all instances started via `docsify start`.
  - `stop <pid>`: Stop a specific instance by its process ID (PID).

Shows help information if no subcommand is provided.

> [!TIP]
> **For macOS Users**: After running `menu register`, go to **System Settings** → **Privacy & Security** → **Extensions** → **Finder**, and check **Docsify Start Server** to enable the context menu.

## Contributing
Please see the [Contributing Guidelines](./CONTRIBUTING.md)

## Contribution

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/docsifyjs/docsify-cli)

## License

[MIT](LICENSE)
