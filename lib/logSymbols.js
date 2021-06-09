'use strict'

const { blue, green, red, yellow } = require('colorette')
const { cross, warning, tick } = require('listr2').figures

module.exports = {
  info: blue('i'),
  success: green(tick),
  warning: yellow(warning),
  error: red(cross),
}
