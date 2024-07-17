import {useNavigate, useParams} from 'react-router-dom';
import {useAlertBanner} from '~/contexts';
import {safeEnv} from '~/helpers';
import {V1BtcSweepForm} from "~/containers/V1BtcSweep/V1BtcSweepForm";
import { BitGoV1Unspent } from "@bitgo/abstract-utxo";


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

        setAlert(undefined);
        const isSdkAuth = await window.queries.isSdkAuthenticated();
        if (!isSdkAuth) {
          setAlert('Not logged in');
          setSubmitting(false);
          navigate(`/${environment}/v1btc-sweep`);
          return;
        }

        const fileReader = new FileReader();
        fileReader.readAsText(values.unspents, 'UTF-8');
        fileReader.onload = async event => {
          try {
            const unspents = JSON.parse(event.target?.result as string) as BitGoV1Unspent[];
            setSubmitting(true);
            await window.commands.unlock(values.otp);
            const chainData = await window.queries.getChain(coin);
            const result = await window.commands.sweepV1(coin, {
              walletId: values.walletId,
              walletPassphrase: values.walletPassphrase,
              recoveryDestination: values.destinationAddress,
              userKey: values.encryptedUserKey,
              unspents,
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
              `/${environment}/v1btc-sweep/${coin}/success`
            );
          } catch (error) {
            setSubmitting(false);
            console.log(error);
            if (error instanceof Error) {
              setAlert(error.message);
            }
          } finally {
            setSubmitting(false);
          }
        };

      }}
    />
  );
}
