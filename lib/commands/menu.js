'use strict'

const chalk = require('chalk')
const instanceManager = require('../util/instance-manager')

// Platform adapter
let platform
if (process.platform === 'darwin') {
  platform = require('../platforms/macos')
} else if (process.platform === 'win32') {
  platform = require('../platforms/windows')
} else {
  platform = null
}

/**
 * Format an instance for display
 */
function formatInstance(inst) {
  return `  PID ${chalk.cyan(inst.pid)}  ${chalk.green(inst.url)}  ${chalk.gray(inst.rootPath)}  ${chalk.gray('started: ' + new Date(inst.startTime).toLocaleString())}`
}

/**
 * Handle `docsify menu register`
 */
function handleRegister() {
  if (!platform) {
    console.error(chalk.red(`[ERROR] Context menu registration is not supported on ${process.platform}.`))
    console.error(chalk.gray('  Supported platforms: macOS (darwin), Windows (win32)'))
    process.exit(1)
  }

  console.log(chalk.bold('\n📋 Registering system context menu...\n'))

  const result = platform.register()

  if (!result.success) {
    console.error(chalk.red('[ERROR] Registration failed: ' + result.message))
    process.exit(1)
  }

  if (process.platform === 'darwin') {
    console.log(chalk.green('✅ Quick Action registered successfully!\n'))
    console.log(chalk.bold('Workflow location:'))
    console.log(chalk.gray('  ' + result.workflowPath))
    console.log(chalk.bold('\nDocsify binary used:'))
    console.log(chalk.gray('  ' + result.docsifyBin))
    console.log()
    console.log(chalk.yellow('⚠️  To activate the context menu:'))
    console.log(chalk.gray('  1. Open System Settings → Privacy & Security → Extensions → Finder'))
    console.log(chalk.gray('  2. Enable "' + platform.SERVICE_NAME + '"'))
    console.log(chalk.gray('  3. Right-click any folder in Finder → Quick Actions → "' + platform.SERVICE_NAME + '"'))
    console.log()
  } else if (process.platform === 'win32') {
    console.log(chalk.green('✅ Context menu registered successfully!\n'))
    console.log(chalk.bold('Docsify binary:'))
    console.log(chalk.gray('  ' + result.docsifyBin))
    console.log()
    console.log(chalk.gray('Right-click any folder in Explorer to see "' + platform.MENU_LABEL + '"'))
    console.log()
  }
}

/**
 * Handle `docsify menu unregister`
 */
function handleUnregister() {
  if (!platform) {
    console.error(chalk.red(`[ERROR] Context menu is not supported on ${process.platform}.`))
    process.exit(1)
  }

  if (!platform.isRegistered()) {
    console.log(chalk.yellow('\n⚠️  Context menu is not currently registered.\n'))
    return
  }

  console.log(chalk.bold('\n🗑️  Unregistering context menu...\n'))

  const result = platform.unregister()

  if (!result.success) {
    console.error(chalk.red('[ERROR] Unregistration failed: ' + result.message))
    process.exit(1)
  }

  console.log(chalk.green('✅ Context menu unregistered successfully!\n'))
}

/**
 * Handle `docsify menu status`
 */
function handleStatus() {
  const instances = instanceManager.getInstances()

  const isReg = platform ? platform.isRegistered() : false

  console.log()
  console.log(chalk.bold('📊 Docsify Menu Status'))
  console.log()

  // Registration status
  if (platform) {
    if (isReg) {
      console.log(chalk.green('✅ Context menu: Registered'))
    } else {
      console.log(chalk.yellow('⚪ Context menu: Not registered'))
      console.log(chalk.gray('   Run `docsify menu register` to enable'))
    }
  } else {
    console.log(chalk.gray(`ℹ️  Context menu: Not supported on ${process.platform}`))
  }

  console.log()

  // Running instances
  if (instances.length === 0) {
    console.log(chalk.gray('No running instances.'))
  } else {
    console.log(chalk.bold(`Running instances (${instances.length}):`))
    console.log()
    instances.forEach(inst => {
      console.log(formatInstance(inst))
    })
  }

  console.log()
}

/**
 * Handle `docsify menu stop-all`
 */
function handleStopAll() {
  console.log(chalk.bold('\n🛑 Stopping all instances...\n'))
  const stopped = instanceManager.stopAllInstances()

  if (stopped === 0) {
    console.log(chalk.yellow('⚠️  No running instances found.\n'))
  } else {
    console.log(chalk.green(`✅ Stopped ${stopped} instance(s).\n`))
  }
}

/**
 * Handle `docsify menu stop <pid>`
 */
function handleStop(pid) {
  if (!pid) {
    console.error(chalk.red('[ERROR] Please specify a PID: docsify menu stop <pid>'))
    console.error(chalk.gray('  Run `docsify menu status` to see running instances.'))
    process.exit(1)
  }

  const ok = instanceManager.stopInstance(pid)
  if (ok) {
    console.log(chalk.green(`\n✅ Instance ${pid} stopped.\n`))
  } else {
    console.log(chalk.yellow(`\n⚠️  Instance ${pid} was not running (removed from state).\n`))
  }
}

/**
 * Main menu command handler
 * @param {string} subcommand - register | unregister | status | stop-all | stop
 * @param {string} [arg] - optional arg (e.g., pid for stop)
 */
module.exports = function (subcommand, arg) {
  switch (subcommand) {
    case 'register':
      handleRegister()
      break
    case 'unregister':
      handleUnregister()
      break
    case 'status':
      handleStatus()
      break
    case 'stop-all':
      handleStopAll()
      break
    case 'stop':
      handleStop(arg)
      break
    default:
      console.error(chalk.red(`[ERROR] Unknown subcommand: ${subcommand}`))
      console.error(chalk.gray('  Available subcommands: register, unregister, status, stop-all, stop <pid>'))
      process.exit(1)
  }
}
