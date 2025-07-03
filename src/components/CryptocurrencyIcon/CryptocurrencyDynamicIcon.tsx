import React, { useEffect, useState, ComponentType, Suspense } from 'react';
import clsx from 'clsx';
import { getDynamicIcon } from './get-dynamic-icon';

type CryptocurrencyDynamicIconProps = {
  Name: string;
  Size?: 'small' | 'medium' | 'large';
} & JSX.IntrinsicElements['svg'];

export function CryptocurrencyDynamicIcon({Name, Size, ...hostProps }: CryptocurrencyDynamicIconProps) {

  let iconName = Name;
  if (iconName === 'thorchain:rune') {
    iconName = 'thor';
  }

  // const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  //
  // useEffect(() => {
  //   let isMounted = true;
  //
  //   import(`cryptocurrency-icons/react/${iconName}.js`)
  //     .then((mod) => {
  //       if (isMounted) {
  //         setComponent(() => mod.default ?? mod);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(`Failed to load icon: ${iconName}`, err);
  //     });
  //
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [Name]);
  //
  // if (!Component) return <span>Loading icon...</span>;

  // return <Component
  //   className={clsx('tw-inline-flex tw-fill-current', {
  //     'tw-w-4 tw-h-4': Size === 'small',
  //     'tw-w-6 tw-h-6': Size === 'medium',
  //     'tw-w-8 tw-h-8': Size === 'large',
  //   })}
  //   {...hostProps} />;

  const IconComponent = getDynamicIcon(iconName);
  console.log(IconComponent, "IconComponent", iconName)

  if (!IconComponent) return <div>Loading icon...</div>;

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
