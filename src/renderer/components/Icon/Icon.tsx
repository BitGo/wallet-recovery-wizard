/* eslint-disable react/prop-types */
import * as React from 'react';
import clsx from 'clsx';
import { IconGlyph } from './IconGlyph';

export type IconProps = JSX.IntrinsicElements['svg'] &
  React.ComponentPropsWithoutRef<typeof IconGlyph> & {
    Size: 'small' | 'medium' | 'large';
  };

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { className: _, style: __, Size, Name, ...hostProps },
  ref,
) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('tw-inline-flex tw-fill-current', {
        'tw-w-4 tw-h-4': Size === 'small',
        'tw-w-6 tw-h-6': Size === 'medium',
        'tw-w-8 tw-h-8': Size === 'large',
      })}
      ref={ref}
      {...hostProps}
    >
      <IconGlyph key={Name} Name={Name} />
    </svg>
  );
});
