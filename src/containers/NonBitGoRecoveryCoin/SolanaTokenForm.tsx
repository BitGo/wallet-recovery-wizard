import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
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
  backupKey: Yup.string().required(),
  bitgoKey: Yup.string().required(),
  krsProvider: Yup.string()
    .oneOf(['keyternal', 'bitgoKRSv2', 'dai'])
    .label('Key Recovery Service'),
  recoveryDestination: Yup.string().required(),
  tokenAddress: Yup.string().required(),
  tokenProgramId: Yup.string().required(),
  userKey: Yup.string().required(),
  walletPassphrase: Yup.string().required(),
})
  .required()
  .shape(
    {
      publicKey: Yup.string().when('secretKey', {
        is: (val: string) => !!val,
        then: Yup.string().required(
          'A public key must be provided with a secret key'
        ),
      }),
      secretKey: Yup.string().when('publicKey', {
        is: (val: string) => !!val,
        then: Yup.string().required(
          'A secret key must be provided with a public key'
        ),
      }),
    },
    [['secretKey', 'publicKey']]
  );

export type SolanaTokenFormProps = {
  onSubmit: (
    values: SolanaFormValues,
    formikHelpers: FormikHelpers<SolanaFormValues>
  ) => void | Promise<void>;
};

type SolanaFormValues = Yup.Asserts<typeof validationSchema>;

export function SolanaTokenForm({ onSubmit }: SolanaTokenFormProps) {
  const formik = useFormik<SolanaFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      bitgoKey: '',
      krsProvider: '',
      publicKey: '',
      recoveryDestination: '',
      tokenAddress: '',
      tokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      secretKey: '',
      userKey: '',
      walletPassphrase: '',
    },
    validationSchema,
  });

  const backupKeyHelperText =
    formik.values.krsProvider === ''
      ? 'Your encrypted backup key, as found on your BitGo recovery keycard.'
      : 'The backup public key for the wallet, as found on your BitGo recovery keycard.';

  return (
    <FormikProvider value={formik}>
      <Form>
        <div className="tw-mb-8">
          <Notice
            Variant="Secondary"
            IconLeft={<Icon Name="warning-sign" Size="small" />}
          >
            Solana transactions have a broadcast window of 60 seconds. By
            filling out the Durable Nonce: Public Key field and the Durable
            Nonce: Secret Key field, you can extend this window.
          </Notice>
        </div>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed hot wallet details
        </h4>
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
          <FormikTextfield
            HelperText="The address of the smart contract of the token to recover. This is unique to each token, and is NOT your wallet address."
            Label="Token Address"
            name="tokenAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikSelectfield
            HelperText="The programId for smart contract of the token to recover."
            Label="Token ProgramId"
            name="tokenProgramId"
            Width="fill"
          >
            <option value="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA">Sol SPL Token</option>
            <option value="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb">Sol SPL 2022 Token</option>
          </FormikSelectfield>
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
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The public key of the authority for your nonce account."
            Label="Durable Nonce: Public Key"
            name="publicKey"
            rows={2}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The secret key for your nonce account."
            Label="Durable Nonce: Secret Key"
            name="secretKey"
            rows={2}
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
