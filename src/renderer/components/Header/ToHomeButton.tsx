import { Icon } from '@blueprintjs/core';
import { NavLink } from 'react-router-dom';

export default function ToHomeButton() {
  return (
    <NavLink to="/">
      <Icon icon="cross" />
    </NavLink>
  );
}
