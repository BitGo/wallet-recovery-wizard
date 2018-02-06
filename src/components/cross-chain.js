import React, { Component } from 'react';

class CrossChainRecoveryForm extends Component {
  updateRecoveryInfo = (fieldName) => (event) => {
    this.setState({ [fieldName]: event.target.value });
  }

  render() {
    return (

    );
  }
}

class FindUnspentsForm extends Component {

}

class BuildTxForm extends Component {

}

export default CrossChainRecoveryForm;