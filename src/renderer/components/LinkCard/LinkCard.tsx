import clsx from 'clsx';

export type LinkCardProps = {
  Title: string;
  children: React.ReactNode;
  Width: 'hug' | 'fill';
};

export function LinkCard({ Title, children, Width }: LinkCardProps) {
  return (
    <div
      className={clsx('tw-flex-col', {
        'tw-inline-flex': Width === 'hug',
        'tw-flex': Width === 'fill',
      })}
    >
      <div className="tw-mb-2 tw-text-body tw-font-medium">{Title}</div>
      <div className="tw-flex tw-flex-col tw-gap-y-5">{children}</div>
    </div>
  );
}
