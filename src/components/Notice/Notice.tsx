import clsx from 'clsx';

export type NoticeProps = {
  Variant: 'Secondary';
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  children: React.ReactNode;
};

export function Notice({
  Variant,
  IconLeft,
  IconRight,
  children,
}: NoticeProps) {
  return (
    <div
      className={clsx(
        'tw-flex tw-border tw-text-label-1 tw-border-solid tw-justify-center tw-px-6 tw-py-3 tw-items-center tw-gap-2 tw-box-border tw-rounded',
        {
          'tw-bg-gray-100 tw-border-gray-500': Variant === 'Secondary',
        }
      )}
    >
      {IconLeft && <span>{IconLeft}</span>}
      <div>{children}</div>
      {IconRight && <span>{IconRight}</span>}
    </div>
  );
}
