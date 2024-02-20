import { Field, Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikPasswordfield, FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
} from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  userKey: Yup.string().required(),
  rootAddress: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  bitgoKey: Yup.string().optional(),
  walletPassphrase: Yup.string().optional(),
  fee: Yup.number().required(),
  firstRound: Yup.number().optional()
    .typeError('firstRound must be a number')
    .integer()
    .positive('firstRound must be a positive integer')
    .required(),
  note: Yup.string().optional(),
  nodeParams: Yup.object({
    token: Yup.string().required(),
    baseServer: Yup.string().required(),
    port: Yup.number().required(),
  }),
}).required();

export type AlgorandFormProps = {
  onSubmit: (
    values: AlgorandFormValues,
    formikHelpers: FormikHelpers<AlgorandFormValues>
  ) => void | Promise<void>;
};

type AlgorandFormValues = Yup.Asserts<typeof validationSchema>;

export function AlgorandForm({ onSubmit }: AlgorandFormProps) {
  const formik = useFormik<AlgorandFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      userKey: '',
      rootAddress: '',
      recoveryDestination: '',
      bitgoKey: '',
      walletPassphrase: '',
      fee: 1000,
      firstRound: 0,
      note: '',
      nodeParams: {
        token: '',
        baseServer: '',
        port: 8443,
      }
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-Managed Hot Wallet
        </h4>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted user key (box A of the KeyCard)."
            Label="Encrypted User Key"
            name="userKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Your encrypted backup key (box B of the KeyCard)."
            Label="Encrypted Backup Key"
            name="backupKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="Bitgo Public key (box C of the KeyCard)."
            Label="BitGo Public Key"
            name="bitgoKey"
            rows={4}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The base address of the wallet (also known as root address)"
            Label="Base Address"
            name="rootAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikPasswordfield
            HelperText="Your wallet passphrase."
            Label="Wallet Passphrase"
            name="walletPassphrase"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The recipient address for the recovery transaction. This is the address of the wallet you are recovering to."
            Label="Destination Address"
            name="recoveryDestination"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos."
            Label="Fee for the transaction"
            name="fee"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The first round for when the transaction is valid. If the transaction is sent prior to this round it will be rejected by the network."
            Label="First Round when the transaction should be valid"
            name="firstRound"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Paid by the sender to the FeeSink to prevent denial-of-service. The minimum fee on Algorand is currently 1000 microAlgos."
            Label="Fee for the transaction"
            name="fee"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Attach any metadata up to 1000 bytes."
            Label="Any data up to 1000 bytes."
            name="note"
            Width="fill"
          />
        </div>
        <Form>
          <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
            Node Parameters
          </h4>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Token of the Algorand node you are connecting to."
              Label="Algorand token"
              name="nodeParams.token"
              Width="fill"
            />
          </div>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Server address of the Algorand node you are connecting to."
              Label="Node Server Address"
              name="nodeParams.baseServer"
              Width="fill"
            />
          </div>
          <div className="tw-mb-4">
            <FormikTextfield
              HelperText="Port of the Algorand node you are connecting to."
              Label="Port"
              name="nodeParams.port"
              Width="fill"
            />
          </div>
        </Form>
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
            {formik.isSubmitting ? 'Building...' : 'Build Transaction'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
