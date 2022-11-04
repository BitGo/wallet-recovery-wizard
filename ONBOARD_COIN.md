## Instructions to onboard a new coin for Wallet Recovery Wizard

1. In scripts/build-icons.js, add the abbreviated coin name to the array of coins.

2. Run the following command:

```bash
npm run icons:build
```

3. In [src/components/CoinsSelectAutocomplete/CoinsSelectAutocomplete.tsx](src/components/CoinsSelectAutocomplete/CoinsSelectAutocomplete.tsx) add an object that will populate the coins dropdown with the new coin using the following format:

   Note: To add the coin to Non-Bitgo Recovery and Build Unsigned Sweep, you must add to each array, respectively. There are also subarrays within each denoting if the coin should be displayed on test and prod.

```js
 {
 Title: '<Abbreviated coin name>',
 Description: '<Full coin name>',
 Icon: '<Abbreviated coin name of the mainnet version of your coin>',
 value: '<Abbreviated coin name>',
 }
```

4. **OPTIONAL STEP:** If the coin you are adding shares the exact same form layout with another coin and does not need unique manipulation of form data, you may skip this step. Otherwsie, you must implement a form for the coin in [src/containers/NonBitGoRecoveryCoin](src/containers/NonBitGoRecoveryCoin) and [src/containers/BuildUnsignedSweepCoin](src/containers/BuildUnsignedSweepCoin) to add the form to Non-BitGo Recovery and Build Unsigned Sweep, respectively.

   Note: The other coins' forms can most likely be used as a guideline.

5. The following instructions should be applied to [src/containers/NonBitGoRecoveryCoin/NonBitGoRecoveryCoin.tsx](src/containers/NonBitGoRecoveryCoin/NonBitGoRecoveryCoin.tsx) and [src/containers/BuildUnsignedSweepCoin/BuildUnsignedSweepCoin.tsx](src/containers/BuildUnsignedSweepCoin/BuildUnsignedSweepCoin.tsx) for Non-Bitgo Recovery and Build Unsigned Sweep, respectively. If you are reusing the form and logic from a previous coin, add a case for the testnet and mainnet versions (using the abbreviated coin name) as needed tot the previous coin's logic. Otherwise, you must import the new form component you created and add the necessary case(s) for that coin as well as the logic to be executed when the user submit's the form.

   Note: The other coins' logic can most likely be used as a guideline.
