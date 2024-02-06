import { FieldConfig, useField } from 'formik';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../Button';
import { Textfield, TextfieldProps } from '../Textfield';

type FormikTextfieldProps = FieldConfig<string> & {
  inputRef?: React.RefObject<HTMLInputElement>;
};

function usePasswordInputFieldProps(
  inputRef: React.RefObject<HTMLInputElement>
): Pick<
  React.ComponentProps<typeof FormikTextfield>,
  'type' | 'AddonRight' | 'onFocus'
> {
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  return {
    type: isPasswordVisible ? 'text' : 'password',
    AddonRight: (
      <Button
        Variant="secondary"
        Width="hug"
        className="tw-text-sm tw-text-gray-700"
        type="button"
        onClick={() => {
          flushSync(() => {
            setPasswordVisible(!isPasswordVisible);
          });
          inputRef.current?.focus();
          inputRef.current?.select();
        }}
      >
        {isPasswordVisible ? 'Hide' : 'Show'}
      </Button>
    ),
  };
}

export function FormikTextfield({
  HelperText,
  inputRef,
  ...props
}: FormikTextfieldProps &
  Omit<TextfieldProps, 'Invalid'> &
  JSX.IntrinsicElements['input']) {
  const [field, meta] = useField<string>(props);

  return (
    <Textfield
      inputRef={inputRef}
      {...field}
      {...props}
      Invalid={meta.touched && !!meta.error}
      HelperText={meta.touched && !!meta.error ? meta.error : HelperText}
    />
  );
}

export function FormikPasswordfield(
  props: Omit<
    React.ComponentProps<typeof FormikTextfield>,
    'Invalid' | 'AddonRight' | 'type'
  >
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const passwordInputFieldProps = usePasswordInputFieldProps(inputRef);

  return (
    <FormikTextfield
      inputRef={inputRef}
      {...props}
      {...passwordInputFieldProps}
    />
  );
}
