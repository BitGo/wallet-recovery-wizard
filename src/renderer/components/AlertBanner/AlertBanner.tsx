import clsx from 'clsx';

export type AlertBannerProps = {
  Variant: 'destructive'
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  children: React.ReactNode;
};

export function AlertBanner({
  Variant,
  IconLeft,
  IconRight,
  children,
}: AlertBannerProps) {
  return (
    <div
      className={clsx(
        'tw-flex tw-justify-center tw-px-2 tw-py-1 tw-items-center tw-gap-2 tw-box-border',
        {
          'tw-bg-red-500 tw-text-gray-50': Variant === 'destructive',
        }
      )}
    >
      {IconLeft && <span>{IconLeft}</span>}
      <div className="tw-text-label-1">{children}</div>
      {IconRight && <span>{IconRight}</span>}
    </div>
  );
}
