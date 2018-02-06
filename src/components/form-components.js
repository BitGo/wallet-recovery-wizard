import React from 'react';
import Select from 'react-select';
import coinConfig from '../constants/coin-config';

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

// const Input = ({ label, onChange, isPassword, value }) => (
//   <div>
//     {label && <label className='input-label'>{label}</label>}
//     <div className='input-text'>
//       <input
//         type={password ? 'password' : 'text'}
//         onChange={onUpdate}
//         value={value}
//       />
//     </div>
//   </div>
// );