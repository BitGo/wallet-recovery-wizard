import * as Polymorphic from '../Polymorphic';

export type LinkCardItemProps = {
  Title: string;
  Description: string;
  IconRight: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkCardItemTag = 'a' | React.ForwardRefExoticComponent<any>;

const LinkCardItemDefaultTag = 'a';

export const LinkCardItem = Polymorphic.forwardRef<
  typeof LinkCardItemDefaultTag,
  LinkCardItemProps,
  LinkCardItemTag
>(function LinkCardItem(
  { Title, Description, IconRight, Tag, ...hostProps },
  ref
) {
  const Component = Tag ?? LinkCardItemDefaultTag;
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      {...hostProps}
      className="tw-flex tw-flex-col tw-border tw-border-solid tw-px-4 tw-py-4 tw-border-gray-700 tw-rounded"
    >
      <div className="tw-gap-1 tw-flex tw-items-center">
        <span className="tw-text-slate-900 tw-font-medium tw-text-label-1">
          {Title}
        </span>
        {IconRight && <span>{IconRight}</span>}
      </div>
      <span className="tw-text-gray-700 tw-text-label-2 tw-mt-1">
        {Description}
      </span>
    </Component>
  );
});
