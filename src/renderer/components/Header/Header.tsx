import { Link } from 'react-router-dom';
import ToHomeButton from './ToHomeButton';

export type HeaderProps = {
  Title: string;
};

export function Header(props: HeaderProps) {
  return (
    <header>
      <span>{props.Title}</span>
      <ToHomeButton />
    </header>
  );
}
