const Application = require('spectron').Application
const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const macros = require('./macros.js')
const testDir = 'test/'
const expect = require('chai').expect
const _ = require('lodash')

chai.should()
chai.use(chaiAsPromised)
macros.setSpectronEnv()

describe('Application launch', function () {
  this.timeout(10000)

  before(function () {
    this.app = new Application({
      path: path.join(
        __dirname,
        '../out/bitgo-wallet-recovery-wizard-darwin-x64/bitgo-wallet-recovery-wizard.app/Contents/MacOS/bitgo-wallet-recovery-wizard',
      ),
      // path: electronPath,
      // args: [
      //   path.join(__dirname, '..'),
      // ],
      waitTimeout: 30000,
      startTimeout: 20000,
      // chromeDriverLogPath: 'test/chromedriverlog.txt',
    })
    // remove test files in case previous run did not teardown cleanly
    macros.removeTestFiles(testDir)
    return this.app.start()
  })

  describe('Non-BitGo Recoveries: ', async function () {
    before(async function () {
      this.timeout(30000)

      await macros.waitForWindow(this)
      await macros.selectNonBitGoRecoveries(this)
      // TODO fill out
      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles(testDir)
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  describe('Build Unsigned Sweep: ', async function () {
    before(async function () {
      this.timeout(30000)

      await macros.waitForWindow(this)
      await macros.selectBuildUnsignedSweep(this)
      // TODO fill out
      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles(testDir)
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  describe('Wrong Chain Recoveries: ', async function () {
    before(async function () {
      this.timeout(30000)

      await macros.waitForWindow(this)
      await macros.selectWrongChainRecoveries(this)
      // TODO fill out
      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles(testDir)
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  describe('Unsupported Tokens Recoveries: ', async function () {
    before(async function () {
      this.timeout(30000)

      await macros.waitForWindow(this)
      await macros.selectUnsupportedTokensRecoveries(this)
      // TODO fill out
      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles(testDir)
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  describe('Migrated Legacy Wallet Recoveries: ', async function () {
    before(async function () {
      this.timeout(30000)

      await macros.waitForWindow(this)
      await macros.selectMigratedLegacyWalletRecoveries(this)
      // TODO fill out
      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles(testDir)
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
      macros.removeTestFiles(testDir)
      return this.app.stop()
    }
  })
})
