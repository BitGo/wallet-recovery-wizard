import clsx from 'clsx';

type SelectfieldProps = {
  children: React.ReactNode;
  Disabled?: boolean;
};

export function Selectfield({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className: _,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style: __,
  children,
  Disabled = false,
  ...hostProps
}: SelectfieldProps & JSX.IntrinsicElements['select']) {
  return (
    <select
      className={clsx(
        'tw-appearance-none tw-box-border tw-border-0 tw-ring-1 tw-ring-gray-700 tw-bg-white tw-flex-row tw-py-2 tw-px-4 tw-text-body tw-text-slate-900 tw-font-normal tw-text-center tw-items-center tw-justify-center tw-rounded',
        'focus:tw-outline-none focus:tw-ring-blue-500',
        {
          'tw-opacity-50': Disabled,
        }
      )}
      {...hostProps}
    >
      {children}
    </select>
  );
}
