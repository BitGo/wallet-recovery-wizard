import clsx from 'clsx';

export type TextfieldProps = {
  Disabled?: boolean;
  HelperText?: React.ReactNode;
  Invalid?: boolean;
  Label: string;
  Width: 'fill' | 'hug';
  AddonRight?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
};

export function Textfield({
  Disabled = false,
  Invalid = false,
  Label,
  Width,
  HelperText,
  type = 'text',
  AddonRight,
  inputRef,
  ...hostProps
}: TextfieldProps & JSX.IntrinsicElements['input']) {
  return (
    <div
      className={clsx('tw-flex-col', {
        'tw-opacity-50': Disabled,
        'tw-flex': Width === 'fill',
        'tw-inline-flex': Width === 'hug',
      })}
    >
      <label
        className={clsx('tw-text-label-1 tw-font-semibold tw-mb-1', {
          'tw-text-slate-900': !Invalid,
          'tw-text-red-500': Invalid,
        })}
        htmlFor={hostProps.id}
      >
        {Label}
      </label>
      <div className="tw-flex">
        <input
          ref={inputRef}
          {...hostProps}
          type={type}
          className={clsx(
            'tw-appearance-none tw-flex tw-w-full tw-py-2 tw-px-4 tw-bg-transparent tw-box-border tw-border tw-border-solid tw-border-gray-700 tw-bg-white tw-text-body tw-text-slate-900 tw-font-normal tw-items-center tw-justify-center tw-rounded tw-relative',
            'placeholder:tw-text-gray-700',
            'focus:tw-outline-none',
            {
              'focus:tw-border-blue-500': !Invalid,
              'tw-border-red-500': Invalid,
            }
          )}
          style={undefined}
        />
        {AddonRight ? <div>{AddonRight}</div> : null}
      </div>
      {HelperText && (
        <div className="tw-mt-1 tw-text-gray-700 tw-text-label-2">
          {HelperText}
        </div>
      )}
    </div>
  );
}
