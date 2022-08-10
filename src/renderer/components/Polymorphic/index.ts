import * as React from 'react';

// Props for Polymorphic Tag property
export type TagProps<TTag extends React.ElementType> = {
  Tag?: TTag;
};

// React.ComponentProps but for use with Polymorphic `Tag` property
export type ComponentPropsWithoutRef<
  TTag extends React.ElementType,
  TProps
> = TProps &
  TagProps<TTag> &
  Omit<React.ComponentPropsWithoutRef<TTag>, keyof (TProps & TagProps<TTag>)>;

// React.ComponentPropsWithRef but for use with Polymorphic `Tag` property
export type ComponentPropsWithRef<
  TTag extends React.ElementType,
  TProps
> = ComponentPropsWithoutRef<TTag, TProps> & {
  ref?: ForwardedRef<TTag>;
};

// Helper function to lookup the ref type of a component
export type ForwardedRef<TTag extends React.ElementType> = React.ForwardedRef<
  React.ElementRef<TTag>
>;

export const forwardRef = React.forwardRef as <
  TDefaultTag extends TElementType,
  TProps,
  TElementType extends React.ElementType = React.ElementType
>(
  renderFn: (
    props: ComponentPropsWithoutRef<TElementType, TProps>,
    ref: ForwardedRef<TElementType>
  ) => React.ReactElement | null
) => <TTag extends TElementType = TDefaultTag>(
  props: ComponentPropsWithRef<TTag, TProps>
) => React.ReactElement | null;
