import React from 'react';
import coinConfig from '../constants/coin-config';

import Select from 'react-select';

import {
  Input,
  UncontrolledTooltip,
  FormGroup,
  Label
} from 'reactstrap';

import questionMarkIcon from 'images/question_mark.png';

export const CoinDropdown = ({ label, name, value, allowedCoins, onChange, tooltipText }) => {
  return (
    <FormGroup>
      {label &&
        <Label className='input-label'>
          {label}
          {tooltipText && <FieldTooltip name={name} text={tooltipText} />}
        </Label>
      }
      <Input
        type='select'
        onChange={onChange}
        name={name}
        value={value}
      >
        {allowedCoins.map((coin) =>
          <option value={coin} key={coin}>
              <img src={coinConfig[coin].icon} alt='' border='0' className='coin-icon' />
              {coinConfig[coin].fullName}
          </option>
        )}
      </Input>
    </FormGroup>
  );
}
export const InputField = ({ label, name, value, onChange, tooltipText, isPassword }) => (
  <FormGroup>
    {label &&
      <Label className='input-label'>
        {label}
        {tooltipText && <FieldTooltip name={name} text={tooltipText} />}
      </Label>
    }
    <Input
      type={isPassword ? 'password' : 'text'}
      onChange={onChange}
      value={value}
    />
  </FormGroup>
);

const FieldTooltip = ({ name, text }) => (
  <span>
    <a href="#" id={`tooltip-${name}`}>
      <img id={`tooltip-${name}`} src={questionMarkIcon} alt='' border='0' className='tooltip-icon'/>
    </a>
    <UncontrolledTooltip placement='right' target={`tooltip-${name}`}>{text}</UncontrolledTooltip>
  </span>
);