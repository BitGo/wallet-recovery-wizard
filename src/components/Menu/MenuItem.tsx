import clsx from 'clsx';
import * as Polymorphic from '../Polymorphic';

export type MenuItemProps = {
  Title: string;
  IconLeft?: React.ReactNode;
  Description?: string;
  Meta?: string;
  'data-active'?: boolean;
  'data-current'?: boolean;
};

const defaultMenuItemTag = 'li';
type MenuItemTag = 'li' | 'button';

export const MenuItem = Polymorphic.forwardRef<
  typeof defaultMenuItemTag,
  MenuItemProps,
  MenuItemTag
>(function MenuItem(
  { Title, Description, Meta, IconLeft, Tag, ...hostProps },
  ref
) {
  const Component = Tag ?? defaultMenuItemTag;

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
      {...(hostProps as any)}
      className={clsx(
        'tw-flex tw-items-center tw-gap-x-2 tw-min-h-14 tw-py-2 tw-px-3 tw-rounded',
        '[button&]:tw-appearance-none [button&]:tw-text-left [&[data-active]]:tw-bg-gray-200 [&[data-current]]:tw-bg-blue-500 [&[data-current]]:tw-text-gray-100 tw-text-slate-900'
      )}
      ref={ref}
      style={undefined}
    >
      {IconLeft && (
        <span className="tw-pointer-events-none tw-flex-grow-0 tw-flex tw-items-center tw-justify-center">
          {IconLeft}
        </span>
      )}
      <div className="tw-pointer-events-none tw-flex-grow">
        <div className="tw-text-current tw-font-semibold tw-text-body">
          {Title}
        </div>
        {Description && (
          <div className="tw-pointer-events-none tw-text-gray-700 [[data-current]_&]:tw-text-gray-100 tw-text-label-1">
            {Description}
          </div>
        )}
      </div>
      {Meta && (
        <div className="tw-pointer-events-none tw-text-gray-700 [[data-current]_&]:tw-text-gray-100 tw-text-label-2">
          {Meta}
        </div>
      )}
    </Component>
  );
});
