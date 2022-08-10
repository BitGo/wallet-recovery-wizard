import clsx from 'clsx';
import * as Polymorphic from '../Polymorphic';

export type MenuItemProps = {
  Title?: string;
  IconLeft?: React.ReactNode;
  Description?: string;
  Meta?: string;
};

const defaultMenuItemTag = 'li';
type MenuItemTag = 'li' | 'button';

export const MenuItem = Polymorphic.forwardRef<
  typeof defaultMenuItemTag,
  MenuItemProps,
  MenuItemTag
>(function MenuItem(
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className: _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    style: __,
    Title,
    Description,
    Meta,
    IconLeft,
    Tag,
    ...hostProps
  },
  ref
) {
  const Component = Tag ?? defaultMenuItemTag;

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={clsx(
        'tw-flex tw-items-center tw-gap-x-2 tw-min-h-14 tw-py-2 tw-px-3 tw-rounded',
        '[button&]:tw-appearance-none [button&]:tw-text-left [button&]:hover:tw-bg-gray-200'
      )}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(hostProps as any)}
    >
      {IconLeft && (
        <span className="tw-flex-grow-0 tw-flex tw-items-center tw-justify-center">
          {IconLeft}
        </span>
      )}
      <div className="tw-flex-grow">
        <div className="tw-text-slate-900 tw-font-semibold tw-text-body">
          {Title}
        </div>
        {Description && (
          <div className="tw-text-gray-700 tw-text-label-1">{Description}</div>
        )}
      </div>
      {Meta && <div className="tw-text-gray-700 tw-text-label-2">{Meta}</div>}
    </Component>
  );
});
