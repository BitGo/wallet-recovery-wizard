const macros = require('../macros')
const coinInfo = require('./coinInfo')

//Use same params
//Bitcoin, Polkadot, Tron, Sol, Near
//Ethereum
//Eos, Ripple, Stellar

async function recoverBTC(context) {
    context.timeout(36000)
    //Choose Non-Bitgo Recoveries
    await macros.waitForWindow(context)
    await macros.selectNonBitGoRecoveries(context)

    //Enter form details
    await macros.selectCurrency(context, 'tbtc')
    await macros.setInputValueWithDataTestId(context, 'userKey', coinInfo.btcInfo.userKey)
    await macros.setInputValueWithDataTestId(context, 'backupKey', coinInfo.btcInfo.backupKey)
    await macros.setInputValueWithDataTestId(context, 'bitgoKey', coinInfo.btcInfo.bitgoKey)
    await macros.setInputValueWithDataTestId(context, 'walletPassphrase', coinInfo.btcInfo.walletPassphrase)
    await macros.setInputValueWithDataTestId(context, 'recoveryDestination', coinInfo.btcInfo.recoveryDestination)

    //Submit and return to home
    await macros.clickFooterContinueButton(context)
    await macros.clickBackToHomeLink(context)
    await macros.sleep(500)
}

async function recoverETH(context) {
    context.timeout(36000)
    await macros.waitForWindow(context)
    await macros.selectNonBitGoRecoveries(context)

    await macros.selectCurrency(context, 'gteth')
    await macros.setInputValueWithDataTestId(context, 'apiKey', coinInfo.ethInfo.apiKey)
    await macros.setInputValueWithDataTestId(context, 'userKey', coinInfo.ethInfo.userKey)
    await macros.setInputValueWithDataTestId(context, 'backupKey', coinInfo.ethInfo.backupKey)
    await macros.setInputValueWithDataTestId(context, 'walletContractAddress', coinInfo.ethInfo.walletContractAddress)
    await macros.setInputValueWithDataTestId(context, 'walletPassphrase', coinInfo.ethInfo.walletPassphrase)
    await macros.setInputValueWithDataTestId(context, 'recoveryDestination', coinInfo.ethInfo.recoveryDestination)

    await macros.clickFooterContinueButton(context)
    await macros.clickBackToHomeLink(context)
    await macros.sleep(500)
}

module.exports = {
    recoverBTC,
    recoverETH,
}