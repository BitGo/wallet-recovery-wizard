import { Textfield, TextfieldProps } from '../Textfield';
import { useField, FieldConfig } from 'formik';

type FormikTextfieldProps = FieldConfig<string>;

export function FormikTextfield({
  HelperText,
  ...props
}: FormikTextfieldProps &
  Omit<TextfieldProps, 'Invalid'> &
  JSX.IntrinsicElements['input']) {
  const [field, meta] = useField<string>(props);

  return (
    <Textfield
      {...field}
      {...props}
      Invalid={meta.touched && !!meta.error}
      HelperText={meta.touched && !!meta.error ? meta.error : HelperText}
    />
  );
}
