import clsx from "clsx";

export type NoticeProps = {
  Variant: 'Secondary';
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  children: React.ReactNode;
}

export function Notice({
  Variant,
  IconLeft,
  IconRight,
  children
}: NoticeProps) {
  return (
    <div
      className={clsx(
        'tw-flex tw-justify-center tw-px-6 tw-py-3 tw-items-center tw-gap-2 tw-box-border tw-rounded',
        {
          'tw-bg-gray-100': Variant === 'Secondary',
        }
      )}
    >
      {IconLeft && (
        <span>{IconLeft}</span>
      )}
      <div className="tw-text-label-1">
        {children}
      </div>
      {IconRight && (
        <span>{IconRight}</span>
      )}
    </div>
  );
}
