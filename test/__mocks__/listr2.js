const listr2 = jest.genMockFromModule('listr2')

listr2.figures = {
  cross: '×',
  tick: '√',
  warning: '‼',
}

module.exports = listr2
