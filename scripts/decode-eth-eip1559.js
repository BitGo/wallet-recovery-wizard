const { Transaction: TransactionFactory, FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const ethUtil = require('ethereumjs-util');
const prompt = require('prompt-sync')();

main();

async function main() {

	const data = '0x' + prompt('Enter the transaction hex from your recovery JSON: ');
	const output = FeeMarketEIP1559Transaction.fromSerializedTx(ethUtil.toBuffer(data));

    console.log(output.toJSON());
}
