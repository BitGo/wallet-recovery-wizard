import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextarea, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  bitgoKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  jettonMasterContract: Yup.string().required(
    'Jetton master contract is required'
  ),
  senderJettonAddress: Yup.string().required(
    'Sender Jetton address is required'
  ),
  seed: Yup.string(),
  apiKey: Yup.string().required('API Key is required'),
}).required();

export type TonTokenFormProps = {
  onSubmit: (
    values: TonTokenFormValues,
    formikHelpers: FormikHelpers<TonTokenFormValues>
  ) => void | Promise<void>;
};

type TonTokenFormValues = Yup.Asserts<typeof validationSchema>;

export function TonTokenForm({ onSubmit }: TonTokenFormProps) {
  const formik = useFormik<TonTokenFormValues>({
    onSubmit,
    initialValues: {
      bitgoKey: '',
      recoveryDestination: '',
      jettonMasterContract: '',
      senderJettonAddress: '',
      seed: undefined,
      apiKey: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Self-managed cold wallet details
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your bitgo public key, as found on your recovery KeyCard."
            Label="Bitgo Public Key"
            name="bitgoKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user seed as found on your KeyCard as Key ID. Most wallets will not have this and you can leave it blank."
            Label="Seed (optional)"
            name="seed"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The Jetton master contract address. This is the main contract address for the token."
            Label="Jetton Master Contract"
            name="jettonMasterContract"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The sender's Jetton wallet address. This is the Jetton address associated with your wallet."
            Label="Sender Jetton Address"
            name="senderJettonAddress"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextarea
            HelperText="The address your recovery transaction will send to."
            Label="Destination Address"
            name="recoveryDestination"
            rows={1}
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="An API Key from toncenter.com"
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
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Recovering...' : 'Recover Funds'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
