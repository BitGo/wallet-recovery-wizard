import clsx from 'clsx';
import { Icon } from '../Icon';

type SelectfieldProps = {
  children: React.ReactNode;
  Disabled?: boolean;
  HelperText?: React.ReactNode;
  Label: string;
  Width?: 'fill' | 'hug';
};

export function Selectfield({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className: _,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style: __,
  children,
  Disabled = false,
  Label,
  Width,
  HelperText,
  ...hostProps
}: SelectfieldProps & JSX.IntrinsicElements['select']) {
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
        htmlFor={hostProps.id}
      >
        {Label}
      </label>
      <div
        className={clsx(
          'tw-box-border tw-border tw-border-solid tw-border-gray-700 tw-bg-white tw-text-body tw-text-slate-900 tw-font-normal tw-items-center tw-justify-center tw-rounded tw-relative',
          'focus-within:tw-border-blue-500'
        )}
      >
        <select
          {...hostProps}
          className={clsx(
            'tw-appearance-none tw-flex tw-w-full tw-py-2 tw-pl-4 tw-pr-8 tw-bg-transparent',
            'focus:tw-outline-none'
          )}
        >
          {children}
        </select>
        <span className="tw-flex tw-absolute tw-top-1/2 tw-right-3 -tw-translate-y-1/2">
          <Icon Name="arrow-down" Size="small" />
        </span>
      </div>
      {HelperText && (
        <div className="tw-mt-1 tw-text-gray-700 tw-text-label-2">
          {HelperText}
        </div>
      )}
    </div>
  );
}
