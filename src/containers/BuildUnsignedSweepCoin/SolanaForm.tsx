import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import {
  Button,
  FormikSelectfield,
  FormikTextarea,
  FormikTextfield,
  Icon,
  Notice,
} from '~/components';

const validationSchema = Yup.object({
  bitgoKey: Yup.string().required(),
  recoveryDestination: Yup.string().required(),
  seed: Yup.string(),
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

export type SolanaFormProps = {
  onSubmit: (
    values: SolanaFormValues,
    formikHelpers: FormikHelpers<SolanaFormValues>
  ) => void | Promise<void>;
};

type SolanaFormValues = Yup.Asserts<typeof validationSchema>;

export function SolanaForm({ onSubmit }: SolanaFormProps) {
  const formik = useFormik<SolanaFormValues>({
    onSubmit,
    initialValues: {
      bitgoKey: '',
      recoveryDestination: '',
      publicKey: '',
      secretKey: '',
      seed: undefined,
    },
    validationSchema,
  });

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
