#!/usr/bin/env node
if (process.platform === 'win32') {
  try {
    // Keep Node's UTF-8 output readable in cmd.exe and legacy PowerShell.
    require('child_process').execFileSync('chcp.com', ['65001'], {
      stdio: 'ignore',
    })
  } catch (_) {
    // A detached process may not have a console, so startup should continue.
  }
}

const fs = require('fs')
const path = require('path')
const tmpPath = require('os').tmpdir()

async function start() {
  // 检测是否存在 anonymous_token 文件,没有则生成
  if (!fs.existsSync(path.resolve(tmpPath, 'anonymous_token'))) {
    fs.writeFileSync(path.resolve(tmpPath, 'anonymous_token'), '', 'utf-8')
  }
  // 启动时更新anonymous_token
  const generateConfig = require('./generateConfig')
  await generateConfig()
  require('./server').serveNcmApi({
    checkVersion: true,
  })
}
start()
