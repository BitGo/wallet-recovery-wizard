import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import * as Polymorphic from '../Polymorphic';

export type LinkCardItemProps = {
  Title: string;
  Description: string;
};

type LinkCardItemTag = 'a' | typeof Link;

const LinkCardItemDefaultTag = 'a';

export const LinkCardItem = Polymorphic.forwardRef<
  typeof LinkCardItemDefaultTag,
  LinkCardItemProps,
  LinkCardItemTag
>(function LinkCardItem(
  { Title, Description, Tag = LinkCardItemDefaultTag, ...hostProps },
  ref
) {
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      {...(hostProps as any)}
      ref={ref}
      className={clsx(
        'tw-flex tw-flex-col tw-border tw-border-solid tw-px-4 tw-py-4 tw-border-gray-700 tw-rounded',
        'hover:tw-bg-gray-100'
      )}
    >
      <div className="tw-gap-1 tw-flex tw-items-center">
        <span className="tw-text-slate-900 tw-font-medium tw-text-label-1">
          {Title}
        </span>
        <span>
          <Icon Name="chevron-right" Size="small" />
        </span>
      </div>
      <span className="tw-text-gray-700 tw-text-label-2 tw-mt-1">
        {Description}
      </span>
    </Tag>
  );
});
