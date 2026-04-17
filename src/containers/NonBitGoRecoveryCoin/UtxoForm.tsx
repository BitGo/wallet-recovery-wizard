import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';

const validationSchema = Yup.object({
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  userKey: Yup.string().required(),
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
  feeRate: Yup.number().nullable().optional(),
  apiKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  scan: Yup.number().required(),
}).required();

export type UtxoFormConfig = {
  showKrsProvider?: boolean;   // defaults true; pass false for coins without KRS support
  feeRateHelperText?: string;  // if set, renders the feeRate field with this helper text
  notice?: ReactNode;          // optional notice rendered above the form heading (e.g. BCH)
};

export type UtxoCoinHandlerConfig = {
  form: UtxoFormConfig;
  passApiKeyToEnv: boolean;
  bigintSerialization: boolean;
};

const BCH_NOTICE = (
  <Notice Variant="Secondary" IconLeft={<Icon Name="warning-sign" Size="small" />}>
    Bitcoin Cash transactions are replayable on Bitcoin SV and Bitcoin ABC.
    Please make sure you are the owner of the Destination Address to avoid
    accidentally sending your Bitcoin Cash to an address you do not own.
  </Notice>
);

const BCHA_NOTICE = (
  <Notice Variant="Secondary" IconLeft={<Icon Name="warning-sign" Size="small" />}>
    BCHA (aka XEC) transactions are replayable on Bitcoin Cash. Please make
    sure you are the owner of the Destination Address to avoid accidentally
    sending your XEC to an address you do not own.
  </Notice>
);

const BTC_CONFIG: UtxoCoinHandlerConfig = {
  form: { feeRateHelperText: '(optional) The fee rate in satoshis per byte to use for the recovery transaction.' },
  passApiKeyToEnv: false,
  bigintSerialization: false,
};
const LTC_CONFIG: UtxoCoinHandlerConfig = {
  form: {},
  passApiKeyToEnv: true,
  bigintSerialization: false,
};
const DOGE_CONFIG: UtxoCoinHandlerConfig = {
  form: { showKrsProvider: false, feeRateHelperText: '(optional) The fee rate in base units per byte to use for the recovery transaction.' },
  passApiKeyToEnv: true,
  bigintSerialization: true,
};
const BCH_CONFIG: UtxoCoinHandlerConfig = {
  form: { notice: BCH_NOTICE },
  passApiKeyToEnv: true,
  bigintSerialization: false,
};
const BCHA_CONFIG: UtxoCoinHandlerConfig = {
  form: { notice: BCHA_NOTICE },
  passApiKeyToEnv: true,
  bigintSerialization: false,
};

export const UTXO_COIN_CONFIGS: Record<string, UtxoCoinHandlerConfig> = {
  btc: BTC_CONFIG, tbtc: BTC_CONFIG,
  ltc: LTC_CONFIG, btg: LTC_CONFIG, dash: LTC_CONFIG, zec: LTC_CONFIG,
  doge: DOGE_CONFIG, tdoge: DOGE_CONFIG,
  bch: BCH_CONFIG,
  bcha: BCHA_CONFIG,
};

export type UtxoFormValues = Yup.Asserts<typeof validationSchema>;

export type UtxoFormProps = UtxoFormConfig & {
  onSubmit: (
    values: UtxoFormValues,
    helpers: FormikHelpers<UtxoFormValues>
  ) => void | Promise<void>;
};

export function UtxoForm({
  showKrsProvider = true,
  feeRateHelperText,
  notice,
  onSubmit,
}: UtxoFormProps) {
  const formik = useFormik<UtxoFormValues>({
    onSubmit,
    initialValues: {
      krsProvider: '',
      userKey: '',
      backupKey: '',
      bitgoKey: '',
      walletPassphrase: '',
      feeRate: null,
      apiKey: '',
      recoveryDestination: '',
      scan: 20,
    },
    validationSchema,
  });

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your recovery KeyCard.'
      : 'The backup public key for the wallet, as found on your recovery KeyCard.';

  return (
    <FormikProvider value={formik}>
      <Form>
        {notice && <div className="tw-mb-8">{notice}</div>}
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed hot wallet details
        </h4>
        {showKrsProvider && (
          <div className="tw-mb-4">
            <FormikSelectfield
              HelperText="The Key Recovery Service that you chose to manage your backup key. If you have the encrypted backup key, you may leave this blank."
              Label="Key Recovery Service"
              name="krsProvider"
              Width="fill"
            >
              <option value="">None</option>
              <option value="keyternal">Keyternal</option>
              <option value="bitgoKRSv2">BitGo KRS</option>
              <option value="dai">Coincover</option>
            </FormikSelectfield>
          </div>
        )}
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key, as found on your recovery KeyCard."
            Label="Box A Value"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText={backupKeyHelperText}
            Label="Box B Value"
            name="backupKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The BitGo public key for the wallet, as found on your recovery KeyCard."
            Label="Box C Value"
            name="bitgoKey"
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikPasswordfield
            HelperText="The passphrase of the wallet."
            Label="Wallet Passphrase"
            name="walletPassphrase"
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
        {feeRateHelperText && (
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText={feeRateHelperText}
              Label="Fee Rate"
              name="feeRate"
              Width="fill"
            />
          </div>
        )}
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The amount of addresses without transactions to scan before stopping the tool."
            Label="Address Scanning Factor"
            name="scan"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An Api-Key Token from blockchair.com required for mainnet recovery of this coin."
            Label="API Key"
            name="apiKey"
            Width="fill"
          />
        </div>
        <div className="tw-flex tw-flex-col-reverse sm:tw-justify-between sm:tw-flex-row tw-gap-1 tw-mt-4">
          <Button Tag={Link} to="/" Variant="secondary" Width="hug">
            Cancel
          </Button>
          <Button
            Variant="primary"
            Width="hug"
            type="submit"
            Disabled={formik.isSubmitting}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
