const { FeeMarketEIP1559Transaction } = require('@ethereumjs/tx');
const ethUtil = require('ethereumjs-util');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

main();

function main() {
  readline.question(
    'Enter the transaction hex from your recovery JSON: ',
    data => {
      const output = FeeMarketEIP1559Transaction.fromSerializedTx(
        ethUtil.toBuffer(data.startsWith('0x') ? data : '0x' + data)
      );
      console.log(output.toJSON());
      readline.close();
    }
  );
}
