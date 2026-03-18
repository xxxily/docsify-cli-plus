'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')
const {execSync} = require('child_process')

const SERVICE_NAME = '📚 Docsify Start Server'
const SERVICES_DIR = path.join(os.homedir(), 'Library', 'Services')
const WORKFLOW_DIR = path.join(SERVICES_DIR, SERVICE_NAME + '.workflow')
const CONTENTS_DIR = path.join(WORKFLOW_DIR, 'Contents')
const INFO_PLIST = path.join(CONTENTS_DIR, 'Info.plist')
const DOCUMENT_WFLOW = path.join(CONTENTS_DIR, 'document.wflow')

/**
 * Find the absolute path to the docsify binary
 */
function getDocsifyBinPath() {
  try {
    // Try to find the actual binary path
    const binPath = execSync('which docsify', {encoding: 'utf-8'}).trim()
    if (binPath) {
      return binPath
    }
  } catch (_) {}

  // Fall back to the local bin
  return path.join(__dirname, '..', '..', 'bin', 'docsify')
}

/**
 * Build the Info.plist content for the Quick Action
 */
function buildInfoPlist() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>${SERVICE_NAME}</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSRequiredContext</key>
			<dict>
				<key>NSApplicationIdentifier</key>
				<string>com.apple.finder</string>
			</dict>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.folder</string>
			</array>
			<key>NSReturnTypes</key>
			<array/>
		</dict>
	</array>
</dict>
</plist>
`
}

/**
 * Build the document.wflow content
 * @param {string} docsifyBin - Path to docsify binary
 */
function buildDocumentWflow(docsifyBin) {
  // Escape for use in shell script
  const escapedBin = docsifyBin.replace(/'/g, '\'\\\'\'')

  const shellScript = `#!/bin/bash
for f in "$@"; do
  if [ -d "$f" ]; then
    DIR="$f"
  else
    DIR=$(dirname "$f")
  fi
  osascript \\
    -e 'tell application "Terminal"' \\
    -e 'activate' \\
    -e "do script \\"cd '$DIR' && '${escapedBin}' start --open\\"" \\
    -e 'end tell'
done
`

  const escapedScript = escapeXml(shellScript)

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>AMApplicationBuild</key>
	<string>521.1</string>
	<key>AMApplicationVersion</key>
	<string>2.10</string>
	<key>AMDocumentVersion</key>
	<string>2</string>
	<key>actions</key>
	<array>
		<dict>
			<key>action</key>
			<dict>
				<key>AMAccepts</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Optional</key>
					<true/>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>AMActionVersion</key>
				<string>2.0.3</string>
				<key>AMApplication</key>
				<array>
					<string>Automator</string>
				</array>
				<key>AMParameterProperties</key>
				<dict>
					<key>COMMAND_STRING</key>
					<dict/>
					<key>CheckedForUserDefaultShell</key>
					<dict/>
					<key>inputMethod</key>
					<dict/>
					<key>shell</key>
					<dict/>
					<key>source</key>
					<dict/>
				</dict>
				<key>AMProvides</key>
				<dict>
					<key>Container</key>
					<string>List</string>
					<key>Types</key>
					<array>
						<string>com.apple.cocoa.path</string>
					</array>
				</dict>
				<key>ActionBundlePath</key>
				<string>/System/Library/Automator/Run Shell Script.action</string>
				<key>ActionName</key>
				<string>Run Shell Script</string>
				<key>ActionParameters</key>
				<dict>
					<key>COMMAND_STRING</key>
					<string>${escapedScript}</string>
					<key>CheckedForUserDefaultShell</key>
					<true/>
					<key>inputMethod</key>
					<integer>1</integer>
					<key>shell</key>
					<string>/bin/bash</string>
					<key>source</key>
					<string></string>
				</dict>
				<key>BundleIdentifier</key>
				<string>com.apple.RunShellScript</string>
				<key>CFBundleVersion</key>
				<string>2.0.3</string>
				<key>CanShowSelectedItemsWhenRun</key>
				<false/>
				<key>CanShowWhenRun</key>
				<true/>
				<key>Category</key>
				<array>
					<string>AMCategoryUtilities</string>
				</array>
				<key>Class Name</key>
				<string>RunShellScriptAction</string>
				<key>InputUUID</key>
				<string>2B3B87FD-CD4D-4C88-B6AF-BD93B60E8A82</string>
				<key>Keywords</key>
				<array>
					<string>Shell</string>
					<string>Script</string>
					<string>Command</string>
					<string>Run</string>
					<string>Unix</string>
				</array>
				<key>OutputUUID</key>
				<string>0D56E0DF-5A90-4D3B-B0A1-7E62BC41B0C9</string>
				<key>UUID</key>
				<string>4EC09A64-4EFB-4A31-B9A1-F94A0AB0F462</string>
				<key>UnlockPassword</key>
				<string></string>
				<key>arguments</key>
				<dict/>
				<key>isViewVisible</key>
				<integer>1</integer>
				<key>location</key>
				<string>309.000000:316.000000</string>
				<key>nibPath</key>
				<string>/System/Library/Automator/Run Shell Script.action/Contents/Resources/English.lproj/main.nib</string>
			</dict>
			<key>isViewVisible</key>
			<integer>1</integer>
		</dict>
	</array>
	<key>connectors</key>
	<dict/>
	<key>workflowMetaData</key>
	<dict>
		<key>applicationBundleIDsByPath</key>
		<dict/>
		<key>applicationPaths</key>
		<array/>
		<key>inputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject</string>
		<key>outputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>presentationMode</key>
		<integer>11</integer>
		<key>processesInput</key>
		<integer>0</integer>
		<key>serviceInputTypeIdentifier</key>
		<string>com.apple.Automator.fileSystemObject.folder</string>
		<key>serviceOutputTypeIdentifier</key>
		<string>com.apple.Automator.nothing</string>
		<key>serviceProcessesInput</key>
		<integer>0</integer>
		<key>systemImageName</key>
		<string>NSActionTemplate</string>
		<key>useAutomaticInputType</key>
		<integer>0</integer>
		<key>workflowTypeIdentifier</key>
		<string>com.apple.Automator.servicesMenu</string>
	</dict>
</dict>
</plist>
`
}

/**
 * Escape special XML characters in a string
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Register the macOS Quick Action (Finder context menu)
 * @returns {{ success: boolean, message: string }}
 */
function register() {
  if (process.platform !== 'darwin') {
    return {success: false, message: 'macOS only'}
  }

  try {
    // Create directory structure
    fs.mkdirSync(CONTENTS_DIR, {recursive: true})

    const docsifyBin = getDocsifyBinPath()

    // Write Info.plist
    fs.writeFileSync(INFO_PLIST, buildInfoPlist(), 'utf-8')

    // Write document.wflow
    fs.writeFileSync(DOCUMENT_WFLOW, buildDocumentWflow(docsifyBin), 'utf-8')

    // Flush the services cache so it picks up the new workflow
    try {
      execSync('/System/Library/CoreServices/pbs -flush', {stdio: 'ignore'})
    } catch (_) {}

    // Restart cfprefsd to help refresh
    try {
      execSync('killall -u $USER cfprefsd 2>/dev/null || true', {shell: true, stdio: 'ignore'})
    } catch (_) {}

    return {
      success: true,
      workflowPath: WORKFLOW_DIR,
      docsifyBin
    }
  } catch (err) {
    return {success: false, message: err.message}
  }
}

/**
 * Unregister the macOS Quick Action
 * @returns {{ success: boolean, message: string }}
 */
function unregister() {
  if (process.platform !== 'darwin') {
    return {success: false, message: 'macOS only'}
  }

  if (!fs.existsSync(WORKFLOW_DIR)) {
    return {success: false, message: 'Not registered'}
  }

  try {
    fs.rmSync(WORKFLOW_DIR, {recursive: true, force: true})

    // Flush the services cache
    try {
      execSync('/System/Library/CoreServices/pbs -flush', {stdio: 'ignore'})
    } catch (_) {}

    return {success: true}
  } catch (err) {
    return {success: false, message: err.message}
  }
}

/**
 * Check if the Quick Action is registered
 * @returns {boolean}
 */
function isRegistered() {
  return fs.existsSync(WORKFLOW_DIR)
}

module.exports = {
  register,
  unregister,
  isRegistered,
  WORKFLOW_DIR,
  SERVICE_NAME
}
