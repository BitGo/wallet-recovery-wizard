import React from 'react';
import { Menu } from '../Menu';
import { Popover } from '../Popover/Popover';
import { Searchfield } from '../Searchfield';

export type SearchAutocompleteProps = {
  children: React.ReactNode;
};

export function SearchAutocomplete({
  children,
  ...hostProps
}: SearchAutocompleteProps & React.ComponentProps<typeof Searchfield>) {
  const menuRef = React.useRef<HTMLElement | null>(null);
  const searchfieldRef = React.useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!searchfieldRef.current) {
      return;
    }

    const searchfield = searchfieldRef.current;
    const handleFocus = () => {
      setOpen(true);
    };
    const handleBlur = () => {
      setOpen(false);
    };

    searchfield.addEventListener('focus', handleFocus);
    searchfield.addEventListener('blur', handleBlur);

    return () => {
      searchfield.removeEventListener('focus', handleFocus);
      searchfield.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <Popover
      Width={hostProps.Width}
      Target={<Searchfield ref={searchfieldRef} {...hostProps} />}
      open={open}
    >
      <Menu
        ref={menuRef}
        Tag="nav"
        onMouseDown={event => event.preventDefault()}
      >
        {children}
      </Menu>
    </Popover>
  );
}
