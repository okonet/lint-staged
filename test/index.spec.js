import { cosmiconfig } from 'cosmiconfig'
import makeConsoleMock from 'consolemock'
import path from 'path'

jest.mock('execa')

// eslint-disable-next-line import/first
// eslint-disable-next-line import/first
import lintStaged from '../lib/index'
import { replaceSerializer } from './utils/replaceSerializer'

const mockCosmiconfigWith = (result) => {
  cosmiconfig.mockImplementationOnce(() => ({
    search: () => Promise.resolve(result),
  }))
}
jest.mock('../lib/gitWorkflow.js')

async function withMockedConsole(mockConsole, fn) {
  const previousConsole = console
  try {
    console = mockConsole
    await fn()
  } finally {
    console = previousConsole
  }
}

// TODO: Never run tests in the project's WC because this might change source files git status

describe('lintStaged', () => {
  const logger = makeConsoleMock()

  beforeEach(() => {
    logger.clearHistory()
  })

  it('should use cosmiconfig if no params are passed', async () => {
    expect.assertions(1)
    const config = {
      '*': 'mytask',
    }
    mockCosmiconfigWith({ config })
    await lintStaged(undefined, logger)
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should return true when passed', async () => {
    expect.assertions(1)
    const config = {
      '*': 'node -e "process.exit(0)"',
    }

    const passed = await lintStaged({ config, quiet: true }, logger)
    expect(passed).toEqual(true)
  })

  it('should use use the console if no logger is passed', async () => {
    expect.assertions(1)
    mockCosmiconfigWith({ config: {} })

    const mockedConsole = makeConsoleMock()
    try {
      await withMockedConsole(mockedConsole, () => lintStaged())
    } catch (ignore) {
      expect(mockedConsole.printHistory()).toMatchSnapshot()
    }
  })

  it('should output config in debug mode', async () => {
    expect.assertions(1)
    const config = {
      '*': 'mytask',
    }
    mockCosmiconfigWith({ config })
    await lintStaged({ debug: true, quiet: true }, logger)
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should not output config in normal mode', async () => {
    expect.assertions(1)
    const config = {
      '*': 'mytask',
    }
    mockCosmiconfigWith({ config })
    await lintStaged({ quiet: true }, logger)
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should throw when invalid config is provided', async () => {
    const config = {}
    mockCosmiconfigWith({ config })
    await expect(lintStaged({ quiet: true }, logger)).rejects.toMatchInlineSnapshot(
      `[Error: Configuration should not be empty!]`
    )
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should load config file when specified', async () => {
    expect.assertions(1)
    await lintStaged(
      {
        configPath: path.join(__dirname, '__mocks__', 'my-config.json'),
        debug: true,
        quiet: true,
      },
      logger
    )
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should parse function linter from js config', async () => {
    expect.assertions(1)
    await lintStaged(
      {
        configPath: path.join(__dirname, '__mocks__', 'advanced-config.js'),
        debug: true,
        quiet: true,
      },
      logger
    )
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should use config object', async () => {
    const config = {
      '*': 'node -e "process.exit(1)"',
    }
    expect.assertions(1)
    await lintStaged({ config, quiet: true }, logger)
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should load an npm config package when specified', async () => {
    expect.assertions(1)
    jest.mock('my-lint-staged-config')
    await lintStaged({ configPath: 'my-lint-staged-config', quiet: true, debug: true }, logger)
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should print helpful error message when config file is not found', async () => {
    expect.assertions(2)
    mockCosmiconfigWith(null)
    await expect(lintStaged({ quiet: true }, logger)).rejects.toMatchInlineSnapshot(
      `[Error: Config could not be found]`
    )
    expect(logger.printHistory()).toMatchSnapshot()
  })

  it('should print helpful error message when explicit config file is not found', async () => {
    expect.assertions(2)
    const nonExistentConfig = 'fake-config-file.yml'

    // Serialize Windows, Linux and MacOS paths consistently
    expect.addSnapshotSerializer(
      replaceSerializer(
        /Error: ENOENT: no such file or directory, open '([^']+)'/,
        `Error: ENOENT: no such file or directory, open '${nonExistentConfig}'`
      )
    )

    await expect(
      lintStaged({ configPath: nonExistentConfig, quiet: true }, logger)
    ).rejects.toThrowError()

    expect(logger.printHistory()).toMatchSnapshot()
  })
})
