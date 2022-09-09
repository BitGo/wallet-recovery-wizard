import clsx from 'clsx';
import { Link } from 'react-router-dom';
import * as Polymorphic from '../Polymorphic';

export type ButtonProps = {
  Disabled?: boolean;
  Variant: 'primary' | 'secondary' | 'tertiary' | 'success' | 'destructive';
  Width: 'fill' | 'hug';
  IconLeft?: React.ReactNode;
  IconRight?: React.ReactNode;
  children?: React.ReactNode;
};

type ButtonTag = 'button' | 'a' | typeof Link;

const ButtonDefaultTag = 'button';

export const Button = Polymorphic.forwardRef<
  typeof ButtonDefaultTag,
  ButtonProps,
  ButtonTag
>(function Button(
  {
    Disabled,
    Width,
    Tag = ButtonDefaultTag,
    Variant,
    IconLeft,
    IconRight,
    children,
    ...hostProps
  },
  ref
) {
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      {...(hostProps as any)}
      className={clsx(
        'tw-border tw-border-solid tw-border-transparent tw-flex-row tw-py-2 tw-px-4 tw-text-button tw-font-semibold tw-text-center tw-items-center tw-justify-center tw-rounded',
        'focus:tw-outline-none focus:tw-ring-4 tw-ring-sky-400 tw-ring-opacity-50 focus:tw-ring-offset-1 tw-ring-offset-blue-500',
        {
          'tw-flex tw-w-full': Width === 'fill',
          'tw-inline-flex': Width === 'hug',
          'tw-bg-sky-500 tw-text-gray-50': Variant === 'primary',
          'active:tw-bg-sky-700  hover:tw-bg-sky-700':
            Variant === 'primary' && !Disabled,
          'tw-bg-green-500 tw-text-gray-50': Variant === 'success',
          'active:tw-bg-green-700 hover:tw-bg-green-700':
            Variant === 'success' && !Disabled,
          'tw-bg-red-500  tw-text-gray-50': Variant === 'destructive',
          'active:tw-bg-red-700 hover:tw-bg-red-700':
            Variant === 'destructive' && !Disabled,
          'tw-bg-gray-50 tw-border-gray-700 tw-text-slate-900':
            Variant === 'secondary',
          'active:tw-bg-gray-200  hover:tw-bg-gray-200':
            Variant === 'secondary' && !Disabled,
          'tw-bg-transparent tw-text-blue-500': Variant === 'tertiary',
          'active:tw-bg-gray-200 active:tw-text-blue-700 hover:tw-bg-gray-200  hover:tw-text-blue-700':
            Variant === 'tertiary' && !Disabled,
          'tw-opacity-50': Disabled,
        }
      )}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={undefined}
    >
      {IconLeft && <span className="tw-flex tw-mr-1">{IconLeft}</span>}
      {children && <span className="tw-flex tw-text-base">{children}</span>}
      {IconRight && <span className="tw-flex tw-ml-1">{IconRight}</span>}
    </Tag>
  );
});
