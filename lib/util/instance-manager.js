'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')

const DOCSIFY_DIR = path.join(os.homedir(), '.docsify')
const INSTANCES_FILE = path.join(DOCSIFY_DIR, 'instances.json')

/**
 * Ensure the ~/.docsify directory exists
 */
function ensureDir() {
  if (!fs.existsSync(DOCSIFY_DIR)) {
    fs.mkdirSync(DOCSIFY_DIR, {recursive: true})
  }
}

/**
 * Read instances from state file
 * @returns {Object} instances map { pid: { pid, rootPath, port, startTime } }
 */
function readInstances() {
  ensureDir()
  if (!fs.existsSync(INSTANCES_FILE)) {
    return {}
  }

  try {
    const content = fs.readFileSync(INSTANCES_FILE, 'utf-8')
    return JSON.parse(content) || {}
  } catch (_) {
    return {}
  }
}

/**
 * Write instances to state file
 * @param {Object} instances
 */
function writeInstances(instances) {
  ensureDir()
  fs.writeFileSync(INSTANCES_FILE, JSON.stringify(instances, null, 2), 'utf-8')
}

/**
 * Check if a process is still running
 * @param {number} pid
 * @returns {boolean}
 */
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Remove dead (exited) instances from the state file
 * @returns {Object} cleaned instances
 */
function cleanDeadInstances() {
  const instances = readInstances()
  const alive = {}

  for (const [pid, info] of Object.entries(instances)) {
    if (isProcessAlive(Number(pid))) {
      alive[pid] = info
    }
  }

  writeInstances(alive)
  return alive
}

/**
 * Register a running instance
 * @param {number} pid - Process ID
 * @param {string} rootPath - Document root path
 * @param {number} port - Server port
 * @param {string} host - Server host
 */
function registerInstance(pid, rootPath, port, host) {
  const instances = cleanDeadInstances()
  instances[pid] = {
    pid,
    rootPath,
    port,
    host: host || 'localhost',
    url: `http://${host || 'localhost'}:${port}`,
    startTime: new Date().toISOString()
  }
  writeInstances(instances)
}

/**
 * Unregister an instance by PID
 * @param {number} pid
 */
function unregisterInstance(pid) {
  const instances = readInstances()
  delete instances[pid]
  writeInstances(instances)
}

/**
 * Get all running instances (cleaned up)
 * @returns {Array} array of instance info objects
 */
function getInstances() {
  const instances = cleanDeadInstances()
  return Object.values(instances)
}

/**
 * Stop all running instances
 * @returns {number} number of instances stopped
 */
function stopAllInstances() {
  const instances = readInstances()
  let stopped = 0

  for (const [pid] of Object.entries(instances)) {
    const numPid = Number(pid)
    if (isProcessAlive(numPid)) {
      try {
        process.kill(numPid, 'SIGTERM')
        stopped++
      } catch (_) {
        // Ignore if process already exited
      }
    }
  }

  writeInstances({})
  return stopped
}

/**
 * Stop a single instance by PID
 * @param {number} pid
 * @returns {boolean} true if stopped
 */
function stopInstance(pid) {
  const numPid = Number(pid)
  if (isProcessAlive(numPid)) {
    try {
      process.kill(numPid, 'SIGTERM')
      unregisterInstance(pid)
      return true
    } catch (_) {
      return false
    }
  }

  unregisterInstance(pid)
  return false
}

module.exports = {
  registerInstance,
  unregisterInstance,
  getInstances,
  stopAllInstances,
  stopInstance,
  cleanDeadInstances,
  INSTANCES_FILE,
  DOCSIFY_DIR
}
