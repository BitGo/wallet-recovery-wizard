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
  const element = await context.app.client.$(`.l-validationBanner`)
  await macros.sleep(100)
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

// Generate key flow helpers

macros.selectCurrencyAndCurve = async function (context, currency) {
  await macros.clickElementWithDataTestId(context, 'currency-and-curve-select')
  await macros.clickElementWithDataTestId(context, `currency-and-curve-select--${currency.toLowerCase()}-item`)
}

macros.selectSingleKey = async function (context) {
  await macros.clickRadioButton(context, 'single')
}

macros.selectShardedKey = async function (context) {
  await macros.clickRadioButton(context, 'shard')
}

macros.setNumShards = async function (context, value) {
  await macros.setSelectValueWithDataTestId(context, 'num-shards-select', value)
}

macros.setNumRequiredShards = async function (context, value) {
  await macros.setSelectValueWithDataTestId(context, 'num-required-shards-select', value)
}

macros.selectCustomEntropyMethod = async function (context) {
  await macros.clickRadioButton(context, 'keyboard')
}

macros.inputCustomEntropyValues = async function (context) {
  for (let i = 0; i < 10; i++) {
    await macros.setInputValueWithDataTestId(context, `custom-entropy-input-${i}`, '1')
  }
  await macros.sleep(100)
}

macros.setPassword = async function (context, password) {
  await macros.setInputValueWithDataTestId(context, 'password-input', password)
}

macros.setConfirmPassword = async function (context, password) {
  await macros.setInputValueWithDataTestId(context, 'confirm-password-input', password)
}

macros.checkDownloadPrivateKeyQRCodeCheckbox = async function (context) {
  await macros.clickCheckboxWithDataTestId(context, 'download-private-key-qr-code-checkbox')
}

macros.checkDownloadPublicKeyQRCodeCheckbox = async function (context) {
  await macros.clickCheckboxWithDataTestId(context, 'download-public-key-qr-code-checkbox')
}

macros.setQRCodeFileFormat = async function (context, value) {
  await macros.setSelectValueWithDataTestId(context, 'qr-code-file-format', value)
}

macros.downloadPrivateKey = async function (context) {
  await macros.clickElementWithDataTestId(context, 'download-private-key-button')
}

macros.downloadPublicKey = async function (context) {
  await macros.clickElementWithDataTestId(context, 'download-public-key-button')
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

// Sign transaction related

macros.uploadTransaction = async function (context, file) {
  await macros.uploadFile(context, file)
  await macros.clickElementWithDataTestId(context, 'upload-transaction-input')
}

macros.setDerivationIDValue = async function (context, derivationId) {
  await macros.setInputValueWithDataTestId(context, 'derivation-id-input', derivationId)
}

macros.downloadTransaction = async function (context) {
  await macros.clickElementWithDataTestId(context, 'download-transaction-button')
}

macros.downloadAllTransactions = async function (context) {
  await macros.clickElementWithDataTestId(context, 'download-all-transactions-button')
}

// Private keys related files

macros.uploadPrivateKeys = async function (context, files, password) {
  for (let i = 0; i < files.length; i++) {
    await macros.uploadFile(context, files[i])
    await macros.uploadPrivateKey(context, i, password)
  }
}

macros.uploadPrivateKeyWithoutPassword = async function (context, files, password) {
  for (let i = 0; i < files.length; i++) {
    await macros.uploadFile(context, files[i])
    await macros.clickElementWithDataTestId(context, 'upload-private-key-input')
  }
}

macros.uploadPrivateKey = async function (context, index, password) {
  await macros.clickElementWithDataTestId(context, 'upload-private-key-input')
  await macros.setInputValueWithDataTestId(context, `key-shard-item-${index}--password-input`, password)
  await macros.clickElementWithDataTestId(context, `key-shard-item-${index}--decrypt-button`)
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
