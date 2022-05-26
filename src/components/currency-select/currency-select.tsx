/** @jsx jsx */
import { coins } from '@bitgo/statics';
import { Icon, MenuItem } from '@blueprintjs/core';
import { ISelectProps, ItemPredicate, Select } from '@blueprintjs/select';
import cn from 'classnames';
import React, { useMemo, useState } from 'react';
import { jsx } from 'theme-ui';
import { BitgoInstrument } from '../../modules/lumina/api/bitgo-instruments';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import InstrumentIcon from '../../modules/lumina/components/instrument-icon/instrument-icon';
import { useApplicationContext } from '../contexts/application-context';

interface IInstrumentItem {
  bitgoInstrument: BitgoInstrument;
}

interface ICurrencySelectProps extends IBaseProps {
  allowedCoins?: string[];
  activeItem?: IInstrumentItem;
  error?: string;
  onItemSelect: (instrumentSymbol: BitgoInstrument) => void;
  selectProps?: Partial<ISelectProps<IInstrumentItem>>;
}

const CurrencySelectComponent = Select.ofType<IInstrumentItem>();

// BitGo has a separate currency to denote offchain, we want to hide that
// from the user though
const stripOfcAndFormat = (instrumentSymbol: string, skipUpperCase?: boolean): string => {
  const formattedInstrumentSymbol = instrumentSymbol?.replace('ofc', '').replace('OFC', '') || '';
  if (skipUpperCase) return formattedInstrumentSymbol.toLowerCase();
  return formattedInstrumentSymbol.toUpperCase();
};

function CurrencySelect(props: ICurrencySelectProps) {
  const {
    allowedCoins = [],
    onItemSelect,
    activeItem: initialActiveItem,
    className,
    error,
    selectProps,
    "data-testid": dataTestID = "currency-select",
  } = props
  const { bitgoSDKOfflineWrapper, network } = useApplicationContext();

  const [activeItem, setActiveItem] = useState<IInstrumentItem>(initialActiveItem);

  const availableCoins: IInstrumentItem[] = useMemo(() => {
    return coins
      .filter((coin) => {
        if (network !== coin.network.type) {
          return false;
        }
        return allowedCoins.includes(coin.name);
      })
      .map((coin) => {
        return {
          bitgoInstrument: bitgoSDKOfflineWrapper.getBitgoInstrument(coin.name),
        };
      })
      .filter((instrumentItem) => instrumentItem.bitgoInstrument !== undefined);
  }, [bitgoSDKOfflineWrapper, network, allowedCoins]);

  const itemPredicate: ItemPredicate<any> = (query, coin) => {
    return (
      `${coin.bitgoInstrument.getSymbol().toLowerCase()}`.indexOf(query.toLowerCase()) >= 0 ||
      `${coin.bitgoInstrument.getFullName().toLowerCase()}`.indexOf(query.toLowerCase()) >= 0
    );
  };

  const itemRenderer = (item: IInstrumentItem, { handleClick, modifiers }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    const symbol = item.bitgoInstrument.getStandardSymbol();
    return (
      <MenuItem
        active={modifiers.active}
        // icon={_.get(activeItem, 'name') === item.name ? 'tick' : 'blank'}
        disabled={!allowedCoins.includes(item.bitgoInstrument.getSymbol().toLowerCase())}
        data-testid={`${dataTestID}--${symbol.toLocaleLowerCase()}-item`}
        key={item.bitgoInstrument.getSymbol()}
        onClick={handleClick}
        shouldDismissPopover={false}
        text={
          <div className="flex w-100 overflow-hidden lh-copy">
            <div className="mr2 pr1 flex items-center justify-center flex-shrink-0">
              <InstrumentIcon
                instrumentSymbol={item.bitgoInstrument.getStandardSymbol(true)}
                viewBox="0 0 37 37"
                height="37"
              />
            </div>
            <div className="flex-grow-1 flex-shrink-1 overflow-hidden">
              <div className="fw6 truncate">{item.bitgoInstrument.getStandardSymbol()}</div>
              <div className="o-70 f7 truncate">{item.bitgoInstrument.getFullName()}</div>
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
      items={availableCoins}
      itemPredicate={itemPredicate}
      itemRenderer={itemRenderer}
      noResults={<MenuItem disabled text="No currency matches your query..." />}
      onItemSelect={(item: IInstrumentItem, event?: React.SyntheticEvent<HTMLElement>) => {
        setActiveItem(item);
        onItemSelect(item.bitgoInstrument);
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
        {!activeItem?.bitgoInstrument && (
          <React.Fragment>
            {/* TODO(louis): add Empty coin icon */}
            <div data-testid={dataTestID} className="flex-grow-1 silver">
              Select a currency
            </div>
          </React.Fragment>
        )}
        {activeItem?.bitgoInstrument && (
          <React.Fragment>
            <div className="flex w-100 overflow-hidden lh-copy pr2">
              <div className="mr2 flex items-center justify-center flex-shrink-0">
                <InstrumentIcon
                  instrumentSymbol={activeItem?.bitgoInstrument?.getStandardSymbol(true)}
                  viewBox="0 0 37 37"
                  height="37"
                />
              </div>
              <div className="flex-grow-1 flex-shrink-1 overflow-hidden">
                <div className="fw6 truncate ttu">{stripOfcAndFormat(activeItem?.bitgoInstrument?.getSymbol())}</div>
                <div className="o-70 f7 truncate">{activeItem?.bitgoInstrument?.getFullName()}</div>
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
