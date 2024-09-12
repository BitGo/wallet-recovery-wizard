import { Form } from 'formik';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormikTextfield, FormikSelectfield } from '~/components';
import {
  evmCCRWrongChainCoins,
  evmCCRIntendedChainCoins,
  CoinMetadata,
  allWalletMetas,
} from '~/helpers/config';
import { BitgoEnv, isBscChain, safeEnv } from '~/helpers';
import { allCoinMetas } from '~/helpers/config';

export function EvmCrossChainRecoveryBaseForm({
  formik,
}: {
  formik: {
    setFieldValue: (a: string, b: string) => void;
  };
}) {
  const [disabled, setDisabled] = useState(true);
  const [wrongChain, setWrongChain] = useState('');
  const [intendedChainCoins, setIntendedChainCoins] = useState<
    readonly CoinMetadata[]
  >([]);
  const { env } = useParams<'env'>();
  const { wallet } = useParams<'wallet'>();
  const isCustodyWallet = wallet === allWalletMetas.custody.value;
  const bitGoEnvironment: BitgoEnv = safeEnv(env);
  const wrongChainCoins: readonly CoinMetadata[] =
    evmCCRWrongChainCoins[bitGoEnvironment];
  const wrongChainCoinsChildren = wrongChainCoins.map(coin => (
    <option key={coin.value} value={coin.value}>
      {`${coin.Title}: ${coin.Description}`}
    </option>
  ));
  wrongChainCoinsChildren.unshift(
    <option disabled selected value="">
      {' '}
      -- select an option --{' '}
    </option>
  );

  const handleWrongChainChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const wrongChainName = event.target.value;
    setWrongChain(wrongChainName);
    formik.setFieldValue('wrongChain', wrongChainName);
    setDisabled(false);
    const intendedChainCoins = evmCCRIntendedChainCoins[wrongChainName];
    setIntendedChainCoins(intendedChainCoins);
  };

  const getIntendedChainCoins = () => {
    const intendedChainCoinsChildren = intendedChainCoins.map(coin => (
      <option key={coin.value} value={coin.value}>
        {`${coin.Title}: ${coin.Description}`}
      </option>
    ));
    intendedChainCoinsChildren.unshift(
      <option disabled selected value="">
        {' '}
        -- select an option --{' '}
      </option>
    );
    return intendedChainCoinsChildren;
  };

  return (
    <Form>
      <div className="tw-mb-4">
        <FormikSelectfield
          HelperText="The chain where the funds are currently stuck."
          Label="Wrong Chain* (Funds are stuck on this chain)"
          name="wrongChain"
          Width="fill"
          value={wrongChain}
          onChange={handleWrongChainChange}
        >
          {wrongChainCoinsChildren}
        </FormikSelectfield>
      </div>
      <div className="tw-mb-4">
        <FormikSelectfield
          HelperText="The chain where the funds are intended to be sent."
          Label="Intended Chain* (Funds are intended to send on this chain)"
          name="intendedChain"
          Width="fill"
          disabled={disabled}
        >
          {getIntendedChainCoins()}
        </FormikSelectfield>
      </div>
      {!isCustodyWallet && (
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The base address of the wallet."
            Label="Wallet Contract Address* (Base Address)"
            name="walletContractAddress"
            Width="fill"
          />
        </div>
      )}
      {!isCustodyWallet && (
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The Fee address which will be used to pay fee for your recovery transaction."
            Label="Bitgo Fee Address*"
            name="bitgoFeeAddress"
            Width="fill"
          />
        </div>
      )}
      <div className="tw-mb-4">
        <FormikTextfield
          HelperText="The address your recovery transaction will send to."
          Label="Destination Address*"
          name="recoveryDestination"
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
      {!isCustodyWallet && (
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An Api-Key Token required for the explorer."
            Label="API Key*"
            name="apiKey"
            Width="fill"
          />
        </div>
      )}
    </Form>
  );
}
