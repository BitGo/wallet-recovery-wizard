import React from 'react';
import coinConfig from '../constants/coin-config';

import {
  Input,
  Tooltip
} from 'reactstrap';

export const CoinDropdown = ({ allowedCoins, onChange, value }) => {
  const options = allowedCoins.map((coin) => ({
    value: coin,
    label: coinConfig[coin].fullName,
    icon: coinConfig[coin].icon
  }));

  return (
    <Select
      options={options}
      onChange={onChange}
      value={value}
      optionRenderer={CoinDropdownOption}
      clearable={false}
    />
  );
}

const CoinDropdownOption = ({ icon, label }) => (
  <div>
    <img src={icon} alt='' />
    <span>{label}</span>
  </div>
);

const InputField = ({ label, tooltipText, onChange, isPassword, name, value }) => (
  <div>
    {label &&
      <label className='input-label'>
        {label}
        {tooltipText && <FieldTooltip name={name} text={tooltipText} />}
      </label>
    }
    <div className='input-text'>
      <Input
        type={password ? 'password' : 'text'}
        onChange={onUpdate}
        value={value}
      />
    </div>
  </div>
);

const FieldTooltip = ({ name, tooltipText }) => (
  <span>
    <img id={`tooltip-${name}`} src={questionMarkIcon} alt='0' border='0' />
    <Tooltip target={`tooltip-${name}`}>{tooltipText}</Tooltip>
  </span>
);