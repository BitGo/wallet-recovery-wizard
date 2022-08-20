import { Selectfield, SelectfieldProps } from '../Selectfield';
import { useField, FieldConfig } from 'formik';

type FormikSelectFieldProps = FieldConfig<string>;

export function FormikSelectfield({
  HelperText,
  children,
  ...props
}: FormikSelectFieldProps &
  Omit<SelectfieldProps, 'Invalid'> &
  JSX.IntrinsicElements['select']) {
  const [field, meta] = useField<string>(props);

  return (
    <Selectfield
      {...field}
      {...props}
      Invalid={meta.touched && !!meta.error}
      HelperText={meta.touched && !!meta.error ? meta.error : HelperText}
    >
      {children}
    </Selectfield>
  );
}
