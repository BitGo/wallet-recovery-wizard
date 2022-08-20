import { Textarea, TextareaProps } from '../Textarea';
import { useField, FieldConfig } from 'formik';

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
