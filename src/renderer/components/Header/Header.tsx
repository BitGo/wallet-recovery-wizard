import { Link } from 'react-router-dom';

export type HeaderProps = {
  Title: string;
};

export function Header(props: HeaderProps) {
  return (
    <header>
      <span>{props.Title}</span>
      <Link to="/">&times;</Link>
    </header>
  );
}
