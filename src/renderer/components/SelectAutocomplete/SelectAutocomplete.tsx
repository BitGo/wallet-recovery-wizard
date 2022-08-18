import clsx from 'clsx';
import React from 'react';
import { Icon } from '../Icon';
import { Menu, MenuItem } from '../Menu';
import { Popover } from '../Popover/Popover';
import { Searchfield } from '../Searchfield';

export type SelectAutocompleteProps = {
  children: React.ReactElement<React.ComponentProps<typeof MenuItem>>[];
  Disabled?: boolean;
  HelperText?: React.ReactNode;
  Label?: string;
  Width: 'hug' | 'fill';
};

export const toString = (value?: unknown) => {
  return value === undefined ? '' : String(value);
};

export function SelectAutocomplete({
  children,
  Disabled = false,
  Label,
  Width,
  HelperText,
  ...hostProps
}: SelectAutocompleteProps & JSX.IntrinsicElements['select']) {
  const popoverRef = React.useRef<HTMLDetailsElement | null>(null);
  const menuRef = React.useRef<HTMLElement | null>(null);
  const searchfieldRef = React.useRef<HTMLInputElement | null>(null);
  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const [currentButton, setCurrentButton] =
    React.useState<HTMLButtonElement | null>(null);
  const [activeButton, setActiveButton] =
    React.useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const placeholder = (
    <span className="tw-text-gray-700 tw-font-medium tw-p-4 tw-block">
      Select a currency
    </span>
  );
  const [selected, setSelected] = React.useState<string>(
    toString(hostProps.value ?? hostProps.defaultValue)
  );

  const childrenArray = React.Children.toArray(children) as React.ReactElement<
    React.ComponentProps<typeof MenuItem>
  >[];

  const filteredChildren = childrenArray.filter(node => {
    return node.props.Title.toLowerCase().includes(search.toLowerCase());
  });

  const value =
    selected === ''
      ? placeholder
      : childrenArray.find(node => node.props.value === selected);

  React.useEffect(() => {
    const button = currentButton;
    if (button) {
      button.setAttribute('data-current', 'true');

      return () => {
        button.removeAttribute('data-current');
      };
    }
  }, [currentButton]);

  React.useEffect(() => {
    const button = activeButton;
    if (button) {
      button.setAttribute('data-active', 'true');

      return () => {
        button.removeAttribute('data-active');
      };
    }
  }, [activeButton]);

  React.useEffect(() => {
    if (menuRef.current) {
      const buttons = Array.from(
        menuRef.current.getElementsByTagName('button')
      );
      const button = buttons.find(element => element.value === selected);
      if (button) {
        setCurrentButton(button);
      }
    }
  }, [selected]);

  return (
    <div
      className={clsx('tw-flex-col tw-relative', {
        'tw-opacity-50': Disabled,
        'tw-flex': Width === 'fill',
        'tw-inline-flex': Width === 'hug',
      })}
    >
      <label
        className="tw-text-label-1 tw-text-slate-900 tw-font-semibold tw-mb-1"
        htmlFor={hostProps.id}
      >
        {Label}
      </label>
      <Popover
        ref={popoverRef}
        onFocus={event => {
          event.preventDefault();
          if (!event.currentTarget.open) {
            selectRef.current?.focus();
          }
        }}
        onToggle={event => {
          event.preventDefault();
          if (event.currentTarget.open) {
            searchfieldRef.current?.focus();
          } else {
            selectRef.current?.focus();
          }
        }}
        Width={Width}
        Target={
          <div className="tw-min-h-14 tw-flex tw-items-center tw-justify-center tw-relative">
            <select
              {...hostProps}
              className={clsx(
                'tw-border tw-border-solid tw-border-gray-700 tw-rounded tw-text-transparent tw-appearance-none tw-inset-0 tw-absolute tw-bg-transparent',
                'placeholder:tw-text-transparent',
                'focus:tw-outline-none focus:tw-border-blue-500'
              )}
              ref={selectRef}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setOpen(prev => !prev);
                }
              }}
              onMouseDown={e => {
                e.preventDefault();
                setOpen(prev => !prev);
                if (hostProps.onMouseDown) {
                  hostProps.onMouseDown(e);
                }
              }}
              onChange={e => {
                setSelected(e.currentTarget.value);
                if (hostProps.onChange) {
                  hostProps.onChange(e);
                }
              }}
            >
              <option />
              {childrenArray.map(child => (
                <option
                  key={String(child.props.value)}
                  value={child.props.value}
                >
                  {child.props.Title}
                </option>
              ))}
            </select>
            <div className="tw-flex-grow tw-flex tw-flex-col">{value}</div>
            <div className="tw-p-3">
              <Icon Name="double-caret-vertical" Size="small" />
            </div>
          </div>
        }
        open={open}
      >
        <div className="tw-shadow-1dp tw-z-10 tw-absolute tw-left-0 tw-right-0">
          <div className="tw-p-1">
            <Searchfield
              tabIndex={-1}
              ref={searchfieldRef}
              value={search}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setOpen(false);
                } else if (
                  menuRef.current &&
                  (event.key === 'ArrowDown' || event.key === 'ArrowUp')
                ) {
                  const buttons = Array.from(
                    menuRef.current.getElementsByTagName('button')
                  );
                  setActiveButton(activeButton => {
                    const activeIndex = activeButton
                      ? buttons.indexOf(activeButton)
                      : -1;
                    if (activeIndex > -1) {
                      const nextIndex = Math.max(
                        0,
                        Math.min(
                          activeIndex + (event.key === 'ArrowDown' ? 1 : -1),
                          buttons.length - 1
                        )
                      );
                      const button = buttons[nextIndex];
                      if (button) {
                        return button ?? activeButton;
                      }
                    }
                    return buttons[0] ?? activeButton;
                  });
                } else if (event.key === 'Enter' && activeButton) {
                  event.preventDefault();

                  const select = selectRef.current;
                  if (!select) return;
                  Object.getOwnPropertyDescriptor(
                    window.HTMLSelectElement.prototype,
                    'value'
                  )?.set?.call(select, activeButton.value);
                  select.dispatchEvent(
                    new Event('change', {
                      bubbles: true,
                      cancelable: true,
                    })
                  );
                  setOpen(false);
                  setActiveButton(null);
                  popoverRef.current?.focus();
                }
              }}
              onChange={event => setSearch(event.currentTarget.value)}
            />
          </div>
          <div className="tw-max-h-[25rem] tw-overflow-y-scroll">
            <Menu
              ref={menuRef}
              Tag="nav"
              onMouseOver={event => {
                if (event.target instanceof HTMLButtonElement) {
                  setActiveButton(event.target);
                }
              }}
              onClick={event => {
                const select = selectRef.current;
                if (!select) return;
                if (event.target instanceof HTMLButtonElement) {
                  Object.getOwnPropertyDescriptor(
                    window.HTMLSelectElement.prototype,
                    'value'
                  )?.set?.call(select, event.target.value);
                  select.dispatchEvent(
                    new Event('change', {
                      bubbles: true,
                      cancelable: true,
                    })
                  );
                  setOpen(false);
                  popoverRef.current?.focus();
                }
              }}
            >
              {filteredChildren}
            </Menu>
          </div>
        </div>
      </Popover>
      {HelperText && (
        <div className="tw-mt-1 tw-text-label-2">
          {HelperText}
        </div>
      )}
    </div>
  );
}
