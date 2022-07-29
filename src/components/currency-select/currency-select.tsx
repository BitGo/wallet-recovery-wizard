/** @jsx jsx */
import React, { useMemo, useState } from 'react';
import cn from 'classnames';
import { jsx } from 'theme-ui';

import { BaseCoin, coins } from '@bitgo/statics';
import { Icon, MenuItem } from '@blueprintjs/core';
import { ISelectProps, ItemPredicate, Select } from '@blueprintjs/select';

import { useBitGoEnvironment } from '../../contexts/bitgo-environment';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import InstrumentIcon from '../../modules/lumina/components/instrument-icon/instrument-icon';

interface ICurrencySelectProps extends IBaseProps {
  allowedCoins?: string[];
  activeItem?: BaseCoin;
  error?: string;
  onItemSelect: (coin: BaseCoin) => void;
  selectProps?: Partial<ISelectProps<BaseCoin>>;
}

const CurrencySelectComponent = Select.ofType<BaseCoin>();

function CurrencySelect(props: ICurrencySelectProps) {
  const {
    allowedCoins = [],
    onItemSelect,
    activeItem,
    className,
    error,
    selectProps,
    'data-testid': dataTestID = 'currency-select',
  } = props;
  const { network } = useBitGoEnvironment();

  const availableCoins: BaseCoin[] = useMemo(() => {
    return coins
      .filter((coin) => {
        if (network !== coin.network.type) {
          return false;
        }
        return allowedCoins.includes(coin.name);
      })
      .map((coin) => coin) as BaseCoin[];
  }, [network, allowedCoins]);

  const itemPredicate: ItemPredicate<any> = (query, coin) => {
    return (
      `${coin.name.toLowerCase()}`.indexOf(query.toLowerCase()) >= 0 ||
      `${coin.fullName.toLowerCase()}`.indexOf(query.toLowerCase()) >= 0
    );
  };

  const itemRenderer = (item: BaseCoin, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    const symbol = item.name;
    return (
      <MenuItem
        active={modifiers.active}
        disabled={!allowedCoins.includes(item.name.toLowerCase())}
        data-testid={`${dataTestID}--${symbol.toLocaleLowerCase()}-item`}
        key={item.name}
        onClick={handleClick}
        shouldDismissPopover={false}
        text={
          <div className="flex w-100 overflow-hidden lh-copy">
            <div className="mr2 pr1 flex items-center justify-center flex-shrink-0">
              <InstrumentIcon instrumentSymbol={item.name.toLowerCase()} viewBox="0 0 37 37" height="37" />
            </div>
            <div className="flex-grow-1 flex-shrink-1 overflow-hidden">
              <div className="fw6 truncate">{item.name.toUpperCase()}</div>
              <div className="o-70 f7 truncate">{item.fullName}</div>
            </div>
          </div>
        }
      />
    );
  };

  return (
    <CurrencySelectComponent
      {...selectProps}
      activeItem={activeItem}
      items={availableCoins as unknown as BaseCoin[]}
      itemPredicate={itemPredicate}
      itemRenderer={itemRenderer}
      noResults={<MenuItem disabled text="No currency matches your query..." />}
      onItemSelect={(item, event?: React.SyntheticEvent<HTMLElement>) => {
        onItemSelect(item);
      }}
      inputProps={{
        placeholder: 'Search currencies...',
      }}
      popoverProps={{
        usePortal: false,
        targetTagName: 'div',
        wrapperTagName: 'div',
        className: 'w-100',
        minimal: true,
        fill: true,
      }}
      filterable
    >
      <div
        className={cn('flex justify-between items-center pl3 pr2 pv2 lh-copy pointer b--border ba br2', className, {
          'b--error': error,
        })}
        sx={{
          height: 56,
        }}
      >
        {!activeItem && (
          <React.Fragment>
            {/* TODO(louis): add Empty coin icon */}
            <div data-testid={dataTestID} className="flex-grow-1 silver">
              Select a currency
            </div>
          </React.Fragment>
        )}
        {activeItem && (
          <React.Fragment>
            <div className="flex w-100 overflow-hidden lh-copy pr2">
              <div className="mr2 flex items-center justify-center flex-shrink-0">
                <InstrumentIcon instrumentSymbol={activeItem.name.toLowerCase()} viewBox="0 0 37 37" height="37" />
              </div>
              <div className="flex-grow-1 flex-shrink-1 overflow-hidden">
                <div className="fw6 truncate ttu">{activeItem.name}</div>
                <div className="o-70 f7 truncate">{activeItem.fullName}</div>
              </div>
            </div>
          </React.Fragment>
        )}
        <Icon icon="double-caret-vertical" />
      </div>
    </CurrencySelectComponent>
  );
}

export default CurrencySelect;
