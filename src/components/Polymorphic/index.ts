import * as React from 'react';

export const forwardRef = React.forwardRef as <
  TDefaultTag extends TElementType,
  TProps,
  TElementType extends React.ElementType = React.ElementType
>(
  renderFn: (
    props: React.ComponentPropsWithoutRef<TElementType> & {
      Tag?: TElementType;
    } & TProps,
    ref: React.ForwardedRef<React.ElementRef<TElementType>>
  ) => React.ReactElement | null
) => <TTag extends TElementType = TDefaultTag>(
  props: React.ComponentPropsWithRef<TTag> & {
    Tag?: TTag;
  } & TProps
) => React.ReactElement | null;
