import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  backupKey: Yup.string().required(),
  backupKeyId: Yup.string(),
  recoveryDestination: Yup.string().required(),
  rootAddress: Yup.string().required(),
  userKey: Yup.string().required(),
  userKeyId: Yup.string(),
  reserveWithdrawal: Yup.boolean(),
}).required();

export type RippleFormProps = {
  onSubmit: (
    values: RippleFormValues,
    formikHelpers: FormikHelpers<RippleFormValues>
  ) => void | Promise<void>;
};

type RippleFormValues = Yup.Asserts<typeof validationSchema>;

export function RippleForm({ onSubmit }: RippleFormProps) {
  const formik = useFormik<RippleFormValues>({
    onSubmit,
    initialValues: {
      backupKey: '',
      backupKeyId: '',
      recoveryDestination: '',
      rootAddress: '',
      userKey: '',
      userKeyId: '',
      reserveWithdrawal: false,
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
            HelperText="Your user public key, as found on your recovery KeyCard."
            Label="User Public Key"
            name="userKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your user Key ID, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="User Key ID (optional)"
            name="userKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The backup public key for the wallet, as found on your recovery KeyCard."
            Label="Backup Public Key"
            name="backupKey"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your backup Key ID, as found on your KeyCard. Most wallets will not have this and you can leave it blank."
            Label="Backup Key ID (optional)"
            name="backupKeyId"
            Width="fill"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="The root address of the wallet."
            Label="Root Address"
            name="rootAddress"
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
        <div className="tw-mb-4 tw-flex tw-items-start tw-gap-2">
          <input
            type="checkbox"
            id="reserveWithdrawal"
            name="reserveWithdrawal"
            checked={formik.values.reserveWithdrawal}
            onChange={formik.handleChange}
            className="tw-mt-1"
          />
          <label htmlFor="reserveWithdrawal" className="tw-text-sm">
            <span className="tw-font-semibold">Withdraw full balance including reserve (AccountDelete)</span>
            <br />
            <span className="tw-text-gray-500">
              Permanently deletes the XRP account and sends the entire balance — including the 10 XRP
              base reserve — to the destination. The account cannot be reused afterwards. Requires: no
              trustlines with non-zero balances, no open offers/escrows/checks, and the account must be
              at least 256 ledgers old. A 2 XRP deletion fee is charged by the network.
            </span>
          </label>
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
