import * as Polymorphic from '../Polymorphic';

export type MenuProps = {
  children: React.ReactNode;
};

const defaultMenuTag = 'ul';
type MenuTag = 'ul' | 'nav';

export const Menu = Polymorphic.forwardRef<
  typeof defaultMenuTag,
  MenuProps,
  MenuTag
>(function Menu({ children, Tag, ...hostProps }, ref) {
  const Component = Tag ?? defaultMenuTag;
  return (
    <Component
      {...hostProps}
      className="tw-bg-white tw-p-1 tw-flex tw-flex-col tw-rounded"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={undefined}
    >
      {children}
    </Component>
  );
});
