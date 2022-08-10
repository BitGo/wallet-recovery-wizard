import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';

export type BackToHomeHeaderProps = {
  Title: string;
};

export function BackToHomeHeader(props: BackToHomeHeaderProps) {
  return (
    <header
      className={clsx(
        'tw-box-border tw-flex tw-pl-8 tw-py-5 tw-pr-10 tw-border-b tw-border-solid tw-border-b-gray-700 tw-justify-between tw-items-center'
      )}
    >
      <span className="tw-text-header-3 tw-font-semibold">{props.Title}</span>
      <Link to="/" className="tw-contents">
        <Icon Size="small" Name="cross" />
      </Link>
    </header>
  );
}
