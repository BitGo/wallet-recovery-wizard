import { FieldConfig } from 'formik';
import { Filefield, FilefieldProps } from '../Filefield';

type FormikFilefieldProps = FieldConfig<File>;

export function FormikFilefield({
  HelperText,
  ...props
}: FormikFilefieldProps &
  Omit<FilefieldProps, 'Invalid' | 'type'> &
  Omit<JSX.IntrinsicElements['input'], 'value'>) {
  return (
    <Filefield
      {...props}
      type='file'
      HelperText={HelperText}
    />
  );
}
