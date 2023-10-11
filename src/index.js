const path = require('path')
const os = require('os')
const fs = require('fs')
const execFileSync = require('child_process').execFileSync

function isPackaged() {
  if (!process.pkg) return false
  return 'entrypoint' in process.pkg && /^C:[\\\/]snapshot/.test(process.pkg.entrypoint)
}

function isWin() {
  return process.platform === 'win32'
}

function getBinPath() {
  let bin
  // Source: https://github.com/MarkTiedemann/fastlist
  switch (process.arch) {
    case 'x64':
      bin = 'fastlist-0.3.0-x64.exe'
      break
    case 'ia32':
      bin = 'fastlist-0.3.0-x86.exe'
      break
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`)
  }
  let binPath = path.join(__dirname, 'vendor', bin)
  if (isPackaged()) {
    const target = path.resolve(os.tmpdir(), path.basename(binPath))
    if (!fs.existsSync(target)) fs.copyFileSync(binPath, target)
    binPath = target
  }
  return binPath
}

function ps() {
  if (!isWin()) throw new Error('Unsupported platform')
  const binPath = getBinPath()
  const stdout = execFileSync(binPath, {windowsHide: true})
  return stdout
    .toString()
    .trim()
    .split('\r\n')
    .map((line) => line.split('\t'))
    .map(([pid, ppid, name]) => ({
      pid: Number.parseInt(pid, 10),
      ppid: Number.parseInt(ppid, 10),
      name,
    }))
}

exports.ps = ps
module.exports = {ps}
