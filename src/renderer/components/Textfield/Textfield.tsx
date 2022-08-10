import clsx from 'clsx';

type TextfieldProps = {
  Disabled?: boolean;
  HelperText?: React.ReactNode;
  Label: string;
  Width?: 'fill' | 'hug';
  type: 'text';
};

export function Textfield({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className: _,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style: __,
  Disabled = false,
  Label,
  Width,
  HelperText,
  id,
  ...hostProps
}: TextfieldProps & Omit<JSX.IntrinsicElements['input'], 'type'>) {
  return (
    <div
      className={clsx('tw-flex-col', {
        'tw-opacity-50': Disabled,
        'tw-flex': Width === 'fill',
        'tw-inline-flex': Width === 'hug',
      })}
    >
      <label
        className="tw-text-label-1 tw-text-slate-900 tw-font-semibold tw-mb-1"
        htmlFor={id}
      >
        {Label}
      </label>
      <input
        className={clsx(
          'tw-appearance-none tw-flex tw-w-full tw-py-2 tw-px-4 tw-bg-transparent tw-box-border tw-border-0 tw-ring-1 tw-ring-gray-700 tw-bg-white tw-text-body tw-text-slate-900 tw-font-normal tw-items-center tw-justify-center tw-rounded tw-relative',
          'placeholder:tw-text-gray-700',
          'focus:tw-outline-none focus:tw-ring-blue-500'
        )}
        id={id}
        {...hostProps}
      />
      {HelperText && (
        <div className="tw-mt-1 tw-text-gray-700 tw-text-label-2">
          {HelperText}
        </div>
      )}
    </div>
  );
}
