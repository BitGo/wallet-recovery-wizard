import React, { useEffect, useState, ComponentType } from 'react';
import clsx from 'clsx';

type CryptocurrencyDynamicIconProps = {
  Name: string;
  Size?: 'small' | 'medium' | 'large';
} & JSX.IntrinsicElements['svg'];

export function CryptocurrencyDynamicIcon({Name, Size, ...hostProps }: CryptocurrencyDynamicIconProps) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    let isMounted = true;

    let iconName = Name;
    if (iconName === 'thorchain:rune') {
      iconName = 'thor';
    }

    import(`/node_modules/cryptocurrency-icons/react/${iconName}`)
      .then((mod) => {
        if (isMounted) {
          setComponent(() => mod.default ?? mod);
        }
      })
      .catch((err) => {
        console.error(`Failed to load icon: ${iconName}`, err);
      });

    return () => {
      isMounted = false;
    };
  }, [Name]);

  if (!Component) return <span>Loading icon...</span>;

  return <Component
    className={clsx('tw-inline-flex tw-fill-current', {
      'tw-w-4 tw-h-4': Size === 'small',
      'tw-w-6 tw-h-6': Size === 'medium',
      'tw-w-8 tw-h-8': Size === 'large',
    })}
    {...hostProps} />;
}
