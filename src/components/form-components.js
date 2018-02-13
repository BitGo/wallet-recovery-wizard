import React, { Component } from 'react';
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
  const options = allowedCoins.map((coin) => ({
    value: coin,
    label: coinConfig.allCoins[coin].fullName,
    icon: coinConfig.allCoins[coin].icon
  }));

  return (
    <FormGroup>
      {label &&
        <Label className='input-label'>
          {label}
          {tooltipText && <FieldTooltip name={name} text={tooltipText} />}
        </Label>
      }
      <Select
        type='select'
        className='bitgo-select'
        options={options}
        optionComponent={CoinDropdownOption}
        onChange={onChange}
        name={name}
        value={value}
        valueComponent={CoinDropdownValue}
        clearable={false}
        searchable={false}
      />
    </FormGroup>
  );
}

class CoinDropdownOption extends Component {
  handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    this.props.onSelect(this.props.option, event);
  }

  render() {
    const { option } = this.props;
    return (
      <div className='coin-dropdown-option'  onMouseDown={this.handleMouseDown}>
        <img src={option.icon} alt='' border='0' className='coin-icon' />
        {option.label}
      </div>
    );
  }
}

const CoinDropdownValue = ({ value }) => (
  <span className='coin-dropdown-value'>
    <img src={value.icon} alt='' border='0' className='coin-icon' />
    {value.label}
  </span>
);

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

export const InputTextarea = ({ label, name, value, onChange, tooltipText }) => (
  <FormGroup>
    {label &&
      <Label className='input-label'>
        {label}
        {tooltipText && <FieldTooltip name={name} text={tooltipText} />}
      </Label>
    }
    <Input
      type='textarea'
      onChange={onChange}
      value={value}
      rows={4}
    />
  </FormGroup>
);

const FieldTooltip = ({ name, text }) => (
  <span>
    <a id={`tooltip-${name}`}>
      <img id={`tooltip-${name}`} src={questionMarkIcon} alt='' border='0' className='tooltip-icon'/>
    </a>
    <UncontrolledTooltip placement='right' target={`tooltip-${name}`}>{text}</UncontrolledTooltip>
  </span>
);