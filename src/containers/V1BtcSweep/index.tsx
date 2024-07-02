import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useAlertBanner} from '~/contexts';
import {safeEnv} from '~/helpers';
import {V1BtcSweepForm} from "~/containers/V1BtcSweep/V1BtcSweepForm";

// TODO: Use from SDK instead
type V1Unspents = {
  tx_hash: string;
  tx_output_n: number;
  value: number;
};

export function V1BtcSweep() {
  const {env} = useParams<'env'>();
  const navigate = useNavigate();
  const [_, setAlert] = useAlertBanner();

  const environment = safeEnv(env);
  const coin = env === 'test' ? 'tbtc' : 'btc';

  return (
    <V1BtcSweepForm
      onSubmit={async (values, {setFieldError, setSubmitting}) => {
        if (!values.unspents) {
          setAlert('Unspents file is required');
          return;
        }

        const fileReader = new FileReader();
        fileReader.readAsText(values.unspents, 'UTF-8');
        fileReader.onload = async event => {
          try {
            const unspents = JSON.parse(event.target?.result as string) as V1Unspents[];
            console.log('Submitting values: ', values.walletId, values.walletPassphrase, values.destinationAddress, values.encryptedUserKey, unspents);

            setSubmitting(true);
            await window.commands.setBitGoEnvironment(environment);
            const chainData = await window.queries.getChain(coin);
            const result = await window.commands.sweepV1(coin, {
              walletId: values.walletId,
              walletPassphrase: values.walletPassphrase,
              recoveryDestination: values.destinationAddress,
              userKey: values.encryptedUserKey,
              unspents,
              otp: '000000' // TODO: Replace with values.otp
            });
            setSubmitting(false);

            const showSaveDialogData = await window.commands.showSaveDialog({
              filters: [
                {
                  name: 'Custom File Type',
                  extensions: ['json'],
                },
              ],
              defaultPath: `~/${chainData}-fullsigned-tx-${Date.now()}.json`,
            });
            if (!showSaveDialogData.filePath) {
              throw new Error('No file path selected');
            }

            await window.commands.writeFile(
              showSaveDialogData.filePath,
              JSON.stringify(result, null, 2),
              { encoding: 'utf8' }
            );
            navigate(
              `/${environment}/wrong-chain-recovery/${coin}/success`
            );
          } catch (error) {
            if (error instanceof Error) {
              setFieldError('unspents', error.message);
              setAlert(error.message);
            } else {
              console.log(error);
            }
          }
          setSubmitting(false);
        };

      }}
    />
  );
}
