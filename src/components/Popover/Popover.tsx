import clsx from 'clsx';
import * as React from 'react';

export type PopoverProps = {
  children: React.ReactElement;
  Target: React.ReactElement;
  Width: 'hug' | 'fill';
};

export const Popover = React.forwardRef<
  HTMLDetailsElement,
  PopoverProps & JSX.IntrinsicElements['details']
>(function Popover({ children, Target, Width, ...hostProps }, ref) {
  return (
    <details
      {...hostProps}
      className={clsx({
        'tw-inline-flex': Width === 'hug',
        'tw-flex tw-w-full': Width === 'fill',
      })}
      ref={ref}
      style={undefined}
    >
      <summary className="marker:tw-hidden marker:tw-content-none">
        {Target}
      </summary>
      {children}
    </details>
  );
});
