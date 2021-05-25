'use strict'

const { blue, green, red, yellow } = require('colorette')

/**
 * Detects whether the terminal supports Unicode.
 *
 * Author: Sindre Sorhus
 * Source: https://github.com/sindresorhus/is-unicode-supported/blob/v1.0.0/index.js
 *
 * @returns {boolean} `true` if the current terminal supports Unicode, `false` otherwise
 */
const isUnicodeSupported = () => {
  if (process.platform !== 'win32') {
    return true
  }

  return (
    Boolean(process.env.CI) ||
    Boolean(process.env.WT_SESSION) || // Windows Terminal
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.TERM === 'xterm-256color' ||
    process.env.TERM === 'alacritty'
  )
}

/*
 * Symbols for log output
 * Author: Sindre Sorhus
 * Source: https://github.com/sindresorhus/log-symbols/blob/v5.0.0/index.js
 */

const unicodeLogSymbols = {
  info: blue('ℹ'),
  success: green('✔'),
  warning: yellow('⚠'),
  error: red('✖'),
}

const asciiLogSymbols = {
  info: blue('i'),
  success: green('√'),
  warning: yellow('‼'),
  error: red('×'),
}

module.exports = isUnicodeSupported() ? unicodeLogSymbols : asciiLogSymbols
