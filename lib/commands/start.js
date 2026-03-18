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
const instanceManager = require('../util/instance-manager')

let virtualSidebar = ''
let sidebarWatcher = null

module.exports = function (
  rootPath,
  openInBrowser,
  port,
  host,
  livereloadPort,
  indexName,
  sidebarSort
) {
  sidebarSort = sidebarSort || 'natural'
  // Use a port range starting from the requested port so consecutive instances
  // get predictable consecutive ports (e.g. 3000, 3001, 3002 …) rather than
  // random high ports that get-port v5 falls back to when the exact port is busy.
  const portRange = getPort.makeRange ? getPort.makeRange(port, port + 100) : port
  const lrRange = getPort.makeRange ? getPort.makeRange(livereloadPort, livereloadPort + 100) : livereloadPort
  getPort({port: portRange})
    .then(p => {
      port = p
      return getPort({port: lrRange})
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
        generateVirtualSidebar(rootPath, 10, sidebarSort)
        setupSidebarWatcher(rootPath, sidebarSort)
      }

      if (!exists(indexFile)) {
        const result = loadDefaultIndexHtml(userDocsifyDir, projectTemplateDir)
        defaultIndexHtmlContent = result.content
        indexHtmlSource = result.source
      }

      const useDefaultIndex = defaultIndexHtmlContent !== null

      // Inject sidebar folder state preservation script into HTML
      if (useVirtualSidebar && defaultIndexHtmlContent) {
        defaultIndexHtmlContent = injectSidebarScript(defaultIndexHtmlContent)
      }

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
      } else if (useVirtualSidebar) {
        // User has their own index.html but no _sidebar.md
        // Inject sidebar script into user's index.html
        const userIndexContent = fs.readFileSync(indexFile, 'utf-8')
        const injectedContent = injectSidebarScript(userIndexContent)
        server.use((req, res, next) => {
          if (req.url === '/' || req.url === '/' + indexFileName) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(injectedContent)
            return
          }

          next()
        })
      }

      // Inject livereload middleware — use a variable so the retry handler can update it
      let _livereloadPort = livereloadPort
      server.use((req, res, next) => {
        livereload({port: _livereloadPort})(req, res, next)
      })

      if (!useDefaultIndex) {
        server.use(history({
          index: '/' + indexFileName,
          rewrites: useVirtualSidebar ? [
            {from: /\/_sidebar\.md/, to: context => context.parsedUrl.pathname}
          ] : undefined
        }))
      }

      server.use(serveStatic(rootPath))
      const httpServer = server.listen(port, host)

      // Handle EADDRINUSE in case of race condition between getPort check and actual bind.
      // Try the next available port automatically to support multi-instance.
      httpServer.on('error', err => {
        if (err.code === 'EADDRINUSE') {
          const retryRange = getPort.makeRange ? getPort.makeRange(port + 1, port + 100) : port + 1
          getPort({port: retryRange}).then(newPort => {
            port = newPort
            httpServer.removeAllListeners('error')
            server.listen(port, host)
            instanceManager.registerInstance(process.pid, rootPath, port, host)
            if (openInBrowser) {
              open(`http://${host}:${port}`)
            }

            let retryMsg = '\nServing ' + chalk.green(`${rootPath}`) + ' now.\n'
            retryMsg += chalk.yellow(`(Port was busy, switched to port ${port})`) + '\n'
            retryMsg += 'Listening at ' + chalk.green(`http://${host}:${port}`) + '\n'
            console.log(retryMsg)
          }).catch(retryErr => {
            logger.error('Could not find a free port: ' + retryErr.message)
          })
        } else {
          logger.error(err.message)
        }
      })

      // Track this instance so `docsify menu status` knows it's running
      instanceManager.registerInstance(process.pid, rootPath, port, host)

      // Livereload server — retry with another port if the first one is busy
      function startLivereload(lrPort) {
        try {
          const lr = lrserver.createServer({
            extraExts: ['md'],
            exclusions: ['node_modules/'],
            port: lrPort
          })

          lr.watch(rootPath)
          _livereloadPort = lrPort
        } catch {
          // Port is busy — find another one
          const lrRetryRange = getPort.makeRange ? getPort.makeRange(lrPort + 1, lrPort + 100) : lrPort + 1
          getPort({port: lrRetryRange}).then(newLrPort => {
            startLivereload(newLrPort)
          }).catch(() => {
            console.log(chalk.yellow('\n⚠️  Could not start livereload server (all ports busy). Live-reload disabled.\n'))
          })
        }
      }

      startLivereload(livereloadPort)

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
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <meta name="description" content="Documentation powered by Docsify">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@5.0.0-rc.4/dist/themes/core.min.css">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@5.0.0-rc.4/dist/themes/addons/vue.min.css">
</head>
<body>
  <div id="app">Loading ...</div>
  <script>
    window.$docsify = {
      name: '',
      repo: '',
      auto2top: true,
      loadSidebar: true,
      subMaxLevel: 3,
      maxLevel: 4,
      relativePath: true,
      search: {
        paths: 'auto',
        placeholder: 'Search...',
        noData: 'No results!',
        depth: 3
      },
      copyCode: {
        buttonText: 'Copy',
        successText: 'Copied!'
      },
      pagination: {
        previousText: '← Previous',
        nextText: 'Next →',
        crossChapter: true
      }
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@5.0.0-rc.4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify@5.0.0-rc.4/lib/plugins/search.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-copy-code@3"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify-pagination@2/dist/docsify-pagination.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-python.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-json.min.js"></script>
</body>
</html>`
}

function getSidebarFolderStateScript() {
  return `
(function() {
  var openFolders = {};
  document.addEventListener('toggle', function(e) {
    var el = e.target;
    if (el.tagName === 'DETAILS' && el.closest('.sidebar-nav')) {
      var summary = el.querySelector('summary');
      if (summary) {
        var key = summary.textContent.trim();
        if (el.open) {
          openFolders[key] = true;
        } else {
          delete openFolders[key];
        }
      }
    }
  }, true);
  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat([
    function(hook) {
      hook.doneEach(function() {
        var allDetails = document.querySelectorAll('.sidebar-nav details');
        for (var i = 0; i < allDetails.length; i++) {
          var summary = allDetails[i].querySelector('summary');
          if (summary) {
            var key = summary.textContent.trim();
            if (openFolders[key]) {
              allDetails[i].open = true;
            }
          }
        }
      });
    }
  ]);
})();
`
}

function injectSidebarScript(html) {
  const script = getSidebarFolderStateScript()
  const scriptTag = '  <script>' + script + '  </script>\n'

  // Inject before the docsify library script tag (after config, before lib load)
  const docsifyScriptRegex = /([ \t]*<script\s+src=["'][^"']*docsify[^"']*["'])/i
  if (docsifyScriptRegex.test(html)) {
    return html.replace(docsifyScriptRegex, scriptTag + '  $1')
  }

  // Fallback: inject before </body>
  return html.replace('</body>', scriptTag + '</body>')
}

function generateVirtualSidebar(rootPath, maxLevel = 10, sortBy = 'natural') {
  const ignoreFiles = ['_navbar', '_coverpage', '_sidebar', 'README']
  const tree = []

  getDirFiles(rootPath, function (pathname, stats) {
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
      parentDirs: depth > 0 ? splitPath.slice(0, -1) : [],
      mtime: stats ? stats.mtime.getTime() : 0
    }

    tree.push(fileEntry)
  })

  if (sortBy === 'mtime') {
    // Build a map of directory path -> max mtime of its children
    const dirMaxMtime = {}
    tree.forEach(entry => {
      const parts = entry.path.split('/')
      // Accumulate mtime for each ancestor directory
      for (let i = 1; i <= parts.length - 1; i++) {
        const dirPath = parts.slice(0, i).join('/')
        if (!dirMaxMtime[dirPath] || entry.mtime > dirMaxMtime[dirPath]) {
          dirMaxMtime[dirPath] = entry.mtime
        }
      }
    })

    tree.sort((a, b) => {
      const partsA = a.path.split('/')
      const partsB = b.path.split('/')

      // Compare level by level
      const minLen = Math.min(partsA.length, partsB.length)
      for (let i = 0; i < minLen - 1; i++) {
        if (partsA[i] !== partsB[i]) {
          const dirA = partsA.slice(0, i + 1).join('/')
          const dirB = partsB.slice(0, i + 1).join('/')
          return (dirMaxMtime[dirB] || 0) - (dirMaxMtime[dirA] || 0)
        }
      }

      // Same directory: sort files by mtime descending
      if (partsA.length === partsB.length) {
        return b.mtime - a.mtime
      }

      // Directories come before files at the same level
      return partsA.length - partsB.length
    })
  } else {
    tree.sort((a, b) => {
      const pathA = a.path.toLowerCase()
      const pathB = b.path.toLowerCase()
      return pathA.localeCompare(pathB)
    })
  }

  virtualSidebar = buildSidebarTree(tree)
}

function buildSidebarTree(entries) {
  if (entries.length === 0) {
    return ''
  }

  // Organize entries into a hierarchical structure
  const root = {children: [], files: []}

  entries.forEach(entry => {
    const parts = entry.path.split('/')
    let current = root

    // Navigate to the correct directory node
    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i]
      let child = current.children.find(c => c.name === dirName)
      if (!child) {
        child = {name: dirName, children: [], files: []}
        current.children.push(child)
      }

      current = child
    }

    current.files.push(entry)
  })

  // Render the tree recursively
  return renderNode(root, 0)
}

function renderNode(node, depth) {
  let result = ''

  // Render child directories with <details>/<summary> for collapsing
  node.children.forEach(child => {
    const indent = '  '.repeat(depth)
    const innerContent = renderNode(child, depth + 1)
    result += indent + '- <details><summary>📁 ' + toCamelCase(child.name) + '</summary>' + os.EOL
    result += os.EOL
    result += innerContent
    result += os.EOL
    result += indent + '  </details>' + os.EOL
    result += os.EOL
  })

  // Render files
  node.files.forEach(entry => {
    const indent = '  '.repeat(depth)
    result += indent + '- [' + entry.name + '](' + entry.path + ')' + os.EOL
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
    const stats = fs.statSync(pathname)

    if (stats.isDirectory()) {
      getDirFiles(pathname, callback)
    } else if (path.extname(file) === '.md') {
      callback(pathname, stats)
    }
  })
}

function toCamelCase(str) {
  return str.replace(/\b(\w)/g, function (match, capture) {
    return capture.toUpperCase()
  }).replace(/-|_/g, ' ')
}

function setupSidebarWatcher(rootPath, sidebarSort) {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }

  let lastMtimes = {}

  const checkChanges = () => {
    let hasChanges = false
    const currentMtimes = {}

    try {
      getDirFiles(rootPath, function (pathname, stats) {
        try {
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
      generateVirtualSidebar(rootPath, 10, sidebarSort)
    }
  }

  sidebarWatcher = setInterval(checkChanges, 2000)
  checkChanges()
}

process.on('exit', () => {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }

  instanceManager.unregisterInstance(process.pid)
})

process.on('SIGINT', () => {
  if (sidebarWatcher) {
    clearInterval(sidebarWatcher)
  }

  instanceManager.unregisterInstance(process.pid)
  process.exit(0)
})
