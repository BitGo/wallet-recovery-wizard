import { Form } from 'formik';
import { FormikTextfield } from '~/components';


export function EvmCrossChainRecoveryBaseForm() {
  return (
    <Form>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The address of the wallet contract. This is also the wallet's base address."
          Label="Wallet Contract Address"
          name="walletContractAddress"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The Fee address which will be used to pay fee for your recovery transaction."
          Label="Bitgo Fee Address"
          name="bitgoFeeAddress"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The address your recovery transaction will send to."
          Label="Destination Address"
          name="recoveryDestination"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="Gas limit for the Polygon transaction. The value should be between 30,000 and 20,000,000. The default is 500,000 unit of gas."
          Label="Gas Limit"
          name="gasLimit"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="Max fee per gas for the Polygon transaction. The default is 20 Gwei."
          Label="Max Fee Per Gas (Gwei)"
          name="maxFeePerGas"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText='"Tip" to the Polygon miner. This is by default 10 Gwei.'
          Label="Max Priority Fee Per Gas (Gwei)"
          name="maxPriorityFeePerGas"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The bitgo address where some part of fee will be sent for your recovery transaction."
          Label="Bitgo Destination Address"
          name="bitgoDestinationAddress"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The contract address of the token which needs to be recovered."
          Label="Token Contract Address"
          name="tokenContractAddress"
          Width="fill"
        />
      </div>
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="An Api-Key Token required for the explorer."
          Label="API Key"
          name="apiKey"
          Width="fill"
        />
      </div>
    </Form>
  );
}
