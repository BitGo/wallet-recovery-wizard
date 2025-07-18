import React, { Suspense } from 'react';
import clsx from 'clsx';
import { getDynamicIcon } from './get-dynamic-icon';

type CryptocurrencyDynamicIconProps = {
  Name: string;
  Size?: 'small' | 'medium' | 'large';
} & JSX.IntrinsicElements['svg'];

export function CryptocurrencyDynamicIcon({Name, Size, ...hostProps }: CryptocurrencyDynamicIconProps) {

  const IconComponent = getDynamicIcon(Name);

  if (!IconComponent) return <div>Icon not found</div>;

  return (
    <Suspense fallback={<div>Loading icon...</div>}>
      <IconComponent
        className={clsx('tw-inline-flex tw-fill-current', {
          'tw-w-4 tw-h-4': Size === 'small',
          'tw-w-6 tw-h-6': Size === 'medium',
          'tw-w-8 tw-h-8': Size === 'large',
        })}
        {...hostProps} />
    </Suspense>);
}
