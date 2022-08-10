import React from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon';

type SearchfieldProps = {
  Disabled?: boolean;
  Width?: 'fill' | 'hug';
};

export const Searchfield = React.forwardRef<
  HTMLInputElement,
  SearchfieldProps & Omit<JSX.IntrinsicElements['input'], 'type'>
>(function Searchfield(
  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    className: _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    style: __,
    Disabled = false,
    Width,
    ...hostProps
  },
  ref
) {
  return (
    <div
      className={clsx('tw-flex-col', {
        'tw-opacity-50': Disabled,
        'tw-flex': Width === 'fill',
        'tw-inline-flex': Width === 'hug',
      })}
    >
      <div
        className={clsx(
          'tw-box-border tw-border-0 tw-ring-1 tw-ring-gray-700 tw-bg-white tw-text-body tw-text-slate-900 tw-font-normal tw-items-center tw-justify-center tw-rounded tw-relative',
          'focus-within:tw-ring-blue-500'
        )}
      >
        <span className="tw-flex tw-absolute tw-top-1/2 tw-left-3 -tw-translate-y-1/2">
          <Icon Name="search" Size="small" />
        </span>
        <input
          ref={ref}
          className={clsx(
            'tw-appearance-none tw-flex tw-w-full tw-py-2 tw-pr-4 tw-pl-8 tw-bg-transparent',
            'placeholder:tw-text-gray-700',
            'focus:tw-outline-none'
          )}
          type="search"
          {...hostProps}
        />
      </div>
    </div>
  );
});
