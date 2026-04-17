import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const UTXO_COINS = ['btc', 'tbtc', 'ltc', 'tltc', 'doge', 'tdoge', 'dash', 'tdash', 'zec', 'tzec', 'bch', 'tbch', 'btg', 'tbtg'] as const;

const validationSchema = Yup.object({
  coin: Yup.string()
    .oneOf(UTXO_COINS as unknown as string[])
    .required(),
  psbt: Yup.string().required(),
  userKey: Yup.string().required(),
  walletPassphrase: Yup.string().optional(),
  recipientAddress: Yup.string().optional(),
  recipientAmount: Yup.string().optional(),
  feeRate: Yup.string().optional(),
}).required();

export type SignPsbtFormValues = Yup.Asserts<typeof validationSchema>;

export type SignPsbtFormProps = {
  onSubmit: (
    values: SignPsbtFormValues,
    formikHelpers: FormikHelpers<SignPsbtFormValues>
  ) => void | Promise<void>;
};

export function SignPsbtForm({ onSubmit }: SignPsbtFormProps) {
  const formik = useFormik<SignPsbtFormValues>({
    onSubmit,
    initialValues: {
      coin: 'tbtc',
      psbt: '',
      userKey: '',
      walletPassphrase: '',
      recipientAddress: '',
      recipientAmount: '',
      feeRate: '',
    },
    validationSchema,
  });

  const showPassphrase = formik.values.userKey && !/^[xt]prv/.test(formik.values.userKey);

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Sign Unsigned PSBT
        </h4>

        <div className="tw-mb-4">
          <FormikSelectfield
            HelperText="The UTXO coin (BTC, LTC, DOGE, etc.)"
            Label="Coin"
            name="coin"
            Width="fill"
          >
            {UTXO_COINS.map((coin: string) => (
              <option key={coin} value={coin}>
                {coin.toUpperCase()}
              </option>
            ))}
          </FormikSelectfield>
        </div>

        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The unsigned PSBT, as hex or base64 string."
            Label="Unsigned PSBT"
            name="psbt"
            rows={6}
            Width="fill"
          />
        </div>

        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your user key (xprv for unencrypted, or encrypted key JSON from your keycard)."
            Label="User Key"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>

        {showPassphrase && (
          <div className="tw-mb-4">
            <FormikPasswordfield
              HelperText="The passphrase to decrypt your user key."
              Label="Wallet Passphrase"
              name="walletPassphrase"
              Width="fill"
            />
          </div>
        )}

        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="(optional) Recipient address to add as an output to the PSBT before signing."
            Label="Recipient Address"
            name="recipientAddress"
            Width="fill"
          />
        </div>

        {formik.values.recipientAddress && (
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="(optional) Amount in satoshis for the recipient output."
              Label="Recipient Amount (satoshis)"
              name="recipientAmount"
              Width="fill"
            />
          </div>
        )}

        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="(optional) Fee rate in satoshis per vbyte. Informational only."
            Label="Fee Rate"
            name="feeRate"
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
            {formik.isSubmitting ? 'Signing...' : 'Sign PSBT'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
