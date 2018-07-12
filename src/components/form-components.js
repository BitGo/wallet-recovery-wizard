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

const XPUB_LENGTH = 111; // string length of a base58-encoded xpub

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
    const { value, format, coin } = this.props;

    if (value === '') {
      return;
    }

    if (format === 'json') {
      try {
        JSON.parse(value);
        this.setState({ error: null });
      } catch (e) {
        this.setState({ error: 'This field should be a JSON object. JSON objects begin with a { and end with a }' });
      }
    } else if (format === 'xpub') {
      if (value.startsWith('xpub') && value.length === XPUB_LENGTH) {
        this.setState({ error: null });
      } else {
        this.setState({ error: `This field should be a public key. Public keys begin with the word 'xpub' and have a total length of ${XPUB_LENGTH} characters.`});
      }
    } else if (format === 'number') {
      if (value >= 0) {
        this.setState({ error: null });
      } else {
        this.setState({ error: 'This field cannot be negative.' });
      }
    } else if (format === 'address') {
      if (!coin) {
        return;
      }

      if (coin.isValidAddress(value)) {
        this.setState({ error: null });
      } else {
        this.setState({ error: `This should be a valid ${coin.getFamily().toUpperCase()} address.`});
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

    if (value === '') {
      return;
    }

    if (format === 'json') {
      try {
        JSON.parse(value);
        this.setState({ error: null });
      } catch (e) {
        console.log(`${value} failed`)
        this.setState({ error: 'This field should be a JSON object. JSON objects begin with a { and end with a }'});
      }
    } else if (format === 'xpub') {
      if (value.startsWith('xpub') && value.length === XPUB_LENGTH) {
        this.setState({ error: null });
      } else {
        this.setState({ error: `This field should be a public key. Public keys begin with the word 'xpub' and have a total length of ${XPUB_LENGTH} characters.`});
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
