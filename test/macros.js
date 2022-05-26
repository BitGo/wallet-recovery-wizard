const fs = require('fs')
const path = require('path')
const sjson = require('secure-json-parse')

const macros = {}

macros.setSpectronEnv = function () {
  // env variable used in  electronUtility.js
  const spectronSaveDir = __dirname + '/'
  process.env.SPECTRON_IS_RUNNING = true
  process.env.SPECTRON_SAVE_DIR = spectronSaveDir
}

macros.sleep = async function (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

macros.waitForWindow = async function (context) {
  // // Wait for our loading window to go away. This means the window count = 1.
  let windowCount = await context.app.client.getWindowCount()
  while (windowCount > 1) {
    windowCount = await context.app.client.getWindowCount()
    await macros.sleep(1000)
  }
  // wait for this window to load after the loading screen
  await context.app.client.windowByIndex(0)

  // wait until home page is visible
  await context.app.client.$(`[data-testid=home-page]`)
  return
}

// General helpers

macros.clickElementWithDataTestId = async function (context, dataTestId) {
  const element = await context.app.client.$(`[data-testid=${dataTestId}]`)
  await element.click()
  await macros.sleep(100)
}

macros.clickCheckboxWithDataTestId = async function (context, dataTestId) {
  const element = await context.app.client.$(`[data-testid=${dataTestId}]`)
  // this is hacky because of a couple of issue
  // 1. clicking on checkbox result in this error:
  //    element click intercepted: Element
  //    <input data-testid="download-private-key-qr-code-checkbox" name="download" type="checkbox">
  //    is not clickable at point (284, 596). Other element would receive the click:
  //    <span class="bp3-control-indicator"></span>
  const label = await element.parentElement()
  await label.click()
  await macros.sleep(100)
}

macros.clickRadioButton = async function (context, value) {
  const element = await context.app.client.$(`input[type='radio'][value='${value}']`)
  // this is hacky because of a couple of issue
  // 1. cannot set data-testid on blueprint radio
  // 2. clicking on radio button result in this error:
  //    element click intercepted: element click intercepted: Element
  //    <input name="keyType" type="radio" value="single"> is not clickable
  //    at point (375, 382). Other element would receive the click:
  //    <span class="bp3-control-indicator"></span>
  const label = await element.parentElement()
  await label.click()
  await macros.sleep(100)
}

macros.setInputValueWithDataTestId = async function (context, dataTestId, value) {
  const element = await context.app.client.$(`[data-testid=${dataTestId}]`)
  await element.setValue(value)
  await macros.sleep(100)
}

macros.setSelectValueWithDataTestId = async function (context, dataTestId, value) {
  const element = await context.app.client.$(`[data-testid=${dataTestId}]`)
  await element.selectByAttribute('value', value)
  await macros.sleep(100)
}

macros.hasValidationBanner = async function (context) {
  // const element = await context.app.client.$(`.l-validationBanner`)
  await context.app.client.$(`[data-testid=validationBanner]`)
  await macros.sleep(100)
}

macros.selectCurrency = async function (context, currency) {
  await macros.clickElementWithDataTestId(context, 'currency-select')
  await macros.clickElementWithDataTestId(context, `currency-select--${currency.toLowerCase()}-item`)
}

macros.clickFooterContinueButton = async function (context) {
  await macros.clickElementWithDataTestId(context, 'footer-submit-button')
}
macros.clickFooterCancelButton = async function (context) {
  await macros.clickElementWithDataTestId(context, 'footer-cancel-button')
}

macros.clickBackToHomeLink = async function (context) {
  await macros.clickElementWithDataTestId(context, 'back-to-home-link')
}

macros.clickCloseButton = async function (context) {
  await macros.clickElementWithDataTestId(context, 'close')
}

macros.clickLogInButton = async function (context) {
  await macros.clickElementWithDataTestId(context, 'log-in')
}

macros.selectAccessToken = async function (context) {
  await macros.clickElementWithDataTestId(context, 'access-token')
}

macros.enterAccessToken = async function (context, accessToken) {
  await macros.setInputValueWithDataTestId(context, 'access-token-input', accessToken)
}

macros.hasLoggedInBanner = async function (context) {
  const element = await context.app.client.$(`.logged-in-banner`)
  await macros.sleep(100)
}

macros.clickLogOutButton = async function (context) {
  await macros.clickElementWithDataTestId(context, 'log-out')
}

// Home page helpers

macros.selectNonBitGoRecoveries = async function (context) {
  await macros.clickElementWithDataTestId(context, 'non-bitgo-recoveries')
}

macros.selectBuildUnsignedSweep = async function (context) {
  await macros.clickElementWithDataTestId(context, 'build-unsigned-sweep')
}

macros.selectWrongChainRecoveries = async function (context) {
  await macros.clickElementWithDataTestId(context, 'wrong-chain-recoveries')
}

macros.selectUnsupportedTokensRecoveries = async function (context) {
  await macros.clickElementWithDataTestId(context, 'unsupported-tokens-recoveries')
}

macros.selectMigratedLegacyWalletRecoveries = async function (context) {
  await macros.clickElementWithDataTestId(context, 'migrated-legacy-wallet-recoveries')
}

// Wrong Chain Recoveries Form

macros.selectSourceCurrency = async function (context, currency) {
  await macros.clickElementWithDataTestId(context, 'source-currency')
  await macros.clickElementWithDataTestId(context, `source-currency--${currency.toLowerCase()}-item`)
}

macros.selectDestinationCurrency = async function (context, currency) {
  await macros.clickElementWithDataTestId(context, 'destination-currency')
  await macros.clickElementWithDataTestId(context, `destination-currency--${currency.toLowerCase()}-item`)
}

macros.addTransactionIDInput = async function (context) {
  await macros.clickElementWithDataTestId(context, 'add-transaction-id')
  await macros.sleep(100)
}

macros.inputTransactionIDs = async function (context, transactionIDs = []) {
  for (let i = 0; i < transactionIDs.length; i++) {
    await macros.setInputValueWithDataTestId(context, `transaction-id-${i}`, transactionIDs[i])
  }
  await macros.sleep(100)
}

macros.hasConfirmationValues = async function (context) {
  const element = await context.app.client.$(`.confirmation-values`)
  await macros.sleep(100)
}

// Files related helpers

macros.getDirContents = function (dirName) {
  return fs.readdirSync(dirName)
}

macros._pdfFilter = function (fileName) {
  return fileName.includes('.pdf')
}

macros._jpgFilter = function (fileName) {
  return fileName.includes('.jpg')
}

macros._maskedPdfFilter = function (fileName) {
  return fileName.includes('.notPdf')
}

macros._jsonFilter = function (fileName) {
  return fileName.includes('.json')
}

macros._halfSignedTxFilter = function (fileName) {
  return fileName.includes('Half-signed')
}

macros._testFilter = function (fileName) {
  return (
    macros._pdfFilter(fileName) ||
    macros._jpgFilter(fileName) ||
    macros._jsonFilter(fileName) ||
    macros._halfSignedTxFilter(fileName)
  )
}

macros.getFiles = function (callback, directory) {
  dirContents = macros.getDirContents(directory)
  files = dirContents.filter(callback)
  return files.map((file) => path.join(directory, file))
}

macros.removeTestFiles = function (testDir) {
  const files = macros.getFiles(macros._testFilter, testDir)
  for (let i = 0; i < files.length; i++) {
    fs.unlinkSync(files[i])
  }
}

macros.readJSONFile = function (fileName) {
  const fileString = fs.readFileSync(fileName)
  return sjson.parse(fileString)
}

macros.uploadFile = async function (context, fileName) {
  const content = await macros.readJSONFile(fileName)
  const spectronFile = JSON.stringify({
    name: path.basename(fileName),
    type: 'application/json',
    content: JSON.stringify(content),
  })
  context.app.client.execute(function (file) {
    window.SPECTRON_FILE = file
  }, spectronFile)
}

module.exports = macros
