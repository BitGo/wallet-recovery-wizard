import React, { Component } from 'react';
import coinConfig from '../constants/coin-config';

import Select from 'react-select';

import {
  Input,
  UncontrolledTooltip,
  FormGroup,
  FormFeedback,
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

export class InputField extends Component {
  state = {
    error: null
  };

  trim = (event) => {
    const { name, onChange, disallowWhiteSpace } = this.props;
    let input = event.target.value;

    if (disallowWhiteSpace) {
      input = input.replace(/\s/g, '');
    }

    onChange(name)(input);
  }

  validate = () => {
    const { value, format } = this.props;
    if (format === 'json') {
      try {
        JSON.parse(value);
        this.setState({ error: null });
      } catch (e) {
        this.setState({ error: 'This field should be a JSON object. JSON objects begin with a { and end with a }' });
      }
    }
  }

  render() {
    const { label, name, value, tooltipText, isPassword, format } = this.props;

    let type = 'text';

    if (isPassword) {
      type = 'password';
    } else if (format === 'number') {
      type = 'number';
    }

    return (
      <FormGroup>
        {label &&
        <Label className='input-label'>
          {label}
          {tooltipText && <FieldTooltip name={name} text={tooltipText}/>}
        </Label>
        }
        <Input
          type={type}
          onChange={this.trim}
          onBlur={this.validate}
          value={value}
          invalid={this.state.error !== null}
        />
        <FormFeedback>{this.state.error}</FormFeedback>
      </FormGroup>
    )
  }
}

export class InputTextarea extends Component {
  state = {
    error: null
  };

  trim = (event) => {
    const { name, disallowWhiteSpace, onChange } = this.props;
    let input = event.target.value;

    if (disallowWhiteSpace) {
      input = input.replace(/\s/g, '');
    }

    onChange(name)(input);
  }

  validate = () => {
    const { value, format } = this.props;

    if (format === 'json') {
      try {
        JSON.parse(value);
        this.setState({ error: null });
      } catch (e) {
        console.log(`${value} failed`)
        this.setState({ error: 'This field should be a JSON object. JSON objects begin with a { and end with a }'});
      }
    }
  }

  render() {
    const { label, name, value, tooltipText } = this.props;

    return (
      <FormGroup>
        {label &&
        <Label className='input-label'>
          {label}
          {tooltipText && <FieldTooltip name={name} text={tooltipText}/>}
        </Label>
        }
        <Input
          type='textarea'
          onChange={this.trim}
          onBlur={this.validate}
          value={value}
          rows={4}
          invalid={this.state.error !== null}
        />
        <FormFeedback>{this.state.error}</FormFeedback>
      </FormGroup>
    );
  }
}

const FieldTooltip = ({ name, text }) => (
  <span>
    <a id={`tooltip-${name}`}>
      <img id={`tooltip-${name}`} src={questionMarkIcon} alt='' border='0' className='tooltip-icon'/>
    </a>
    <UncontrolledTooltip placement='right' target={`tooltip-${name}`}>{text}</UncontrolledTooltip>
  </span>
);
