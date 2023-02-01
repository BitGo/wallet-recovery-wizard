import { Form, FormikHelpers, FormikProvider, useFormik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Button, FormikTextfield } from '~/components';

const validationSchema = Yup.object({
  username: Yup.string().required(),
  password: Yup.string().required(),
  otp: Yup.string().required(),
}).required();

export type LoginFormProps = {
  onSubmit: (
    values: LoginFormValues,
    formikHelpers: FormikHelpers<LoginFormValues>
  ) => void | Promise<void>;
};

type LoginFormValues = Yup.Asserts<typeof validationSchema>;

export function LoginForm({ onSubmit }: LoginFormProps) {
  const formik = useFormik<LoginFormValues>({
    onSubmit,
    initialValues: {
      username: '',
      password: '',
      otp: '',
    },
    validationSchema,
  });

  return (
    <FormikProvider value={formik}>
      <Form>
        <h4 className="tw-text-body tw-font-semibold tw-border-b-0.5 tw-border-solid tw-border-gray-700 tw-mb-4">
          Log into BitGo
        </h4>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your BitGo login email."
            Label="Email"
            name="username"
            Width="fill"
            type="email"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Your BitGo login password."
            Label="Password"
            name="password"
            Width="fill"
            type="password"
          />
        </div>
        <div className="tw-mb-4">
          <FormikTextfield
            HelperText="Login two-factor-authentication."
            Label="Two-factor authentication"
            name="otp"
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
            {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </Form>
    </FormikProvider>
  );
}
