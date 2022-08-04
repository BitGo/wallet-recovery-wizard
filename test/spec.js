const Application = require('spectron').Application
const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const nonbitgo = require('./non-bitgo-tests/nonbitgo')
const macros = require('./macros.js')
const expect = require('chai').expect
const _ = require('lodash')

// TODO(louis): needs clean up, test token
const testDir = macros.testDir
const accessToken = 'TBD'

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
    macros.removeTestFiles()
    return this.app.start()
  })

  describe('Non-BitGo Recoveries: ', function () {
    afterEach(function () {
      macros.removeTestFiles()
    })

    describe('#recoverBTC()', function () {
      before(async function () {await nonbitgo.recoverBTC(this)})
      it('created a json file', macros.isOneFile)
    })

    describe('#recoverETH()', function () {
      before(async function () {await nonbitgo.recoverETH(this)})
      it('created a json file', macros.isOneFile)
    })
  })

  describe('Build Unsigned Sweep: ', async function () {
    before(async function () {
      this.timeout(50000)

      const userKey = 'xpub661MyMwAqRbcGxnf2qJ6c6Ysn3gAFneJXHGthX6CRyNFducXyts2BrhdWta6uNDK8ZcbaPGgMvQBK8VAWZbdZCvY4HSrhzczVQFiU3ZyZSy'
      const backupKey = 'xpub69gYCpeZvK7no3tFLCjm7P447ikmr2CtR3qAUC3KpPPgUqrWSyzZY5FEYPj4Sm8SCotvcjLmjjQX5baBSuvmSr4xNqFJCTeMuQyb5ak1Mvp'
      const bitgoKey = 'xpub661MyMwAqRbcF5v5xYL33eMJMkaDST8jw5japGeLPjDvmAfabUK2nfBkHXB9hQ2UbWTYDhgqXqvJbFkcbqdqDmbAWqX8ja3S12beeDZZ3JX'
      const recoveryDestination = '2N7LFAeS8mHN2igHZtgDhQbHEngBnf5TwjD'

      await macros.waitForWindow(this)
      await macros.selectBuildUnsignedSweep(this)

      await macros.selectCurrency(this, 'tbtc')
      await macros.setInputValueWithDataTestId(this, 'userKey', userKey)
      await macros.setInputValueWithDataTestId(this, 'backupKey', backupKey)
      await macros.setInputValueWithDataTestId(this, 'bitgoKey', bitgoKey)
      await macros.setInputValueWithDataTestId(this, 'recoveryDestination', recoveryDestination)

      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles()
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  describe('Wrong Chain Recoveries: ', function () {
    before(async function () {
      this.timeout(30000)

      const walletID = '62970fc56a974600081e2ad0ee9ec98a'
      const transactionIDs = ['f2e641ccb6a3c280f6104774c763a43196cbd1a1fb07b770e174da154e60fd8f', 'ba9fd17cf6cb7782d3298b91d6c6e72141ab86c25e4e45d96ef10862365b21fe']
      const destinationAddress = '2NEWFNQ9JoRuxJoTgm2FsYaACJ65cQRuMFK'

      await macros.waitForWindow(this)

      await macros.clickLogInButton(this)
      await macros.selectAccessToken(this)
      await macros.enterAccessToken(this, accessToken)
      await macros.clickFooterContinueButton(this)

      // Enter form details
      await macros.selectWrongChainRecoveries(this)
      await macros.selectSourceCurrency(this, 'tbtc')
      await macros.selectDestinationCurrency(this, 'tltc')
      await macros.setInputValueWithDataTestId(this, 'wallet-id', walletID)
      await macros.addTransactionIDInput(this)
      await macros.inputTransactionIDs(this, transactionIDs)
      await macros.setInputValueWithDataTestId(this, 'destination-address', destinationAddress)
      await macros.clickFooterContinueButton(this)

      // Confirm details and download transaction
      await macros.hasConfirmationValues(this)
      await macros.clickFooterContinueButton(this)

      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles()
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  // TODO(louis): need values for success
  describe('Unsupported Tokens Recoveries: ', async function () {
    it('show success', async function () {
      this.timeout(30000)

      const walletID = '62907f8a7f284900073b2cef0303dede'
      const contractAddress = '0xBA62BCfcAaFc6622853cca2BE6Ac7d845BC0f2Dc'
      const destinationAddress = '0x523094e813d1c6821a15aa2bd9536c32627d80f3'

      await macros.waitForWindow(this)

      await macros.clickLogInButton(this)
      await macros.selectAccessToken(this)
      await macros.enterAccessToken(this, accessToken)
      await macros.clickFooterContinueButton(this)

      await macros.selectUnsupportedTokensRecoveries(this)
      await macros.setInputValueWithDataTestId(this, 'walletId', walletID)
      await macros.setInputValueWithDataTestId(this, 'tokenAddress', contractAddress)
      await macros.setInputValueWithDataTestId(this, 'recoveryAddress', destinationAddress)
      await macros.clickRadioButton(this, 'passphrase')
      await macros.setInputValueWithDataTestId(this, 'passphrase', walletPassword)
      await macros.setInputValueWithDataTestId(this, 'twofa', '000000')

      await macros.clickFooterContinueButton(this)
      // TODO(louis): need values for success
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })
  })

  // TODO(louis): values don't work
  describe('Migrated Legacy Wallet Recoveries: ', async function () {
    before(async function () {
      this.timeout(30000)

      const walletID = '6290709d7f28490007334ba3fcc1f978'
      const recoveryAddress = '2MtSR6vXTa65ax8T5X7G4NAQEf67NyXygxe'

      await macros.waitForWindow(this)

      await macros.clickLogInButton(this)
      await macros.selectAccessToken(this)
      await macros.enterAccessToken(this, accessToken)
      await macros.clickFooterContinueButton(this)

      await macros.selectMigratedLegacyWalletRecoveries(this)
      await macros.selectCurrency(this, 'tbch')
      await macros.setInputValueWithDataTestId(this, 'walletId', walletID)
      await macros.setInputValueWithDataTestId(this, 'recoveryAddress', recoveryAddress)
      await macros.setInputValueWithDataTestId(this, 'passphrase', walletPassword)
      await macros.setInputValueWithDataTestId(this, 'twofa', '000000')

      await macros.clickFooterContinueButton(this)
      await macros.clickBackToHomeLink(this)
      await macros.sleep(500)
    })

    after(function () {
      macros.removeTestFiles()
    })

    it('should have created a json file', function () {
      const numFiles = 1
      const files = macros.getFiles(macros._jsonFilter, testDir)
      return files.length.should.equal(numFiles)
    })
  })

  after(function () {
    if (this.app && this.app.isRunning()) {
      macros.removeTestFiles()
      return this.app.stop()
    }
  })
})
