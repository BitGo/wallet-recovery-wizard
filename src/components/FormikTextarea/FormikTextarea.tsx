import { FieldConfig, useField } from 'formik';
import { Textarea, TextareaProps } from '../Textarea';

type FormikTextareaProps = FieldConfig<string>;

export function FormikTextarea({
  HelperText,
  children,
  ...props
}: FormikTextareaProps &
  Omit<TextareaProps, 'Invalid'> &
  JSX.IntrinsicElements['textarea']) {
  const [field, meta] = useField<string>(props);

  return (
    <Textarea
      {...field}
      {...props}
      Invalid={meta.touched && !!meta.error}
      HelperText={meta.touched && !!meta.error ? meta.error : HelperText}
    >
      {children}
    </Textarea>
  );
}
