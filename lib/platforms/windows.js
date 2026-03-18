'use strict'

const {execSync} = require('child_process')
const path = require('path')

// Registry keys for folder and folder-background right-click menus
const REG_KEYS = {
  folderShell: 'HKCU\\Software\\Classes\\Directory\\shell\\DocsifyStartServer',
  folderBgShell: 'HKCU\\Software\\Classes\\Directory\\Background\\shell\\DocsifyStartServer'
}

const MENU_LABEL = '📚 Docsify: Start Server Here'

/**
 * Find the absolute path to the docsify binary on Windows
 */
function getDocsifyBinPath() {
  try {
    const result = execSync('where docsify', {encoding: 'utf-8'}).trim().split('\n')[0].trim()
    if (result) {
      return result
    }
  } catch (_) {}

  return path.join(__dirname, '..', '..', 'bin', 'docsify')
}

/**
 * Run a reg command, return true on success
 * @param {string} cmd
 * @returns {boolean}
 */
function runReg(cmd) {
  try {
    execSync(cmd, {stdio: 'ignore'})
    return true
  } catch (_) {
    return false
  }
}

/**
 * Register the Windows context menu entries
 * @returns {{ success: boolean, message?: string }}
 */
function register() {
  if (process.platform !== 'win32') {
    return {success: false, message: 'Windows only'}
  }

  const docsifyBin = getDocsifyBinPath()
  // Wrap in quotes to handle spaces; use %V for folder path (Directory\Background gives folder)
  const cmdFolder = `cmd.exe /k cd /d "%1" && "${docsifyBin}" start --open`
  const cmdBg = `cmd.exe /k cd /d "%V" && "${docsifyBin}" start --open`

  try {
    // Register for Directory (right-clicking a folder)
    runReg(`reg add "${REG_KEYS.folderShell}" /ve /d "${MENU_LABEL}" /f`)
    runReg(`reg add "${REG_KEYS.folderShell}" /v "Icon" /d "${docsifyBin}" /f`)
    runReg(`reg add "${REG_KEYS.folderShell}\\command" /ve /d "${cmdFolder}" /f`)

    // Register for Directory\Background (right-clicking inside a folder)
    runReg(`reg add "${REG_KEYS.folderBgShell}" /ve /d "${MENU_LABEL}" /f`)
    runReg(`reg add "${REG_KEYS.folderBgShell}" /v "Icon" /d "${docsifyBin}" /f`)
    runReg(`reg add "${REG_KEYS.folderBgShell}\\command" /ve /d "${cmdBg}" /f`)

    return {success: true, docsifyBin}
  } catch (err) {
    return {success: false, message: err.message}
  }
}

/**
 * Unregister the Windows context menu entries
 * @returns {{ success: boolean, message?: string }}
 */
function unregister() {
  if (process.platform !== 'win32') {
    return {success: false, message: 'Windows only'}
  }

  try {
    runReg(`reg delete "${REG_KEYS.folderShell}" /f`)
    runReg(`reg delete "${REG_KEYS.folderBgShell}" /f`)
    return {success: true}
  } catch (err) {
    return {success: false, message: err.message}
  }
}

/**
 * Check if the context menu is registered
 * @returns {boolean}
 */
function isRegistered() {
  if (process.platform !== 'win32') {
    return false
  }

  try {
    execSync(`reg query "${REG_KEYS.folderShell}"`, {stdio: 'ignore'})
    return true
  } catch (_) {
    return false
  }
}

module.exports = {
  register,
  unregister,
  isRegistered,
  MENU_LABEL
}
