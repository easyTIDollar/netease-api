// ANSI 颜色代码
const supportsColor =
  !process.env.NO_COLOR && (process.stdout.isTTY || process.stderr.isTTY)
const color = (code) => (supportsColor ? code : '')

const colors = {
  reset: color('\x1b[0m'),
  bright: color('\x1b[1m'),
  dim: color('\x1b[2m'),
  black: color('\x1b[30m'),
  red: color('\x1b[31m'),
  green: color('\x1b[32m'),
  yellow: color('\x1b[33m'),
  blue: color('\x1b[34m'),
  magenta: color('\x1b[35m'),
  cyan: color('\x1b[36m'),
  white: color('\x1b[37m'),
  bgRed: color('\x1b[41m'),
  bgGreen: color('\x1b[42m'),
  bgYellow: color('\x1b[43m'),
}

const logger = {
  debug: (msg, ...args) =>
    console.info(`${colors.cyan}[DEBUG]${colors.reset}`, msg, ...args),
  info: (msg, ...args) =>
    console.info(`${colors.green}[INFO]${colors.reset}`, msg, ...args),
  warn: (msg, ...args) =>
    console.info(`${colors.yellow}[WARN]${colors.reset}`, msg, ...args),
  error: (msg, ...args) =>
    console.error(`${colors.red}[ERROR]${colors.reset}`, msg, ...args),
  success: (msg, ...args) =>
    console.log(
      `${colors.bright}${colors.green}[SUCCESS]${colors.reset}`,
      msg,
      ...args,
    ),
  critical: (msg, ...args) =>
    console.error(
      `${colors.bright}${colors.bgRed}[CRITICAL]${colors.reset}`,
      msg,
      ...args,
    ),
}

module.exports = logger
