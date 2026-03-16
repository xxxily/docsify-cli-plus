'use strict'

const serveStatic = require('serve-static')
const connect = require('connect')
const livereload = require('connect-livereload')
const history = require('connect-history-api-fallback')
const lrserver = require('livereload')
const open = require('open')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const os = require('os')
const logger = require('../util/logger')
const {exists, resolve} = require('../util')
const getPort = require('get-port')

let virtualSidebar = ''
let sidebarWatcher = null

module.exports = function (
  rootPath,
  openInBrowser,
  port,
  host,
  livereloadPort,
  indexName
) {
  getPort({port})
    .then(p => {
      port = p
      return getPort({port: livereloadPort})
    })
    .then(p => {
      livereloadPort = p
    })
    .then(_ => {
      rootPath = resolve(rootPath || '.')
      const indexFileName = indexName || 'index.html'
      const indexFile = resolve(rootPath, indexFileName)
      const sidebarFile = resolve(rootPath, '_sidebar.md')

      const userDocsifyDir = path.join(os.homedir(), '.docsify')
      const projectTemplateDir = path.join(__dirname, '..', 'template')

      let indexHtmlSource = null
      let defaultIndexHtmlContent = null

      const useVirtualSidebar = !exists(sidebarFile)

      const server = connect()

      if (useVirtualSidebar) {
        generateVirtualSidebar(rootPath)
        setupSidebarWatcher(rootPath)
      }

      if (!exists(indexFile)) {
        const result = loadDefaultIndexHtml(userDocsifyDir, projectTemplateDir)
        defaultIndexHtmlContent = result.content
        indexHtmlSource = result.source
      }

      const useDefaultIndex = defaultIndexHtmlContent !== null

      server.use((req, res, next) => {
        if (useVirtualSidebar && req.url === '/_sidebar.md') {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
          res.end(virtualSidebar)
          return
        }

        next()
      })

      if (useDefaultIndex) {
        server.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(defaultIndexHtmlContent)
            return
          }

          next()
        })
      }

      server.use(
        livereload({
          port: livereloadPort
        })
      )

      if (!useDefaultIndex) {
        server.use(history({
          index: '/' + indexFileName,
          rewrites: useVirtualSidebar ? [
            {from: /\/_sidebar\.md/, to: context => context.parsedUrl.pathname}
          ] : undefined
        }))
      }

      server.use(serveStatic(rootPath))
      server.listen(port, host)

      const lr = lrserver.createServer({
        extraExts: ['md'],
        exclusions: ['node_modules/'],
        port: livereloadPort
      })

      lr.watch(rootPath)

      if (openInBrowser) {
        open(`http://${host}:${port}`)
      }

      let msg = '\nServing ' + chalk.green(`${rootPath}`) + ' now.\n'
      msg += 'Listening at ' + chalk.green(`http://${host}:${port}`) + '\n'

      if (useDefaultIndex) {
        msg += '\n' + chalk.yellow('Using default index.html (no index.html found in target directory)') + '\n'
        msg += chalk.gray(`  Loaded from: ${indexHtmlSource}`) + '\n'
        msg += chalk.gray('  You can create your own index.html or place one in ~/.docsify/index.html') + '\n'
      }

      if (useVirtualSidebar) {
        msg += '\n' + chalk.yellow('Using virtual _sidebar.md (auto-generated)') + '\n'
        msg += chalk.gray('  Create _sidebar.md to customize the sidebar') + '\n'
      }

      console.log(msg)
    })
    .catch(err => {
      logger.error(err.message)
    })
}

function loadDefaultIndexHtml(userDocsifyDir, projectTemplateDir) {
  const userIndexPath = path.join(userDocsifyDir, 'index.html')
  const projectIndexPath = path.join(projectTemplateDir, 'start-index.html')

  if (exists(userIndexPath)) {
    return {
      content: fs.readFileSync(userIndexPath, 'utf-8'),
      source: userIndexPath
    }
  }

  if (exists(projectIndexPath)) {
    return {
      content: fs.readFileSync(projectIndexPath, 'utf-8'),
      source: projectIndexPath
    }
  }

  return {
    content: getFallbackIndexHtml(),
    source: 'built-in fallback'
  }
}

function getFallbackIndexHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Docsify</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/dist/themes/core.min.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/dist/themes/addons/vue.min.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: '',
      repo: '',
      loadSidebar: true,
      subMaxLevel: 2,
      auto2top: true,
      search: 'auto'
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
</body>
</html>`
}

function generateVirtualSidebar(rootPath, maxLevel = 10) {
  const ignoreFiles = ['_navbar', '_coverpage', '_sidebar', 'README']
  const tree = []

  getDirFiles(rootPath, function (pathname) {
    const relativePath = pathname.replace(rootPath + path.sep, '')
    const filename = path.basename(relativePath, '.md')
    const splitPath = relativePath.split(path.sep)
    const depth = splitPath.length - 1

    if (ignoreFiles.indexOf(filename) !== -1) {
      return true
    }

    if (depth >= maxLevel) {
      return true
    }

    const fileEntry = {
      name: toCamelCase(filename),
      path: relativePath.replace(/\\/g, '/'),
      filename: filename,
      depth: depth,
      parentDirs: depth > 0 ? splitPath.slice(0, -1) : []
    }

    tree.push(fileEntry)
  })

  tree.sort((a, b) => {
    const pathA = a.path.toLowerCase()
    const pathB = b.path.toLowerCase()
    return pathA.localeCompare(pathB)
  })

  virtualSidebar = buildSidebarTree(tree)
}

function buildSidebarTree(entries) {
  if (entries.length === 0) {
    return ''
  }

  let result = ''
  let lastPathParts = []

  entries.forEach(entry => {
    const currentPathParts = entry.path.split('/')
    const currentDepth = entry.depth

    let commonPrefixLength = 0
    for (let i = 0; i < Math.min(lastPathParts.length - 1, currentPathParts.length - 1); i++) {
      if (lastPathParts[i] === currentPathParts[i]) {
        commonPrefixLength++
      } else {
        break
      }
    }

    if (currentDepth > 0) {
      for (let i = commonPrefixLength; i < currentDepth; i++) {
        const dirName = currentPathParts[i]
        const indent = '  '.repeat(i)
        result += indent + '- 📁 ' + toCamelCase(dirName) + os.EOL
      }

      const indent = '  '.repeat(currentDepth)
      result += indent + '- [' + entry.name + '](' + entry.path + ')' + os.EOL
    } else {
      result += '- [' + entry.name + '](' + entry.path + ')' + os.EOL
    }

    lastPathParts = currentPathParts
  })

  return result
}

function getDirFiles(dir, callback) {
  if (!fs.existsSync(dir)) {
    return
  }

  fs.readdirSync(dir).forEach(function (file) {
    if (file.startsWith('.') || file === 'node_modules') {
      return
    }

    let pathname = path.join(dir, file)

    if (fs.statSync(pathname).isDirectory()) {
      getDirFiles(pathname, callback)
    } else if (path.extname(file) === '.md') {
      callback(pathname)
    }
  })
}

function toCamelCase(str) {
  return str.replace(/\b(\w)/g, function (match, capture) {
    return capture.toUpperCase()
  }).replace(/-|_/g, ' ')
}

function setupSidebarWatcher(rootPath) {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }

  let lastMtimes = {}

  const checkChanges = () => {
    let hasChanges = false
    const currentMtimes = {}

    try {
      getDirFiles(rootPath, function (pathname) {
        try {
          const stats = fs.statSync(pathname)
          currentMtimes[pathname] = stats.mtime.getTime()

          if (lastMtimes[pathname] !== currentMtimes[pathname]) {
            hasChanges = true
          }
        } catch (_) { }
      })
    } catch (_) { }

    const lastPaths = Object.keys(lastMtimes)
    const currentPaths = Object.keys(currentMtimes)
    if (lastPaths.length === currentPaths.length) {
      for (const p of lastPaths) {
        if (!currentMtimes[p]) {
          hasChanges = true
          break
        }
      }
    } else {
      hasChanges = true
    }

    if (hasChanges) {
      lastMtimes = currentMtimes
      generateVirtualSidebar(rootPath)
    }
  }

  sidebarWatcher = setInterval(checkChanges, 2000)
  checkChanges()
}

process.on('exit', () => {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }
})

process.on('SIGINT', () => {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }

  process.exit(0)
})
